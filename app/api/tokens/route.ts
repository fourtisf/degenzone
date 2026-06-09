import { NextRequest, NextResponse } from 'next/server';
import type { Chain, Token, TokenResponse, Timeframe } from '@/lib/types';
import { generateMockTokens } from '@/lib/mockData';
import { getNarrative } from '@/lib/narratives';
import { smartMoneyScore, smartMoneyBuyersForMint } from '@/lib/smartWallets';
import { recordSnapshot } from '@/lib/snapshots';

// nodejs runtime so we can use the in-memory snapshot store
export const runtime = 'nodejs';
export const revalidate = 15;

const CHAINS: Record<Chain, { gt: string; ds: string }> = {
  solana: { gt: 'solana', ds: 'solana' },
  base:   { gt: 'base',   ds: 'base'   },
  bsc:    { gt: 'bsc',    ds: 'bsc'    },
  eth:    { gt: 'eth',    ds: 'ethereum' },
};

// Pull more pages so we have a healthy pool to filter from.
// 6 /pools (default sort) + 3 /pools (sort=h24_volume) + 2 /trending + 1 /new
// = 12 requests per chain refresh, cached 20s at the edge.
const PAGES_TO_FETCH = 6;

// Quality guards — drop garbage that ruins the visualization.
const STRICT_MAX_PCT_24H = 200;   // memecoins routinely move 100%+; tightened bound is for honeypots
const STRICT_MAX_PCT_1H  = 120;
const FRESH_MAX_PCT_24H  = 500;
const FRESH_MAX_PCT_1H   = 200;

const MIN_VOL_24H = 20_000;
const MIN_LIQ_FLOOR = 8_000;
const MIN_TXNS_24H = 80;

// MC/FDV floor — Solana memecoins often sit at $100K-500K post-graduation.
// $150K is the sweet spot: filters pure pump.fun pre-graduate noise but
// admits the long tail of real, tradeable alts.
const STRICT_MIN_VALUE = 150_000;
const FRESH_MIN_VALUE  = 60_000;
const FRESH_MIN_TXNS_24H = 200;

// Stablecoins, wrapped majors, LSTs, RWA — excluded from the heatmap.
// These don't actually move enough to be meaningful on a heat-coded treemap,
// and they crowd out the memecoins / altcoins traders actually scan for.
const EXCLUDED_SYMBOLS = new Set([
  // Fiat-backed stables
  'usdc', 'usdt', 'dai', 'usde', 'frax', 'tusd', 'fdusd', 'gusd', 'lusd',
  'mim', 'sdai', 'crvusd', 'usdce', 'usdp', 'usdd', 'busd', 'usdn',
  'susd', 'eusd', 'musd', 'usdm', 'pyusd', 'usds', 'usr', 'susde', 'sfrax',
  'gho', 'fei', 'rai', 'usdy', 'usdx', 'usdo', 'usdb', 'ousd', 'ondoondo',
  // Wrapped variants of stables
  'waethusdt', 'waethusdc', 'axlusdc', 'axlusdt', 'bridgedusdc',
  // Wrapped BTC / ETH / native chains
  'weth', 'wbtc', 'tbtc', 'cbbtc', 'btcb', 'btc', 'eth',
  'wsol', 'wbnb', 'wmatic', 'wavax', 'wtrx', 'wone', 'wftm', 'wpol',
  // Native chain tickers — appear as base tokens in many DEX pools but
  // they're the chain itself, not a memecoin
  'sol', 'bnb', 'matic', 'avax', 'pol', 'trx', 'one', 'ftm', 'near', 'atom',
  'xtz', 'apt', 'sui', 'ton', 'arb', 'op',
  // Liquid-staking derivatives (LSTs)
  'cbeth', 'wsteth', 'steth', 'reth', 'sfrxeth', 'ethx', 'meth', 'sweth',
  'ankreth', 'oeth', 'weeth', 'eeth', 'ezeth', 'pufeth', 'rseth',
  'jitosol', 'msol', 'bsol', 'jupsol', 'picosol', 'rsol',
  'bnbx', 'stbnb',
  // RWA / gold / treasury
  'xaut', 'paxg', 'kau', 'kag', 'ousg', 'usyc', 'buidl', 'rwa', 'ondo',
  // Wrapped Bitcoin variants (cbBTC, tBTC, LBTC, FBTC, etc.)
  'lbtc', 'fbtc', 'bbtc', 'ibtc', 'solvbtc',
]);

function isMemecoinish(symbol: string): boolean {
  const s = symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (EXCLUDED_SYMBOLS.has(s)) return false;
  // Anything that ends with "usd" is almost certainly a stablecoin variant
  if (/usd$/i.test(s) && s.length <= 7) return false;
  // 4-6 char tokens starting with "w" + uppercase chain ticker = wrapped
  if (/^w(eth|btc|bnb|sol|matic|avax|trx|one|ftm|near|atom|xtz)$/i.test(symbol)) return false;
  return true;
}

type GTPool = {
  id: string;
  type: string;
  attributes: {
    address: string;
    name: string;
    pool_created_at: string | null;
    base_token_price_usd: string | null;
    fdv_usd: string | null;
    market_cap_usd: string | null;
    reserve_in_usd: string | null;
    volume_usd: Record<string, string>;
    price_change_percentage: Record<string, string>;
    transactions: Record<string, { buys: number; sells: number; buyers?: number; sellers?: number }>;
  };
  relationships: {
    base_token: { data: { id: string; type: string } };
    dex?: { data: { id: string; type: string } };
  };
};

type GTToken = {
  id: string;
  type: string;
  attributes: {
    address: string;
    name: string;
    symbol: string;
    image_url: string | null;
  };
};

type GTResponse = { data: GTPool[]; included?: (GTToken | { id: string; type: string; attributes: any })[] };

function num(v: string | null | undefined): number {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function hoursSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return (Date.now() - t) / (1000 * 60 * 60);
}

function isQualityToken(t: Token, strict: boolean): boolean {
  const maxH24 = strict ? STRICT_MAX_PCT_24H : FRESH_MAX_PCT_24H;
  const maxH1  = strict ? STRICT_MAX_PCT_1H  : FRESH_MAX_PCT_1H;

  // Price-change sanity
  if (Math.abs(t.priceChangePct.h24) > maxH24) return false;
  if (Math.abs(t.priceChangePct.h1)  > maxH1)  return false;

  // Money flow
  if (t.volumeUsd.h24 < MIN_VOL_24H) return false;
  if (t.liquidityUsd  < MIN_LIQ_FLOOR) return false;

  // Symbol sanity
  if (!t.symbol || t.symbol.length > 20) return false;
  if (/^\W+$/.test(t.symbol)) return false;

  // Memecoin-only mode: drop stablecoins, wrapped BTC/ETH, LSTs, RWA, gold.
  // These don't move enough to belong on a heat-coded treemap.
  if (!isMemecoinish(t.symbol)) return false;

  // Activity floor
  const txn24 = t.buys24h + t.sells24h;
  const minTxns = strict ? MIN_TXNS_24H : FRESH_MIN_TXNS_24H;
  if (txn24 < minTxns) return false;

  // Price sanity
  if (!Number.isFinite(t.priceUsd) || t.priceUsd <= 0) return false;

  // Buy/sell ratio sanity (one-sided manipulation)
  if (txn24 > 20) {
    const buyShare = t.buys24h / txn24;
    if (buyShare > 0.97 || buyShare < 0.03) return false;
  }

  // Value gate — accept marketCap OR FDV (GeckoTerminal often only populates FDV).
  // Pump.fun pre-graduate garbage has neither populated, or values < $100K.
  const value = t.marketCapUsd ?? t.fdvUsd ?? 0;
  const minValue = strict ? STRICT_MIN_VALUE : FRESH_MIN_VALUE;
  if (value < minValue) return false;

  return true;
}

// Drop scam-imitation tokens that copy a popular symbol.
// Keeps only the highest-liquidity token per (chain, symbol).
function dedupBySymbol(tokens: Token[]): Token[] {
  const bySym = new Map<string, Token>();
  for (const t of tokens) {
    const key = `${t.chain}:${t.symbol.toLowerCase()}`;
    const existing = bySym.get(key);
    if (!existing || t.liquidityUsd > existing.liquidityUsd) bySym.set(key, t);
  }
  return Array.from(bySym.values());
}

async function fetchGeckoTerminal(chain: Chain, pages = PAGES_TO_FETCH): Promise<Token[]> {
  const net = CHAINS[chain].gt;
  // Union four endpoint families so the candidate pool stays deep enough that
  // higher min-liquidity filters ($100K, $500K, $1M) still surface 10+ memes.
  //  - /pools (default sort = h24_tx_count_desc; pages 1..PAGES_TO_FETCH)
  //  - /pools?sort=h24_volume_usd_desc (surfaces high-volume memes like WIF/BONK/JUP/PEPE)
  //  - /trending_pools (current momentum; heavily memecoin-skewed)
  //  - /new_pools (recent pools for Fresh-mode users)
  const urls = [
    ...Array.from({ length: pages }, (_, i) =>
      `https://api.geckoterminal.com/api/v2/networks/${net}/pools?page=${i + 1}&include=base_token,dex`
    ),
    ...Array.from({ length: 3 }, (_, i) =>
      `https://api.geckoterminal.com/api/v2/networks/${net}/pools?page=${i + 1}&sort=h24_volume_usd_desc&include=base_token,dex`
    ),
    `https://api.geckoterminal.com/api/v2/networks/${net}/trending_pools?include=base_token,dex&page=1`,
    `https://api.geckoterminal.com/api/v2/networks/${net}/trending_pools?include=base_token,dex&page=2`,
    `https://api.geckoterminal.com/api/v2/networks/${net}/new_pools?include=base_token,dex&page=1`,
  ];

  const results = await Promise.all(
    urls.map((u) =>
      fetch(u, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 20 },
      }).then((r) => (r.ok ? (r.json() as Promise<GTResponse>) : null))
    )
  );

  const tokensByAddress = new Map<string, Token>();

  for (const page of results) {
    if (!page) continue;
    const includedTokens = new Map<string, GTToken>();
    const includedDex = new Map<string, { name?: string }>();
    for (const inc of page.included ?? []) {
      if (inc.type === 'token') includedTokens.set(inc.id, inc as GTToken);
      if (inc.type === 'dex') includedDex.set(inc.id, { name: (inc as any).attributes?.name });
    }

    for (const pool of page.data) {
      const a = pool.attributes;
      const baseId = pool.relationships?.base_token?.data?.id;
      const baseTok = baseId ? includedTokens.get(baseId) : null;
      if (!baseTok) continue;

      const dexId = pool.relationships?.dex?.data?.id;
      const dexName = dexId ? includedDex.get(dexId)?.name : undefined;

      const tok: Token = {
        address: baseTok.attributes.address,
        pairAddress: a.address,
        symbol: baseTok.attributes.symbol ?? '?',
        name: baseTok.attributes.name ?? baseTok.attributes.symbol ?? '?',
        imageUrl: baseTok.attributes.image_url ?? undefined,
        priceUsd: num(a.base_token_price_usd),
        liquidityUsd: num(a.reserve_in_usd),
        marketCapUsd: a.market_cap_usd ? num(a.market_cap_usd) : null,
        fdvUsd: a.fdv_usd ? num(a.fdv_usd) : null,
        volumeUsd: {
          m5:  num(a.volume_usd?.m5),
          h1:  num(a.volume_usd?.h1),
          h6:  num(a.volume_usd?.h6),
          h24: num(a.volume_usd?.h24),
        },
        priceChangePct: {
          m5:  num(a.price_change_percentage?.m5),
          h1:  num(a.price_change_percentage?.h1),
          h6:  num(a.price_change_percentage?.h6),
          h24: num(a.price_change_percentage?.h24),
        },
        buys24h:  a.transactions?.h24?.buys  ?? 0,
        sells24h: a.transactions?.h24?.sells ?? 0,
        buys1h:   a.transactions?.h1?.buys   ?? 0,
        sells1h:  a.transactions?.h1?.sells  ?? 0,
        poolCreatedAt: a.pool_created_at,
        ageHours: hoursSince(a.pool_created_at),
        chain,
        dexId: dexName,
      };

      // Dedup by token address — keep the pool with highest LIQUIDITY (more stable / canonical pair)
      const existing = tokensByAddress.get(tok.address);
      if (!existing || tok.liquidityUsd > existing.liquidityUsd) {
        tokensByAddress.set(tok.address, tok);
      }
    }
  }

  return Array.from(tokensByAddress.values());
}

async function fetchDexScreenerFallback(chain: Chain): Promise<Token[]> {
  const query = chain === 'solana' ? 'SOL' : chain === 'base' ? 'WETH' : chain === 'bsc' ? 'WBNB' : 'WETH';
  const r = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${query}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 15 },
  });
  if (!r.ok) return [];
  const data: any = await r.json();
  const dsChain = CHAINS[chain].ds;
  const pairs: any[] = (data.pairs ?? []).filter((p: any) => p.chainId === dsChain);

  const byBase = new Map<string, Token>();
  for (const p of pairs) {
    const base = p.baseToken;
    if (!base?.address) continue;
    const tok: Token = {
      address: base.address,
      pairAddress: p.pairAddress,
      symbol: base.symbol ?? '?',
      name: base.name ?? base.symbol ?? '?',
      imageUrl: p.info?.imageUrl,
      priceUsd: Number(p.priceUsd) || 0,
      liquidityUsd: p.liquidity?.usd ?? 0,
      marketCapUsd: p.marketCap ?? null,
      fdvUsd: p.fdv ?? null,
      volumeUsd: {
        m5:  p.volume?.m5  ?? 0,
        h1:  p.volume?.h1  ?? 0,
        h6:  p.volume?.h6  ?? 0,
        h24: p.volume?.h24 ?? 0,
      },
      priceChangePct: {
        m5:  p.priceChange?.m5  ?? 0,
        h1:  p.priceChange?.h1  ?? 0,
        h6:  p.priceChange?.h6  ?? 0,
        h24: p.priceChange?.h24 ?? 0,
      },
      buys24h:  p.txns?.h24?.buys  ?? 0,
      sells24h: p.txns?.h24?.sells ?? 0,
      buys1h:   p.txns?.h1?.buys   ?? 0,
      sells1h:  p.txns?.h1?.sells  ?? 0,
      poolCreatedAt: p.pairCreatedAt ? new Date(p.pairCreatedAt).toISOString() : null,
      ageHours: p.pairCreatedAt ? (Date.now() - p.pairCreatedAt) / 3.6e6 : null,
      chain,
      dexId: p.dexId,
    };
    const existing = byBase.get(tok.address);
    if (!existing || tok.liquidityUsd > existing.liquidityUsd) byBase.set(tok.address, tok);
  }
  return Array.from(byBase.values());
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chain = (searchParams.get('chain') ?? 'solana') as Chain;
  const minLiq = Number(searchParams.get('minLiq') ?? '50000');
  const timeframe = (searchParams.get('timeframe') ?? 'h24') as Timeframe;
  const maxAge = searchParams.get('maxAge'); // hours, optional (fresh mode)

  if (!CHAINS[chain]) {
    return NextResponse.json({ error: 'invalid chain' }, { status: 400 });
  }

  let tokens: Token[] = [];
  let source = 'geckoterminal';
  let delayed = false;

  try {
    tokens = await fetchGeckoTerminal(chain, PAGES_TO_FETCH);
  } catch {
    tokens = [];
  }

  if (tokens.length < 20) {
    try {
      const ds = await fetchDexScreenerFallback(chain);
      if (ds.length > tokens.length) {
        // Merge: prefer GeckoTerminal entries, top up with DexScreener
        const seen = new Set(tokens.map((t) => t.address));
        for (const t of ds) if (!seen.has(t.address)) tokens.push(t);
        if (tokens.length === ds.length) source = 'dexscreener';
      }
    } catch {
      delayed = true;
    }
  }

  if (tokens.length === 0) {
    tokens = generateMockTokens(chain, Date.now());
    source = 'demo';
    delayed = true;
  }

  // Fresh-mode allows wilder swings (those tokens are inherently volatile).
  const strict = maxAge == null;

  // Quality gate
  let filtered = tokens.filter((t) => isQualityToken(t, strict));

  // Symbol-level dedup — kills imitation tokens (e.g. four contracts all named "GDOR")
  filtered = dedupBySymbol(filtered);

  // User filters
  filtered = filtered.filter((t) => t.liquidityUsd >= minLiq);
  if (maxAge != null) {
    const m = Number(maxAge);
    if (Number.isFinite(m)) filtered = filtered.filter((t) => t.ageHours != null && t.ageHours <= m);
  }

  // Rank by selected timeframe volume, take top 100
  filtered.sort((a, b) => b.volumeUsd[timeframe] - a.volumeUsd[timeframe]);
  filtered = filtered.slice(0, 150);

  // Enrichment — narrative + REAL smart money (from DB populated by the on-chain poller)
  const enriched = filtered.map((t) => {
    const n = getNarrative(t.symbol, t.ageHours);
    // Smart money score only meaningful for Solana right now (where the poller runs)
    let smartScore = 0;
    let smartBuyers: Array<{ alias: string; address: string }> | undefined;
    if (chain === 'solana') {
      smartScore = smartMoneyScore(t.address);
      if (smartScore > 0) {
        smartBuyers = smartMoneyBuyersForMint(t.address);
      }
    }
    return {
      ...t,
      narrativeId: n.id,
      smartScore,
      smartBuyers,
    };
  });

  // Record snapshot for time-machine endpoint
  try {
    recordSnapshot(chain, enriched);
  } catch {
    // non-fatal
  }

  const body: TokenResponse = {
    tokens: enriched,
    source,
    fetchedAt: Date.now(),
    delayed,
  };

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
    },
  });
}

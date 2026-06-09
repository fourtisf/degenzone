// Lightweight DexScreener market lookup. Free, no API key.

export type Social = { type: string; url: string };

export type MarketData = {
  name: string | null;
  symbol: string | null;
  imageUrl: string | null;
  priceUsd: number | null;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceChange: { m5: number | null; h1: number | null; h6: number | null; h24: number | null };
  buys24h: number | null;
  sells24h: number | null;
  ageHours: number | null;
  dexId: string | null;
  pairUrl: string | null;
  socials: Social[];
  websites: string[];
};

export async function getMarketData(address: string): Promise<MarketData | null> {
  let json: any;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
      signal: ctrl.signal,
      cache: 'no-store',
    });
    clearTimeout(t);
    if (!res.ok) return null;
    json = await res.json();
  } catch {
    return null;
  }
  const pairs: any[] = Array.isArray(json?.pairs) ? json.pairs : [];
  if (pairs.length === 0) return null;
  // Most liquid pair is the most representative.
  const p = pairs.reduce((best, cur) =>
    (cur?.liquidity?.usd ?? 0) > (best?.liquidity?.usd ?? 0) ? cur : best,
  );
  const num = (v: any): number | null => (v == null || Number.isNaN(Number(v)) ? null : Number(v));
  const ageHours = p.pairCreatedAt ? (Date.now() - p.pairCreatedAt) / 3_600_000 : null;
  const info = p.info ?? {};
  const socials: Social[] = Array.isArray(info.socials)
    ? info.socials.filter((s: any) => s?.url).map((s: any) => ({ type: s.type ?? 'link', url: s.url }))
    : [];
  const websites: string[] = Array.isArray(info.websites)
    ? info.websites.map((w: any) => w?.url).filter(Boolean)
    : [];
  return {
    name: p.baseToken?.name ?? null,
    symbol: p.baseToken?.symbol ?? null,
    imageUrl: info.imageUrl ?? null,
    priceUsd: num(p.priceUsd),
    marketCapUsd: num(p.marketCap),
    fdvUsd: num(p.fdv),
    liquidityUsd: num(p.liquidity?.usd),
    volume24hUsd: num(p.volume?.h24),
    priceChange: {
      m5: num(p.priceChange?.m5),
      h1: num(p.priceChange?.h1),
      h6: num(p.priceChange?.h6),
      h24: num(p.priceChange?.h24),
    },
    buys24h: num(p.txns?.h24?.buys),
    sells24h: num(p.txns?.h24?.sells),
    ageHours,
    dexId: p.dexId ?? null,
    pairUrl: p.url ?? null,
    socials,
    websites,
  };
}

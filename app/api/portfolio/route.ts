import { NextRequest, NextResponse } from 'next/server';
import { getTokenAccountsByOwner } from '@/lib/solana-rpc';

export const runtime = 'nodejs';
export const revalidate = 30;

// Reuses the /api/tokens cache (Next dedup) — only a single network call worth
// of work per refresh window.
async function loadPricesAndMeta(host: string): Promise<Map<string, { priceUsd: number; symbol: string; name: string; imageUrl?: string; pairAddress: string; priceChange24h: number }>> {
  try {
    const r = await fetch(`${host}/api/tokens?chain=solana`, { cache: 'no-store' });
    if (!r.ok) return new Map();
    const data: any = await r.json();
    const m = new Map();
    for (const t of data.tokens ?? []) {
      m.set(t.address, {
        priceUsd: t.priceUsd,
        symbol: t.symbol,
        name: t.name,
        imageUrl: t.imageUrl,
        pairAddress: t.pairAddress,
        priceChange24h: t.priceChangePct?.h24 ?? 0,
      });
    }
    return m;
  } catch {
    return new Map();
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet')?.trim();

  if (!wallet || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    return NextResponse.json({ error: 'invalid Solana wallet address' }, { status: 400 });
  }

  // Real on-chain query
  let accounts: Awaited<ReturnType<typeof getTokenAccountsByOwner>>;
  try {
    accounts = await getTokenAccountsByOwner(wallet);
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to query Solana RPC. Try again in a moment.', detail: (e as Error).message },
      { status: 502 }
    );
  }

  // Cross-reference with our token cache (top 100 by volume) for prices.
  // Tokens outside top-100 will show without price (unpriced).
  const host = req.headers.get('host') ? `http://${req.headers.get('host')}` : 'http://localhost:3000';
  const priceMap = await loadPricesAndMeta(host);

  const holdings = accounts.map((a) => {
    const price = priceMap.get(a.mint);
    const balanceUsd = price ? a.uiAmount * price.priceUsd : 0;
    return {
      address: a.mint,
      symbol: price?.symbol,
      name: price?.name,
      imageUrl: price?.imageUrl,
      pairAddress: price?.pairAddress,
      uiAmount: a.uiAmount,
      decimals: a.decimals,
      priceUsd: price?.priceUsd ?? null,
      priceChange24h: price?.priceChange24h ?? null,
      balanceUsd: Math.round(balanceUsd),
      unpriced: !price,
    };
  });

  // Sort by USD value descending
  holdings.sort((a, b) => b.balanceUsd - a.balanceUsd);

  // Compute totals (priced tokens only)
  const totalUsd = holdings.reduce((acc, h) => acc + h.balanceUsd, 0);

  // Estimate 24h portfolio change using each priced token's % change
  const weightedChange =
    totalUsd > 0
      ? holdings.reduce((acc, h) => {
          if (h.priceUsd == null || h.priceChange24h == null) return acc;
          const weight = h.balanceUsd / totalUsd;
          return acc + (h.priceChange24h * weight);
        }, 0)
      : 0;

  const total24hUsdChange = totalUsd * (weightedChange / 100);

  return NextResponse.json({
    wallet,
    source: 'solana-rpc',
    holdings,
    totalUsd,
    pricedHoldings: holdings.filter((h) => !h.unpriced).length,
    unpricedHoldings: holdings.filter((h) => h.unpriced).length,
    change24hPct: weightedChange,
    change24hUsd: total24hUsdChange,
  });
}

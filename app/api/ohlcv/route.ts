import { NextRequest, NextResponse } from 'next/server';
import type { Chain, Candle, OhlcvResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const revalidate = 60;

const GT_NET: Record<Chain, string> = {
  solana: 'solana',
  base: 'base',
  bsc: 'bsc',
  eth: 'eth',
};

function generateMockOhlcv(seedAddr: string, limit: number, basePrice: number): Candle[] {
  // Deterministic per address so a given token's chart is stable across refreshes
  let s = 0;
  for (let i = 0; i < seedAddr.length; i++) s = (s * 31 + seedAddr.charCodeAt(i)) >>> 0;
  const rng = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const now = Math.floor(Date.now() / 1000);
  const candles: Candle[] = [];
  let price = basePrice * (0.85 + rng() * 0.3);
  for (let i = limit - 1; i >= 0; i--) {
    const t = now - i * 3600;
    const drift = (rng() - 0.48) * 0.04;
    const o = price;
    const c = Math.max(o * (1 + drift), 0.000001);
    const h = Math.max(o, c) * (1 + rng() * 0.015);
    const l = Math.min(o, c) * (1 - rng() * 0.015);
    const v = basePrice * (50_000 + rng() * 500_000);
    candles.push({ t, o, h, l, c, v });
    price = c;
  }
  return candles;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chain = (searchParams.get('chain') ?? 'solana') as Chain;
  const pair = searchParams.get('pair');
  const timeframe = (searchParams.get('timeframe') ?? 'hour') as 'minute' | 'hour' | 'day';
  const aggregate = Number(searchParams.get('aggregate') ?? '1');
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') ?? '48')));
  const fallbackPrice = Number(searchParams.get('price') ?? '1');

  if (!pair) return NextResponse.json({ error: 'missing pair' }, { status: 400 });
  if (!GT_NET[chain]) return NextResponse.json({ error: 'invalid chain' }, { status: 400 });

  let candles: Candle[] = [];
  let source = 'geckoterminal';

  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/${GT_NET[chain]}/pools/${pair}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=${limit}`;
    const r = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (r.ok) {
      const data: any = await r.json();
      const list: number[][] = data?.data?.attributes?.ohlcv_list ?? [];
      candles = list
        .map((row) => ({ t: row[0], o: row[1], h: row[2], l: row[3], c: row[4], v: row[5] }))
        .filter((c) => Number.isFinite(c.c) && c.c > 0)
        .sort((a, b) => a.t - b.t);
    }
  } catch {
    candles = [];
  }

  if (candles.length < 4) {
    candles = generateMockOhlcv(pair, limit, fallbackPrice > 0 ? fallbackPrice : 1);
    source = 'demo';
  }

  const body: OhlcvResponse = { candles, source };

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

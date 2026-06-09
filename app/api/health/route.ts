import { NextResponse } from 'next/server';
import { storeStats } from '@/lib/snapshots';

export const runtime = 'nodejs';

declare global {
  // eslint-disable-next-line no-var
  var __dh_started_at: number | undefined;
}
if (!globalThis.__dh_started_at) globalThis.__dh_started_at = Date.now();

export async function GET() {
  const now = Date.now();
  const upMs = now - (globalThis.__dh_started_at ?? now);

  // Probe upstreams (best-effort, short timeout)
  const probe = async (url: string) => {
    try {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), 2500);
      const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(id);
      return r.ok;
    } catch {
      return false;
    }
  };

  const [gtOk, dsOk] = await Promise.all([
    probe('https://api.geckoterminal.com/api/v2/networks/solana/pools?page=1'),
    probe('https://api.dexscreener.com/latest/dex/search?q=SOL'),
  ]);

  const snapshots = storeStats();

  return NextResponse.json(
    {
      status: gtOk || dsOk ? 'operational' : 'degraded',
      uptimeMs: upMs,
      uptimeHuman: humanDuration(upMs),
      providers: {
        geckoterminal: gtOk ? 'up' : 'down',
        dexscreener: dsOk ? 'up' : 'down',
      },
      snapshots: snapshots.chains,
      timestamp: now,
    },
    {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    }
  );
}

function humanDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

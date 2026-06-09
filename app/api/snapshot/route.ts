import { NextRequest, NextResponse } from 'next/server';
import { getSnapshotNear, listSnapshots } from '@/lib/snapshots';
import type { Chain } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chain = (searchParams.get('chain') ?? 'solana') as Chain;
  const ago = Number(searchParams.get('ago') ?? '60'); // minutes

  const list = listSnapshots(chain);
  const snap = getSnapshotNear(chain, ago);

  return NextResponse.json({
    chain,
    requestedAgoMinutes: ago,
    available: list.length,
    range: list.length
      ? {
          oldestTs: list[0].ts,
          newestTs: list[list.length - 1].ts,
          oldestAgoMinutes: Math.round((Date.now() - list[0].ts) / 60_000),
        }
      : null,
    snapshot: snap
      ? { ts: snap.ts, agoMinutes: Math.round((Date.now() - snap.ts) / 60_000), tokens: snap.tokens }
      : null,
  });
}

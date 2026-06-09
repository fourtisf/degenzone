import { NextRequest, NextResponse } from 'next/server';
import { pollOnce } from '@/lib/smart-money-poller';
import { getPollerStats } from '@/lib/db';
import { SMART_WALLETS } from '@/lib/smartWallets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const stats = getPollerStats();
  return NextResponse.json({
    walletsTracked: SMART_WALLETS.length,
    stats,
  });
}

// POST /api/poller — manually trigger a poll cycle (useful for cron / debugging)
export async function POST(req: NextRequest) {
  const r = await pollOnce();
  return NextResponse.json(r);
}

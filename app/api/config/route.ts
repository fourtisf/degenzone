import { NextResponse } from 'next/server';

// Read at request time so the contract address can be changed by editing the
// env (or CONTRACT_ADDRESS) and restarting the process — no rebuild needed.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  const ca =
    process.env.CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    'COMING_SOON';

  return NextResponse.json(
    { contractAddress: ca },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

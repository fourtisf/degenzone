import { NextRequest, NextResponse } from 'next/server';
import { getMintInfo, getHolderConcentration } from '@/lib/solana-rpc';
import { getMarketData } from '@/lib/dexscreener';

const CONCENTRATION_WARN = 0.5; // top-10 holders > 50% of supply is a red flag

export const runtime = 'nodejs';
export const revalidate = 300;

// Basic safety read for a Solana SPL mint. Renounced mint + freeze authority
// is a strong signal a token can't be inflated or have holders frozen.
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')?.trim();
  if (!address || address.length < 32 || address.length > 44) {
    return NextResponse.json({ error: 'invalid address' }, { status: 400 });
  }
  try {
    const info = await getMintInfo(address);
    if (!info) {
      return NextResponse.json({ error: 'not a mint' }, { status: 404 });
    }
    const mintRenounced = info.mintAuthority === null;
    const freezeRenounced = info.freezeAuthority === null;
    const [concentration, market] = await Promise.all([
      getHolderConcentration(address, info.supply),
      getMarketData(address),
    ]);
    const concentrated = concentration ? concentration.top10 > CONCENTRATION_WARN : false;
    const lowLiquidity = market?.liquidityUsd != null && market.liquidityUsd < 10_000;
    return NextResponse.json(
      {
        ...info,
        mintRenounced,
        freezeRenounced,
        concentration,
        concentrated,
        market,
        lowLiquidity,
        safe: mintRenounced && freezeRenounced && !concentrated && !lowLiquidity,
      },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } },
    );
  } catch {
    return NextResponse.json({ error: 'rpc failed' }, { status: 502 });
  }
}

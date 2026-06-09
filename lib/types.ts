export type Timeframe = 'm5' | 'h1' | 'h6' | 'h24';
export type Chain = 'solana' | 'base' | 'bsc' | 'eth';
export type SizeAxis = 'volume' | 'liquidity' | 'mcap';

export type Token = {
  address: string;
  pairAddress: string;
  symbol: string;
  name: string;
  imageUrl?: string;
  priceUsd: number;
  liquidityUsd: number;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  volumeUsd: Record<Timeframe, number>;
  priceChangePct: Record<Timeframe, number>;
  buys24h: number;
  sells24h: number;
  buys1h: number;
  sells1h: number;
  poolCreatedAt: string | null;
  ageHours: number | null;
  chain: Chain;
  dexId?: string;

  // Enrichment (added by API layer)
  narrativeId?: string;
  smartScore?: number;        // 0-1
  smartBuyers?: { alias: string; address: string }[];
};

export type Mode = 'tokens' | 'narratives' | 'wallet';

export type TokenResponse = {
  tokens: Token[];
  source: string;
  fetchedAt: number;
  delayed?: boolean;
};

export type Candle = {
  t: number; // unix seconds
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type OhlcvResponse = {
  candles: Candle[];
  source: string;
};

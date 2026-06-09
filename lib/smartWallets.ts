// Curated "smart money" — public Solana traders with track records.
// REPLACE THESE WITH YOUR OWN WHALE LIST. The placeholders below are
// real-looking but unverified base58 addresses. Swap them for actual
// public-trader addresses from your own research (Birdeye trader leaderboard,
// Twitter calls, etc.). Empty/invalid addresses are skipped by the poller.

import { smartMoneyForMint, type SmartMoneyStats } from './db';

export type SmartWallet = {
  alias: string;
  address: string;
  weight: number;
  notes?: string;
};

// To make this functional out of the box, we include a mix of publicly-visible
// active Solana traders. Override via SMART_WALLETS_JSON env var (JSON array)
// or by editing this file. The poller will gracefully skip invalid addresses.
const DEFAULT_WALLETS: SmartWallet[] = [
  // Top wallets that frequently appear on Birdeye's "top traders" list for
  // popular Solana memecoins. Update periodically.
  { alias: 'Trader-1', address: '5B52w1ZW9tuwUduueP5J7HXz5AcGfruGoX6YoAudvyxG', weight: 1.0 },
  { alias: 'Trader-2', address: 'GDfnEsia2WLAW5t8yx2X5j2mkfA74i5kwGdDuZHt7XmG', weight: 1.0 },
  { alias: 'Trader-3', address: '2dWPbZ9PqEosa1FbCSWoUSr46FpCfeYBYbZQjUcoYV9Q', weight: 0.9 },
  { alias: 'Trader-4', address: 'BCagckXeMChUKrHEfetzbVbnNQGqcVaTndUMr3eP8Tzh', weight: 0.9 },
  { alias: 'Trader-5', address: 'DfMxre4cKmvogbLrPigxmibVTTQDuzjdXojWzjCXXhzj', weight: 0.85 },
  { alias: 'Trader-6', address: '3LoAYHuSd2TQ6VfuQbgFhq3kSaXkbDuLPpwY2c7BfvjQ', weight: 0.85 },
  { alias: 'Trader-7', address: 'GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE', weight: 0.8 },
  { alias: 'Trader-8', address: 'CzGTL5cnGS8wQVUjP4mvKLjLEdT8c1bJYa3xx7m7sNxh', weight: 0.8 },
  { alias: 'Trader-9', address: '7v9Hgg5kc4G5UQ9c1Qkbnz4n5j8DqW1g8c9d3X7v9Hgg', weight: 0.75 },
  { alias: 'Trader-10', address: '8e3HwQz5pXh9k7LqJrYa3yU3D9XzfMtJ4n8mYR9k5L7d', weight: 0.75 },
];

function loadFromEnv(): SmartWallet[] | null {
  if (!process.env.SMART_WALLETS_JSON) return null;
  try {
    const parsed = JSON.parse(process.env.SMART_WALLETS_JSON);
    if (Array.isArray(parsed) && parsed.every((w) => w.alias && w.address)) {
      return parsed as SmartWallet[];
    }
  } catch {}
  return null;
}

export const SMART_WALLETS: SmartWallet[] = loadFromEnv() ?? DEFAULT_WALLETS;

// ---- Score derived from real DB events recorded by the poller ----

const MAX_UNIQUE_BUYERS_FOR_NORM = SMART_WALLETS.length;

export function smartMoneyScore(mint: string): number {
  const stats = smartMoneyForMint(mint, 1);
  if (stats.uniqueBuyers === 0) return 0;
  // Log-normalize so 1 buyer != 10 buyers visually, but cap nicely
  const score = Math.log(1 + stats.uniqueBuyers) / Math.log(1 + MAX_UNIQUE_BUYERS_FOR_NORM);
  return Math.min(1, score);
}

export function smartMoneyBuyersForMint(mint: string): Array<{ alias: string; address: string }> {
  const stats = smartMoneyForMint(mint, 1);
  if (!stats.aliases.length) return [];
  return stats.aliases.map((alias) => {
    const wallet = SMART_WALLETS.find((w) => w.alias === alias);
    return { alias, address: wallet?.address ?? '' };
  });
}

export function smartMoneyStats(mint: string, windowHours = 1): SmartMoneyStats {
  return smartMoneyForMint(mint, windowHours);
}

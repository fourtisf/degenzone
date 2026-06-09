import { SMART_WALLETS } from './smartWallets';
import { getSignaturesForAddress, getParsedTransaction } from './solana-rpc';
import { recordBuy, getWalletCursor, setWalletCursor, setPollerStat, pruneOldBuys } from './db';

// Known mints to ignore (stablecoins, wrapped SOL, etc.) — these aren't "smart buys"
const IGNORE_MINTS = new Set<string>([
  'So11111111111111111111111111111111111111112',  // wSOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',  // mSOL
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', // JitoSOL
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // ETH (wormhole)
  'EKEWdsRwG1RTuTeQjJoY29eYqJrUyJgkbtj8wfPe7N3o', // bSOL
]);

const POLL_INTERVAL_MS = 90_000;
const PER_WALLET_SIG_LIMIT = 8;
const RPC_RATE_DELAY_MS = 350; // ~3 RPC calls/sec safe for public

declare global {
  // eslint-disable-next-line no-var
  var __dh_poller_started: boolean | undefined;
  // eslint-disable-next-line no-var
  var __dh_poller_running: boolean | undefined;
  // eslint-disable-next-line no-var
  var __dh_poller_handle: NodeJS.Timeout | undefined;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function pollOnce(): Promise<{ scanned: number; newBuys: number; errors: number }> {
  let scanned = 0;
  let newBuys = 0;
  let errors = 0;

  for (const wallet of SMART_WALLETS) {
    if (!isLikelyValidSolanaAddress(wallet.address)) continue;
    const cursor = getWalletCursor(wallet.address);

    try {
      const sigs = await getSignaturesForAddress(wallet.address, {
        limit: PER_WALLET_SIG_LIMIT,
        until: cursor.last_signature ?? undefined,
      });
      scanned += sigs.length;
      if (sigs.length === 0) {
        setWalletCursor(wallet.address, cursor.last_signature ?? '', 0);
        continue;
      }

      // newest first; record cursor as the newest sig
      const newCursor = sigs[0].signature;

      // Walk oldest → newest so cursor lands on newest after success
      for (const sigInfo of sigs.slice().reverse()) {
        if (!sigInfo.blockTime) continue;
        if (sigInfo.err) continue;

        await sleep(RPC_RATE_DELAY_MS);

        try {
          const tx = await getParsedTransaction(sigInfo.signature);
          if (!tx || !tx.meta) continue;
          const pre = tx.meta.preTokenBalances ?? [];
          const post = tx.meta.postTokenBalances ?? [];

          // For each post-balance owned by the whale, compare to pre
          for (const p of post) {
            if (p.owner !== wallet.address) continue;
            if (IGNORE_MINTS.has(p.mint)) continue;
            const preMatch = pre.find((x) => x.accountIndex === p.accountIndex);
            const preAmt = preMatch?.uiTokenAmount?.uiAmount ?? 0;
            const postAmt = p.uiTokenAmount?.uiAmount ?? 0;
            const delta = postAmt - preAmt;
            if (delta > 0) {
              const inserted = recordBuy({
                wallet: wallet.address,
                wallet_alias: wallet.alias,
                mint: p.mint,
                amount: delta,
                block_time: sigInfo.blockTime,
                signature: sigInfo.signature,
                side: 'buy',
              });
              if (inserted) newBuys++;
            } else if (delta < 0) {
              recordBuy({
                wallet: wallet.address,
                wallet_alias: wallet.alias,
                mint: p.mint,
                amount: -delta,
                block_time: sigInfo.blockTime,
                signature: sigInfo.signature,
                side: 'sell',
              });
            }
          }
        } catch {
          errors++;
        }
      }

      setWalletCursor(wallet.address, newCursor, 0);
    } catch {
      errors++;
      setWalletCursor(wallet.address, cursor.last_signature ?? '', cursor.consecutive_errors + 1);
    }
  }

  pruneOldBuys(48);
  setPollerStat('last_run_at', String(Date.now()));
  setPollerStat('last_scanned', String(scanned));
  setPollerStat('last_new_buys', String(newBuys));
  setPollerStat('last_errors', String(errors));
  return { scanned, newBuys, errors };
}

export function startPoller() {
  if (globalThis.__dh_poller_started) return;
  globalThis.__dh_poller_started = true;
  // eslint-disable-next-line no-console
  console.log(`[smart-money-poller] started — interval ${POLL_INTERVAL_MS / 1000}s, wallets ${SMART_WALLETS.length}`);

  const tick = async () => {
    if (globalThis.__dh_poller_running) return;
    globalThis.__dh_poller_running = true;
    try {
      const r = await pollOnce();
      // eslint-disable-next-line no-console
      console.log(`[smart-money-poller] scanned=${r.scanned} new=${r.newBuys} err=${r.errors}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[smart-money-poller] tick failed:', (e as Error).message);
    } finally {
      globalThis.__dh_poller_running = false;
    }
  };

  // Kick the first run after 10s so we don't slam RPC on boot
  setTimeout(tick, 10_000);
  globalThis.__dh_poller_handle = setInterval(tick, POLL_INTERVAL_MS);
  globalThis.__dh_poller_handle.unref?.();
}

function isLikelyValidSolanaAddress(s: string): boolean {
  // Base58, 32-44 chars
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);
}

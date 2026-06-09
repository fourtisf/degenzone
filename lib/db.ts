import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const DB_DIR = process.env.DZ_DB_DIR || '/tmp/degenzone-db';
const DB_PATH = path.join(DB_DIR, 'app.db');

declare global {
  // eslint-disable-next-line no-var
  var __dh_db: Database.Database | undefined;
}

function init(): Database.Database {
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
  const d = new Database(DB_PATH);
  d.pragma('journal_mode = WAL');
  d.pragma('synchronous = NORMAL');
  d.pragma('foreign_keys = ON');

  d.exec(`
    -- Smart-money buy events recorded by the whale poller
    CREATE TABLE IF NOT EXISTS smart_buys (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet      TEXT NOT NULL,
      wallet_alias TEXT,
      mint        TEXT NOT NULL,
      amount      REAL NOT NULL,
      block_time  INTEGER NOT NULL,
      signature   TEXT NOT NULL,
      side        TEXT NOT NULL CHECK(side IN ('buy', 'sell')),
      UNIQUE(signature, wallet, mint)
    );
    CREATE INDEX IF NOT EXISTS idx_smart_buys_mint_time ON smart_buys(mint, block_time DESC);
    CREATE INDEX IF NOT EXISTS idx_smart_buys_wallet_time ON smart_buys(wallet, block_time DESC);

    -- Last-checked signature per wallet so we don't re-process
    CREATE TABLE IF NOT EXISTS wallet_cursor (
      wallet              TEXT PRIMARY KEY,
      last_signature      TEXT,
      last_polled_at      INTEGER NOT NULL DEFAULT 0,
      consecutive_errors  INTEGER NOT NULL DEFAULT 0
    );

    -- Server-side watchlist (per browser_id; trivial pseudo-account)
    CREATE TABLE IF NOT EXISTS watchlist (
      browser_id  TEXT NOT NULL,
      chain       TEXT NOT NULL,
      address     TEXT NOT NULL,
      symbol      TEXT,
      added_at    INTEGER NOT NULL,
      PRIMARY KEY(browser_id, address)
    );
    CREATE INDEX IF NOT EXISTS idx_watchlist_browser ON watchlist(browser_id);

    -- Poller stats / heartbeat
    CREATE TABLE IF NOT EXISTS poller_stats (
      key         TEXT PRIMARY KEY,
      value       TEXT NOT NULL
    );
  `);
  return d;
}

export function db(): Database.Database {
  if (!globalThis.__dh_db) globalThis.__dh_db = init();
  return globalThis.__dh_db;
}

// ---- Smart money queries ----

export function recordBuy(row: {
  wallet: string;
  wallet_alias: string;
  mint: string;
  amount: number;
  block_time: number;
  signature: string;
  side: 'buy' | 'sell';
}): boolean {
  try {
    const stmt = db().prepare(
      `INSERT OR IGNORE INTO smart_buys (wallet, wallet_alias, mint, amount, block_time, signature, side)
       VALUES (@wallet, @wallet_alias, @mint, @amount, @block_time, @signature, @side)`
    );
    const r = stmt.run(row);
    return r.changes > 0;
  } catch {
    return false;
  }
}

export function pruneOldBuys(retentionHours = 48) {
  try {
    const cutoff = Math.floor(Date.now() / 1000) - retentionHours * 3600;
    db().prepare(`DELETE FROM smart_buys WHERE block_time < ?`).run(cutoff);
  } catch {}
}

export type SmartMoneyStats = {
  uniqueBuyers: number;
  totalEvents: number;
  lastTs: number | null;
  aliases: string[];
};

export function smartMoneyForMint(mint: string, windowHours = 1): SmartMoneyStats {
  try {
    const cutoff = Math.floor(Date.now() / 1000) - windowHours * 3600;
    const stmt = db().prepare<[string, number]>(
      `SELECT wallet, wallet_alias, MAX(block_time) AS last_ts
       FROM smart_buys
       WHERE mint = ? AND block_time >= ? AND side = 'buy'
       GROUP BY wallet`
    );
    const rows = stmt.all(mint, cutoff) as Array<{ wallet: string; wallet_alias: string; last_ts: number }>;
    const aliases = Array.from(new Set(rows.map((r) => r.wallet_alias).filter(Boolean)));
    const lastTs = rows.length ? Math.max(...rows.map((r) => r.last_ts)) : null;
    const totalEvents = (db()
      .prepare(`SELECT COUNT(*) AS c FROM smart_buys WHERE mint = ? AND block_time >= ?`)
      .get(mint, cutoff) as { c: number }).c;
    return { uniqueBuyers: rows.length, totalEvents, aliases, lastTs };
  } catch {
    return { uniqueBuyers: 0, totalEvents: 0, aliases: [], lastTs: null };
  }
}

export function getWalletCursor(wallet: string): { last_signature: string | null; last_polled_at: number; consecutive_errors: number } {
  const row = db()
    .prepare(`SELECT last_signature, last_polled_at, consecutive_errors FROM wallet_cursor WHERE wallet = ?`)
    .get(wallet) as any;
  return row ?? { last_signature: null, last_polled_at: 0, consecutive_errors: 0 };
}

export function setWalletCursor(wallet: string, last_signature: string, errors = 0) {
  db()
    .prepare(
      `INSERT INTO wallet_cursor (wallet, last_signature, last_polled_at, consecutive_errors)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(wallet) DO UPDATE SET last_signature = excluded.last_signature,
                                          last_polled_at = excluded.last_polled_at,
                                          consecutive_errors = excluded.consecutive_errors`
    )
    .run(wallet, last_signature, Date.now(), errors);
}

export function setPollerStat(key: string, value: string) {
  db().prepare(`INSERT OR REPLACE INTO poller_stats (key, value) VALUES (?, ?)`).run(key, value);
}

export function getPollerStats(): Record<string, string> {
  const rows = db().prepare(`SELECT key, value FROM poller_stats`).all() as Array<{ key: string; value: string }>;
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

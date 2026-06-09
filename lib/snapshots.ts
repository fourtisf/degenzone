import type { Chain, Token } from './types';
import { promises as fs } from 'fs';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

type Snapshot = {
  ts: number;
  tokens: Token[];
};

const BUFFER_MINUTES = 240;        // 4h of history
const STEP_SECONDS = 60;
const MAX_ENTRIES = Math.ceil((BUFFER_MINUTES * 60) / STEP_SECONDS);

const STORE_DIR = process.env.DZ_SNAPSHOT_DIR || '/tmp/degenzone-snapshots';
const FLUSH_INTERVAL_MS = 60_000;

declare global {
  // eslint-disable-next-line no-var
  var __dh_snapshots: Map<Chain, Snapshot[]> | undefined;
  // eslint-disable-next-line no-var
  var __dh_snapshots_dirty: Set<Chain> | undefined;
  // eslint-disable-next-line no-var
  var __dh_snapshots_flusher: NodeJS.Timeout | undefined;
}

function store(): Map<Chain, Snapshot[]> {
  if (!globalThis.__dh_snapshots) {
    globalThis.__dh_snapshots = new Map();
    loadFromDisk();
    startFlusher();
  }
  return globalThis.__dh_snapshots;
}

function fileFor(chain: Chain): string {
  return path.join(STORE_DIR, `${chain}.json`);
}

function loadFromDisk() {
  try {
    if (!existsSync(STORE_DIR)) return;
    for (const chain of ['solana', 'base', 'bsc', 'eth'] as Chain[]) {
      const f = fileFor(chain);
      if (!existsSync(f)) continue;
      try {
        const raw = readFileSync(f, 'utf-8');
        const arr = JSON.parse(raw) as Snapshot[];
        if (Array.isArray(arr)) globalThis.__dh_snapshots!.set(chain, arr);
      } catch {}
    }
  } catch {}
}

function startFlusher() {
  if (globalThis.__dh_snapshots_flusher) return;
  globalThis.__dh_snapshots_dirty = new Set<Chain>();
  globalThis.__dh_snapshots_flusher = setInterval(async () => {
    const dirty = globalThis.__dh_snapshots_dirty;
    if (!dirty || dirty.size === 0) return;
    try {
      await fs.mkdir(STORE_DIR, { recursive: true });
      for (const chain of dirty) {
        const arr = globalThis.__dh_snapshots!.get(chain) ?? [];
        await fs.writeFile(fileFor(chain), JSON.stringify(arr), 'utf-8');
      }
      dirty.clear();
    } catch {
      // non-fatal — try again next tick
    }
  }, FLUSH_INTERVAL_MS);
  globalThis.__dh_snapshots_flusher.unref?.();
}

export function recordSnapshot(chain: Chain, tokens: Token[]) {
  const s = store();
  const arr = s.get(chain) ?? [];
  const now = Date.now();
  const last = arr[arr.length - 1];
  if (last && now - last.ts < STEP_SECONDS * 1000) return;
  arr.push({ ts: now, tokens });
  while (arr.length > MAX_ENTRIES) arr.shift();
  s.set(chain, arr);
  globalThis.__dh_snapshots_dirty?.add(chain);
}

export function getSnapshotNear(chain: Chain, agoMinutes: number): Snapshot | null {
  const s = store();
  const arr = s.get(chain);
  if (!arr || !arr.length) return null;
  const target = Date.now() - agoMinutes * 60_000;
  let best: Snapshot | null = null;
  let bestDelta = Infinity;
  for (const snap of arr) {
    const d = Math.abs(snap.ts - target);
    if (d < bestDelta) {
      bestDelta = d;
      best = snap;
    }
  }
  return best;
}

export function listSnapshots(chain: Chain): { ts: number; count: number }[] {
  const arr = store().get(chain) ?? [];
  return arr.map((s) => ({ ts: s.ts, count: s.tokens.length }));
}

export function storeStats(): { chains: Record<string, { count: number; oldestTs: number | null; newestTs: number | null }> } {
  const out: any = {};
  for (const [chain, arr] of store().entries()) {
    out[chain] = {
      count: arr.length,
      oldestTs: arr[0]?.ts ?? null,
      newestTs: arr[arr.length - 1]?.ts ?? null,
    };
  }
  return { chains: out };
}

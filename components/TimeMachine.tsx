'use client';

import { useEffect, useState } from 'react';
import { History, X, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import type { Chain, Token } from '@/lib/types';
import { colorForChange, formatPct, formatUsd } from '@/lib/colors';

type Props = {
  chain: Chain;
  current: Token[];
  onClose: () => void;
};

type SnapshotResponse = {
  snapshot: { ts: number; agoMinutes: number; tokens: Token[] } | null;
  range: { oldestAgoMinutes: number } | null;
  available: number;
};

const PRESETS = [15, 60, 240] as const;

export default function TimeMachine({ chain, current, onClose }: Props) {
  const [ago, setAgo] = useState<number>(60);
  const [data, setData] = useState<SnapshotResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/snapshot?chain=${chain}&ago=${ago}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chain, ago]);

  const past = data?.snapshot?.tokens ?? [];
  const pastMap = new Map(past.map((t) => [t.address, t]));
  const currentMap = new Map(current.map((t) => [t.address, t]));

  // Diff metrics
  const newEntries: Token[] = [];
  const dropouts: Token[] = [];
  const movers: { sym: string; addr: string; from: number; to: number; pct: number }[] = [];

  for (const t of current) {
    if (!pastMap.has(t.address)) newEntries.push(t);
    else {
      const p = pastMap.get(t.address)!;
      const diff = t.priceUsd > 0 && p.priceUsd > 0 ? ((t.priceUsd - p.priceUsd) / p.priceUsd) * 100 : 0;
      movers.push({ sym: t.symbol, addr: t.address, from: p.priceUsd, to: t.priceUsd, pct: diff });
    }
  }
  for (const t of past) {
    if (!currentMap.has(t.address)) dropouts.push(t);
  }

  movers.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  const topMovers = movers.slice(0, 8);

  return (
    <aside className="w-full md:w-[400px] shrink-0 bg-surface-1 border-l border-border-line h-full flex flex-col overflow-y-auto scrollbar-thin">
      <div className="px-4 pt-4 pb-3 border-b border-border-line flex items-center gap-2">
        <History size={16} strokeWidth={2.5} className="text-accent" />
        <div className="flex-1">
          <div className="font-bold text-sm tracking-tight">Time Machine</div>
          <div className="text-[10px] text-zinc-500">
            Snapshot comparison · {chain.toUpperCase()}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded text-zinc-500 hover:text-white hover:bg-surface-2 transition flex items-center justify-center"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-border-line">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Compare to</div>
        <div className="flex gap-1">
          {PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => setAgo(m)}
              className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded transition border ${
                ago === m
                  ? 'bg-surface-3 text-white border-border-strong'
                  : 'border-border-line text-zinc-400 hover:text-white hover:border-border-strong'
              }`}
            >
              {m < 60 ? `${m}m ago` : `${m / 60}h ago`}
            </button>
          ))}
        </div>
        {data && data.range && (
          <div className="text-[10px] text-zinc-600 mt-2">
            {data.available} snapshots stored · oldest {data.range.oldestAgoMinutes}m ago
          </div>
        )}
      </div>

      {!data?.snapshot ? (
        <div className="p-6 text-center text-xs text-zinc-500">
          {loading ? (
            <span>Loading snapshot…</span>
          ) : (
            <>
              <div className="mb-2">No snapshot for {ago < 60 ? `${ago}m` : `${ago / 60}h`} ago yet.</div>
              <div className="text-zinc-600">
                Snapshots build up as the app runs. Come back in a few minutes.
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="px-4 py-3 border-b border-border-line grid grid-cols-3 gap-2 text-center">
            <Metric label="New entries" value={newEntries.length} accent="text-emerald-400" />
            <Metric label="Dropouts" value={dropouts.length} accent="text-red-400" />
            <Metric label="Survived" value={current.length - newEntries.length} accent="text-zinc-300" />
          </div>

          <div className="px-4 py-3 border-b border-border-line">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
              Biggest moves vs {ago < 60 ? `${ago}m` : `${ago / 60}h`} ago
            </div>
            <div className="space-y-1">
              {topMovers.map((m) => (
                <div key={m.addr} className="flex items-center gap-2 text-xs">
                  {m.pct >= 0 ? (
                    <ArrowUpRight size={12} className="text-emerald-400 shrink-0" />
                  ) : (
                    <ArrowDownRight size={12} className="text-red-400 shrink-0" />
                  )}
                  <span className="font-semibold w-16 truncate">{m.sym}</span>
                  <span className="flex-1 text-zinc-500 font-mono tabular-nums text-[11px]">
                    {formatUsd(m.from, { compact: false })} →{' '}
                    <span className="text-zinc-300">{formatUsd(m.to, { compact: false })}</span>
                  </span>
                  <span
                    className="font-mono tabular-nums text-[11px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: colorForChange(m.pct), color: '#fff' }}
                  >
                    {formatPct(m.pct)}
                  </span>
                </div>
              ))}
              {topMovers.length === 0 && (
                <div className="text-xs text-zinc-600 text-center py-3">No price differences detected.</div>
              )}
            </div>
          </div>

          {newEntries.length > 0 && (
            <div className="px-4 py-3 border-b border-border-line">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                <Plus size={11} strokeWidth={3} className="text-emerald-400" />
                New in top 100
              </div>
              <div className="flex flex-wrap gap-1">
                {newEntries.slice(0, 18).map((t) => (
                  <span
                    key={t.address}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    title={t.name}
                  >
                    {t.symbol}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
}

function Metric({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div>
      <div className={`text-xl font-bold tabular-nums ${accent}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}

'use client';

import { Star, X, ExternalLink, Copy, Check, Zap, Gem, Sparkles, Brain, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Sparkline from './Sparkline';
import type { Token } from '@/lib/types';
import { formatAge, formatPct, formatUsd, colorForChange } from '@/lib/colors';
import { getNarrative } from '@/lib/narratives';

type Props = {
  token: Token | null;
  watched: boolean;
  isPump: boolean;
  isWhale: boolean;
  onToggleWatch: (address: string) => void;
  onClose: () => void;
};

function tradeUrl(t: Token): string {
  if (t.chain === 'solana') return `https://jup.ag/swap/SOL-${t.address}`;
  return `https://app.uniswap.org/#/swap?outputCurrency=${t.address}`;
}

function chartUrl(t: Token): string {
  const chainMap: Record<string, string> = { solana: 'solana', base: 'base', bsc: 'bsc', eth: 'ethereum' };
  return `https://dexscreener.com/${chainMap[t.chain] ?? t.chain}/${t.pairAddress}`;
}

function explorerUrl(t: Token): string {
  if (t.chain === 'solana') return `https://solscan.io/token/${t.address}`;
  if (t.chain === 'base')   return `https://basescan.org/token/${t.address}`;
  if (t.chain === 'bsc')    return `https://bscscan.com/token/${t.address}`;
  return `https://etherscan.io/token/${t.address}`;
}

const TF_LABEL: Record<string, string> = { m5: '5m', h1: '1h', h6: '6h', h24: '24h' };

type MintSafety = {
  mintRenounced: boolean;
  freezeRenounced: boolean;
  concentration: { top10: number } | null;
  concentrated: boolean;
  safe: boolean;
  supply: number;
};

export default function SidePanel({ token, watched, isPump, isWhale, onToggleWatch, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [safety, setSafety] = useState<MintSafety | null>(null);
  const [safetyState, setSafetyState] = useState<'idle' | 'loading' | 'error'>('idle');

  const address = token?.address;
  const isSolana = token?.chain === 'solana';

  useEffect(() => {
    if (!address || !isSolana) { setSafety(null); setSafetyState('idle'); return; }
    let active = true;
    setSafety(null);
    setSafetyState('loading');
    fetch(`/api/mint?address=${encodeURIComponent(address)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (active) { setSafety(d); setSafetyState('idle'); } })
      .catch(() => { if (active) setSafetyState('error'); });
    return () => { active = false; };
  }, [address, isSolana]);

  if (!token) return null;

  const buyRatio24 =
    token.buys24h + token.sells24h > 0
      ? token.buys24h / (token.buys24h + token.sells24h)
      : 0.5;

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(token.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <aside className="w-full md:w-[400px] shrink-0 bg-surface-1 border-l border-border-line h-full flex flex-col overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border-line flex items-start gap-3">
        {token.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={token.imageUrl}
            alt={token.symbol}
            className="w-11 h-11 rounded-full bg-surface-2 object-cover ring-1 ring-border-line"
            onError={(e) => ((e.currentTarget.style.display = 'none'))}
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold ring-1 ring-border-line">
            {token.symbol.slice(0, 3)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold text-base tracking-tight truncate">{token.symbol}</span>
            {isPump && (
              <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-accent/15 text-accent border border-accent/30 flex items-center gap-0.5">
                <Zap size={9} strokeWidth={3} /> pump
              </span>
            )}
            {isWhale && (
              <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-whale/15 text-whale border border-whale/30 flex items-center gap-0.5">
                <Gem size={9} strokeWidth={3} /> whale
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-500 truncate">{token.name}</div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onToggleWatch(token.address)}
            className={`w-8 h-8 rounded transition flex items-center justify-center ${
              watched ? 'text-accent hover:bg-surface-2' : 'text-zinc-500 hover:text-accent hover:bg-surface-2'
            }`}
            title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
            aria-label="Toggle watchlist"
          >
            <Star size={16} fill={watched ? '#FFB800' : 'none'} strokeWidth={2} />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded text-zinc-500 hover:text-white hover:bg-surface-2 transition flex items-center justify-center"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Price + chart */}
      <div className="px-4 py-4 border-b border-border-line">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Price</div>
            <div className="text-[26px] font-bold tabular-nums leading-none tracking-tight">
              {formatUsd(token.priceUsd, { compact: false })}
            </div>
          </div>
          <div
            className="text-sm font-semibold tabular-nums px-2 py-1 rounded leading-none"
            style={{ background: colorForChange(token.priceChangePct.h24), color: '#fff' }}
          >
            {formatPct(token.priceChangePct.h24)}
          </div>
        </div>

        <Sparkline chain={token.chain} pair={token.pairAddress} price={token.priceUsd} />

        <div className="grid grid-cols-4 gap-1 mt-3">
          {(['m5', 'h1', 'h6', 'h24'] as const).map((tf) => {
            const v = token.priceChangePct[tf];
            return (
              <div
                key={tf}
                className="rounded px-2 py-1.5 text-center"
                style={{ background: colorForChange(v) }}
              >
                <div className="text-[9px] uppercase opacity-70 tracking-wider">{TF_LABEL[tf]}</div>
                <div className="text-xs font-semibold tabular-nums mt-0.5">{formatPct(v)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-4 py-3 border-b border-border-line grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
        <Stat label="Market Cap" value={formatUsd(token.marketCapUsd)} />
        <Stat label="FDV" value={formatUsd(token.fdvUsd)} />
        <Stat label="Liquidity" value={formatUsd(token.liquidityUsd)} />
        <Stat label="Volume 24h" value={formatUsd(token.volumeUsd.h24)} />
        <Stat label="Volume 1h" value={formatUsd(token.volumeUsd.h1)} />
        <Stat label="Pool Age" value={formatAge(token.ageHours)} />
        <Stat label="DEX" value={token.dexId ?? '—'} />
        <Stat label="Txns 24h" value={(token.buys24h + token.sells24h).toLocaleString()} />
      </div>

      {/* On-chain safety (Solana) */}
      {isSolana && (
        <div className="px-4 py-3 border-b border-border-line">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
            <span>Contract safety · on-chain</span>
            {safetyState === 'loading' && <Loader2 size={11} className="animate-spin text-zinc-500" />}
            {safety && (
              <span className={`normal-case font-semibold flex items-center gap-1 ${safety.safe ? 'text-emerald-400' : 'text-amber-400'}`}>
                {safety.safe ? <ShieldCheck size={12} strokeWidth={2.5} /> : <ShieldAlert size={12} strokeWidth={2.5} />}
                {safety.safe ? 'Safe' : 'Caution'}
              </span>
            )}
          </div>
          {safetyState === 'error' ? (
            <div className="text-[11px] text-zinc-600">On-chain data unavailable.</div>
          ) : safety ? (
            <div className="space-y-1.5">
              <SafetyRow ok={safety.mintRenounced} okLabel="Mint authority renounced" badLabel="Mint authority active — supply can be inflated" />
              <SafetyRow ok={safety.freezeRenounced} okLabel="Freeze authority renounced" badLabel="Freeze authority active — holders can be frozen" />
              {safety.concentration && (
                <SafetyRow
                  ok={!safety.concentrated}
                  okLabel={`Top 10 hold ${(safety.concentration.top10 * 100).toFixed(1)}%`}
                  badLabel={`Concentrated — top 10 hold ${(safety.concentration.top10 * 100).toFixed(1)}%`}
                />
              )}
            </div>
          ) : safetyState === 'loading' ? (
            <div className="text-[11px] text-zinc-600">Checking mint…</div>
          ) : null}
        </div>
      )}

      {/* Narrative + smart money */}
      {(token.narrativeId || (token.smartScore ?? 0) > 0.3) && (
        <div className="px-4 py-3 border-b border-border-line space-y-2.5">
          {token.narrativeId && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Narrative</span>
              <span className="font-medium text-zinc-100 flex items-center gap-1.5">
                <span>{getNarrative(token.symbol, token.ageHours).emoji}</span>
                <span>{getNarrative(token.symbol, token.ageHours).label}</span>
              </span>
            </div>
          )}
          {(token.smartScore ?? 0) > 0.3 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Brain size={10} strokeWidth={2.5} className="text-cyan-400" />
                  Smart money
                </span>
                <span className="font-medium text-cyan-400 tabular-nums">
                  {Math.round((token.smartScore ?? 0) * 100)} / 100
                </span>
              </div>
              {token.smartBuyers && token.smartBuyers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {token.smartBuyers.slice(0, 6).map((b) => (
                    <span
                      key={b.alias}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20"
                    >
                      {b.alias}
                    </span>
                  ))}
                  {token.smartBuyers.length > 6 && (
                    <span className="text-[10px] text-zinc-500">+{token.smartBuyers.length - 6} more</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Buy / Sell ratio */}
      <div className="px-4 py-3 border-b border-border-line">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
          <span>Buy / Sell pressure · 24h</span>
          <span className="tabular-nums text-zinc-300 normal-case font-mono">
            <span className="text-emerald-400">{(buyRatio24 * 100).toFixed(0)}</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span className="text-red-400">{((1 - buyRatio24) * 100).toFixed(0)}</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-surface-2 flex">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(buyRatio24 * 100).toFixed(1)}%` }} />
          <div className="h-full bg-red-500 transition-all" style={{ width: `${((1 - buyRatio24) * 100).toFixed(1)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] mt-1.5 text-zinc-600 font-mono tabular-nums">
          <span>{token.buys24h.toLocaleString()} buys</span>
          <span>{token.sells24h.toLocaleString()} sells</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-4 space-y-1.5 mt-auto">
        <a
          href={tradeUrl(token)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded font-semibold text-[13px] transition hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #FFB800 0%, #FF6B35 100%)', color: '#000' }}
        >
          <Sparkles size={14} strokeWidth={2.5} />
          Trade on {token.chain === 'solana' ? 'Jupiter' : 'Uniswap'}
          <ExternalLink size={12} strokeWidth={2.5} />
        </a>
        <div className="grid grid-cols-2 gap-1.5">
          <a
            href={chartUrl(token)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 rounded border border-border-line hover:border-border-strong hover:bg-surface-2 transition text-xs text-zinc-300"
          >
            Chart <ExternalLink size={10} strokeWidth={2.5} />
          </a>
          <a
            href={explorerUrl(token)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 rounded border border-border-line hover:border-border-strong hover:bg-surface-2 transition text-xs text-zinc-300"
          >
            Explorer <ExternalLink size={10} strokeWidth={2.5} />
          </a>
        </div>
        <button
          onClick={copy}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded border border-border-line hover:border-border-strong hover:bg-surface-2 transition text-[11px] text-zinc-500 hover:text-zinc-300 font-mono"
          title="Copy contract"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          <span className="truncate max-w-[280px]">{token.address}</span>
        </button>
      </div>
    </aside>
  );
}

function SafetyRow({ ok, okLabel, badLabel }: { ok: boolean; okLabel: string; badLabel: string }) {
  return (
    <div className="flex items-start gap-1.5 text-[11px]">
      {ok ? (
        <ShieldCheck size={13} strokeWidth={2.5} className="text-emerald-400 shrink-0 mt-px" />
      ) : (
        <ShieldAlert size={13} strokeWidth={2.5} className="text-amber-400 shrink-0 mt-px" />
      )}
      <span className={ok ? 'text-zinc-300' : 'text-amber-300'}>{ok ? okLabel : badLabel}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">{label}</div>
      <div className="font-semibold tabular-nums text-zinc-100 text-[13px]">{value}</div>
    </div>
  );
}

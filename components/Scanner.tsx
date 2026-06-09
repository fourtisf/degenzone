'use client';

import { useState } from 'react';
import { Search, Loader2, Copy, Check, ExternalLink, Droplet, Send } from 'lucide-react';
import { formatUsd, formatPct, formatAge, colorForChange } from '@/lib/colors';

type Social = { type: string; url: string };
type Market = {
  name: string | null;
  symbol: string | null;
  imageUrl: string | null;
  priceUsd: number | null;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceChange: { m5: number | null; h1: number | null; h6: number | null; h24: number | null };
  buys24h: number | null;
  sells24h: number | null;
  ageHours: number | null;
  dexId: string | null;
  pairUrl: string | null;
  socials: Social[];
  websites: string[];
};

type MintResult = {
  mint: string;
  decimals: number;
  supply: number;
  mintRenounced: boolean;
  freezeRenounced: boolean;
  concentration: { top1: number; top10: number; accountsSampled: number } | null;
  concentrated: boolean;
  market: Market | null;
  lowLiquidity: boolean;
  safe: boolean;
};

function scoreFor(r: MintResult): number {
  let s = 100;
  if (!r.mintRenounced) s -= 35;
  if (!r.freezeRenounced) s -= 25;
  if (r.concentrated) s -= 20;
  if (r.lowLiquidity) s -= 15;
  if (!r.market) s -= 5;
  return Math.max(0, Math.min(100, s));
}

function verdict(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'SAFE', color: '#22c55e' };
  if (score >= 50) return { label: 'CAUTION', color: '#f59e0b' };
  return { label: 'DANGER', color: '#ef4444' };
}

export default function Scanner({ initialAddress = '' }: { initialAddress?: string }) {
  const [address, setAddress] = useState(initialAddress);
  const [result, setResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  async function scan(e?: React.FormEvent) {
    e?.preventDefault();
    const addr = address.trim();
    if (addr.length < 32 || addr.length > 44) {
      setError('Enter a valid Solana token address.');
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`/api/mint?address=${encodeURIComponent(addr)}`);
      if (!r.ok) {
        setError(r.status === 404 ? 'Not an SPL mint — check the address.' : 'On-chain lookup failed. Try again.');
        return;
      }
      setResult(await r.json());
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const score = result ? scoreFor(result) : 0;
  const v = verdict(score);
  const name = result?.market?.symbol ?? 'TOKEN';
  const fullName = result?.market?.name ?? null;
  const shareText = result ? `${name} scored ${score}/100 (${v.label}) on DegenZone Scanner` : '';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1400);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Contract Scanner</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Paste a Solana token address for an instant on-chain safety score — authorities,
        holder concentration, and liquidity.
      </p>

      <form onSubmit={scan} className="flex gap-2 mb-6">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Solana token address (CA)"
          spellCheck={false}
          className="flex-1 bg-surface-2 border border-border-line focus:border-border-strong rounded px-3 py-2.5 text-sm font-mono outline-none transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded text-black hover:brightness-110 transition disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FFB800 0%, #FF6B35 100%)' }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} strokeWidth={2.5} />}
          Scan
        </button>
      </form>

      {error && (
        <div className="rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm px-3 py-2.5">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          {/* Score header */}
          <div className="rounded-xl border border-border-line bg-surface-1 p-5 flex flex-col sm:flex-row items-center gap-5">
            <ScoreRing score={score} color={v.color} />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="text-xs font-bold tracking-widest mb-1" style={{ color: v.color }}>{v.label}</div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
                {result.market?.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.market.imageUrl} alt="" className="w-7 h-7 rounded-full ring-1 ring-border-line" onError={(e) => (e.currentTarget.style.display = 'none')} />
                )}
                <span className="text-xl font-bold tracking-tight uppercase">{name}</span>
                {fullName && <span className="text-zinc-500 text-sm truncate">({fullName})</span>}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-[11px] px-2 py-0.5 rounded bg-surface-2 border border-border-line text-zinc-300">Solana</span>
                <button
                  onClick={() => { navigator.clipboard?.writeText(result.mint); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
                  className="text-[11px] px-2 py-0.5 rounded bg-surface-2 border border-border-line text-zinc-300 font-mono inline-flex items-center gap-1 hover:border-border-strong transition"
                >
                  {result.mint.slice(0, 4)}…{result.mint.slice(-4)}
                  {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                </button>
                {result.market?.priceUsd != null && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-surface-2 border border-border-line text-zinc-300 tabular-nums">
                    {formatUsd(result.market.priceUsd, { compact: false })}
                  </span>
                )}
              </div>
              {!result.market && (
                <p className="text-[11px] text-zinc-500 mt-2">
                  Limited market data — token may be new or have no DEX pair yet.
                </p>
              )}
            </div>
          </div>

          {/* Share */}
          <div className="rounded-xl border border-border-line bg-surface-1 px-4 py-3 flex items-center gap-2 flex-wrap text-sm">
            <span className="text-zinc-500 mr-1">Share:</span>
            <ShareBtn href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} label="X" />
            <ShareBtn href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} label="Telegram" icon={<Send size={12} />} />
            <ShareBtn href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`} label="WhatsApp" />
            <button onClick={copyLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border-line hover:border-border-strong hover:bg-surface-2 transition text-xs text-zinc-300">
              {linkCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {linkCopied ? 'Copied' : 'Copy link'}
            </button>
          </div>

          {/* Security analysis grid */}
          <div>
            <h2 className="text-sm font-bold text-zinc-200 mb-3">
              Security Analysis <span className="text-zinc-500 font-normal">— {name}</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <CheckCard label="Mintable" bad={!result.mintRenounced} />
              <CheckCard label="Freezable" bad={!result.freezeRenounced} />
              <CheckCard
                label="Holder Concentration"
                bad={result.concentrated}
                value={result.concentration ? `${(result.concentration.top10 * 100).toFixed(1)}%` : undefined}
              />
              <CheckCard
                label="Liquidity"
                bad={result.lowLiquidity}
                neutralValue={result.market?.liquidityUsd != null ? formatUsd(result.market.liquidityUsd) : undefined}
              />
            </div>
          </div>

          {/* Market stats */}
          {result.market && (
            <div>
              <h2 className="text-sm font-bold text-zinc-200 mb-3">Market</h2>
              <div className="rounded-xl border border-border-line bg-surface-1 p-4">
                <div className="grid grid-cols-4 gap-1 mb-4">
                  {(['m5', 'h1', 'h6', 'h24'] as const).map((tf) => (
                    <div key={tf} className="rounded px-2 py-1.5 text-center" style={{ background: colorForChange(result.market!.priceChange[tf]) }}>
                      <div className="text-[9px] uppercase opacity-70 tracking-wider">{tf === 'm5' ? '5m' : tf}</div>
                      <div className="text-xs font-semibold tabular-nums mt-0.5">{formatPct(result.market!.priceChange[tf])}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
                  <Meta label="Market Cap" value={formatUsd(result.market.marketCapUsd)} />
                  <Meta label="FDV" value={formatUsd(result.market.fdvUsd)} />
                  <Meta label="Liquidity" value={formatUsd(result.market.liquidityUsd)} />
                  <Meta label="Volume 24h" value={formatUsd(result.market.volume24hUsd)} />
                  <Meta label="Pair Age" value={formatAge(result.market.ageHours)} />
                  <Meta label="DEX" value={result.market.dexId ?? '—'} />
                </div>
              </div>
            </div>
          )}

          {/* On-chain facts */}
          <div className="rounded-xl border border-border-line bg-surface-1 p-4 grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-xs">
            <Meta label="Supply" value={result.supply.toLocaleString()} />
            <Meta label="Decimals" value={String(result.decimals)} />
            {result.concentration && <Meta label="Top holder" value={`${(result.concentration.top1 * 100).toFixed(1)}%`} />}
            {result.concentration && <Meta label="Top 10" value={`${(result.concentration.top10 * 100).toFixed(1)}%`} />}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-1.5">
            {result.market?.pairUrl && <LinkChip href={result.market.pairUrl} label="DexScreener" />}
            <LinkChip href={`https://solscan.io/token/${result.mint}`} label="Solscan" />
            <LinkChip href={`https://jup.ag/swap/SOL-${result.mint}`} label="Trade" icon={<Droplet size={10} />} />
            {result.market?.websites.map((w, i) => <LinkChip key={`w${i}`} href={w} label="Website" />)}
            {result.market?.socials.map((s, i) => <LinkChip key={`s${i}`} href={s.url} label={s.type} />)}
          </div>

          {result.concentration && (
            <p className="text-[10px] text-zinc-600">
              Holder concentration may include DEX liquidity pools, so it is an upper bound.
              Score is heuristic and not financial advice — always do your own research.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div className="relative shrink-0" style={{ width: 128, height: 128 }}>
      <svg width={128} height={128} className="-rotate-90">
        <circle cx={64} cy={64} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={9} />
        <circle cx={64} cy={64} r={r} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-[10px] text-zinc-500">/100</span>
      </div>
    </div>
  );
}

function CheckCard({ label, bad, value, neutralValue }: { label: string; bad: boolean; value?: string; neutralValue?: string }) {
  const badgeText = neutralValue ?? value ?? (bad ? 'Yes' : 'No');
  return (
    <div className="rounded-lg border border-border-line bg-surface-1 px-4 py-3 flex items-center justify-between gap-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <span
        className={`text-xs font-bold px-2 py-1 rounded ${bad ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}
      >
        {badgeText}
      </span>
    </div>
  );
}

function ShareBtn({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border-line hover:border-border-strong hover:bg-surface-2 transition text-xs text-zinc-300"
    >
      {icon ?? <ExternalLink size={12} strokeWidth={2.5} />}
      {label}
    </a>
  );
}

function LinkChip({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border-line hover:border-border-strong hover:bg-surface-2 transition text-[11px] text-zinc-300 capitalize"
    >
      {icon ?? <ExternalLink size={10} strokeWidth={2.5} />}
      {label}
    </a>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">{label}</div>
      <div className="font-semibold tabular-nums text-zinc-100">{value}</div>
    </div>
  );
}

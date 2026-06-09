'use client';

import { useState } from 'react';
import { Wallet, X, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { colorForChange, formatPct, formatUsd } from '@/lib/colors';

type Holding = {
  address: string;
  symbol?: string;
  name?: string;
  imageUrl?: string;
  pairAddress?: string;
  uiAmount: number;
  decimals: number;
  priceUsd: number | null;
  priceChange24h: number | null;
  balanceUsd: number;
  unpriced: boolean;
};

type Portfolio = {
  wallet: string;
  source: string;
  holdings: Holding[];
  totalUsd: number;
  pricedHoldings: number;
  unpricedHoldings: number;
  change24hPct: number;
  change24hUsd: number;
};

type Props = {
  wallet: string;
  setWallet: (w: string) => void;
  onLoad: (addresses: Set<string>) => void;
  onClose: () => void;
};

export default function WalletPanel({ wallet, setWallet, onLoad, onClose }: Props) {
  const [data, setData] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState(wallet);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/portfolio?wallet=${encodeURIComponent(input.trim())}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`);
      setData(d);
      setWallet(d.wallet);
      onLoad(new Set(d.holdings.filter((h: Holding) => !h.unpriced).map((h: Holding) => h.address)));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-full md:w-[400px] shrink-0 bg-surface-1 border-l border-border-line h-full flex flex-col overflow-y-auto scrollbar-thin">
      <div className="px-4 pt-4 pb-3 border-b border-border-line flex items-center gap-2">
        <Wallet size={16} strokeWidth={2.5} className="text-accent" />
        <div className="flex-1">
          <div className="font-bold text-sm tracking-tight">Portfolio overlay</div>
          <div className="text-[10px] text-zinc-500">
            Live from Solana RPC · no API key needed
          </div>
        </div>
        <button
          onClick={() => {
            onLoad(new Set());
            onClose();
          }}
          className="w-7 h-7 rounded text-zinc-500 hover:text-white hover:bg-surface-2 transition flex items-center justify-center"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-border-line space-y-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
          placeholder="Solana wallet address (base58)"
          className="w-full px-3 py-2 text-xs font-mono bg-surface-2 border border-border-line focus:border-border-strong rounded outline-none placeholder:text-zinc-600"
        />
        <button
          onClick={load}
          disabled={loading || input.length < 32}
          className="w-full py-2 rounded font-semibold text-xs text-black disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition flex items-center justify-center gap-1.5"
          style={{ background: 'linear-gradient(135deg, #FFB800 0%, #FF6B35 100%)' }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : null}
          {loading ? 'Querying chain…' : 'Overlay portfolio'}
        </button>
        {error && (
          <div className="flex items-start gap-1.5 text-[11px] text-red-400">
            <AlertCircle size={11} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {data && (
        <>
          <div className="px-4 py-4 border-b border-border-line">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Portfolio value · priced tokens</div>
            <div className="text-3xl font-bold tabular-nums tracking-tight">{formatUsd(data.totalUsd)}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-semibold tabular-nums" style={{ color: colorForChange(data.change24hPct) }}>
                {data.change24hUsd >= 0 ? '+' : ''}{formatUsd(data.change24hUsd)}
              </span>
              <span className="text-xs tabular-nums" style={{ color: colorForChange(data.change24hPct) }}>
                ({formatPct(data.change24hPct)} 24h)
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-zinc-500">
              <span><span className="text-emerald-400 font-semibold">{data.pricedHoldings}</span> priced</span>
              <span><span className="text-zinc-400 font-semibold">{data.unpricedHoldings}</span> unpriced</span>
              <span className="text-zinc-600 font-mono ml-auto">via {data.source}</span>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Holdings · {data.holdings.length}</div>
            <div className="space-y-1">
              {data.holdings.map((h) => (
                <div key={h.address} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded hover:bg-surface-2 transition group">
                  {h.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.imageUrl} alt={h.symbol} className="w-6 h-6 rounded-full bg-surface-2 object-cover shrink-0" onError={(e) => ((e.currentTarget.style.display = 'none'))} />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-[8px] font-bold shrink-0">
                      {(h.symbol ?? h.address.slice(0, 2)).slice(0, 3)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{h.symbol ?? h.address.slice(0, 6) + '…' + h.address.slice(-4)}</div>
                    <div className="text-[10px] font-mono text-zinc-500 tabular-nums">{formatAmount(h.uiAmount)} {h.symbol ?? ''}</div>
                  </div>
                  <div className="text-right shrink-0">
                    {h.unpriced ? (
                      <span className="text-[10px] text-zinc-600 italic">unpriced</span>
                    ) : (
                      <>
                        <div className="font-mono tabular-nums text-zinc-200 text-[11px]">{formatUsd(h.balanceUsd)}</div>
                        <div className="font-mono tabular-nums text-[10px]" style={{ color: colorForChange(h.priceChange24h ?? 0) }}>
                          {formatPct(h.priceChange24h ?? 0)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 text-[10px] text-zinc-600 border-t border-border-line">
            Held tokens that appear in the top-100 are highlighted with a star border on the heatmap.
            Unpriced tokens are outside the current top-100 view.
            <a href={`https://solscan.io/account/${data.wallet}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-2 hover:text-zinc-400">
              View on Solscan <ExternalLink size={9} />
            </a>
          </div>
        </>
      )}
    </aside>
  );
}

function formatAmount(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.001) return n.toFixed(4);
  return n.toExponential(2);
}

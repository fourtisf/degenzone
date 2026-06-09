'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Brain, Zap, Gem, Sparkles, Search, Star, ChevronDown } from 'lucide-react';
import ChainIcon from '../ChainIcon';
import Logo from '../Logo';

type Tile = { sym: string; pct: number; col: number; row: number; w: number; h: number; smart?: boolean; pump?: boolean; whale?: boolean };

// Carefully hand-arranged tile grid (12-col x 8-row) for that "real heatmap" feel
const TILES: Tile[] = [
  { sym: 'WIF',    pct: 18.4,  col: 1,  row: 1, w: 4, h: 3, smart: true },
  { sym: 'PEPE',   pct: 12.1,  col: 5,  row: 1, w: 3, h: 2 },
  { sym: 'POPCAT', pct: 22.4,  col: 8,  row: 1, w: 3, h: 3, pump: true },
  { sym: 'TRUMP',  pct: 5.1,   col: 11, row: 1, w: 2, h: 2 },
  { sym: 'BONK',   pct: 8.2,   col: 5,  row: 3, w: 3, h: 3 },
  { sym: 'JTO',    pct: -3.4,  col: 11, row: 3, w: 2, h: 2 },
  { sym: 'JUP',    pct: 4.0,   col: 1,  row: 4, w: 2, h: 2, whale: true },
  { sym: 'PYTH',   pct: 6.7,   col: 3,  row: 4, w: 2, h: 2 },
  { sym: 'RAY',    pct: -1.8,  col: 8,  row: 4, w: 3, h: 2 },
  { sym: 'ORCA',   pct: -1.1,  col: 1,  row: 6, w: 2, h: 1 },
  { sym: 'MEW',    pct: 9.4,   col: 3,  row: 6, w: 2, h: 1, smart: true },
  { sym: 'IO',     pct: -0.4,  col: 5,  row: 6, w: 2, h: 1 },
  { sym: 'AI16Z',  pct: 14.2,  col: 7,  row: 6, w: 2, h: 1 },
  { sym: 'FART',   pct: 7.1,   col: 9,  row: 6, w: 2, h: 1 },
  { sym: 'DRIFT',  pct: 2.0,   col: 11, row: 6, w: 2, h: 1 },
  { sym: 'GME',    pct: -6.6,  col: 1,  row: 7, w: 3, h: 2 },
  { sym: 'PNUT',   pct: 11.3,  col: 4,  row: 7, w: 2, h: 2 },
  { sym: 'TNSR',   pct: -2.3,  col: 6,  row: 7, w: 2, h: 2 },
  { sym: 'GIGA',   pct: 3.4,   col: 8,  row: 7, w: 2, h: 2 },
  { sym: 'CHILL',  pct: -0.9,  col: 10, row: 7, w: 3, h: 2 },
];

function tileColor(pct: number): string {
  if (pct <= -10) return '#7F1D1D';
  if (pct <= -5)  return '#991B1B';
  if (pct <= -2)  return '#B91C1C';
  if (pct < -0.3) return '#7F3F3F';
  if (pct < 0.3)  return '#374151';
  if (pct < 2)    return '#1F8E47';
  if (pct < 5)    return '#16A34A';
  if (pct < 10)   return '#15803D';
  if (pct < 20)   return '#166534';
  return '#14532D';
}

export default function DashboardMockup() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  // Tiny live deltas to feel "alive"
  const delta = (i: number) => {
    const v = Math.sin((tick + i) * 0.5) * 0.4;
    return v;
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Ambient glow under the panel */}
      <div className="absolute inset-x-12 -inset-y-10 bg-gradient-to-b from-brand/15 via-brand-2/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div
        className="relative rounded-xl overflow-hidden border border-border-line shadow-[0_60px_120px_-30px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.04)] bg-surface-1"
        style={{ transform: 'perspective(2200px) rotateX(1.5deg)' }}
      >
        {/* Browser chrome */}
        <div className="h-9 bg-surface-2/80 border-b border-border-line flex items-center px-3 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex-1 mx-auto max-w-md bg-surface-3 rounded text-[10px] font-mono h-5 flex items-center justify-center px-2 text-zinc-500">
            <span className="text-emerald-500/80 mr-1.5">●</span>
            degenzone.app/app
          </div>
          <div className="w-12" />
        </div>

        {/* App header */}
        <div className="h-9 px-3 border-b border-border-line flex items-center gap-3 text-[10px] bg-canvas">
          <div className="flex items-center gap-1.5 shrink-0">
            <Logo size={14} />
            <span className="font-bold tracking-tight">DegenZone</span>
          </div>
          <div className="flex gap-0.5 bg-surface-2 rounded p-0.5">
            {(['solana', 'base', 'bsc', 'eth'] as const).map((c, i) => (
              <div
                key={c}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                  i === 0 ? 'bg-surface-3 text-white' : 'text-zinc-500'
                }`}
              >
                <ChainIcon chain={c} size={9} />
                <span className="capitalize">{c}</span>
              </div>
            ))}
          </div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-2 border border-border-line text-[10px]">
            <Search size={9} className="text-zinc-600" />
            <span className="text-zinc-600">Search tokens…</span>
            <kbd className="text-[8px] text-zinc-600 px-1 rounded bg-surface-1 border border-border-line">⌘K</kbd>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-surface-2 border border-border-line text-[9px]">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-zinc-400 font-mono">3s</span>
          </div>
        </div>

        {/* KPI strip */}
        <div className="h-8 px-3 flex items-center gap-3 md:gap-4 border-b border-border-line bg-surface-1/40 text-[10px] overflow-hidden">
          <KPI icon={<Activity size={9} />} label="24h Vol" value="$2.42B" />
          <KPI icon={<TrendingUp size={9} className="text-emerald-500" />} label="Up" value={`58 / ${80 + Math.floor(delta(0))}`} valClass="text-emerald-400" />
          <KPI icon={<TrendingDown size={9} className="text-red-500" />} label="Down" value="22 / 80" valClass="text-red-400" />
          <KPI icon={<Brain size={9} className="text-cyan-400" />} label="Smart" value="7" valClass="text-cyan-400" />
          <KPI icon={<Zap size={9} className="text-pump" />} label="Pump" value="3" valClass="text-pump" />
          <KPI icon={<Gem size={9} className="text-whale" />} label="Whale" value="5" />
          <KPI icon={<Sparkles size={9} />} label="Top mover" value={<span className="flex items-center gap-1">WIF <span className="px-1 py-0.5 rounded bg-emerald-700 text-white text-[8px]">+18%</span></span>} />
        </div>

        {/* Filter bar */}
        <div className="h-8 px-3 border-b border-border-line flex items-center gap-2 bg-surface-1/20 text-[10px] overflow-hidden">
          <FilterChip label="Time">
            <Seg active>24h</Seg><Seg>6h</Seg><Seg>1h</Seg><Seg>5m</Seg>
          </FilterChip>
          <FilterChip label="Size">
            <Seg active>Vol</Seg><Seg>Liq</Seg><Seg>MC</Seg>
          </FilterChip>
          <FilterChip label="View">
            <Seg active>Tokens</Seg><Seg>Sectors</Seg>
          </FilterChip>
          <div className="flex-1" />
          <Toggle active icon={<Brain size={9} />} label="Smart" />
          <Toggle active icon={<Zap size={9} />} label="Pump" />
          <Toggle icon={<Sparkles size={9} />} label="Fresh" />
          <Toggle active icon={<Gem size={9} />} label="Whale" />
        </div>

        {/* Heatmap + side panel */}
        <div className="flex">
          <div className="flex-1 p-1 grid grid-cols-12 grid-rows-8 gap-0.5 bg-canvas aspect-[16/8]">
            {TILES.map((t, i) => {
              const live = t.pct + delta(i);
              const col = tileColor(live);
              const sign = live >= 0 ? '+' : '';
              const size = Math.min(t.w, t.h) * 28;
              return (
                <div
                  key={t.sym}
                  className="rounded-[2px] flex flex-col items-center justify-center relative overflow-hidden transition-colors"
                  style={{
                    gridColumn: `${t.col} / span ${t.w}`,
                    gridRow:    `${t.row} / span ${t.h}`,
                    background: col,
                    boxShadow: t.smart ? 'inset 0 0 0 1.5px #06B6D4' : t.whale ? 'inset 0 0 0 1.5px #FFB800' : undefined,
                  }}
                >
                  {t.smart && (
                    <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#06B6D4]" />
                  )}
                  {t.whale && (
                    <Star size={8} className="absolute top-1 right-1 text-amber-300" fill="#FFB800" strokeWidth={0} />
                  )}
                  {t.pump && (
                    <div className="absolute inset-0 rounded-[2px] ring-1 ring-pump animate-pulse pointer-events-none" />
                  )}
                  <div
                    className="font-bold tracking-tight text-white leading-none"
                    style={{ fontSize: Math.max(8, Math.min(size * 0.42, 16)) }}
                  >
                    {t.sym}
                  </div>
                  <div
                    className="font-mono tabular-nums text-white/85 leading-none mt-0.5"
                    style={{ fontSize: Math.max(7, Math.min(size * 0.25, 11)) }}
                  >
                    {sign}{live.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini side panel */}
          <div className="hidden md:flex flex-col w-44 border-l border-border-line bg-surface-1 text-[10px]">
            <div className="px-2.5 py-2 border-b border-border-line flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-emerald-600/30 ring-1 ring-emerald-500/40 flex items-center justify-center text-[9px] font-bold">W</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[11px]">WIF</div>
                <div className="text-zinc-500 truncate">dogwifhat</div>
              </div>
              <Star size={10} className="text-amber-400" fill="#FFB800" strokeWidth={0} />
            </div>
            <div className="px-2.5 py-2 border-b border-border-line">
              <div className="text-[8px] uppercase tracking-wider text-zinc-500">Price</div>
              <div className="text-base font-bold tabular-nums tracking-tight">$2.341</div>
              <div className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-700 text-white">+18.43%</div>
            </div>
            <div className="px-2.5 py-2 border-b border-border-line">
              {/* Mini sparkline */}
              <svg viewBox="0 0 100 30" className="w-full">
                <defs>
                  <linearGradient id="spk-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M2 24 L12 22 L22 19 L32 21 L42 17 L52 15 L62 12 L72 14 L82 8 L92 6 L98 4 L98 30 L2 30 Z"
                  fill="url(#spk-grad)"
                />
                <path
                  d="M2 24 L12 22 L22 19 L32 21 L42 17 L52 15 L62 12 L72 14 L82 8 L92 6 L98 4"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-[8px] text-zinc-500 flex justify-between mt-1">
                <span>48h</span>
                <span className="text-emerald-400">+24.1%</span>
              </div>
            </div>
            <div className="px-2.5 py-2 border-b border-border-line grid grid-cols-2 gap-1 gap-y-1.5">
              {[['MC','$2.4B'],['FDV','$2.4B'],['Liq','$18M'],['Vol 24h','$142M']].map(([k,v]) => (
                <div key={k}>
                  <div className="text-[8px] uppercase tracking-wider text-zinc-500">{k}</div>
                  <div className="text-[10px] font-semibold tabular-nums font-mono">{v}</div>
                </div>
              ))}
            </div>
            <div className="px-2.5 py-2 border-b border-border-line">
              <div className="text-[8px] uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                <Brain size={8} className="text-cyan-400" /> Smart money
              </div>
              <div className="flex flex-wrap gap-0.5">
                {['Cented7','Mezo','Orange'].map((a) => (
                  <span key={a} className="text-[8px] font-mono px-1 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-2 mt-auto">
              <div className="bg-brand-gradient w-full text-center py-1.5 rounded text-[10px] font-bold text-black">
                Trade on Jupiter →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tag stripe under mockup */}
      <div className="hidden md:flex items-center justify-center gap-6 mt-6 text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Smart money</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-pump" /> Pump signal</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-whale" /> Whale activity</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 15s refresh</span>
      </div>
    </div>
  );
}

function KPI({ icon, label, value, valClass = 'text-zinc-100' }: { icon: React.ReactNode; label: string; value: React.ReactNode; valClass?: string }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="text-zinc-500">{icon}</div>
      <div className="flex flex-col leading-none">
        <span className="text-[7px] uppercase tracking-wider text-zinc-500">{label}</span>
        <span className={`text-[10px] font-semibold tabular-nums mt-0.5 ${valClass}`}>{value}</span>
      </div>
    </div>
  );
}

function FilterChip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</span>
      <div className="flex items-center gap-0.5 bg-surface-2 rounded p-0.5">{children}</div>
    </div>
  );
}

function Seg({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span className={`px-1 py-0.5 text-[9px] font-semibold rounded ${active ? 'bg-surface-3 text-white' : 'text-zinc-500'}`}>
      {children}
    </span>
  );
}

function Toggle({ active, icon, label }: { active?: boolean; icon: React.ReactNode; label: string }) {
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
      active ? 'bg-surface-3 text-white border-border-strong' : 'text-zinc-500 border-transparent'
    }`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

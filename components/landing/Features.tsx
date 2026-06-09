import { Brain, Layers, History, Bell, Wallet, Send, Zap, Globe } from 'lucide-react';

const HERO_FEATURES = [
  {
    icon: Brain,
    badge: 'PRO',
    title: 'Smart Money overlay',
    body:
      'Tiles glow cyan when 10 tracked whale wallets accumulate within the last hour. Catch the early entry, follow the alpha — not the herd.',
    color: '#06B6D4',
    visual: 'smart',
  },
  {
    icon: Layers,
    title: 'Narrative rotation',
    body:
      'See sectors as parent tiles — AI agents, dog memes, DeFi, Trump-tied. Spot capital flowing out of one narrative into the next in real time.',
    color: '#A78BFA',
    visual: 'sectors',
  },
  {
    icon: History,
    badge: 'PRO',
    title: 'Time Machine',
    body:
      'Snapshot every 60 seconds, kept for 4 hours. Compare "now vs 1h ago" and see exactly which tokens just entered the top 100 — before CT does.',
    color: '#F59E0B',
    visual: 'timeline',
  },
  {
    icon: Bell,
    title: 'Pump alerts',
    body:
      'Composite signal: volume z-score × buyer velocity × price acceleration × buy share. Audio + Telegram alert the second it fires.',
    color: '#FF6B35',
    visual: 'pulse',
  },
];

const SMALL_FEATURES = [
  { icon: Wallet, title: 'Wallet portfolio overlay', body: 'Paste any wallet → see holdings on the heatmap with live P&L.' },
  { icon: Send,   title: 'Telegram bot',             body: '/heatmap returns a PNG. /watch arms alerts. /portfolio overlays.' },
  { icon: Zap,    title: 'Live everything',           body: '15-second polling, 60fps treemap, sub-100ms tile updates.' },
  { icon: Globe,  title: '4 chains, 1 view',          body: 'Solana, Base, BSC, Ethereum — same UX, single hotkey switch.' },
];

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-16 md:mb-20">
          <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
            Built for serious traders
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-[-0.025em] leading-[1.05]">
            Eight tools.
            <br />
            <span className="text-zinc-500">One screen.</span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400 max-w-xl leading-relaxed">
            Stop juggling DexScreener, Birdeye, GMGN, Photon, and three Telegram groups.
            Everything you need to find, validate, and act on a trade.
          </p>
        </div>

        {/* Big features — 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-line rounded-xl overflow-hidden mb-px">
          {HERO_FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative bg-surface-1 p-8 md:p-10 overflow-hidden transition hover:bg-surface-2/60"
              >
                <div
                  className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-0 group-hover:opacity-25 transition-opacity duration-700 blur-3xl"
                  style={{ background: f.color }}
                />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${f.color}15`, color: f.color }}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    {f.badge && (
                      <span className="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">{f.title}</h3>
                  <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">{f.body}</p>
                  <FeatureVisual kind={f.visual} color={f.color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Small features row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-12">
          {SMALL_FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-lg bg-surface-1 border border-border-line hover:border-border-strong transition"
              >
                <Icon size={14} strokeWidth={2} className="text-zinc-500 mb-3" />
                <h3 className="font-semibold text-sm tracking-tight">{f.title}</h3>
                <p className="mt-1.5 text-[12px] text-zinc-500 leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureVisual({ kind, color }: { kind: string; color: string }) {
  if (kind === 'smart') {
    return (
      <div className="mt-7 grid grid-cols-4 gap-1.5 max-w-sm">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const isSmart = i % 3 === 0;
          const isPump = i === 5;
          return (
            <div
              key={i}
              className="aspect-square rounded relative"
              style={{
                background: i % 2 === 0 ? '#15803D' : i % 3 === 0 ? '#16A34A' : '#1F8E47',
                boxShadow: isSmart ? `inset 0 0 0 1.5px ${color}` : undefined,
              }}
            >
              {isSmart && <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />}
              {isPump && <div className="absolute inset-0 rounded ring-1 ring-accent animate-pulse" />}
            </div>
          );
        })}
      </div>
    );
  }
  if (kind === 'sectors') {
    return (
      <div className="mt-7 max-w-sm space-y-1.5">
        {[
          { label: '🐕 Dog memes', tiles: 5, base: '#16A34A' },
          { label: '🤖 AI agents', tiles: 4, base: '#15803D' },
          { label: '🏦 DeFi',       tiles: 3, base: '#7F3F3F' },
        ].map((s, i) => (
          <div key={i} className="p-1.5 rounded bg-surface-2 border border-border-line">
            <div className="text-[9px] text-zinc-400 mb-1 font-medium">{s.label}</div>
            <div className="flex gap-0.5">
              {Array.from({ length: s.tiles }).map((_, j) => (
                <div
                  key={j}
                  className="flex-1 h-5 rounded-[2px]"
                  style={{ background: s.base, opacity: 0.5 + (j / s.tiles) * 0.5 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'timeline') {
    return (
      <div className="mt-7 max-w-sm space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span className="font-mono">1h ago</span>
          <div className="flex-1 h-px bg-border-line" />
          <span className="font-mono">now</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px]">
            <div className="text-[8px] uppercase tracking-wider opacity-70">New in top 100</div>
            <div className="font-bold mt-1">+5 tokens</div>
          </div>
          <div className="rounded p-2 bg-red-500/10 border border-red-500/30 text-red-300 text-[10px]">
            <div className="text-[8px] uppercase tracking-wider opacity-70">Dropped out</div>
            <div className="font-bold mt-1">3 tokens</div>
          </div>
        </div>
      </div>
    );
  }
  // pulse
  return (
    <div className="mt-7 max-w-sm">
      <div className="rounded p-3 bg-surface-2 border border-accent/40 relative overflow-hidden">
        <div className="absolute inset-0 ring-1 ring-accent animate-pulse pointer-events-none" />
        <div className="flex items-center gap-2 text-[10px]">
          <div className="w-7 h-7 rounded-full bg-emerald-600/30 ring-1 ring-emerald-500/40 flex items-center justify-center text-[9px] font-bold">W</div>
          <div className="flex-1">
            <div className="font-bold text-sm">WIF</div>
            <div className="text-accent text-[9px] uppercase tracking-wider">PUMP SIGNAL · z=3.2 · burst 5.1x</div>
          </div>
          <div className="text-accent font-mono font-bold">+18%</div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import { Activity, Brain, Filter, Gem, History, Keyboard, Layers, Sparkles, Star, Wallet, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'How to use DegenZone — heatmap mechanics, filters, signals, shortcuts, and wallet overlay.',
};

const NAV = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'heatmap', label: 'The heatmap', icon: Activity },
  { id: 'filters', label: 'Filters', icon: Filter },
  { id: 'signals', label: 'Signals', icon: Zap },
  { id: 'sectors', label: 'Narrative sectors', icon: Layers },
  { id: 'time-machine', label: 'Time Machine', icon: History },
  { id: 'wallet', label: 'Wallet overlay', icon: Wallet },
  { id: 'watchlist', label: 'Watchlist', icon: Star },
  { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <Nav />
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10 py-10 md:py-16">
        {/* Sidebar */}
        <aside className="md:sticky md:top-20 self-start hidden md:block">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3">On this page</div>
          <nav className="space-y-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              return (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-surface-2 rounded transition"
                >
                  <Icon size={13} strokeWidth={2} className="text-zinc-500" />
                  <span>{n.label}</span>
                </a>
              );
            })}
            <div className="pt-3 mt-3 border-t border-border-line">
              <Link href="/docs/api" className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-surface-2 rounded transition">
                <span>API reference →</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <article className="prose-doc max-w-3xl">
          <Header
            kicker="Documentation"
            title="Get the most out of DegenZone"
            sub="A real-time treemap of DEX markets with smart-money overlay, narrative rotation, and pump detection. Everything you need to know in one page."
          />

          <Section id="overview" title="Overview">
            <p>
              DegenZone visualises decentralised exchange activity as a single treemap. Every tile
              is one token. <strong className="text-white">Tile size</strong> reflects trading volume (or
              liquidity, or market cap — your choice). <strong className="text-white">Tile color</strong> reflects
              the price change over the selected timeframe. The view refreshes every fifteen seconds.
            </p>
            <p>
              Four chains are live: Solana, Base, BSC, and Ethereum. Switch with the chain tabs at the
              top of the app, or press <Kbd>1</Kbd>–<Kbd>4</Kbd> while focused.
            </p>
          </Section>

          <Section id="heatmap" title="How tiles are sized and colored">
            <Bullets>
              <li><strong className="text-white">Size axis</strong> — choose Volume, Liquidity, or Market Cap from the filter bar. Volume is the default and rewards the most-traded tokens with bigger tiles.</li>
              <li><strong className="text-white">Color</strong> — a 15-stop diverging scale from deep red (sharp negative) through dark grey (flat) to deep green (sharp positive). Saturates at ±50% so an outlier doesn&apos;t flatten the rest of the map.</li>
              <li><strong className="text-white">Intensity halo</strong> — tiles with |%change| over 25% get a subtle green or red outline. Quick spotting of extreme moves.</li>
              <li><strong className="text-white">Star border</strong> — tokens in your watchlist (or held in the wallet overlay) have a gold border.</li>
            </Bullets>
            <CalloutNote>
              Hover any tile for a tooltip with price, market cap, liquidity, 24h volume, and age.
              Click a tile to open the detail panel with sparkline, action buttons, and full stats.
            </CalloutNote>
          </Section>

          <Section id="filters" title="Filters">
            <Bullets>
              <li><strong className="text-white">Time</strong> — 5m, 1h, 6h, 24h. Changes both the price-change color and the volume metric used for sizing.</li>
              <li><strong className="text-white">Size</strong> — Volume / Liquidity / M.Cap as discussed above.</li>
              <li><strong className="text-white">View</strong> — flat token grid or sector-grouped (see Narrative sectors below).</li>
              <li><strong className="text-white">Min Liq</strong> — drop tokens with liquidity below the threshold. Useful to filter out thin / honeypot tokens.</li>
            </Bullets>
            <p>
              Tokens that are obviously not memecoins or altcoins (stablecoins, wrapped majors,
              LSTs, RWA tokens like XAUt/PAXG) are excluded by default. The heatmap is built for
              tokens that <em>actually move</em>.
            </p>
          </Section>

          <Section id="signals" title="Signals">
            <SignalCard
              color="#06B6D4"
              icon={<Brain size={14} strokeWidth={2.5} />}
              title="Smart Money"
              body={
                <>
                  A cyan border + dot indicates a tracked whale wallet has bought the token in the
                  last hour. We watch ten Solana wallets (configurable via the{' '}
                  <code className="text-zinc-300 bg-surface-2 px-1 rounded">SMART_WALLETS_JSON</code> environment
                  variable). Signal comes from real on-chain RPC polling — pre-token-balance vs
                  post-token-balance diff per transaction.
                </>
              }
            />
            <SignalCard
              color="#FFB800"
              icon={<Zap size={14} strokeWidth={2.5} />}
              title="Pump"
              body={
                <>
                  Yellow pulsing border indicates an active pump signal. Composite of four sub-scores:
                  volume z-score, buyer velocity ratio, price acceleration, and buy-share. Tile must
                  pass all four thresholds simultaneously.
                </>
              }
            />
            <SignalCard
              color="#E6B800"
              icon={<Gem size={14} strokeWidth={2.5} />}
              title="Whale"
              body={
                <>
                  Gold border indicates abnormally large average trade size in the last hour combined
                  with positive 1h price change. Catches institutional / sniper accumulation in real
                  time.
                </>
              }
            />
            <SignalCard
              color="#22D3EE"
              icon={<Sparkles size={14} strokeWidth={2.5} />}
              title="Fresh"
              body={
                <>
                  When toggled, the view is restricted to tokens with pool age under 48 hours. Filter
                  thresholds (max % change, min volume) are loosened since fresh tokens are
                  inherently more volatile.
                </>
              }
            />
          </Section>

          <Section id="sectors" title="Narrative sectors">
            <p>
              Switch the <em>View</em> filter from Tokens to Sectors to see a two-level treemap.
              Parent tiles group tokens by narrative — dog memes, cat memes, AI agents, Trump-tied,
              food memes, DeFi, etc. Useful to spot capital rotation: when AI tiles shrink and dog
              tiles grow, money is flowing.
            </p>
            <p>
              Categorisation is curated in{' '}
              <code className="text-zinc-300 bg-surface-2 px-1 rounded">lib/narratives.ts</code>{' '}
              by symbol match and fallback patterns. Tokens not in any sector land in &quot;Other&quot;.
            </p>
          </Section>

          <Section id="time-machine" title="Time Machine">
            <p>
              The Time Machine button in the filter bar (or <Kbd>T</Kbd>) opens a side panel
              comparing the current heatmap to a snapshot from 15 minutes, 1 hour, or 4 hours ago.
              Surfaces:
            </p>
            <Bullets>
              <li>Number of tokens that entered the top-150 since then.</li>
              <li>Number that dropped out.</li>
              <li>Biggest price movers (absolute %change since the snapshot).</li>
              <li>List of brand-new entries — typically pump.fun graduates that just crossed the volume threshold.</li>
            </Bullets>
            <p>
              Snapshots are recorded every 60 seconds and persisted to disk so they survive
              process restarts. Retention is 4 hours by default.
            </p>
          </Section>

          <Section id="wallet" title="Wallet portfolio overlay">
            <p>
              The Wallet button (or click the wallet icon in the filter bar) opens a panel where
              you can paste any Solana wallet address. We query Solana RPC{' '}
              <code className="text-zinc-300 bg-surface-2 px-1 rounded">getTokenAccountsByOwner</code>{' '}
              for real on-chain holdings, cross-reference with our price cache, and overlay the
              positions on the heatmap with a star border.
            </p>
            <p>
              The panel shows portfolio value, 24h P&L, and per-token balance with current price /
              change. Tokens outside the top-150 view are listed as &quot;unpriced&quot;.
            </p>
          </Section>

          <Section id="watchlist" title="Watchlist">
            <p>
              Click the star icon in any side panel to add a token to your watchlist. Watchlist is
              stored in <code className="text-zinc-300 bg-surface-2 px-1 rounded">localStorage</code>{' '}
              on your device (no account required).
            </p>
            <p>
              Toggle the Watchlist button in the filter bar to view only your watched tokens. The
              count badge shows how many tokens are watched.
            </p>
          </Section>

          <Section id="shortcuts" title="Keyboard shortcuts">
            <div className="rounded-lg border border-border-line bg-surface-1 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-2 text-[10px] uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Key</th>
                    <th className="text-left px-4 py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-line">
                  {[
                    ['⌘K / Ctrl+K / /', 'Focus search'],
                    ['1 / 2 / 3 / 4', 'Switch timeframe (5m / 1h / 6h / 24h)'],
                    ['S', 'Cycle size axis (Volume → Liquidity → M.Cap)'],
                    ['G', 'Toggle Sector / Token view'],
                    ['M', 'Toggle Smart Money overlay'],
                    ['P', 'Toggle Pump-mode'],
                    ['F', 'Toggle Fresh-mode'],
                    ['W', 'Toggle Whale-mode'],
                    ['T', 'Open Time Machine panel'],
                    ['ESC', 'Close panel / clear search'],
                  ].map(([key, action]) => (
                    <tr key={key}>
                      <td className="px-4 py-2 font-mono text-xs text-zinc-300">{key}</td>
                      <td className="px-4 py-2 text-zinc-400">{action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <div className="mt-16 pt-8 border-t border-border-line">
            <div className="flex items-center justify-between">
              <Link href="/changelog" className="text-sm text-zinc-400 hover:text-white transition">← Changelog</Link>
              <Link href="/docs/api" className="text-sm text-zinc-400 hover:text-white transition">API reference →</Link>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}

function Header({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="mb-12">
      <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">{kicker}</div>
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 text-zinc-400 text-base md:text-lg leading-relaxed max-w-2xl">{sub}</p>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 mb-12">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-4">
        <a href={`#${id}`} className="group">
          {title}
          <span className="text-zinc-700 ml-2 opacity-0 group-hover:opacity-100 transition">#</span>
        </a>
      </h2>
      <div className="text-zinc-300 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

function Bullets({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2.5 list-disc pl-5 marker:text-zinc-600">{children}</ul>;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-2 border border-border-line text-zinc-300">
      {children}
    </kbd>
  );
}

function CalloutNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 p-4 rounded-lg border border-border-line bg-surface-1 text-sm text-zinc-400 leading-relaxed">
      {children}
    </div>
  );
}

function SignalCard({
  color,
  icon,
  title,
  body,
}: {
  color: string;
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border-line bg-surface-1 p-5 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </span>
        <h3 className="font-bold tracking-tight">{title}</h3>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
    </div>
  );
}

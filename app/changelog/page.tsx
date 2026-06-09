import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What is shipping on DegenZone. Sorted newest first.',
};

const RELEASES = [
  {
    version: 'v0.5',
    date: '2026-05-18',
    title: 'Memecoin-first filtering & deeper candidate pool',
    items: [
      'Native chain tickers (SOL, BNB, MATIC, ETH) excluded from the heatmap — they crowd out memecoins, especially in M.Cap view.',
      'Filter pipeline now strips stablecoins, wrapped majors, LSTs, and RWA (gold) tokens by default. The map shows tokens that actually move.',
      'Added /pools?sort=h24_volume_usd_desc + /trending_pools + /new_pools to the upstream fetch — high min-liquidity filters now still surface 10+ memes.',
      'Min MC/FDV floor lowered to $150K. Many real Solana memes sit at $100-300K post-graduation.',
      'Search no longer substring-matches contract addresses for queries < 16 chars. Searching "pump" no longer returns every pump.fun mint.',
      'Tile hover: brightness lift with 180ms transition. Tile color fill transitions over 600ms so refreshes feel smooth instead of jumpy.',
      'DEMO badge hidden by default in production (opt-in via NEXT_PUBLIC_SHOW_DEMO_BADGE).',
    ],
  },
  {
    version: 'v0.4',
    date: '2026-05-17',
    title: 'Backend actually functions — Solana RPC + SQLite',
    items: [
      'Smart-money score is now real, not mocked. Background poller hits Solana RPC every 90s, walks signatures for 10 tracked whale wallets, parses pre/post token-balance deltas, records buys/sells in SQLite.',
      'Wallet portfolio overlay queries Solana getTokenAccountsByOwner for real on-chain holdings. P&L computed against the live token cache.',
      'New /api/poller endpoint for heartbeat + manual trigger.',
      'better-sqlite3 (v11 for Node 18 compatibility) for persistent storage; WAL mode, dirty-set flush every 60s.',
      'Solana RPC client rotates through 4 public endpoints on failure.',
      'next 14.2.18 → 14.2.35 security patch, engines field, .nvmrc, full README with deployment runbook.',
    ],
  },
  {
    version: 'v0.3',
    date: '2026-05-17',
    title: 'Premium landing + persistent snapshots',
    items: [
      'New landing-page DashboardMockup: faked-but-faithful app screenshot inside browser chrome, subtle 3D perspective, live tick animation.',
      'Hero / Features / Pricing rebuilt — 4 hero features in 2x2 grid with per-feature visuals (smart-money tile cluster, sector strip, time-diff card, pump-signal alert).',
      'Time-Machine snapshot store now writes to disk every 60s — survives pm2 restart.',
      'New /api/health endpoint probes GeckoTerminal + DexScreener, returns providers up/down + uptime + snapshot counts.',
    ],
  },
  {
    version: 'v0.2',
    date: '2026-05-17',
    title: 'Routing split + sectors + smart money + time machine + wallet + audio + Telegram bot',
    items: [
      'Marketing landing moved to /, real-time app to /app.',
      'Sector view: 2-level visx treemap, parent rectangles per narrative (dog memes, AI agents, DeFi, etc).',
      'Smart Money overlay (initially mocked; v0.4 made it real).',
      'Time Machine panel: in-memory ring buffer of 60-second snapshots, compare current to 15m / 1h / 4h ago.',
      'Wallet portfolio overlay (initially mocked; v0.4 made it real).',
      'Web Audio API alerts for pump signals (Volume2 button in header).',
      'Telegram bot scaffold with /heatmap /top /watch /whale /portfolio commands.',
      'Switched from Inter to Geist Sans + Geist Mono.',
    ],
  },
  {
    version: 'v0.1',
    date: '2026-05-17',
    title: 'Initial demo',
    items: [
      'visx treemap, box size = volume, color = % change.',
      'Solana / Base / BSC / Ethereum chain switcher.',
      'Hover tooltip, click-to-open side panel with sparkline + trade / chart / explorer links.',
      'Pump composite signal (z-score × buyer velocity × acceleration × buy share).',
      'GeckoTerminal → DexScreener provider chain with mock fallback.',
      'Keyboard shortcuts: 1-4 timeframe, S size, P/F/W toggles, ESC close.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10 md:py-16">
        <div className="mb-12">
          <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">Changelog</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">What we shipped.</h1>
          <p className="mt-4 text-zinc-400 text-base md:text-lg leading-relaxed">
            Sorted newest first.
          </p>
        </div>

        <div className="space-y-12">
          {RELEASES.map((r) => (
            <article key={r.version} className="relative pl-8">
              <span className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-accent ring-4 ring-accent/15" />
              <div className="absolute left-1.5 top-6 bottom-0 w-px bg-border-line" />
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-lg font-bold tracking-tight">{r.version}</span>
                <span className="text-xs text-zinc-500 font-mono">{r.date}</span>
              </div>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">{r.title}</h2>
              <ul className="space-y-2 text-sm text-zinc-400">
                {r.items.map((item, i) => (
                  <li key={i} className="leading-relaxed pl-4 relative">
                    <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-zinc-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border-line text-center">
          <Link href="/app" className="text-sm text-zinc-400 hover:text-white transition">
            Launch the app →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

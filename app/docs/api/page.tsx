import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'API reference',
  description: 'REST API for DegenZone — token data, portfolio holdings, snapshot diffs, OHLCV charts.',
};

const ENDPOINTS = [
  { id: 'tokens',    method: 'GET', path: '/api/tokens',    label: 'Live token list' },
  { id: 'portfolio', method: 'GET', path: '/api/portfolio', label: 'Wallet portfolio' },
  { id: 'snapshot',  method: 'GET', path: '/api/snapshot',  label: 'Time Machine snapshot' },
  { id: 'ohlcv',     method: 'GET', path: '/api/ohlcv',     label: 'OHLCV candles' },
  { id: 'poller',    method: 'GET', path: '/api/poller',    label: 'Smart-money poller stats' },
  { id: 'health',    method: 'GET', path: '/api/health',    label: 'System health' },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <Nav />
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10 py-10 md:py-16">
        <aside className="md:sticky md:top-20 self-start hidden md:block">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3">Endpoints</div>
          <nav className="space-y-1">
            {ENDPOINTS.map((e) => (
              <a key={e.id} href={`#${e.id}`} className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-surface-2 rounded transition">
                <span className="text-[9px] font-mono uppercase font-bold text-emerald-500">{e.method}</span>
                <span className="font-mono text-xs">{e.path}</span>
              </a>
            ))}
            <div className="pt-3 mt-3 border-t border-border-line">
              <Link href="/docs" className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-surface-2 rounded transition">
                <span>← Documentation</span>
              </Link>
            </div>
          </nav>
        </aside>

        <article className="max-w-3xl">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">API reference</div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">REST API</h1>
            <p className="mt-4 text-zinc-400 text-base md:text-lg leading-relaxed">
              Six read-only JSON endpoints. No authentication on the free tier (rate-limited per IP).
              Whale tier subscribers get an API key with 10 RPS quota and webhook support.
            </p>
          </div>

          <div className="rounded-lg border border-border-line bg-surface-1 p-5 mb-12">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">Base URL</div>
            <code className="text-sm text-zinc-200 font-mono">https://degenzone.com</code>
          </div>

          {/* /api/tokens */}
          <Endpoint
            id="tokens"
            method="GET"
            path="/api/tokens"
            description="Top 150 memecoin/altcoin tokens on the selected chain, enriched with narrative tag, smart-money score, and recent buyer wallets."
            params={[
              { name: 'chain',     type: 'enum',   required: true,  desc: 'solana | base | bsc | eth' },
              { name: 'timeframe', type: 'enum',   required: false, desc: 'm5 | h1 | h6 | h24 (default: h24). Determines which volume bucket is used for ranking.' },
              { name: 'minLiq',    type: 'number', required: false, desc: 'Min liquidity USD (default: 50000)' },
              { name: 'maxAge',    type: 'number', required: false, desc: 'Max pool age in hours. Setting this enables Fresh-mode (relaxed quality filters).' },
            ]}
            curl={`curl 'https://degenzone.com/api/tokens?chain=solana&timeframe=h1&minLiq=100000'`}
            response={`{
  "tokens": [
    {
      "address": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
      "pairAddress": "EP2ib6dYdEeqD8MfE2ezHCxX3kP3K2eLKkirfPm5eyMx",
      "symbol": "WIF",
      "name": "dogwifhat",
      "imageUrl": "https://dd.dexscreener.com/...",
      "priceUsd": 2.341,
      "liquidityUsd": 412183091.23,
      "marketCapUsd": 2341000000,
      "fdvUsd": 2341000000,
      "volumeUsd":      { "m5": 12450, "h1": 1245009, "h6": 12450091, "h24": 142183091 },
      "priceChangePct": { "m5": 0.45, "h1": -1.21, "h6": 5.4, "h24": 18.43 },
      "buys24h": 12340, "sells24h": 11201, "buys1h": 643, "sells1h": 502,
      "poolCreatedAt": "2024-03-04T01:23:45Z",
      "ageHours": 12480,
      "chain": "solana",
      "dexId": "raydium",
      "narrativeId": "dog",
      "smartScore": 0.78,
      "smartBuyers": [{ "alias": "Cented7", "address": "5B52..." }]
    }
  ],
  "source": "geckoterminal",
  "fetchedAt": 1742284800000,
  "delayed": false
}`}
          />

          {/* /api/portfolio */}
          <Endpoint
            id="portfolio"
            method="GET"
            path="/api/portfolio"
            description="Real Solana wallet holdings via on-chain RPC, cross-referenced with the live token cache for prices and 24h P&L. Currently Solana-only."
            params={[
              { name: 'wallet', type: 'string (base58)', required: true, desc: 'Solana wallet address, 32–44 chars' },
            ]}
            curl={`curl 'https://degenzone.com/api/portfolio?wallet=4hHQemDr8zKbVH7ZB7vXjCsAvBVtMNDqFvtRYM5UCnvw'`}
            response={`{
  "wallet": "4hHQemDr8zKbVH7ZB7vXjCsAvBVtMNDqFvtRYM5UCnvw",
  "source": "solana-rpc",
  "holdings": [
    {
      "address": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
      "symbol": "WIF",
      "name": "dogwifhat",
      "uiAmount": 1850.2,
      "decimals": 6,
      "priceUsd": 2.341,
      "priceChange24h": 18.43,
      "balanceUsd": 4332,
      "unpriced": false
    }
  ],
  "totalUsd": 12450,
  "pricedHoldings": 6,
  "unpricedHoldings": 2,
  "change24hPct": 8.4,
  "change24hUsd": 968
}`}
          />

          {/* /api/snapshot */}
          <Endpoint
            id="snapshot"
            method="GET"
            path="/api/snapshot"
            description="Time-Machine snapshot of the chain N minutes ago, plus metadata about the snapshot store."
            params={[
              { name: 'chain', type: 'enum',   required: true,  desc: 'solana | base | bsc | eth' },
              { name: 'ago',   type: 'number', required: false, desc: 'Minutes ago (default: 60). Common values: 15, 60, 240.' },
            ]}
            curl={`curl 'https://degenzone.com/api/snapshot?chain=solana&ago=60'`}
            response={`{
  "chain": "solana",
  "requestedAgoMinutes": 60,
  "available": 240,
  "range": {
    "oldestTs": 1742270400000,
    "newestTs": 1742284800000,
    "oldestAgoMinutes": 240
  },
  "snapshot": {
    "ts": 1742281200000,
    "agoMinutes": 60,
    "tokens": [/* Token[] same shape as /api/tokens */]
  }
}`}
          />

          {/* /api/ohlcv */}
          <Endpoint
            id="ohlcv"
            method="GET"
            path="/api/ohlcv"
            description="OHLCV candles for a specific pool. Used internally by the side-panel sparkline."
            params={[
              { name: 'chain',     type: 'enum',   required: true,  desc: 'solana | base | bsc | eth' },
              { name: 'pair',      type: 'string', required: true,  desc: 'Pool / pair address (base58 for Solana, 0x... for EVM)' },
              { name: 'timeframe', type: 'enum',   required: false, desc: 'minute | hour | day (default: hour)' },
              { name: 'aggregate', type: 'number', required: false, desc: 'Aggregation per candle (default: 1)' },
              { name: 'limit',     type: 'number', required: false, desc: 'Max candles (default: 48, max: 200)' },
              { name: 'price',     type: 'number', required: false, desc: 'Fallback price used by the demo generator if upstream is unreachable' },
            ]}
            curl={`curl 'https://degenzone.com/api/ohlcv?chain=solana&pair=EP2ib6dYdEeqD8MfE2ezHCxX3kP3K2eLKkirfPm5eyMx&limit=48'`}
            response={`{
  "candles": [
    { "t": 1742281200, "o": 2.31, "h": 2.36, "l": 2.30, "c": 2.34, "v": 1245000 }
  ],
  "source": "geckoterminal"
}`}
          />

          {/* /api/poller */}
          <Endpoint
            id="poller"
            method="GET"
            path="/api/poller"
            description="Heartbeat for the on-chain smart-money poller. Returns count of tracked wallets and last-cycle stats."
            params={[]}
            curl={`curl 'https://degenzone.com/api/poller'`}
            response={`{
  "walletsTracked": 10,
  "stats": {
    "last_run_at": "1742284800000",
    "last_scanned": "47",
    "last_new_buys": "3",
    "last_errors": "0"
  }
}`}
          />

          {/* /api/health */}
          <Endpoint
            id="health"
            method="GET"
            path="/api/health"
            description="System health probe — upstream provider status, uptime, snapshot counts. Backs the /status page."
            params={[]}
            curl={`curl 'https://degenzone.com/api/health'`}
            response={`{
  "status": "operational",
  "uptimeMs": 86400000,
  "uptimeHuman": "1d 0h",
  "providers": {
    "geckoterminal": "up",
    "dexscreener": "up"
  },
  "snapshots": {
    "solana": { "count": 240, "oldestTs": 1742270400000, "newestTs": 1742284800000 }
  },
  "timestamp": 1742284800000
}`}
          />

          <div className="mt-12 pt-8 border-t border-border-line">
            <div className="flex items-center justify-between">
              <Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition">← Documentation</Link>
              <Link href="/status" className="text-sm text-zinc-400 hover:text-white transition">Status →</Link>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}

function Endpoint({
  id,
  method,
  path,
  description,
  params,
  curl,
  response,
}: {
  id: string;
  method: string;
  path: string;
  description: string;
  params: Array<{ name: string; type: string; required: boolean; desc: string }>;
  curl: string;
  response: string;
}) {
  return (
    <section id={id} className="scroll-mt-20 mb-14">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">{method}</span>
        <code className="text-base md:text-lg font-mono text-zinc-100 font-semibold">{path}</code>
      </div>
      <p className="text-zinc-400 mb-5 leading-relaxed">{description}</p>

      {params.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">Query parameters</div>
          <div className="rounded-lg border border-border-line overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-[10px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Name</th>
                  <th className="text-left px-3 py-2 font-semibold">Type</th>
                  <th className="text-left px-3 py-2 font-semibold">Required</th>
                  <th className="text-left px-3 py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-line bg-surface-1">
                {params.map((p) => (
                  <tr key={p.name}>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-200">{p.name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-400">{p.type}</td>
                    <td className="px-3 py-2 text-xs">
                      {p.required ? <span className="text-accent">yes</span> : <span className="text-zinc-600">no</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-400">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">Example request</div>
        <pre className="rounded-lg bg-surface-1 border border-border-line p-3 text-xs font-mono text-zinc-300 overflow-x-auto"><code>{curl}</code></pre>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">Response</div>
        <pre className="rounded-lg bg-surface-1 border border-border-line p-3 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed"><code>{response}</code></pre>
      </div>
    </section>
  );
}

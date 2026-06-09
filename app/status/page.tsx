'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import { RefreshCw, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

type Health = {
  status: 'operational' | 'degraded' | 'down';
  uptimeMs: number;
  uptimeHuman: string;
  providers: Record<string, 'up' | 'down'>;
  snapshots: Record<string, { count: number; oldestTs: number | null; newestTs: number | null }>;
  timestamp: number;
};

export default function StatusPage() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/health', { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setData(d);
      setFetchedAt(Date.now());
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-white">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10 md:py-16">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">Status</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">System status</h1>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Live health check across upstream data providers and our snapshot store. Auto-refresh every 30 seconds.
          </p>
        </div>

        {error && !data ? (
          <ErrorBox error={error} onRetry={load} />
        ) : !data ? (
          <SkeletonBox />
        ) : (
          <>
            <StatusBanner status={data.status} />

            <Section title="Uptime">
              <div className="rounded-lg border border-border-line bg-surface-1 p-5">
                <div className="text-3xl font-bold tabular-nums tracking-tight">{data.uptimeHuman}</div>
                <div className="text-xs text-zinc-500 mt-1 font-mono">
                  Process started {fmtDate(data.timestamp - data.uptimeMs)}
                </div>
              </div>
            </Section>

            <Section title="Upstream providers">
              <div className="rounded-lg border border-border-line bg-surface-1 overflow-hidden">
                {Object.entries(data.providers).map(([name, st], i) => (
                  <div
                    key={name}
                    className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-border-line' : ''}`}
                  >
                    <span className="font-medium text-zinc-200 capitalize">{name}</span>
                    <ProviderBadge status={st} />
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Snapshot store">
              <div className="rounded-lg border border-border-line bg-surface-1 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-2 text-[10px] uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold">Chain</th>
                      <th className="text-right px-4 py-2 font-semibold">Snapshots</th>
                      <th className="text-right px-4 py-2 font-semibold">Oldest</th>
                      <th className="text-right px-4 py-2 font-semibold">Newest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-line">
                    {Object.entries(data.snapshots).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-zinc-500 text-sm">
                          No snapshots recorded yet. Builds up after a few minutes of runtime.
                        </td>
                      </tr>
                    ) : (
                      Object.entries(data.snapshots).map(([chain, s]) => (
                        <tr key={chain}>
                          <td className="px-4 py-2 font-semibold uppercase text-xs">{chain}</td>
                          <td className="px-4 py-2 text-right font-mono tabular-nums text-zinc-300">{s.count}</td>
                          <td className="px-4 py-2 text-right font-mono text-xs text-zinc-500">{s.oldestTs ? fmtDate(s.oldestTs) : '—'}</td>
                          <td className="px-4 py-2 text-right font-mono text-xs text-zinc-500">{s.newestTs ? fmtDate(s.newestTs) : '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Section>

            <div className="flex items-center justify-between mt-10 text-xs text-zinc-500">
              <span className="font-mono">last checked {fetchedAt ? fmtDate(fetchedAt) : '—'}</span>
              <button
                onClick={load}
                disabled={loading}
                className="flex items-center gap-1.5 hover:text-zinc-300 transition disabled:opacity-50"
              >
                <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </>
        )}

        <div className="mt-12 pt-8 border-t border-border-line text-center">
          <Link href="/docs/api" className="text-sm text-zinc-400 hover:text-white transition">
            API reference →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">{title}</div>
      {children}
    </section>
  );
}

function StatusBanner({ status }: { status: Health['status'] }) {
  const cfg =
    status === 'operational'
      ? { color: 'emerald', icon: CheckCircle2, label: 'All systems operational' }
      : status === 'degraded'
      ? { color: 'amber', icon: AlertCircle, label: 'Partial outage — fallbacks active' }
      : { color: 'red', icon: XCircle, label: 'Major outage' };
  const Icon = cfg.icon;
  return (
    <div
      className={`flex items-center gap-3 p-5 rounded-lg border ${
        cfg.color === 'emerald'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : cfg.color === 'amber'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          : 'bg-red-500/10 border-red-500/30 text-red-300'
      }`}
    >
      <Icon size={20} />
      <span className="font-semibold">{cfg.label}</span>
    </div>
  );
}

function ProviderBadge({ status }: { status: 'up' | 'down' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        status === 'up' ? 'text-emerald-400' : 'text-red-400'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'up' ? 'bg-emerald-400' : 'bg-red-400'
        }`}
      />
      {status === 'up' ? 'Operational' : 'Down'}
    </span>
  );
}

function SkeletonBox() {
  return <div className="rounded-lg bg-surface-1 border border-border-line h-32 animate-pulse" />;
}

function ErrorBox({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-center">
      <div className="text-red-300 font-semibold mb-2">Could not reach health endpoint</div>
      <div className="text-xs text-zinc-500 font-mono mb-3">{error}</div>
      <button onClick={onRetry} className="px-3 py-1.5 text-xs rounded border border-border-line hover:bg-surface-2 transition">Retry</button>
    </div>
  );
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

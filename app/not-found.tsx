import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas text-white flex flex-col">
      <header className="px-6 py-4 border-b border-border-line/50">
        <Link href="/" className="inline-flex items-center gap-2">
          <Logo size={22} />
          <span className="font-bold tracking-tight text-[15px]">DegenZone</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[480px] h-[480px] orb-warm opacity-50 pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[520px] h-[520px] orb-cool opacity-50 pointer-events-none" />

        <div className="relative text-center max-w-md">
          <div className="font-mono text-[120px] md:text-[180px] leading-none font-bold tracking-tight gradient-text">
            404
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-4">
            This page hasn&apos;t shipped yet.
          </h1>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            The URL you opened doesn&apos;t exist on degenzone.com. Could be a typo, an old link,
            or something we&apos;ve renamed.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded font-semibold text-sm text-black hover:brightness-110 transition shadow-[0_8px_24px_-6px_rgba(255,184,0,0.6)]"
              style={{ background: 'linear-gradient(135deg, #FFB800 0%, #FF6B35 100%)' }}
            >
              Open the heatmap
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded font-semibold text-sm text-zinc-300 bg-surface-2/60 border border-border-line hover:border-border-strong hover:text-white transition"
            >
              Back to home
            </Link>
          </div>

          <div className="mt-12 text-xs text-zinc-500">
            Looking for{' '}
            <Link href="/docs" className="underline hover:text-zinc-300">docs</Link>,{' '}
            <Link href="/docs/api" className="underline hover:text-zinc-300">API</Link>,{' '}
            <Link href="/changelog" className="underline hover:text-zinc-300">changelog</Link>,{' '}
            <Link href="/status" className="underline hover:text-zinc-300">status</Link>?
          </div>
        </div>
      </main>
    </div>
  );
}

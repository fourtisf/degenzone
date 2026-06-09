import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import DashboardMockup from './DashboardMockup';

export default function Hero() {
  return (
    <section className="relative pt-16 md:pt-24 pb-12 md:pb-20 overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute -top-20 -left-32 w-[520px] h-[520px] orb-warm pointer-events-none" />
      <div className="absolute -top-10 -right-32 w-[520px] h-[520px] orb-cool pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-[0.18] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="flex justify-center mb-5 fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-zinc-400 bg-surface-2/60 border border-border-line">
            <span className="relative inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
            </span>
            <span>v0.2 · Solana · Base · BSC · Ethereum</span>
          </span>
        </div>

        <h1
          className="fade-up text-center text-[40px] sm:text-[56px] md:text-[72px] leading-[1.02] tracking-[-0.025em] font-bold max-w-4xl mx-auto"
          style={{ animationDelay: '0.05s' }}
        >
          The <span className="gradient-text">unfair edge</span>
          <br />
          for Solana traders.
        </h1>

        <p
          className="fade-up text-center mt-5 md:mt-7 text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          style={{ animationDelay: '0.12s' }}
        >
          See what&apos;s pumping, what&apos;s rotating, and what smart money is buying —
          one screen, fifteen seconds. The terminal pros use to find the next 10x
          before Twitter does.
        </p>

        <div
          className="fade-up flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 md:mt-10"
          style={{ animationDelay: '0.18s' }}
        >
          <Link
            href="/app"
            className="group bg-brand-gradient shadow-brand inline-flex items-center gap-2 px-5 py-3 rounded-md font-semibold text-sm text-black hover:brightness-110 transition"
          >
            Launch the heatmap
            <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md font-semibold text-sm text-zinc-300 bg-surface-2/60 border border-border-line hover:border-border-strong hover:text-white transition"
          >
            <Play size={11} fill="currentColor" strokeWidth={0} />
            See how it works
          </Link>
        </div>
      </div>

      {/* Dashboard mockup — the real visual hook */}
      <div
        className="fade-up relative mt-12 md:mt-20 px-6"
        style={{ animationDelay: '0.30s' }}
      >
        <DashboardMockup />
      </div>

      {/* Fade-out at bottom so next section blends */}
      <div className="absolute inset-x-0 -bottom-1 h-24 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
    </section>
  );
}

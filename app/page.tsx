import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';
import ContractBanner from '@/components/landing/ContractBanner';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <ContractBanner />
      <Nav />
      <Hero />
      <SocialBand />
      <Features />
      <CTA />
      <Pricing />
      <Footer />
    </div>
  );
}

function SocialBand() {
  const stats = [
    { value: '$2.4B+', label: '24h tracked volume' },
    { value: '<200ms', label: 'tile update' },
    { value: '60s',    label: 'snapshot interval' },
    { value: '4',      label: 'chains, zero reload' },
  ];
  return (
    <section className="py-10 px-6 border-y border-border-line bg-gradient-to-b from-surface-1/40 to-canvas">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:border-r last:border-r-0 md:border-border-line">
            <div className="text-2xl md:text-3xl font-bold tabular-nums tracking-[-0.02em]">{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

function CTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto relative rounded-2xl border border-border-line p-10 md:p-16 overflow-hidden text-center">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] orb-warm opacity-50 pointer-events-none" />
        <div className="relative">
          <h3 className="text-3xl md:text-5xl font-bold tracking-[-0.025em] leading-tight">
            Stop screen-glued to DexScreener.
          </h3>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            One screen. Fifteen seconds. Every chain. Try the free tier — no card needed.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-md font-semibold text-sm text-black hover:brightness-110 transition shadow-[0_8px_30px_-8px_rgba(255,184,0,0.6)]"
            style={{ background: 'linear-gradient(135deg, #FFB800 0%, #FF6B35 100%)' }}
          >
            Launch DegenZone
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}

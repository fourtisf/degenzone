import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Curious traders exploring the market.',
    cta: 'Open app',
    href: '/app',
    highlight: false,
    features: [
      'Live heatmap, 24h timeframe',
      'All 4 chains',
      'Search + 5 watchlist slots',
      'Narrative sector view',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'Active Solana traders who treat this like a job.',
    cta: 'Upgrade to Pro',
    href: '/app?upgrade=pro',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Everything in Free',
      'Real-time data, no delay',
      'Smart Money overlay',
      'Audio + Telegram alerts',
      'Time Machine — 4h history',
      'Unlimited watchlist',
      'Wallet portfolio overlay',
      'Mobile PWA',
    ],
  },
  {
    name: 'Whale',
    price: '$99',
    period: 'per month',
    description: 'Desk traders, KOLs, and bot builders.',
    cta: 'Talk to us',
    href: 'mailto:hello@degenzone.app?subject=Whale tier',
    highlight: false,
    features: [
      'Everything in Pro',
      'Multi-wallet portfolio (up to 10)',
      'Custom whale-wallet tracking',
      'API access (10 RPS) + webhooks',
      'Time Machine — 24h history',
      'Branded Telegram bot',
      'Snapshot exports (CSV/PNG)',
      'Priority support',
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 px-6 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
            Pricing
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-[-0.025em] leading-[1.05]">
            Pay only if it makes
            <br />
            <span className="text-zinc-500">you faster.</span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400">
            Free tier is fully functional. Pro unlocks the edge.
            Cancel anytime — no card-on-file games.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl p-7 ${
                t.highlight
                  ? 'bg-gradient-to-b from-surface-2 to-surface-1 ring-1 ring-accent/40'
                  : 'bg-surface-1 border border-border-line'
              }`}
              style={
                t.highlight
                  ? {
                      boxShadow:
                        '0 0 0 1px rgba(124,92,255,0.18), 0 30px 80px -20px rgba(124,92,255,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }
                  : undefined
              }
            >
              {t.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="bg-brand-gradient px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-black shadow-[0_4px_16px_-2px_rgba(124,92,255,0.6)]"
                  >
                    {t.badge}
                  </span>
                </div>
              )}

              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">{t.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-[-0.03em] tabular-nums">{t.price}</span>
                <span className="text-sm text-zinc-500">/ {t.period}</span>
              </div>
              <p className="text-sm text-zinc-500 mt-3 leading-relaxed h-10">{t.description}</p>

              <Link
                href={t.href}
                className={`mt-5 flex items-center justify-center gap-1.5 w-full py-3 rounded-md font-semibold text-sm transition group ${
                  t.highlight
                    ? 'bg-brand-gradient text-black hover:brightness-110 shadow-[0_8px_24px_-6px_rgba(124,92,255,0.55)]'
                    : 'bg-surface-2 border border-border-line hover:border-border-strong text-white'
                }`}
              >
                {t.highlight && <Sparkles size={13} strokeWidth={2.5} />}
                {t.cta}
                <ArrowRight size={13} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition" />
              </Link>

              <div className="mt-7 pt-6 border-t border-border-line space-y-3">
                {t.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13px]">
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      className={`mt-0.5 shrink-0 ${t.highlight ? 'text-accent' : 'text-emerald-400'}`}
                    />
                    <span className="text-zinc-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-xs text-zinc-500">
          7-day money-back guarantee. Email{' '}
          <a href="mailto:hello@degenzone.app" className="underline hover:text-zinc-300">
            hello@degenzone.app
          </a>{' '}
          and we&apos;ll refund instantly.
        </div>
      </div>
    </section>
  );
}

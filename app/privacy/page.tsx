import type { Metadata } from 'next';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What DegenZone collects, what we do with it, and what we do not.',
};

const UPDATED = '18 May 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10 md:py-16">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">Legal</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-xs text-zinc-500 font-mono">Last updated {UPDATED}</p>
          <p className="mt-4 text-zinc-400 text-sm leading-relaxed">
            We collect the bare minimum. No account is required for the free tier. No tracking
            cookies. No selling data, ever.
          </p>
        </div>

        <article className="space-y-8 text-zinc-300 leading-relaxed text-sm">
          <Section title="1. What we collect">
            <p><strong className="text-white">When you visit degenzone.com:</strong></p>
            <ul className="list-disc pl-6 space-y-1.5 marker:text-zinc-600">
              <li>Standard web-server logs: IP address, user agent, referer, page path, timestamp. Retained 14 days for abuse detection.</li>
              <li>Aggregated analytics (page views, country) via a self-hosted Plausible instance. No cross-site tracking, no fingerprinting, no cookies.</li>
            </ul>

            <p className="mt-4"><strong className="text-white">In your browser (localStorage, never sent to us):</strong></p>
            <ul className="list-disc pl-6 space-y-1.5 marker:text-zinc-600">
              <li>Your watchlist (token addresses).</li>
              <li>Your settings (audio on/off, smart-money mode, default chain).</li>
            </ul>

            <p className="mt-4"><strong className="text-white">When you paste a wallet into the portfolio overlay:</strong></p>
            <ul className="list-disc pl-6 space-y-1.5 marker:text-zinc-600">
              <li>The address is sent to our server, which queries public Solana RPC for token balances. The address is not logged or stored.</li>
            </ul>

            <p className="mt-4"><strong className="text-white">If you subscribe to a paid tier (Pro / Whale):</strong></p>
            <ul className="list-disc pl-6 space-y-1.5 marker:text-zinc-600">
              <li>Email address, for billing and account access.</li>
              <li>Stripe handles payment data — we never see your card number.</li>
              <li>Watchlist + alert preferences are synced to our database for cross-device sync.</li>
            </ul>
          </Section>

          <Section title="2. What we do not collect">
            <ul className="list-disc pl-6 space-y-1.5 marker:text-zinc-600">
              <li>Browsing history outside degenzone.com.</li>
              <li>Cross-site tracking cookies.</li>
              <li>Real names, phone numbers, addresses.</li>
              <li>Wallet private keys (we never ask, never accept).</li>
              <li>Any data about your trades or off-app activity.</li>
            </ul>
          </Section>

          <Section title="3. Third-party services">
            <p>The Service queries the following upstreams server-side to fetch market data:</p>
            <ul className="list-disc pl-6 space-y-1.5 marker:text-zinc-600">
              <li><a href="https://www.geckoterminal.com" className="underline hover:text-zinc-100">GeckoTerminal</a> — DEX pool data.</li>
              <li><a href="https://dexscreener.com" className="underline hover:text-zinc-100">DexScreener</a> — fallback DEX pool data.</li>
              <li>Solana public RPC endpoints — wallet holdings, smart-money tracking.</li>
              <li><a href="https://stripe.com" className="underline hover:text-zinc-100">Stripe</a> (paid tiers only) — payments.</li>
            </ul>
            <p>Your IP is exposed to these services when our server proxies requests on your behalf.</p>
          </Section>

          <Section title="4. Data retention">
            <ul className="list-disc pl-6 space-y-1.5 marker:text-zinc-600">
              <li>Server access logs: 14 days.</li>
              <li>Snapshot store (Time Machine data): 4 hours rolling.</li>
              <li>Smart-money on-chain events: 48 hours rolling.</li>
              <li>Paid-tier account data: retained while your subscription is active + 30 days after cancellation.</li>
            </ul>
          </Section>

          <Section title="5. Your rights">
            <p>
              Free tier: there is no account, so there is no data to delete or export.
              Email{' '}
              <a href="mailto:hello@degenzone.com" className="underline hover:text-zinc-100">hello@degenzone.com</a>{' '}
              if you believe we have data on you and want it removed (e.g., legacy logs).
            </p>
            <p>
              Paid tier: you can request export or deletion of your account data at any time via{' '}
              <a href="mailto:hello@degenzone.com" className="underline hover:text-zinc-100">hello@degenzone.com</a>.
              We comply within 30 days as required by GDPR / CCPA.
            </p>
          </Section>

          <Section title="6. Changes">
            <p>
              Material changes to this policy will be announced on{' '}
              <a href="https://x.com/degenzonexyz" className="underline hover:text-zinc-100">@degenzonexyz</a>{' '}
              and in the changelog. The &quot;last updated&quot; date at the top reflects the latest revision.
            </p>
          </Section>

          <Section title="7. Contact">
            <p>
              Privacy questions:{' '}
              <a href="mailto:hello@degenzone.com" className="underline hover:text-zinc-100">hello@degenzone.com</a>.
            </p>
          </Section>
        </article>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base md:text-lg font-bold text-white tracking-tight mb-3">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

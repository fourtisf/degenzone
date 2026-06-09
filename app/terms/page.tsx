import type { Metadata } from 'next';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for DegenZone.',
};

const UPDATED = '18 May 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-10 md:py-16">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">Legal</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-xs text-zinc-500 font-mono">Last updated {UPDATED}</p>
        </div>

        <article className="prose-doc space-y-8 text-zinc-300 leading-relaxed text-sm">
          <Section title="1. Acceptance">
            <p>
              By accessing or using DegenZone (the &quot;Service&quot;, available at degenzone.com),
              you agree to be bound by these Terms of Service. If you do not agree, do not use the
              Service.
            </p>
          </Section>

          <Section title="2. Not financial advice">
            <p>
              DegenZone is a market-visualisation and data-aggregation tool. Nothing on the Service
              constitutes financial, investment, legal, or tax advice, an endorsement of any token
              or project, or an offer to buy or sell any digital asset. All trading decisions are
              your own.
            </p>
            <p>
              Cryptocurrency trading is highly volatile and can result in total loss. Do your own
              research. We are not responsible for any losses you incur.
            </p>
          </Section>

          <Section title="3. Service availability">
            <p>
              The Service is provided &quot;as is&quot; with no uptime guarantee. Data is sourced from
              third-party providers (GeckoTerminal, DexScreener, Solana RPC endpoints, etc.) and may
              be delayed, incomplete, or incorrect. We are not liable for any reliance you place on
              displayed data.
            </p>
          </Section>

          <Section title="4. Acceptable use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1.5 marker:text-zinc-600">
              <li>Scrape, mirror, or republish the Service&apos;s data outside of normal browser use without an API key from us.</li>
              <li>Exceed the rate limit on free-tier API endpoints.</li>
              <li>Use the Service to facilitate market manipulation, wash trading, or any illegal activity.</li>
              <li>Reverse-engineer the Service or attempt to extract source code beyond what is publicly available on our GitHub.</li>
              <li>Use the Service to harass, defame, or harm others.</li>
            </ul>
          </Section>

          <Section title="5. Paid subscriptions">
            <p>
              Pro ($29/mo) and Whale ($99/mo) tiers are billed monthly. Cancel at any time from
              your account settings. We offer a 7-day refund window from initial purchase — email{' '}
              <a href="mailto:hello@degenzone.com" className="underline hover:text-zinc-100">hello@degenzone.com</a>{' '}
              for refunds.
            </p>
            <p>
              Smart-money signals, audio alerts, Telegram alerts, and API access are gated to paid
              tiers. Free tier remains fully functional for the heatmap itself with a small data
              delay.
            </p>
          </Section>

          <Section title="6. Smart-money wallet tracking">
            <p>
              The wallets surfaced as &quot;smart money&quot; are publicly identifiable on-chain addresses
              with a history of profitable trading. Inclusion in the tracked list does not imply
              endorsement of those wallets or their owners, and is subject to change at any time.
              Tracked wallets are not paid to be included.
            </p>
          </Section>

          <Section title="7. Intellectual property">
            <p>
              The DegenZone brand, logo, trademark, source code, and database content remain our
              property. You may not copy, redistribute, or create derivative works without written
              permission.
            </p>
          </Section>

          <Section title="8. Limitation of liability">
            <p>
              To the maximum extent permitted by law, DegenZone and its operators are not liable
              for any indirect, incidental, consequential, special, or exemplary damages, including
              loss of profits, trading losses, or data, arising from your use of the Service.
            </p>
          </Section>

          <Section title="9. Changes">
            <p>
              We may update these terms from time to time. Material changes will be announced via
              the Service or our X account (<a href="https://x.com/degenzone" className="underline hover:text-zinc-100">@degenzone</a>).
              Continued use after a change constitutes acceptance.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions, complaints, or refund requests:{' '}
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

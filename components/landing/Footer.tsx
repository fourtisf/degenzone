import Link from 'next/link';
import Logo from '../Logo';

export default function Footer() {
  return (
    <footer className="border-t border-border-line py-12 px-6 mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Logo size={22} />
              <span className="font-bold tracking-tight">DegenZone</span>
            </div>
            <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
              The unfair edge for Solana traders. Real-time DEX market visualization
              with smart-money overlays and pump detection.
            </p>
            <p className="text-xs text-zinc-600 mt-4">
              Powered by GeckoTerminal · DexScreener · Helius
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-sm">
            <Col title="Product">
              <FooterLink href="/app">Launch app</FooterLink>
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/#pricing">Pricing</FooterLink>
              <FooterLink href="/changelog">Changelog</FooterLink>
            </Col>
            <Col title="Resources">
              <FooterLink href="/docs">Docs</FooterLink>
              <FooterLink href="/docs/api">API reference</FooterLink>
              <FooterLink href="https://t.me/degenzone" external>
                Telegram bot
              </FooterLink>
              <FooterLink href="/status">Status</FooterLink>
            </Col>
            <Col title="Company">
              <FooterLink href="https://x.com/degenzonexyz" external>
                <span className="inline-flex items-center gap-1.5">
                  <XIcon /> X / Twitter
                </span>
              </FooterLink>
              <FooterLink href="https://t.me/degenzone" external>
                Telegram
              </FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
            </Col>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-10 pt-6 border-t border-border-line">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} DegenZone. Not financial advice.
            Trade at your own risk.
          </p>
          <div className="flex items-center gap-3 text-xs text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function XIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold mb-3">{title}</div>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  if (external) {
    return (
      <li>
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition">
          {children}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link href={href} className="text-zinc-400 hover:text-white transition">
        {children}
      </Link>
    </li>
  );
}

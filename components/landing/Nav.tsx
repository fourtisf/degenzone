'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X as Close } from 'lucide-react';
import Logo from '../Logo';

function XIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/scan', label: 'Scanner' },
  { href: '/docs', label: 'Docs' },
  { href: '/changelog', label: 'Changelog' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-6 py-3 backdrop-blur-md bg-canvas/70 border-b border-border-line/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={22} />
          <span className="font-bold tracking-tight text-[15px]">DegenZone</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition">{l.label}</Link>
          ))}
          <a href="https://x.com/degenzone" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1" aria-label="DegenZone on X">
            <XIcon size={12} />
            <span>X</span>
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/app"
            className="bg-brand-gradient inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-black hover:brightness-110 transition"
          >
            Launch app
            <ArrowRight size={11} strokeWidth={2.5} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-1.5 -mr-1.5 text-zinc-300 hover:text-white transition"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <Close size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden mt-3 pt-3 border-t border-border-line/50 flex flex-col gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-1 py-2 text-zinc-300 hover:text-white transition"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://x.com/degenzone"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="px-1 py-2 text-zinc-300 hover:text-white transition flex items-center gap-2"
          >
            <XIcon size={13} />
            <span>X / Twitter</span>
          </a>
        </nav>
      )}
    </header>
  );
}

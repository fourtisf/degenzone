'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Check, ArrowRight } from 'lucide-react';

const BUILD_TIME_CA = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'COMING_SOON';

export default function ContractBanner() {
  const [copied, setCopied] = useState(false);
  const [CA, setCA] = useState(BUILD_TIME_CA);

  // Refresh from the runtime config so the CA can be changed without a rebuild.
  useEffect(() => {
    let active = true;
    fetch('/api/config')
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.contractAddress) setCA(d.contractAddress);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const isComingSoon = CA === 'COMING_SOON' || !CA;

  const copy = async () => {
    if (isComingSoon) return;
    try {
      await navigator.clipboard.writeText(CA);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div className="relative w-full border-b border-border-line bg-gradient-to-r from-canvas via-surface-1 to-canvas">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] sm:text-[10px] uppercase tracking-widest font-bold bg-accent/15 text-accent border border-accent/30 shrink-0">
          CA
        </span>

        {isComingSoon ? (
          <span
            className="inline-flex items-center gap-2 font-mono tracking-wider truncate cursor-default"
            title="Token launch coming soon — follow @degenzonexyz on X for the announcement"
          >
            <span className="relative inline-flex shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-70" />
            </span>
            <span className="text-zinc-400">
              <span className="hidden sm:inline">Token launch — </span>
              <span className="font-bold text-white">COMING SOON</span>
            </span>
          </span>
        ) : (
          <button
            onClick={copy}
            className="group inline-flex items-center gap-1.5 font-mono text-zinc-300 hover:text-white transition truncate"
            title="Click to copy"
          >
            <span className="truncate max-w-[160px] sm:max-w-[280px] md:max-w-md">{CA}</span>
            {copied ? (
              <Check size={11} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
            ) : (
              <Copy size={11} className="text-zinc-500 group-hover:text-zinc-300 shrink-0" strokeWidth={2} />
            )}
          </button>
        )}

        <span className="text-zinc-600 hidden sm:inline">·</span>

        <Link
          href="https://x.com/degenzonexyz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition shrink-0 group"
        >
          <span className="hidden sm:inline">Updates on</span>
          <span className="font-semibold">@degenzonexyz</span>
          <ArrowRight size={10} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}

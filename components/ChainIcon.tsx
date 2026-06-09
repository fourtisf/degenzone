import type { Chain } from '@/lib/types';

type Props = { chain: Chain; size?: number };

export default function ChainIcon({ chain, size = 14 }: Props) {
  const s = size;
  if (chain === 'solana') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
        <defs>
          <linearGradient id={`sol-${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill={`url(#sol-${s})`} />
        <path
          d="M6.5 8.5h9l2 -2h-9z M6.5 15.5h9l2 -2h-9z M8.5 12h9l2 -2h-9z"
          fill="white"
          opacity="0.92"
          transform="translate(-1, 0)"
        />
      </svg>
    );
  }
  if (chain === 'base') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#0052FF" />
        <circle cx="12" cy="12" r="5.5" fill="none" stroke="white" strokeWidth="2" />
        <rect x="12" y="6.5" width="6" height="11" fill="#0052FF" />
      </svg>
    );
  }
  if (chain === 'bsc') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#F0B90B" />
        <path
          d="M12 6 L8.5 9.5 L10.2 11.2 L12 9.4 L13.8 11.2 L15.5 9.5 Z M6 12 L7.7 10.3 L9.4 12 L7.7 13.7 Z M12 18 L8.5 14.5 L10.2 12.8 L12 14.6 L13.8 12.8 L15.5 14.5 Z M14.6 12 L16.3 10.3 L18 12 L16.3 13.7 Z M12 11.3 L10.7 12.6 L12 13.9 L13.3 12.6 Z"
          fill="#0A0A0F"
        />
      </svg>
    );
  }
  // eth
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="6" fill="#627EEA" />
      <path d="M12 4 L12 10.2 L17 12.3 Z" fill="white" opacity="0.6" />
      <path d="M12 4 L7 12.3 L12 10.2 Z" fill="white" />
      <path d="M12 16.4 L12 20 L17 13.3 Z" fill="white" opacity="0.6" />
      <path d="M12 20 L12 16.4 L7 13.3 Z" fill="white" />
      <path d="M12 15.5 L17 12.3 L12 10.2 Z" fill="white" opacity="0.3" />
      <path d="M7 12.3 L12 15.5 L12 10.2 Z" fill="white" opacity="0.5" />
    </svg>
  );
}

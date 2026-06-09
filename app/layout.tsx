import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://degenzone.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'DegenZone — The unfair edge for Solana traders',
    template: '%s · DegenZone',
  },
  description:
    'See what is pumping, what is rotating, and what smart money is buying — all in one screen, refreshed every 15 seconds. The terminal pros use to find the next 10x before Twitter does.',
  applicationName: 'DegenZone',
  authors: [{ name: 'DegenZone' }],
  keywords: [
    'solana heatmap',
    'memecoin scanner',
    'dex screener alternative',
    'crypto finviz',
    'solana memecoin tracker',
    'smart money tracking',
    'pump detection',
    'degenzone',
  ],
  openGraph: {
    type: 'website',
    siteName: 'DegenZone',
    title: 'DegenZone — The unfair edge for Solana traders',
    description: 'See what is pumping, what is rotating, and what smart money is buying.',
    url: SITE_URL,
    images: [{ url: '/og', width: 1200, height: 630, alt: 'DegenZone — real-time DEX treemap' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@degenzone',
    creator: '@degenzone',
    title: 'DegenZone — The unfair edge for Solana traders',
    description: 'See what is pumping, what is rotating, and what smart money is buying.',
    images: ['/og'],
  },
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07070A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

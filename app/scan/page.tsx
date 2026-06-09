import type { Metadata } from 'next';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import Scanner from '@/components/Scanner';

export const metadata: Metadata = {
  title: 'Contract Scanner',
  description: 'Check a Solana token mint for renounced mint and freeze authorities.',
};

export default function ScanPage({ searchParams }: { searchParams: { address?: string } }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-white">
      <Nav />
      <main className="flex-1">
        <Scanner initialAddress={searchParams.address ?? ''} />
      </main>
      <Footer />
    </div>
  );
}

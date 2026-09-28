import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'NWIS — Nearby Wells Intelligence System | Oil India Limited',
  description: 'Stage 01 Foundation & Data Platform for Nearby Wells Intelligence and Precedent Retrieval',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="bg-petro-950 border-t border-petro-800 py-4 px-6 text-center text-xs text-slate-500">
          <p>
            NWIS — Nearby Wells Intelligence System &bull; Designed for Oil India Limited (OIL) &bull;
            Stage 01: Foundation Platform &bull; Synthetic Demo Dataset
          </p>
        </footer>
      </body>
    </html>
  );
}

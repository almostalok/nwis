import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { ToastProvider } from '../components/Toast';
import { ThemeProvider } from '../components/ThemeContext';

export const metadata: Metadata = {
  title: 'NWIS — Nearby Wells Intelligence System | Oil India Limited',
  description: 'Grounded Real-Time Intelligence & Historical Precedent System for Oil India Limited',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('nwis-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#f4f4f6] text-black flex flex-col font-sans antialiased selection:bg-black selection:text-white">
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <footer className="bg-white border-t-2 border-black py-4 px-6 text-center text-xs text-zinc-700">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <span className="font-extrabold text-black">NWIS Drilling Intelligence</span>
                <span>&bull;</span>
                <span className="font-semibold text-black">Oil India Limited (OIL)</span>
                <span>&bull;</span>
                <span className="neo-badge neo-badge-amber text-[11px]">
                  Demonstration Dataset
                </span>
                <span>&bull;</span>
                <span className="text-zinc-600 font-mono text-[11px]">Zero Autonomous Rig Actuation &bull; Advisory Support Only</span>
              </div>
            </footer>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

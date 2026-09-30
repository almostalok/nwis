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
      <body className="min-h-screen bg-zinc-50/70 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
              {children}
            </main>
            <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-4 px-6 text-center text-xs text-zinc-500">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">NWIS Drilling Intelligence</span>
                <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Oil India Limited (OIL)</span>
                <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                <span className="tech-badge tech-badge-amber text-[10px]">
                  Demonstration Dataset
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                <span className="font-mono text-[11px] text-zinc-400">Zero Autonomous Rig Actuation &bull; Advisory Support Only</span>
              </div>
            </footer>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

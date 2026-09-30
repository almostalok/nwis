'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-8 w-8 rounded-md border border-zinc-200 dark:border-zinc-800 opacity-40 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      id="btn-theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      className={`relative inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-mono font-medium ${className}`}
    >
      {isDark ? (
        <>
          <svg className="w-3.5 h-3.5 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {!compact && <span>Light</span>}
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          {!compact && <span>Dark</span>}
        </>
      )}
    </button>
  );
}

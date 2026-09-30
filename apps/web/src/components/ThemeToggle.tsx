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
    // Avoid SSR hydration layout shift with a placeholder of matching size
    return (
      <div
        className={`w-9 h-8 rounded-full border-2 border-black opacity-30 ${className}`}
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
      className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer select-none ${className}`}
    >
      {isDark ? (
        <>
          <span className="text-sm leading-none transition-transform group-hover:rotate-45 duration-200">
            ☀️
          </span>
          {!compact && (
            <span className="font-mono text-[11px] font-black tracking-wider uppercase">
              LIGHT
            </span>
          )}
        </>
      ) : (
        <>
          <span className="text-sm leading-none transition-transform group-hover:-rotate-12 duration-200">
            🌙
          </span>
          {!compact && (
            <span className="font-mono text-[11px] font-black tracking-wider uppercase">
              DARK
            </span>
          )}
        </>
      )}
    </button>
  );
}

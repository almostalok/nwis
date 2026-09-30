'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';

interface SearchResultItem {
  id: string;
  type: 'WELL' | 'EVENT' | 'DOC' | 'ALERT';
  title: string;
  subtitle: string;
  url: string;
  tag?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Global keydown: ESC to close, Ctrl+K / Cmd+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search execution across wells, documents, and precedents
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [wellsRes, intelRes] = await Promise.all([
          api.wells.list({ limit: 10 }).catch(() => []),
          api.intelligence.search({ query, limit: 10 }).catch(() => ({ results: [] })),
        ]);

        const qLower = query.toLowerCase();

        // Filter wells
        const matchedWells: SearchResultItem[] = (wellsRes || [])
          .filter(
            (w: any) =>
              w.wellId?.toLowerCase().includes(qLower) ||
              w.name?.toLowerCase().includes(qLower) ||
              w.field?.toLowerCase().includes(qLower)
          )
          .slice(0, 5)
          .map((w: any) => ({
            id: w.wellId,
            type: 'WELL' as const,
            title: `${w.wellId} — ${w.name}`,
            subtitle: `${w.field} • Total Depth: ${w.totalDepth}m • Status: ${w.status}`,
            url: `/wells/${w.wellId}`,
            tag: w.status,
          }));

        // Transform intelligence results
        const matchedIntel: SearchResultItem[] = (intelRes?.results || [])
          .slice(0, 6)
          .map((item: any, idx: number) => ({
            id: `intel-${idx}`,
            type: (item.entityType === 'EVENT' ? 'EVENT' : 'DOC') as 'EVENT' | 'DOC',
            title: item.title,
            subtitle: item.snippet,
            url: item.wellId ? `/wells/${item.wellId}` : '/intelligence',
            tag: item.formation || item.entityType,
          }));

        setResults([...matchedWells, ...matchedIntel]);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
          <svg
            className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mr-3 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search active wells, Barail/Tipam formations, stuck pipe incidents, DDRs..."
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none font-medium"
          />
          {loading && (
            <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mr-3 flex-shrink-0"></div>
          )}
          <button
            onClick={onClose}
            aria-label="Close search dialog"
            className="text-[11px] font-mono font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 transition-colors flex-shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        {query.length === 0 && (
          <div className="p-4 text-xs">
            <div className="font-mono text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2.5">
              Popular Lookups &amp; Geological Formations
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['OIL-SYN-020', 'Stuck Pipe', 'Barail Sandstone', 'Lost Circulation', 'DDR-003', 'Tipam', 'Differential Sticking'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md border border-zinc-200 dark:border-zinc-700/80 text-xs font-mono font-medium transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Press</span>
                <kbd className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 font-mono text-[10px] border border-zinc-200 dark:border-zinc-700">⌘K</kbd>
                <span>or</span>
                <kbd className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 font-mono text-[10px] border border-zinc-200 dark:border-zinc-700">ESC</kbd>
              </span>
              <span>20 OIL Wells Indexed</span>
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-1.5">
            {results.map((item) => (
              <a
                key={`${item.type}-${item.id}`}
                href={item.url}
                onClick={onClose}
                className="flex items-start justify-between p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold border ${
                        item.type === 'WELL'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          : item.type === 'EVENT'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>
                {item.tag && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                    {item.tag}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="p-8 text-center text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            No matching records found for &quot;<span className="text-zinc-800 dark:text-zinc-200 font-semibold">{query}</span>&quot;.
          </div>
        )}
      </div>
    </div>
  );
}

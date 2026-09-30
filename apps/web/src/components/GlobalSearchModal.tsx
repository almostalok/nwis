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
              w.wellId.toLowerCase().includes(qLower) ||
              w.name.toLowerCase().includes(qLower) ||
              w.field.toLowerCase().includes(qLower)
          )
          .slice(0, 5)
          .map((w: any) => ({
            id: w.wellId,
            type: 'WELL',
            title: `${w.wellId} — ${w.name}`,
            subtitle: `${w.field} • Depth: ${w.totalDepth}m • Status: ${w.status}`,
            url: `/wells/${w.wellId}`,
            tag: w.status,
          }));

        // Transform intelligence results
        const matchedIntel: SearchResultItem[] = (intelRes?.results || [])
          .slice(0, 6)
          .map((item: any, idx: number) => ({
            id: `intel-${idx}`,
            type: item.entityType === 'EVENT' ? 'EVENT' : 'DOC',
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="bg-white border-2 border-black w-full max-w-2xl rounded-3xl shadow-[8px_8px_0px_0px_#000000] overflow-hidden font-sans">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b-2 border-black bg-white">
          <svg
            className="w-5 h-5 text-black mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wells, Barail/Tipam formations, stuck pipe incidents, DDRs..."
            className="w-full bg-transparent text-base text-black placeholder-zinc-400 focus:outline-none font-bold"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
          )}
          <button
            onClick={onClose}
            aria-label="Close search dialog"
            className="text-xs font-mono font-bold text-black bg-[#f4f4f6] px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000] hover:bg-zinc-200 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        {query.length === 0 && (
          <div className="p-5 text-xs text-zinc-600">
            <div className="font-mono font-bold text-black uppercase tracking-wider text-[11px] mb-2.5">
              Popular Searches &amp; Shortcuts:
            </div>
            <div className="flex flex-wrap gap-2">
              {['OIL-SYN-020', 'Stuck Pipe', 'Barail Sandstone', 'Lost Circulation', 'DDR-003', 'Tipam'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1 bg-white hover:bg-zinc-50 text-black rounded-full border-2 border-black text-xs font-bold font-mono shadow-[1.5px_1.5px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
            <div className="mt-5 pt-3.5 border-t-2 border-black text-xs text-zinc-600 font-mono font-bold flex justify-between">
              <span>ProTip: Press <kbd className="bg-[#f4f4f6] px-1.5 py-0.5 rounded text-black font-mono text-[10px] border border-black">⌘K</kbd> anywhere to open</span>
              <span>All 20 OIL Wells Indexed</span>
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto divide-y-2 divide-zinc-200 p-2">
            {results.map((item) => (
              <a
                key={`${item.type}-${item.id}`}
                href={item.url}
                onClick={onClose}
                className="flex items-start justify-between p-3.5 rounded-xl hover:bg-[#f4f4f6] transition-all group"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`neo-badge text-[9px] uppercase tracking-wider ${
                        item.type === 'WELL'
                          ? 'neo-badge-blue'
                          : item.type === 'EVENT'
                          ? 'neo-badge-amber'
                          : 'neo-badge-emerald'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-sm font-black text-black group-hover:underline">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 mt-1 line-clamp-1 font-medium">{item.subtitle}</p>
                </div>
                {item.tag && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f4f4f6] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                    {item.tag}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="p-10 text-center text-sm text-zinc-500 font-mono font-bold">
            No matching records found for &quot;<span className="text-black">{query}</span>&quot;.
          </div>
        )}
      </div>
    </div>
  );
}

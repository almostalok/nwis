'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';

interface SearchResultItem {
  id: string;
  type: 'WELL' | 'EVENT' | 'DOCUMENT' | 'FORMATION';
  title: string;
  subtitle: string;
  url: string;
  tag?: string;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.toLowerCase();
        const items: SearchResultItem[] = [];

        // 1. Fetch wells
        const wells = await api.wells.list({ limit: 20 });
        wells
          .filter(
            (w) =>
              w.wellId.toLowerCase().includes(q) ||
              w.name.toLowerCase().includes(q) ||
              w.field.toLowerCase().includes(q)
          )
          .slice(0, 4)
          .forEach((w) => {
            items.push({
              id: w.id,
              type: 'WELL',
              title: `${w.wellId} — ${w.name}`,
              subtitle: `Field: ${w.field} • Status: ${w.status} • TD: ${w.totalDepth}m`,
              url: `/wells/${w.wellId}`,
              tag: w.status,
            });
          });

        // 2. Fetch events
        const events = await api.events.list({ limit: 20 });
        events
          .filter(
            (e) =>
              e.eventType.toLowerCase().includes(q) ||
              e.description.toLowerCase().includes(q) ||
              (e.mitigation && e.mitigation.toLowerCase().includes(q))
          )
          .slice(0, 4)
          .forEach((e) => {
            items.push({
              id: e.id,
              type: 'EVENT',
              title: `${e.eventType} at ${e.startDepth}m`,
              subtitle: e.description.slice(0, 90) + '...',
              url: `/events/${e.id}`,
              tag: e.severity,
            });
          });

        // 3. Fetch documents
        try {
          const docs = await api.knowledge.listDocuments();
          docs
            .filter(
              (d: any) =>
                d.title.toLowerCase().includes(q) ||
                d.documentType.toLowerCase().includes(q) ||
                d.fileName.toLowerCase().includes(q)
            )
            .slice(0, 3)
            .forEach((d: any) => {
              items.push({
                id: d.id,
                type: 'DOCUMENT',
                title: d.title,
                subtitle: `${d.documentType} • File: ${d.fileName} (${d.pageCount || 1} pages)`,
                url: `/documents/${d.id}`,
                tag: d.documentType,
              });
            });
        } catch {
          // ignore doc errors
        }

        setResults(items);
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <svg
            className="w-5 h-5 text-slate-400 mr-3"
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
            placeholder="Search wells, Barail/Tipam formations, stuck pipe incidents, DDRs... (e.g. OIL-SYN-001)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mr-2"></div>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        {query.length === 0 && (
          <div className="p-4 text-xs text-slate-400">
            <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
              Popular Searches & Shortcuts:
            </div>
            <div className="flex flex-wrap gap-2">
              {['OIL-SYN-020', 'Stuck Pipe', 'Barail Coal', 'Lost Circulation', 'DDR', 'Tipam Sand'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
              <span>ProTip: Press <kbd className="bg-slate-800 px-1 rounded text-slate-300">Ctrl</kbd> + <kbd className="bg-slate-800 px-1 rounded text-slate-300">K</kbd> anywhere to open</span>
              <span>All 20 OIL Synthetic Wells Indexed</span>
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60 p-2">
            {results.map((item) => (
              <a
                key={`${item.type}-${item.id}`}
                href={item.url}
                onClick={onClose}
                className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-800/60 transition-colors group"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        item.type === 'WELL'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : item.type === 'EVENT'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.subtitle}</p>
                </div>
                {item.tag && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.tag}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="p-8 text-center text-sm text-slate-400">
            No matching wells, events, or documents found for &quot;<span className="text-slate-200">{query}</span>&quot;.
          </div>
        )}
      </div>
    </div>
  );
}

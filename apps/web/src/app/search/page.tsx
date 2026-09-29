'use client';

import React, { useState } from 'react';
import { api } from '../../lib/api';

export default function SemanticSearchPage() {
  const [query, setQuery] = useState('stuck pipe in Barail formation');
  const [formation, setFormation] = useState('');
  const [depth, setDepth] = useState<number | ''>('');
  const [eventType, setEventType] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await api.intelligence.search({
        query,
        formation: formation || undefined,
        depth: depth ? Number(depth) : undefined,
        eventType: eventType || undefined,
        limit: 25,
      });

      setResults(res.results || []);
      setTotalFound(res.totalFound || 0);
    } catch (err: any) {
      console.error('Search failed:', err);
      alert(`Search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-petro-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Semantic & Hybrid Search</h1>
        <p className="text-xs text-slate-400 mt-1">
          Query unstructured drilling reports, DDRs, and operational events using Vector Similarity + Keyword + Metadata Filters.
        </p>
      </div>

      {/* Search Input & Filter Bar */}
      <form onSubmit={handleSearch} className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'stuck pipe around 3200m', 'torque spike before incident', 'mud loss in Girujan'..."
              className="w-full bg-petro-950 border border-petro-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow transition-colors"
          >
            {loading ? 'Searching...' : 'Search Intelligence'}
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-petro-800/80">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Filter by Formation</label>
            <input
              type="text"
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              placeholder="e.g. Barail, Tipam, Girujan..."
              className="w-full bg-petro-950 border border-petro-700 rounded px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Filter by Depth (m)</label>
            <input
              type="number"
              value={depth}
              onChange={(e) => setDepth(e.target.value ? Number(e.target.value) : '')}
              placeholder="e.g. 3200"
              className="w-full bg-petro-950 border border-petro-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Filter by Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-petro-950 border border-petro-700 rounded px-2.5 py-1.5 text-xs text-white"
            >
              <option value="">All Event Types</option>
              <option value="STUCK_PIPE">STUCK_PIPE</option>
              <option value="LOST_CIRCULATION">LOST_CIRCULATION</option>
              <option value="TORQUE_SPIKE">TORQUE_SPIKE</option>
              <option value="KICK">KICK</option>
              <option value="FISHING">FISHING</option>
            </select>
          </div>
        </div>
      </form>

      {/* Results Section */}
      <div className="space-y-4">
        {searched && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Found <strong className="text-white font-mono">{totalFound}</strong> matching historical records
            </span>
            <span>Ranked by Hybrid Relevance (Vector + Keyword)</span>
          </div>
        )}

        <div className="space-y-3">
          {results.map((item, idx) => (
            <div
              key={idx}
              className="bg-petro-900 border border-petro-800 rounded-xl p-5 hover:border-slate-700 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.entityType === 'EVENT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}
                    >
                      {item.entityType}
                    </span>
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                  </div>
                  {item.wellId && (
                    <span className="text-xs text-emerald-400 font-mono block mt-1">
                      Well: {item.wellId} {item.wellName ? `(${item.wellName})` : ''}
                      {item.depth ? ` • Depth: ${item.depth}m` : ''}
                      {item.formation ? ` • Formation: ${item.formation}` : ''}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {(item.relevanceScore * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase">Match</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-petro-950 p-3 rounded-lg border border-petro-800/80 mb-3">
                {item.snippet}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Source: <strong className="text-slate-300">{item.sourceDocument || 'Historical Archive'}</strong>
                  {item.pageNumber ? ` (Page ${item.pageNumber})` : ''}
                </span>
                {item.wellId && (
                  <a
                    href={`/wells/${item.wellId}/intelligence`}
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    View Well Intelligence →
                  </a>
                )}
              </div>
            </div>
          ))}

          {searched && results.length === 0 && !loading && (
            <div className="bg-petro-900 border border-petro-800 rounded-xl p-12 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-300">No matching historical records found.</p>
              <p className="text-xs mt-1">Try expanding your keywords or relaxing depth/formation filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';

export default function SemanticSearchPage() {
  const toast = useToast();
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
      toast.error(`Search failed: ${err.message}`, 'Search Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-zinc-500 mb-1">
            <Link href="/dashboard" className="text-blue-700 hover:underline">
              ← Command Center
            </Link>
            <span>/</span>
            <span>Intelligence</span>
            <span>/</span>
            <span className="text-black font-bold">Semantic Search</span>
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
            Semantic & Hybrid Search
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              VECTOR + KEYWORD
            </span>
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Query unstructured drilling reports, DDRs, and operational events using Vector Similarity + Keyword + Metadata Filters.
          </p>
        </div>

        <Link
          href="/documents"
          className="px-4 py-2 bg-white hover:bg-zinc-100 text-black border-2 border-black font-bold text-xs rounded-xl shadow-[2px_2px_0px_0px_#000] transition-all"
        >
          Browse Documents →
        </Link>
      </div>

      {/* Search Input & Filter Bar */}
      <form onSubmit={handleSearch} className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'stuck pipe around 3200m', 'torque spike before incident', 'mud loss in Girujan'..."
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-4 py-3 text-xs sm:text-sm text-black placeholder-zinc-500 font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-black border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Intelligence →'}
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t-2 border-black">
          <div>
            <label className="text-xs font-black uppercase font-mono text-zinc-700 block mb-1.5">Filter by Formation</label>
            <input
              type="text"
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              placeholder="e.g. Barail, Tipam, Girujan..."
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2 text-xs text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase font-mono text-zinc-700 block mb-1.5">Filter by Depth (m)</label>
            <input
              type="number"
              value={depth}
              onChange={(e) => setDepth(e.target.value ? Number(e.target.value) : '')}
              placeholder="e.g. 3200"
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2 text-xs text-black font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase font-mono text-zinc-700 block mb-1.5">Filter by Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2 text-xs text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
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
          <div className="flex items-center justify-between text-xs text-zinc-600 px-1 font-mono font-bold">
            <span>
              Found <strong className="text-black font-mono font-black">{totalFound}</strong> matching historical records
            </span>
            <span className="text-zinc-500">Ranked by Hybrid Relevance (Vector + Keyword)</span>
          </div>
        )}

        <div className="space-y-4">
          {results.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-black rounded-2xl p-6 hover:shadow-[6px_6px_0px_0px_#000] transition-all shadow-[4px_4px_0px_0px_#000] space-y-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] ${
                        item.entityType === 'EVENT'
                          ? 'bg-[#ffe4e6] text-[#881337]'
                          : 'bg-[#dbeafe] text-[#1e3a8a]'
                      }`}
                    >
                      {item.entityType}
                    </span>
                    <h3 className="font-black text-black text-base">{item.title}</h3>
                  </div>
                  {item.wellId && (
                    <span className="text-xs text-[#1e3a8a] font-mono font-bold block mt-1">
                      Well: {item.wellId} {item.wellName ? `(${item.wellName})` : ''}
                      {item.depth ? ` • Depth: ${item.depth}m` : ''}
                      {item.formation ? ` • Formation: ${item.formation}` : ''}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-[#064e3b] font-mono">
                    {(item.relevanceScore * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold">Match</span>
                </div>
              </div>

              <p className="text-xs text-black leading-relaxed bg-[#f8f9fa] p-4 rounded-xl border-2 border-black font-semibold shadow-[2px_2px_0px_0px_#000]">
                {item.snippet}
              </p>

              <div className="flex items-center justify-between text-xs text-zinc-600 pt-1 font-mono">
                <span>
                  Source: <strong className="text-black font-black">{item.sourceDocument || 'Historical Archive'}</strong>
                  {item.pageNumber ? ` (Page ${item.pageNumber})` : ''}
                </span>
                {item.wellId && (
                  <Link
                    href={`/wells/${item.wellId}`}
                    className="text-black bg-[#fef08a] px-3 py-1 rounded-full border border-black font-black hover:bg-yellow-300 inline-flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]"
                  >
                    <span>View Well Dossier</span>
                    <span>→</span>
                  </Link>
                )}
              </div>
            </div>
          ))}

          {searched && results.length === 0 && !loading && (
            <div className="bg-white border-2 border-black rounded-2xl p-12 text-center text-zinc-600 shadow-[4px_4px_0px_0px_#000]">
              <p className="text-sm font-black text-black">No matching historical records found.</p>
              <p className="text-xs mt-1 text-zinc-500">Try expanding your keywords or relaxing depth/formation filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';

function CrossWellCompareContent() {
  const searchParams = useSearchParams();
  const initialWellA = searchParams.get('wellA') || 'OIL-SYN-020';
  const initialWellB = searchParams.get('wellB') || 'OIL-SYN-003';

  const [wellA, setWellA] = useState(initialWellA);
  const [wellB, setWellB] = useState(initialWellB);
  const [wellsList, setWellsList] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.wells.list({ limit: 50 }).then((res: any) => setWellsList(Array.isArray(res) ? res : res.data || [])).catch(() => {});
  }, []);

  const runComparison = async (wA: string, wB: string) => {
    if (!wA || !wB || wA === wB) return;
    setLoading(true);
    try {
      const data = await api.intelligence.compare(wA, wB);
      setComparison(data);
    } catch (err: any) {
      console.error('Comparison failed:', err);
      alert(`Comparison failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wellA && wellB) {
      runComparison(wellA, wellB);
    }
  }, [wellA, wellB]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-petro-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Cross-Well Intelligence Comparison</h1>
        <p className="text-xs text-slate-400 mt-1">
          Multi-dimensional correlation between target well and historical offset well (Formation, Depth, Trajectory, and Events).
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Target Well (Well A):</label>
          <select
            value={wellA}
            onChange={(e) => setWellA(e.target.value)}
            className="w-full bg-petro-950 border border-petro-700 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500"
          >
            {wellsList.map((w) => (
              <option key={w.id} value={w.wellId}>
                {w.wellId} — {w.name} ({w.totalDepth}m)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Offset Candidate (Well B):</label>
          <select
            value={wellB}
            onChange={(e) => setWellB(e.target.value)}
            className="w-full bg-petro-950 border border-petro-700 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500"
          >
            {wellsList.map((w) => (
              <option key={w.id} value={w.wellId}>
                {w.wellId} — {w.name} ({w.totalDepth}m)
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs">Computing cross-well multi-factor similarity...</p>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && !loading && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-petro-900 border border-emerald-900/60 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Overall Multi-Factor Similarity
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {comparison.distanceKm} km apart
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {comparison.wellA.wellId} vs {comparison.wellB.wellId}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {comparison.explanations?.map((exp: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 text-xs text-slate-300 bg-petro-950 px-2.5 py-1 rounded border border-petro-800"
                  >
                    <span className="text-emerald-400">✓</span>
                    <span>{exp}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-4xl font-extrabold text-emerald-400 font-mono">
                {(comparison.similarityScore * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-slate-400 block uppercase tracking-wider">
                Correlation Score
              </span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {[
              { label: 'Spatial Proximity', val: comparison.similarityBreakdown.spatial, wt: '20%' },
              { label: 'Formation Overlap', val: comparison.similarityBreakdown.formation, wt: '30%' },
              { label: 'Depth Overlap', val: comparison.similarityBreakdown.depth, wt: '20%' },
              { label: 'Trajectory Profile', val: comparison.similarityBreakdown.trajectory, wt: '10%' },
              { label: 'Operational Incidents', val: comparison.similarityBreakdown.operational, wt: '10%' },
              { label: 'Reservoir Zones', val: comparison.similarityBreakdown.reservoir, wt: '10%' },
            ].map((metric, idx) => (
              <div key={idx} className="bg-petro-900 border border-petro-800 rounded-lg p-3 text-center">
                <span className="text-[10px] text-slate-400 block">{metric.label}</span>
                <span className="text-base font-bold text-white font-mono my-1 block">
                  {(metric.val * 100).toFixed(0)}%
                </span>
                <span className="text-[9px] text-emerald-400/80 font-mono">Weight: {metric.wt}</span>
              </div>
            ))}
          </div>

          {/* Side-by-Side Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Well A Dossier */}
            <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-petro-800 pb-3">
                <h3 className="font-bold text-white text-base">{comparison.wellA.name}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-petro-950 text-slate-300 border border-petro-800">
                  {comparison.wellA.wellId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-petro-950 p-2.5 rounded border border-petro-800">
                  <span className="text-slate-400 block text-[10px]">Total Drilled Depth</span>
                  <span className="font-bold text-white font-mono text-sm">{comparison.wellA.totalDepth} m</span>
                </div>
                <div className="bg-petro-950 p-2.5 rounded border border-petro-800">
                  <span className="text-slate-400 block text-[10px]">Recorded Events</span>
                  <span className="font-bold text-amber-400 font-mono text-sm">{comparison.wellA.eventCount}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Penetrated Formations:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {comparison.wellA.formations.map((f: string, idx: number) => {
                    const isShared = comparison.formationOverlap.shared.includes(f);
                    return (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-xs ${
                          isShared
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold'
                            : 'bg-petro-950 text-slate-400 border border-petro-800'
                        }`}
                      >
                        {f}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Operational Events:</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {comparison.historicalEventsComparison.eventsA.map((ev: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-petro-950 p-2 rounded border border-petro-800 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-200">{ev.eventType} at {ev.startDepth}m</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950 text-rose-300 border border-rose-900 font-bold">
                        {ev.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Well B Dossier */}
            <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-petro-800 pb-3">
                <h3 className="font-bold text-white text-base">{comparison.wellB.name}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-petro-950 text-slate-300 border border-petro-800">
                  {comparison.wellB.wellId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-petro-950 p-2.5 rounded border border-petro-800">
                  <span className="text-slate-400 block text-[10px]">Total Drilled Depth</span>
                  <span className="font-bold text-white font-mono text-sm">{comparison.wellB.totalDepth} m</span>
                </div>
                <div className="bg-petro-950 p-2.5 rounded border border-petro-800">
                  <span className="text-slate-400 block text-[10px]">Recorded Events</span>
                  <span className="font-bold text-amber-400 font-mono text-sm">{comparison.wellB.eventCount}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Penetrated Formations:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {comparison.wellB.formations.map((f: string, idx: number) => {
                    const isShared = comparison.formationOverlap.shared.includes(f);
                    return (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-xs ${
                          isShared
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold'
                            : 'bg-petro-950 text-slate-400 border border-petro-800'
                        }`}
                      >
                        {f}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Operational Events:</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {comparison.historicalEventsComparison.eventsB.map((ev: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-petro-950 p-2 rounded border border-petro-800 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-200">{ev.eventType} at {ev.startDepth}m</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950 text-rose-300 border border-rose-900 font-bold">
                        {ev.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CrossWellComparePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading Cross-Well Comparison Module...</p>
        </div>
      }
    >
      <CrossWellCompareContent />
    </Suspense>
  );
}

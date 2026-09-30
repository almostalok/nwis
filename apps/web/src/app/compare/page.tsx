'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';

function CrossWellCompareContent() {
  const toast = useToast();
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
      toast.error(`Comparison failed: ${err.message}`, 'Comparison Error');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-zinc-500 mb-1">
            <Link href="/dashboard" className="text-blue-700 hover:underline">
              ← Command Center
            </Link>
            <span>/</span>
            <span className="text-black">Cross-Well Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
            Cross-Well Intelligence Comparison
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#fef08a] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              OFFSET CORRELATION
            </span>
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Multi-dimensional correlation between target well and historical offset well (Formation, Depth, Trajectory, and Events).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/intelligence"
            className="px-4 py-2 bg-white hover:bg-zinc-100 text-black border-2 border-black rounded-xl font-bold text-xs shadow-[2px_2px_0px_0px_#000] transition-all"
          >
            ← Precedents Catalog
          </Link>
          <Link
            href="/intelligence/map"
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white border-2 border-black rounded-xl font-bold text-xs shadow-[2px_2px_0px_0px_#000] transition-all"
          >
            View on GIS Map →
          </Link>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-black uppercase font-mono text-zinc-700 block mb-2">
            Target Well (Well A):
          </label>
          <select
            value={wellA}
            onChange={(e) => setWellA(e.target.value)}
            className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl p-3 text-xs text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
          >
            {wellsList.map((w) => (
              <option key={w.id} value={w.wellId}>
                {w.wellId} — {w.name} ({w.totalDepth}m)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-black uppercase font-mono text-zinc-700 block mb-2">
            Offset Candidate (Well B):
          </label>
          <select
            value={wellB}
            onChange={(e) => setWellB(e.target.value)}
            className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl p-3 text-xs text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
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
        <div className="bg-white border-2 border-black rounded-2xl p-12 text-center shadow-[4px_4px_0px_0px_#000]">
          <div className="inline-block w-8 h-8 border-4 border-black border-t-[#2563eb] rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-mono font-bold text-zinc-800">Computing cross-well multi-factor similarity matrix...</p>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && !loading && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="text-xs font-black uppercase tracking-wider font-mono text-zinc-600">
                  Overall Multi-Factor Similarity
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  {comparison.distanceKm} km apart
                </span>
              </div>
              <h2 className="text-3xl font-black text-black">
                {comparison.wellA.wellId} <span className="text-zinc-400 font-normal">vs</span> {comparison.wellB.wellId}
              </h2>
              <div className="flex flex-wrap gap-2 mt-4">
                {comparison.explanations?.map((exp: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 text-xs text-black bg-[#f8f9fa] px-3.5 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000] font-semibold"
                  >
                    <span className="text-emerald-600 font-black">✓</span>
                    <span>{exp}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center sm:text-right bg-[#eff6ff] p-5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] shrink-0">
              <span className="text-5xl font-black text-[#1e3a8a] font-mono">
                {(comparison.similarityScore * 100).toFixed(0)}%
              </span>
              <span className="text-[11px] text-zinc-600 block uppercase tracking-wider font-mono font-bold mt-1">
                Correlation Index
              </span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {[
              { label: 'Spatial Proximity', val: comparison.similarityBreakdown.spatial, wt: '20%', color: 'bg-[#dbeafe] text-[#1e3a8a]' },
              { label: 'Formation Overlap', val: comparison.similarityBreakdown.formation, wt: '30%', color: 'bg-[#fef3c7] text-[#78350f]' },
              { label: 'Depth Overlap', val: comparison.similarityBreakdown.depth, wt: '20%', color: 'bg-[#d1fae5] text-[#064e3b]' },
              { label: 'Trajectory Profile', val: comparison.similarityBreakdown.trajectory, wt: '10%', color: 'bg-[#ede9fe] text-[#5b21b6]' },
              { label: 'Operational Incidents', val: comparison.similarityBreakdown.operational, wt: '10%', color: 'bg-[#ffe4e6] text-[#881337]' },
              { label: 'Reservoir Zones', val: comparison.similarityBreakdown.reservoir, wt: '10%', color: 'bg-[#fce7f3] text-[#831843]' },
            ].map((metric, idx) => (
              <div key={idx} className="bg-white border-2 border-black rounded-xl p-4 text-center shadow-[3px_3px_0px_0px_#000]">
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block font-mono">{metric.label}</span>
                <span className="text-2xl font-black text-black font-mono my-1 block">
                  {(metric.val * 100).toFixed(0)}%
                </span>
                <span className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-black ${metric.color}`}>
                  Wt: {metric.wt}
                </span>
              </div>
            ))}
          </div>

          {/* Side-by-Side Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Well A Dossier */}
            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h3 className="font-black text-black text-base">{comparison.wellA.name}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  {comparison.wellA.wellId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#f8f9fa] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-500 font-mono font-bold block text-[10px] uppercase">Total Drilled Depth</span>
                  <span className="font-black text-black font-mono text-base">{comparison.wellA.totalDepth} m</span>
                </div>
                <div className="bg-[#f8f9fa] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-500 font-mono font-bold block text-[10px] uppercase">Recorded Events</span>
                  <span className="font-black text-amber-700 font-mono text-base">{comparison.wellA.eventCount}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase font-mono text-zinc-700 mb-2">Penetrated Formations:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {comparison.wellA.formations.map((f: string, idx: number) => {
                    const isShared = comparison.formationOverlap.shared.includes(f);
                    return (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                          isShared
                            ? 'bg-[#d1fae5] text-[#064e3b]'
                            : 'bg-white text-zinc-700'
                        }`}
                      >
                        {f}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase font-mono text-zinc-700 mb-2">Operational Events:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {comparison.historicalEventsComparison.eventsA.map((ev: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-[#f8f9fa] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs flex items-center justify-between"
                    >
                      <span className="text-black font-bold">{ev.eventType} at {ev.startDepth}m</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#ffe4e6] text-[#881337] border border-black font-black uppercase font-mono">
                        {ev.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Well B Dossier */}
            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h3 className="font-black text-black text-base">{comparison.wellB.name}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#fef3c7] text-[#78350f] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  {comparison.wellB.wellId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#f8f9fa] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-500 font-mono font-bold block text-[10px] uppercase">Total Drilled Depth</span>
                  <span className="font-black text-black font-mono text-base">{comparison.wellB.totalDepth} m</span>
                </div>
                <div className="bg-[#f8f9fa] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-500 font-mono font-bold block text-[10px] uppercase">Recorded Events</span>
                  <span className="font-black text-amber-700 font-mono text-base">{comparison.wellB.eventCount}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase font-mono text-zinc-700 mb-2">Penetrated Formations:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {comparison.wellB.formations.map((f: string, idx: number) => {
                    const isShared = comparison.formationOverlap.shared.includes(f);
                    return (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                          isShared
                            ? 'bg-[#d1fae5] text-[#064e3b]'
                            : 'bg-white text-zinc-700'
                        }`}
                      >
                        {f}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase font-mono text-zinc-700 mb-2">Operational Events:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {comparison.historicalEventsComparison.eventsB.map((ev: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-[#f8f9fa] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs flex items-center justify-between"
                    >
                      <span className="text-black font-bold">{ev.eventType} at {ev.startDepth}m</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#ffe4e6] text-[#881337] border border-black font-black uppercase font-mono">
                        {ev.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SYNCHRONIZED DEPTH CHART */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black text-xs">
              <span className="font-black text-black tracking-tight flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-[#2563eb] border border-black" />
                Synchronized Vertical Depth Correlation
              </span>
              <span className="text-xs font-bold text-zinc-600 bg-[#f8f9fa] px-3 py-1 rounded-full border border-black">
                DEPTH INTERVAL: 2,800m - 3,500m (BARAIL RESERVOIR)
              </span>
            </div>

            {/* Depth Correlation Rails */}
            <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
              {/* Scale Header */}
              <div className="grid grid-cols-12 text-[11px] text-zinc-600 pb-2 border-b-2 border-black font-black">
                <div className="col-span-2 text-left">DEPTH (m MD)</div>
                <div className="col-span-5 text-center text-[#1e3a8a]">WELL A: {comparison.wellA.wellId}</div>
                <div className="col-span-5 text-center text-[#78350f]">WELL B: {comparison.wellB.wellId}</div>
              </div>

              {/* Depth Markers */}
              {[
                { depth: 2900, fm: 'Upper Barail Sandstone', noteA: 'Nominal Drilling', noteB: 'Nominal Drilling', hazard: false },
                { depth: 3100, fm: 'Middle Barail Sandstone', noteA: 'Nominal Drilling', noteB: 'Nominal Drilling', hazard: false },
                { depth: 3180, fm: 'Reactive Barail Coal Seam', noteA: 'Torque surge recorded', noteB: 'OIL-SYN-007 Stuck Pipe Incident', hazard: true },
                { depth: 3205, fm: 'Barail Carbonaceous Boundary', noteA: 'Overpull +45 kN', noteB: 'OIL-SYN-012 Recurrent Stuck Pipe', hazard: true },
                { depth: 3210, fm: 'High-Permeability Transition', noteA: 'Bit at 3,208m (Current)', noteB: 'OIL-SYN-003 Complete Mechanical Stuck Pipe (60t)', hazard: true, current: true },
                { depth: 3350, fm: 'Lower Barail Sandstone', noteA: 'Planned Trajectory', noteB: 'Sidetracked Section', hazard: false },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 text-xs py-3 px-3.5 rounded-xl items-center border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all ${
                    row.current
                      ? 'bg-[#fef3c7] text-[#78350f] font-bold'
                      : row.hazard
                      ? 'bg-[#ffe4e6] text-[#881337]'
                      : 'bg-white text-black'
                  }`}
                >
                  <div className="col-span-2 font-black text-xs font-mono">
                    {row.depth}m
                  </div>
                  <div className="col-span-5 text-left pl-2 font-sans">
                    <span className="block font-bold">{row.noteA}</span>
                    <span className="text-[10px] text-zinc-500 font-mono font-semibold">{row.fm}</span>
                  </div>
                  <div className="col-span-5 text-left pl-3 border-l-2 border-black font-sans">
                    <span className="block font-bold">{row.noteB}</span>
                    <span className="text-[10px] text-zinc-500 font-mono font-semibold">{row.fm}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-zinc-700 pt-2 gap-2">
              <span>Historical event depths directly align with current reactive coal boundary</span>
              <span className="px-3 py-1 bg-[#d1fae5] text-[#064e3b] border-2 border-black rounded-full font-black shadow-[2px_2px_0px_0px_#000]">
                ✓ Corroborated 94% by Precedent Engine
              </span>
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
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-zinc-600">
          <div className="inline-block w-8 h-8 border-4 border-black border-t-[#2563eb] rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-mono font-bold">Loading Cross-Well Comparison Module...</p>
        </div>
      }
    >
      <CrossWellCompareContent />
    </Suspense>
  );
}

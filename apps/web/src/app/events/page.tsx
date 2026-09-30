'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { EventType, OperationalEvent } from '@nwis/types';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [formation, setFormation] = useState<string>('');
  const [minDepth, setMinDepth] = useState<string>('');
  const [maxDepth, setMaxDepth] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Near depth query mode
  const [targetDepth, setTargetDepth] = useState<string>('3200');
  const [tolerance, setTolerance] = useState<string>('50');

  const fetchEvents = () => {
    setLoading(true);
    api.events
      .list({
        formation: formation || undefined,
        minDepth: minDepth ? Number(minDepth) : undefined,
        maxDepth: maxDepth ? Number(maxDepth) : undefined,
        eventType: eventType ? (eventType as EventType) : undefined,
      })
      .then((data) => setEvents(data))
      .catch((err) => console.error('Failed to load events:', err))
      .finally(() => setLoading(false));
  };

  const handleNearDepthSearch = () => {
    if (!targetDepth) return;
    setLoading(true);
    api.events
      .getNearDepth({
        targetDepth: Number(targetDepth),
        toleranceMeters: Number(tolerance || 50),
        formation: formation || undefined,
        eventType: eventType ? (eventType as EventType) : undefined,
      })
      .then((data) => setEvents(data))
      .catch((err) => console.error('Failed to query near depth events:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [formation, eventType]);

  const loadPrecedentPreset = (formName: string, minD: number, maxD: number, type: EventType) => {
    setFormation(formName);
    setMinDepth(String(minD));
    setMaxDepth(String(maxD));
    setEventType(type);
    api.events
      .list({
        formation: formName,
        minDepth: minD,
        maxDepth: maxD,
        eventType: type,
      })
      .then((data) => setEvents(data));
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
            <span>Historical</span>
            <span>/</span>
            <span className="text-black font-bold">Precedent Retrieval</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-black tracking-tight">
              Historical Precedent Retrieval Engine
            </h1>
            <span className="px-3 py-1 text-xs font-mono font-black uppercase tracking-wider bg-[#dbeafe] text-[#1e3a8a] border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000]">
              PRECEDENTS
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            eRTMAC tells what is happening now. NWIS tells what happened before in comparable offset wells.
          </p>
        </div>

        <Link
          href="/compare"
          className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all"
        >
          Cross-Well Compare →
        </Link>
      </div>

      {/* QUICK PRECEDENT BENCHMARK PRESETS */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-3 shadow-[4px_4px_0px_0px_#000]">
        <span className="text-xs font-black text-black uppercase tracking-wider block font-mono">
          Benchmark Precedent Discovery Presets
        </span>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => loadPrecedentPreset('Barail Sandstone', 3150, 3250, EventType.STUCK_PIPE)}
            className="px-4 py-2 rounded-full bg-[#ffe4e6] hover:bg-rose-200 border-2 border-black text-[#881337] text-xs font-black flex items-center space-x-2 shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>⚠️ Barail Sandstone (~3200m) Stuck Pipe (Wells 003, 007, 012)</span>
          </button>
          <button
            onClick={() => loadPrecedentPreset('Tipam Sandstone', 2100, 2150, EventType.LOST_CIRCULATION)}
            className="px-4 py-2 rounded-full bg-[#fef3c7] hover:bg-amber-200 border-2 border-black text-[#78350f] text-xs font-black flex items-center space-x-2 shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>⚠️ Tipam Sandstone (~2120m) Lost Circulation (Wells 005, 014)</span>
          </button>
          <button
            onClick={() => loadPrecedentPreset('Kopili Shale', 3600, 3700, EventType.KICK)}
            className="px-4 py-2 rounded-full bg-[#ede9fe] hover:bg-purple-200 border-2 border-black text-[#5b21b6] text-xs font-black flex items-center space-x-2 shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>⚠️ Kopili Shale (~3650m) Gas Kick Incident (Well 009)</span>
          </button>
        </div>
      </div>

      {/* Search & Query Builder */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-5 shadow-[4px_4px_0px_0px_#000]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-black text-zinc-700 mb-1.5 font-mono uppercase">Geological Formation</label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2.5 text-xs text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Formations</option>
              <option value="Barail Sandstone">Barail Sandstone</option>
              <option value="Tipam Sandstone">Tipam Sandstone</option>
              <option value="Girujan Clay">Girujan Clay</option>
              <option value="Kopili Shale">Kopili Shale</option>
              <option value="Jaintia Limestone">Jaintia Limestone</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-zinc-700 mb-1.5 font-mono uppercase">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2.5 text-xs text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Event Types</option>
              <option value="STUCK_PIPE">STUCK_PIPE</option>
              <option value="LOST_CIRCULATION">LOST_CIRCULATION</option>
              <option value="KICK">KICK</option>
              <option value="FORMATION_INSTABILITY">FORMATION_INSTABILITY</option>
              <option value="NPT">NPT</option>
              <option value="TORQUE_SPIKE">TORQUE_SPIKE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-zinc-700 mb-1.5 font-mono uppercase">Min Depth (m)</label>
            <input
              type="number"
              placeholder="e.g. 3100"
              value={minDepth}
              onChange={(e) => setMinDepth(e.target.value)}
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2.5 text-xs text-black font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-zinc-700 mb-1.5 font-mono uppercase">Max Depth (m)</label>
            <input
              type="number"
              placeholder="e.g. 3300"
              value={maxDepth}
              onChange={(e) => setMaxDepth(e.target.value)}
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2.5 text-xs text-black font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchEvents}
              className="w-full bg-black hover:bg-zinc-800 text-white font-black py-2.5 rounded-xl text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Near-Depth Query Bar */}
        <div className="pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-black font-mono">Target Depth Window:</span>
            <input
              type="number"
              value={targetDepth}
              onChange={(e) => setTargetDepth(e.target.value)}
              className="w-24 bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-1.5 text-xs font-mono text-black font-black shadow-[2px_2px_0px_0px_#000]"
            />
            <span className="text-black font-bold">m &plusmn;</span>
            <input
              type="number"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              className="w-16 bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-1.5 text-xs font-mono text-black font-black shadow-[2px_2px_0px_0px_#000]"
            />
            <span className="text-black font-bold">meters</span>
            <button
              onClick={handleNearDepthSearch}
              className="px-4 py-2 bg-[#dbeafe] hover:bg-blue-200 text-[#1e3a8a] border-2 border-black font-black rounded-xl text-xs shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Query Near-Depth Precedents
            </button>
          </div>
          <span className="text-black font-mono font-bold bg-[#f8f9fa] px-3 py-1 rounded-full border border-black">
            Found <strong className="text-black font-black">{events.length}</strong> matching precedent events
          </span>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-zinc-600 text-xs font-mono font-bold bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
            <div className="inline-block w-8 h-8 border-4 border-black border-t-[#2563eb] rounded-full animate-spin mb-3"></div>
            <p>Querying precedent index...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-zinc-600 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] font-bold">
            No historical precedent events match the current criteria.
          </div>
        ) : (
          events.map((ev: any) => (
            <div
              key={ev.id}
              className="bg-white border-2 border-black rounded-2xl p-6 space-y-4 hover:shadow-[6px_6px_0px_0px_#000] transition-all shadow-[4px_4px_0px_0px_#000]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-black">
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/wells/${ev.well?.wellId || ev.wellId}`}
                    className="font-mono font-black text-sm text-[#1e3a8a] hover:underline"
                  >
                    {ev.well?.wellId || ev.wellId}
                  </Link>
                  <span className="text-xs text-zinc-600 font-bold">({ev.well?.name})</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black font-mono uppercase border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] ${
                      ev.eventType === 'STUCK_PIPE'
                        ? 'bg-[#ffe4e6] text-[#881337]'
                        : ev.eventType === 'LOST_CIRCULATION'
                        ? 'bg-[#fef3c7] text-[#78350f]'
                        : 'bg-[#ede9fe] text-[#5b21b6]'
                    }`}
                  >
                    {ev.eventType}
                  </span>
                  <span className="font-mono text-xs font-black text-black bg-[#f8f9fa] px-2.5 py-0.5 rounded-full border border-black">
                    {ev.startDepth} m MD
                  </span>
                  {ev.formation && (
                    <span className="text-xs text-black font-bold">
                      &bull; {ev.formation.formationName}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-zinc-600 font-mono font-bold">
                    Severity:{' '}
                    <strong
                      className={`px-2 py-0.5 rounded border border-black font-black uppercase text-[10px] ${
                        ev.severity === 'CRITICAL'
                          ? 'bg-[#ffe4e6] text-[#881337]'
                          : ev.severity === 'HIGH'
                          ? 'bg-[#fef3c7] text-[#78350f]'
                          : 'bg-zinc-100 text-black'
                      }`}
                    >
                      {ev.severity}
                    </strong>
                  </span>
                  <span className="font-mono text-[#064e3b] text-xs font-black bg-[#d1fae5] px-2.5 py-0.5 rounded-full border border-black">
                    Confidence: {(ev.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-black leading-relaxed font-semibold">{ev.description}</p>

              {/* Precedent Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <div>
                  <span className="text-zinc-600 block font-black text-[11px] mb-1 uppercase font-mono">
                    Root Cause:
                  </span>
                  <span className="text-black font-semibold leading-relaxed">{ev.rootCause || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-zinc-600 block font-black text-[11px] mb-1 uppercase font-mono">
                    Mitigation &amp; Recovery:
                  </span>
                  <span className="text-black font-semibold leading-relaxed">{ev.mitigation || 'N/A'}</span>
                </div>
              </div>

              {/* Provenance footer */}
              <div className="pt-2 border-t-2 border-black/10 flex flex-wrap items-center justify-between text-xs text-zinc-600 font-mono">
                <div>
                  Source Document:{' '}
                  <span className="text-[#1e3a8a] font-black">
                    {ev.document?.fileName || 'Daily Drilling Report (DDR)'}
                  </span>{' '}
                  (Page {ev.sourcePage || 1})
                </div>
                <div>
                  Verified By: <span className="text-black font-bold">{ev.verifiedBy || 'Superintendent'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { EventType, OperationalEvent } from '@nwis/types';

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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Historical Precedent Retrieval Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          eRTMAC tells what is happening now. NWIS tells what happened before in comparable offset wells.
        </p>
      </div>

      {/* QUICK PRECEDENT BENCHMARK PRESETS */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-4 space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Benchmark Precedent Discovery Presets
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadPrecedentPreset('Barail Sandstone', 3150, 3250, EventType.STUCK_PIPE)}
            className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <span>Barail Sandstone (~3200m) Stuck Pipe (Wells 003, 007, 012)</span>
          </button>
          <button
            onClick={() => loadPrecedentPreset('Tipam Sandstone', 2100, 2150, EventType.LOST_CIRCULATION)}
            className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-200 text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <span>Tipam Sandstone (~2120m) Lost Circulation (Wells 005, 014)</span>
          </button>
          <button
            onClick={() => loadPrecedentPreset('Kopili Shale', 3600, 3700, EventType.KICK)}
            className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-200 text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <span>Kopili Shale (~3650m) Gas Kick Incident (Well 009)</span>
          </button>
        </div>
      </div>

      {/* Search & Query Builder */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Geological Formation</label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="w-full bg-petro-950 border border-petro-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
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
            <label className="block text-xs font-medium text-slate-400 mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-petro-950 border border-petro-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
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
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Depth (m)</label>
            <input
              type="number"
              placeholder="e.g. 3100"
              value={minDepth}
              onChange={(e) => setMinDepth(e.target.value)}
              className="w-full bg-petro-950 border border-petro-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Depth (m)</label>
            <input
              type="number"
              placeholder="e.g. 3300"
              value={maxDepth}
              onChange={(e) => setMaxDepth(e.target.value)}
              className="w-full bg-petro-950 border border-petro-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchEvents}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-1.5 rounded-lg text-xs transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Near-Depth Query Bar (Section 30) */}
        <div className="pt-3 border-t border-petro-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-amber-400">Target Depth Window:</span>
            <input
              type="number"
              value={targetDepth}
              onChange={(e) => setTargetDepth(e.target.value)}
              className="w-24 bg-petro-950 border border-petro-700 rounded px-2 py-1 text-xs font-mono text-white"
            />
            <span className="text-slate-400">m &plusmn;</span>
            <input
              type="number"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              className="w-16 bg-petro-950 border border-petro-700 rounded px-2 py-1 text-xs font-mono text-white"
            />
            <span className="text-slate-400">meters</span>
            <button
              onClick={handleNearDepthSearch}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded text-xs transition-colors"
            >
              Query Near-Depth Precedents
            </button>
          </div>
          <span className="text-slate-400">
            Found <strong className="text-white">{events.length}</strong> matching precedent events
          </span>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Querying precedent index...
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-petro-900 border border-petro-800 rounded-xl">
            No historical precedent events match the current criteria.
          </div>
        ) : (
          events.map((ev: any) => (
            <div
              key={ev.id}
              className="bg-petro-900 border border-petro-800 hover:border-slate-600 rounded-xl p-5 space-y-3 transition-colors shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <a
                    href={`/wells/${ev.well?.wellId || ev.wellId}`}
                    className="font-mono font-bold text-sm text-emerald-400 hover:underline"
                  >
                    {ev.well?.wellId || ev.wellId}
                  </a>
                  <span className="text-xs text-slate-400">({ev.well?.name})</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ev.eventType === 'STUCK_PIPE'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : ev.eventType === 'LOST_CIRCULATION'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}
                  >
                    {ev.eventType}
                  </span>
                  <span className="font-mono text-xs font-semibold text-white">
                    {ev.startDepth} m MD
                  </span>
                  {ev.formation && (
                    <span className="text-xs text-emerald-400 font-medium">
                      &bull; {ev.formation.formationName}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-400">
                    Severity:{' '}
                    <strong
                      className={
                        ev.severity === 'CRITICAL'
                          ? 'text-red-400'
                          : ev.severity === 'HIGH'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }
                    >
                      {ev.severity}
                    </strong>
                  </span>
                  <span className="font-mono text-emerald-400 text-xs font-semibold">
                    Confidence: {(ev.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans">{ev.description}</p>

              {/* Precedent Insights: Root Cause and Mitigation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-petro-950 p-3 rounded-lg border border-petro-800">
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px] mb-0.5">
                    Root Cause:
                  </span>
                  <span className="text-slate-300 leading-relaxed">{ev.rootCause || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px] mb-0.5">
                    Mitigation & Recovery:
                  </span>
                  <span className="text-slate-300 leading-relaxed">{ev.mitigation || 'N/A'}</span>
                </div>
              </div>

              {/* Provenance footer */}
              <div className="pt-2 border-t border-petro-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <div>
                  Source Document:{' '}
                  <span className="font-mono text-emerald-400">
                    {ev.document?.fileName || 'Daily Drilling Report (DDR)'}
                  </span>{' '}
                  (Page {ev.sourcePage || 1})
                </div>
                <div>
                  Verified By: <span className="text-slate-300">{ev.verifiedBy || 'Superintendent'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

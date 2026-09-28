'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Well, OperationalEvent, DataQualityReport, NearbyWellResult } from '@nwis/types';
import { WellMap } from '../../components/WellMap';

export default function DashboardPage() {
  const [wells, setWells] = useState<Well[]>([]);
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.wells.list({ limit: 50 }),
      api.events.list({ limit: 10 }),
      api.dataQuality.getReport(),
    ])
      .then(([wellsData, eventsData, qualityData]) => {
        setWells(wellsData);
        setEvents(eventsData);
        setQualityReport(qualityData);
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeDrillingCount = wells.filter((w) => w.status === 'DRILLING').length;
  const completedCount = wells.filter((w) => w.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Operational Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Nearby Wells Intelligence System (NWIS) &bull; Field: <span className="font-semibold text-emerald-400">NWIS-DEMO-FIELD</span> (Upper Assam Basin)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="/wells"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-colors"
          >
            Explore All 20 Wells
          </a>
          <a
            href="/events"
            className="px-3.5 py-1.5 rounded-lg bg-petro-800 hover:bg-petro-700 text-slate-200 border border-petro-700 text-xs font-medium transition-colors"
          >
            Precedent Engine
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-petro-900 border border-petro-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Total Monitored Wells</span>
          <div className="text-2xl font-bold text-white mt-1">{loading ? '...' : wells.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {completedCount} Completed &bull; {activeDrillingCount} Active
          </div>
        </div>

        <div className="bg-petro-900 border border-petro-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Active Drilling Operations</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{loading ? '...' : activeDrillingCount}</div>
          <div className="text-[11px] text-blue-300 mt-1">Real-time parameters tracking</div>
        </div>

        <div className="bg-petro-900 border border-petro-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Historical Precedent Events</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{loading ? '...' : events.length}</div>
          <div className="text-[11px] text-amber-300 mt-1">Stuck pipe, losses & kicks logged</div>
        </div>

        <div className="bg-petro-900 border border-petro-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Data Platform Quality Index</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {loading ? '...' : qualityReport ? `${(qualityReport.overallScore * 100).toFixed(1)}%` : '100%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {qualityReport?.totalRecords || 0} canonical records verified
          </div>
        </div>
      </div>

      {/* HISTORICAL PRECEDENT INTELLIGENCE BANNER */}
      <div className="bg-gradient-to-r from-red-950/70 via-amber-950/60 to-petro-900 border border-amber-800/80 rounded-xl p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>Key Cross-Well Historical Precedent Detected</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Recurrent Mechanical Sticking in Barail Sandstone at ~3200m MD
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              NWIS precedent correlation identified an identical signature across three offset wells in NWIS-DEMO-FIELD:
              <strong className="text-amber-200"> OIL-SYN-003 (at 3210m)</strong>,{' '}
              <strong className="text-amber-200">OIL-SYN-007 (at 3180m)</strong>, and{' '}
              <strong className="text-amber-200">OIL-SYN-012 (at 3205m)</strong>. All three suffered stuck pipe
              preceded by gradual torque escalation (11 &rarr; 34 kN.m) and sudden ROP degradation across the
              carbonaceous shale boundary zone.
            </p>
          </div>
          <a
            href="/events?formation=Barail&minDepth=3100&maxDepth=3300"
            className="hidden sm:inline-block px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-md"
          >
            Inspect Precedents
          </a>
        </div>
      </div>

      {/* Geospatial Map Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Geospatial Proximity & Radius Search (PostGIS Engine)
          </h2>
          <span className="text-xs text-slate-400">
            Click map to set search center &bull; Toggle radius filter
          </span>
        </div>
        <WellMap initialWells={wells} />
      </div>

      {/* Recent Operational Events Table */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-petro-950 border-b border-petro-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Recent Operational Events with Provenance & Mitigation
          </h3>
          <a href="/events" className="text-xs text-emerald-400 hover:underline">
            View All Historical Events &rarr;
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-petro-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Well ID</th>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Depth</th>
                <th className="py-2.5 px-4">Formation</th>
                <th className="py-2.5 px-4">Severity</th>
                <th className="py-2.5 px-4">Description & Root Cause</th>
                <th className="py-2.5 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-petro-800">
              {events.slice(0, 5).map((ev: any) => (
                <tr key={ev.id} className="hover:bg-petro-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    <a href={`/wells/${ev.well?.wellId || ev.wellId}`} className="hover:underline text-emerald-400">
                      {ev.well?.wellId || ev.wellId}
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ev.eventType === 'STUCK_PIPE'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : ev.eventType === 'LOST_CIRCULATION'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : ev.eventType === 'KICK'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {ev.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-200">{ev.startDepth} m</td>
                  <td className="py-3 px-4 text-slate-300">{ev.formation?.formationName || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        ev.severity === 'CRITICAL'
                          ? 'text-red-400'
                          : ev.severity === 'HIGH'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {ev.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-md truncate">
                    {ev.description}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400">
                    {(ev.confidence * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

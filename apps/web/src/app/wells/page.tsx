'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Well, WellStatus, WellType } from '@nwis/types';
import { WellMap } from '../../components/WellMap';

export default function WellsPage() {
  const [wells, setWells] = useState<Well[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [wellTypeFilter, setWellTypeFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.wells
      .list({
        search: search || undefined,
        status: statusFilter ? (statusFilter as WellStatus) : undefined,
        wellType: wellTypeFilter ? (wellTypeFilter as WellType) : undefined,
      })
      .then((data) => setWells(data))
      .catch((err) => console.error('Failed to load wells:', err))
      .finally(() => setLoading(false));
  }, [search, statusFilter, wellTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Well Master Registry</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, search, and inspect all 20 synthetic exploration and development wells
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-petro-900 border border-petro-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'table' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'map' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Geospatial Map
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search wells by ID or name (e.g. OIL-SYN-003, Precedent)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-petro-950 border border-petro-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-petro-950 border border-petro-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="DRILLING">DRILLING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="PLANNED">PLANNED</option>
          </select>

          <select
            value={wellTypeFilter}
            onChange={(e) => setWellTypeFilter(e.target.value)}
            className="bg-petro-950 border border-petro-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
          >
            <option value="">All Well Types</option>
            <option value="DEVELOPMENT">DEVELOPMENT</option>
            <option value="EXPLORATION">EXPLORATION</option>
            <option value="APPRAISAL">APPRAISAL</option>
          </select>
        </div>
      </div>

      {/* Content View */}
      {viewMode === 'map' ? (
        <WellMap initialWells={wells} />
      ) : (
        <div className="bg-petro-900 border border-petro-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-petro-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-petro-800">
                <tr>
                  <th className="py-3 px-4">Well ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Field</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Total Depth</th>
                  <th className="py-3 px-4">Coordinates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-petro-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Loading well directory...
                    </td>
                  </tr>
                ) : wells.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No wells found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  wells.map((w) => (
                    <tr key={w.id} className="hover:bg-petro-800/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        <a href={`/wells/${w.wellId}`} className="text-emerald-400 hover:underline">
                          {w.wellId}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-medium">{w.name}</td>
                      <td className="py-3 px-4 text-slate-400">{w.field}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-petro-800 text-slate-300">
                          {w.wellType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-200">{w.totalDepth} m</td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {w.latitude.toFixed(3)}°N, {w.longitude.toFixed(3)}°E
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            w.status === 'DRILLING'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : w.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/wells/${w.wellId}`}
                          className="px-2.5 py-1 rounded bg-petro-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-colors text-[11px] font-medium"
                        >
                          Inspect Dossier &rarr;
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { Well, WellStatus, WellType } from '@nwis/types';
import { WellMap } from '../../components/WellMap';

export default function WellsPage() {
  const [wells, setWells] = useState<Well[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [wellTypeFilter, setWellTypeFilter] = useState<string>('');
  const [formationFilter, setFormationFilter] = useState<string>('');
  const [depthFilter, setDepthFilter] = useState<string>('');
  const [onlyHazards, setOnlyHazards] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'table'>('split');
  const [selectedWellId, setSelectedWellId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Fetch all wells on mount
  useEffect(() => {
    api.wells
      .list({ limit: 50 })
      .then((data) => setWells(data))
      .catch((err) => console.error('Failed to load wells:', err))
      .finally(() => setLoading(false));
  }, []);

  // Compute filtered wells with multi-criteria support
  const filteredWells = useMemo(() => {
    return wells.filter((w) => {
      // 1. Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesId = w.wellId.toLowerCase().includes(q);
        const matchesName = w.name.toLowerCase().includes(q);
        const matchesField = w.field.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesField) return false;
      }

      // 2. Status filter
      if (statusFilter && w.status !== statusFilter) {
        return false;
      }

      // 3. Well type filter
      if (wellTypeFilter && w.wellType !== wellTypeFilter) {
        return false;
      }

      // 4. Formation filter
      if (formationFilter) {
        const formations = (w as any).formations || [];
        const hasFormation = formations.some((f: any) => {
          const fName = typeof f === 'string' ? f : f.formationName || '';
          return fName.toLowerCase().includes(formationFilter.toLowerCase());
        });
        // Check formationSummary if available
        const hasSummary = (w as any).formationSummary?.some((f: string) =>
          f.toLowerCase().includes(formationFilter.toLowerCase())
        );
        if (!hasFormation && !hasSummary) return false;
      }

      // 5. Depth filter
      if (depthFilter === 'SHALLOW' && w.totalDepth >= 3000) return false;
      if (depthFilter === 'MEDIUM' && (w.totalDepth < 3000 || w.totalDepth > 4000)) return false;
      if (depthFilter === 'DEEP' && w.totalDepth <= 4000) return false;

      // 6. Only Hazards / Historical Incidents filter
      if (onlyHazards) {
        const eventsCount = (w as any).events?.length || (w as any).eventCount || 0;
        if (eventsCount === 0) return false;
      }

      return true;
    });
  }, [wells, search, statusFilter, wellTypeFilter, formationFilter, depthFilter, onlyHazards]);

  // Quick filter presets
  const handleQuickFilter = (preset: string) => {
    if (preset === 'ALL') {
      setSearch('');
      setStatusFilter('');
      setWellTypeFilter('');
      setFormationFilter('');
      setDepthFilter('');
      setOnlyHazards(false);
    } else if (preset === 'DRILLING') {
      setStatusFilter('DRILLING');
      setOnlyHazards(false);
    } else if (preset === 'STUCK_PIPE') {
      setFormationFilter('Barail');
      setOnlyHazards(true);
    } else if (preset === 'DEEP_EXPLORATION') {
      setWellTypeFilter('EXPLORATION');
      setDepthFilter('DEEP');
    } else if (preset === 'TIPAM_LOSS') {
      setFormationFilter('Tipam');
      setOnlyHazards(true);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setWellTypeFilter('');
    setFormationFilter('');
    setDepthFilter('');
    setOnlyHazards(false);
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(statusFilter) ||
    Boolean(wellTypeFilter) ||
    Boolean(formationFilter) ||
    Boolean(depthFilter) ||
    onlyHazards;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & KPI Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider font-mono">
              Oil India Limited &bull; Assam-Arakan Basin
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider font-mono">
              Google Maps Enterprise GIS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Well Master Registry & Subsurface GIS
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive multi-criteria spatial exploration across all 20 OIL synthetic exploration and development wells
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              viewMode === 'split'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>◫</span>
            <span>Split View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              viewMode === 'map'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🗺️</span>
            <span>Full Map</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              viewMode === 'table'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>☰</span>
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px] uppercase">Quick Presets:</span>
          <button
            onClick={() => handleQuickFilter('ALL')}
            className={`px-2.5 py-1 rounded text-xs transition-colors font-medium ${
              !hasActiveFilters
                ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            All Wells ({wells.length})
          </button>
          <button
            onClick={() => handleQuickFilter('DRILLING')}
            className={`px-2.5 py-1 rounded text-xs transition-colors font-medium ${
              statusFilter === 'DRILLING'
                ? 'bg-blue-900 text-blue-200 font-semibold border border-blue-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Active Drilling (3)
          </button>
          <button
            onClick={() => handleQuickFilter('STUCK_PIPE')}
            className={`px-2.5 py-1 rounded text-xs transition-colors font-medium ${
              formationFilter === 'Barail' && onlyHazards
                ? 'bg-rose-900 text-rose-200 font-semibold border border-rose-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            ⚠️ Barail Stuck Pipe Precedents
          </button>
          <button
            onClick={() => handleQuickFilter('TIPAM_LOSS')}
            className={`px-2.5 py-1 rounded text-xs transition-colors font-medium ${
              formationFilter === 'Tipam' && onlyHazards
                ? 'bg-amber-900 text-amber-200 font-semibold border border-amber-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            ⚠️ Tipam Mud Losses
          </button>
          <button
            onClick={() => handleQuickFilter('DEEP_EXPLORATION')}
            className={`px-2.5 py-1 rounded text-xs transition-colors font-medium ${
              depthFilter === 'DEEP'
                ? 'bg-purple-900 text-purple-200 font-semibold border border-purple-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Deep Exploration (&gt;4,000m)
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-rose-400 hover:text-rose-300 underline font-mono flex items-center space-x-1"
          >
            <span>✕ Clear Filters</span>
          </button>
        )}
      </div>

      {/* Comprehensive Filter Bar (Like Reference Petroleum Exploration Portals) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Keyword Search */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Search Well / Field
            </label>
            <input
              type="text"
              placeholder="e.g. OIL-SYN-001, Discovery..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 2. Status Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Drilling Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="DRILLING">DRILLING (Active)</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="PLANNED">PLANNED</option>
            </select>
          </div>

          {/* 3. Well Type Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Well Purpose
            </label>
            <select
              value={wellTypeFilter}
              onChange={(e) => setWellTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="">All Well Types</option>
              <option value="DEVELOPMENT">DEVELOPMENT</option>
              <option value="EXPLORATION">EXPLORATION</option>
              <option value="APPRAISAL">APPRAISAL</option>
            </select>
          </div>

          {/* 4. Stratigraphic Formation Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Formation Horizon
            </label>
            <select
              value={formationFilter}
              onChange={(e) => setFormationFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="">All Formations</option>
              <option value="Barail">Barail Sandstone</option>
              <option value="Tipam">Tipam Sandstone</option>
              <option value="Girujan">Girujan Clay</option>
              <option value="Kopili">Kopili Shale</option>
              <option value="Jaintia">Jaintia Limestone</option>
            </select>
          </div>

          {/* 5. Depth Range Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Depth Interval
            </label>
            <select
              value={depthFilter}
              onChange={(e) => setDepthFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="">All Depths</option>
              <option value="SHALLOW">&lt; 3,000m (Shallow)</option>
              <option value="MEDIUM">3,000m – 4,000m</option>
              <option value="DEEP">&gt; 4,000m (Deep)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Hazard Precedent Toggle & Result Count */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80 gap-3 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyHazards}
              onChange={(e) => setOnlyHazards(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
            />
            <span className="text-slate-300 font-medium">
              Filter to Wells with Historical Precedent Incidents (Stuck Pipe, Losses, Kicks)
            </span>
          </label>

          <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
            <span>Filtered Wells:</span>
            <span className="font-bold text-emerald-400 text-sm">{filteredWells.length}</span>
            <span>of {wells.length} Total</span>
          </div>
        </div>
      </div>

      {/* Main Content Area based on viewMode */}
      {viewMode === 'map' ? (
        /* Full Screen Map View */
        <WellMap
          initialWells={wells}
          filteredWells={filteredWells}
          selectedWellId={selectedWellId}
          onSelectWell={(w) => setSelectedWellId(w.wellId)}
          height="680px"
          showSidebarList={true}
        />
      ) : viewMode === 'split' ? (
        /* Split View: Google Map + Detailed Results Table below */
        <div className="space-y-6">
          <WellMap
            initialWells={wells}
            filteredWells={filteredWells}
            selectedWellId={selectedWellId}
            onSelectWell={(w) => setSelectedWellId(w.wellId)}
            height="520px"
            showSidebarList={true}
          />

          {/* Complementary Results Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Matching Wells Directory ({filteredWells.length})
              </span>
              <span className="text-[11px] font-mono text-slate-400">Click a well to view full dossier</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-2.5 px-4">Well ID</th>
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Field</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Total Depth</th>
                    <th className="py-2.5 px-4">Coordinates</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Loading well directory...
                      </td>
                    </tr>
                  ) : filteredWells.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No wells found matching the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredWells.map((w) => {
                      const isSelected = selectedWellId === w.wellId;
                      return (
                        <tr
                          key={w.id}
                          onClick={() => setSelectedWellId(w.wellId)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-slate-800/80 border-l-2 border-emerald-500'
                              : 'hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="py-2.5 px-4 font-bold text-emerald-400">
                            {w.wellId}
                          </td>
                          <td className="py-2.5 px-4 text-slate-200 font-sans font-medium">{w.name}</td>
                          <td className="py-2.5 px-4 text-slate-400 font-sans">{w.field}</td>
                          <td className="py-2.5 px-4 text-slate-300">{w.wellType}</td>
                          <td className="py-2.5 px-4 text-slate-200">{w.totalDepth} m</td>
                          <td className="py-2.5 px-4 text-slate-400">
                            {w.latitude.toFixed(3)}°N, {w.longitude.toFixed(3)}°E
                          </td>
                          <td className="py-2.5 px-4">
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
                          <td className="py-2.5 px-4 text-right">
                            <a
                              href={`/wells/${w.wellId}`}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-colors text-[10px] font-sans font-medium"
                            >
                              Dossier →
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-mono">
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
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Loading well directory...
                    </td>
                  </tr>
                ) : filteredWells.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No wells found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWells.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        <a href={`/wells/${w.wellId}`} className="text-emerald-400 hover:underline">
                          {w.wellId}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-sans font-medium">{w.name}</td>
                      <td className="py-3 px-4 text-slate-400 font-sans">{w.field}</td>
                      <td className="py-3 px-4 text-slate-300">{w.wellType}</td>
                      <td className="py-3 px-4 text-slate-200">{w.totalDepth} m</td>
                      <td className="py-3 px-4 text-slate-400">
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
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-colors text-[11px] font-sans font-medium"
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

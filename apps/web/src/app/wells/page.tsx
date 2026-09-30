'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { api } from '../../lib/api';
import { Well } from '@nwis/types';

const WellMap = dynamic(
  () => import('../../components/WellMap').then((mod) => mod.WellMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-zinc-50 text-xs font-mono text-zinc-500 rounded-2xl border border-zinc-200">
        [INITIALIZING WELL MAP OVERLAY...]
      </div>
    ),
  }
);

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
    <div className="space-y-6 pb-12 font-sans">
      {/* Header & KPI Summary */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#d1fae5] text-[#064e3b] border-2 border-black uppercase tracking-wider font-mono shadow-[2px_2px_0px_0px_#000]">
              Oil India Limited &bull; Assam-Arakan Basin
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#dbeafe] text-[#1e3a8a] border-2 border-black uppercase tracking-wider font-mono shadow-[2px_2px_0px_0px_#000]">
              Google Maps Enterprise GIS
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-black mt-2">
            Well Master Registry & Subsurface GIS
          </h1>
          <p className="text-xs text-zinc-600 font-medium mt-0.5">
            Interactive multi-criteria spatial exploration across all 20 OIL synthetic exploration and development wells
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1.5 bg-[#f4f4f6] p-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 ${
              viewMode === 'split'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-700 hover:text-black'
            }`}
          >
            <span>◫</span>
            <span>Split View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 ${
              viewMode === 'map'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-700 hover:text-black'
            }`}
          >
            <span>🗺️</span>
            <span>Full Map</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 ${
              viewMode === 'table'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-700 hover:text-black'
            }`}
          >
            <span>☰</span>
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-black font-mono text-[11px] uppercase tracking-wider font-black">Quick Presets:</span>
          <button
            onClick={() => handleQuickFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-black font-mono border-2 border-black transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 ${
              !hasActiveFilters
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-white text-black shadow-[2px_2px_0px_0px_#000] hover:bg-zinc-100'
            }`}
          >
            All Wells ({wells.length})
          </button>
          <button
            onClick={() => handleQuickFilter('DRILLING')}
            className={`px-3 py-1 rounded-full text-xs font-black font-mono border-2 border-black transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 ${
              statusFilter === 'DRILLING'
                ? 'bg-[#2563eb] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-[#dbeafe] text-[#1e3a8a] shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            Active Drilling (3)
          </button>
          <button
            onClick={() => handleQuickFilter('STUCK_PIPE')}
            className={`px-3 py-1 rounded-full text-xs font-black font-mono border-2 border-black transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 ${
              formationFilter === 'Barail' && onlyHazards
                ? 'bg-[#ef4444] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-[#ffe4e6] text-[#881337] shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            ⚠️ Barail Stuck Pipe Precedents
          </button>
          <button
            onClick={() => handleQuickFilter('TIPAM_LOSS')}
            className={`px-3 py-1 rounded-full text-xs font-black font-mono border-2 border-black transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 ${
              formationFilter === 'Tipam' && onlyHazards
                ? 'bg-[#f59e0b] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-[#fef3c7] text-[#78350f] shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            ⚠️ Tipam Mud Losses
          </button>
          <button
            onClick={() => handleQuickFilter('DEEP_EXPLORATION')}
            className={`px-3 py-1 rounded-full text-xs font-black font-mono border-2 border-black transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 ${
              depthFilter === 'DEEP'
                ? 'bg-purple-700 text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-purple-100 text-purple-900 shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            Deep Exploration (&gt;4,000m)
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-rose-700 hover:text-rose-900 font-mono font-black flex items-center space-x-1 px-2.5 py-1 bg-[#ffe4e6] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]"
          >
            <span>✕ Clear Filters</span>
          </button>
        )}
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Keyword Search */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-mono uppercase text-black font-black mb-1">
              Search Well / Field
            </label>
            <input
              type="text"
              placeholder="e.g. OIL-SYN-001, Discovery..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f8f8fb] border-2 border-black rounded-xl px-3 py-2 text-xs font-mono font-bold text-black placeholder-zinc-400 focus:outline-none shadow-[2px_2px_0px_0px_#000]"
            />
          </div>

          {/* 2. Status Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-black font-black mb-1">
              Drilling Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#f8f8fb] border-2 border-black rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-black outline-none shadow-[2px_2px_0px_0px_#000]"
            >
              <option value="">All Statuses</option>
              <option value="DRILLING">DRILLING (Active)</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="PLANNED">PLANNED</option>
            </select>
          </div>

          {/* 3. Well Type Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-black font-black mb-1">
              Well Purpose
            </label>
            <select
              value={wellTypeFilter}
              onChange={(e) => setWellTypeFilter(e.target.value)}
              className="w-full bg-[#f8f8fb] border-2 border-black rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-black outline-none shadow-[2px_2px_0px_0px_#000]"
            >
              <option value="">All Well Types</option>
              <option value="DEVELOPMENT">DEVELOPMENT</option>
              <option value="EXPLORATION">EXPLORATION</option>
              <option value="APPRAISAL">APPRAISAL</option>
            </select>
          </div>

          {/* 4. Stratigraphic Formation Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-black font-black mb-1">
              Formation Horizon
            </label>
            <select
              value={formationFilter}
              onChange={(e) => setFormationFilter(e.target.value)}
              className="w-full bg-[#f8f8fb] border-2 border-black rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-black outline-none shadow-[2px_2px_0px_0px_#000]"
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
            <label className="block text-[10px] font-mono uppercase text-black font-black mb-1">
              Depth Interval
            </label>
            <select
              value={depthFilter}
              onChange={(e) => setDepthFilter(e.target.value)}
              className="w-full bg-[#f8f8fb] border-2 border-black rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-black outline-none shadow-[2px_2px_0px_0px_#000]"
            >
              <option value="">All Depths</option>
              <option value="SHALLOW">&lt; 3,000m (Shallow)</option>
              <option value="MEDIUM">3,000m – 4,000m</option>
              <option value="DEEP">&gt; 4,000m (Deep)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Hazard Precedent Toggle & Result Count */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t-2 border-black gap-3 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyHazards}
              onChange={(e) => setOnlyHazards(e.target.checked)}
              className="rounded border-2 border-black text-black w-4 h-4 cursor-pointer"
            />
            <span className="text-black font-bold">
              Filter to Wells with Historical Precedent Incidents (Stuck Pipe, Losses, Kicks)
            </span>
          </label>

          <div className="text-xs font-mono text-zinc-600 flex items-center space-x-2">
            <span>Filtered Wells:</span>
            <span className="font-black text-black text-sm px-2 py-0.5 bg-[#fef3c7] border border-black rounded shadow-[1px_1px_0px_0px_#000]">{filteredWells.length}</span>
            <span className="font-bold">of {wells.length} Total</span>
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
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
            <div className="p-4 bg-[#f8f8fb] border-b-2 border-black flex items-center justify-between">
              <span className="text-xs font-black text-black uppercase tracking-wider font-mono">
                Matching Wells Directory ({filteredWells.length})
              </span>
              <span className="text-[11px] font-mono font-bold text-zinc-600">Click a well to view full dossier</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f4f6] text-black uppercase tracking-wider text-[10px] border-b-2 border-black font-mono font-black">
                  <tr>
                    <th className="py-3 px-4 font-black">Well ID</th>
                    <th className="py-3 px-4 font-black">Name</th>
                    <th className="py-3 px-4 font-black">Field</th>
                    <th className="py-3 px-4 font-black">Type</th>
                    <th className="py-3 px-4 font-black">Total Depth</th>
                    <th className="py-3 px-4 font-black">Coordinates</th>
                    <th className="py-3 px-4 font-black">Status</th>
                    <th className="py-3 px-4 text-right font-black">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-zinc-200 font-mono text-[11px]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-500 font-bold">
                        Loading well directory...
                      </td>
                    </tr>
                  ) : filteredWells.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-500 font-bold">
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
                              ? 'bg-[#dbeafe] border-l-4 border-black'
                              : 'hover:bg-zinc-100/70'
                          }`}
                        >
                          <td className="py-3 px-4 font-black text-blue-900">
                            {w.wellId}
                          </td>
                          <td className="py-3 px-4 text-black font-sans font-bold">{w.name}</td>
                          <td className="py-3 px-4 text-zinc-700 font-sans">{w.field}</td>
                          <td className="py-3 px-4 text-zinc-800 font-bold">{w.wellType}</td>
                          <td className="py-3 px-4 text-black font-black">{w.totalDepth} m</td>
                          <td className="py-3 px-4 text-zinc-600">
                            {w.latitude.toFixed(3)}°N, {w.longitude.toFixed(3)}°E
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                                w.status === 'DRILLING'
                                  ? 'bg-[#dbeafe] text-[#1e3a8a]'
                                  : w.status === 'COMPLETED'
                                  ? 'bg-[#d1fae5] text-[#064e3b]'
                                  : 'bg-zinc-100 text-zinc-700'
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <a
                              href={`/wells/${w.wellId}`}
                              className="px-3 py-1 rounded-xl bg-white hover:bg-black text-black hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all text-[11px] font-sans font-bold inline-block"
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
        <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f4f6] text-black uppercase tracking-wider text-[10px] border-b-2 border-black font-mono font-black">
                <tr>
                  <th className="py-3.5 px-4 font-black">Well ID</th>
                  <th className="py-3.5 px-4 font-black">Name</th>
                  <th className="py-3.5 px-4 font-black">Field</th>
                  <th className="py-3.5 px-4 font-black">Type</th>
                  <th className="py-3.5 px-4 font-black">Total Depth</th>
                  <th className="py-3.5 px-4 font-black">Coordinates</th>
                  <th className="py-3.5 px-4 font-black">Status</th>
                  <th className="py-3.5 px-4 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-zinc-200 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 font-bold">
                      Loading well directory...
                    </td>
                  </tr>
                ) : filteredWells.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 font-bold">
                      No wells found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWells.map((w) => (
                    <tr key={w.id} className="hover:bg-zinc-100/70 transition-colors">
                      <td className="py-3.5 px-4 font-black">
                        <a href={`/wells/${w.wellId}`} className="text-blue-900 hover:underline">
                          {w.wellId}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-black font-sans font-bold">{w.name}</td>
                      <td className="py-3.5 px-4 text-zinc-700 font-sans">{w.field}</td>
                      <td className="py-3.5 px-4 text-zinc-800 font-bold">{w.wellType}</td>
                      <td className="py-3.5 px-4 text-black font-black">{w.totalDepth} m</td>
                      <td className="py-3.5 px-4 text-zinc-600">
                        {w.latitude.toFixed(3)}°N, {w.longitude.toFixed(3)}°E
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                            w.status === 'DRILLING'
                              ? 'bg-[#dbeafe] text-[#1e3a8a]'
                              : w.status === 'COMPLETED'
                              ? 'bg-[#d1fae5] text-[#064e3b]'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`/wells/${w.wellId}`}
                          className="px-3 py-1 rounded-xl bg-white hover:bg-black text-black hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all text-[11px] font-sans font-bold inline-block"
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

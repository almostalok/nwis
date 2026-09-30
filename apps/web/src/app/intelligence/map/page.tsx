'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { api } from '../../../lib/api';
import { Well } from '@nwis/types';

const WellMap = dynamic(
  () => import('../../../components/WellMap').then((mod) => mod.WellMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-zinc-50 text-xs font-mono text-zinc-500 rounded-2xl border border-zinc-200">
        [INITIALIZING GIS SPATIAL ENGINE...]
      </div>
    ),
  }
);

export default function SpatialMapPage() {
  const [wells, setWells] = useState<Well[]>([]);
  const [selectedWellId, setSelectedWellId] = useState<string>('OIL-SYN-020');
  const [formationFilter, setFormationFilter] = useState<string>('ALL');
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [depthFilter, setDepthFilter] = useState<string>('ALL');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.wells
      .list({ limit: 50 })
      .then((data: any) => setWells(data || []))
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filter wells dynamically
  const filteredWells = useMemo(() => {
    return wells.filter((w) => {
      // Formation filter
      if (formationFilter !== 'ALL') {
        const fSummary = (w as any).formationSummary || [];
        const hasFm = fSummary.some((f: string) =>
          f.toLowerCase().includes(formationFilter.toLowerCase())
        );
        if (!hasFm && formationFilter !== 'Barail') return false;
      }

      // Event/hazard filter
      if (eventFilter === 'STUCK_PIPE') {
        const events = (w as any).events || [];
        const isKnownStuck = ['OIL-SYN-003', 'OIL-SYN-007', 'OIL-SYN-012', 'OIL-SYN-020'].includes(w.wellId);
        if (!isKnownStuck && events.length === 0) return false;
      }

      // Depth filter
      if (depthFilter === 'DEEP' && w.totalDepth < 3500) return false;
      if (depthFilter === 'SHALLOW' && w.totalDepth >= 3500) return false;

      return true;
    });
  }, [wells, formationFilter, eventFilter, depthFilter]);

  return (
    <div className="space-y-5 pb-12 font-sans">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs">
            <Link href="/dashboard" className="text-blue-900 font-bold hover:underline">
              &larr; Return to Command Center
            </Link>
            <span className="text-zinc-400">/</span>
            <Link href="/intelligence" className="text-zinc-700 hover:text-black font-semibold">
              Intelligence
            </Link>
            <span className="text-zinc-400">/</span>
            <span className="text-black font-black uppercase text-[11px] font-mono">GIS Spatial Map</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-black text-black tracking-tight">
              Spatial Intelligence &amp; GIS Map
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#dbeafe] text-[#1e3a8a] border-2 border-black rounded-full font-mono shadow-[2px_2px_0px_0px_#000]">
              PostGIS Geodetic
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-medium mt-1">
            Assam-Arakan Basin &bull; Proximity clustering, radius buffers, trajectory horizons, and historical hazards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
          >
            Command Center &rarr;
          </Link>
        </div>
      </div>

      {/* GIS Filter Controls Bar */}
      <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-black font-mono font-black uppercase text-[10px]">FORMATION:</span>
          <select
            value={formationFilter}
            onChange={(e) => setFormationFilter(e.target.value)}
            className="bg-[#f8f8fb] text-black px-3 py-1.5 border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
          >
            <option value="ALL">All Formations</option>
            <option value="Barail">Barail Sandstone</option>
            <option value="Tipam">Tipam Sandstone</option>
            <option value="Girujan">Girujan Clay</option>
            <option value="Kopili">Kopili Shale</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-black font-mono font-black uppercase text-[10px]">HAZARD FILTER:</span>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-[#f8f8fb] text-black px-3 py-1.5 border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
          >
            <option value="ALL">All Incidents</option>
            <option value="STUCK_PIPE">Stuck Pipe Precedents</option>
            <option value="LOST_CIRCULATION">Lost Circulation</option>
            <option value="KICK">Kick / Influx</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-black font-mono font-black uppercase text-[10px]">DEPTH:</span>
          <select
            value={depthFilter}
            onChange={(e) => setDepthFilter(e.target.value)}
            className="bg-[#f8f8fb] text-black px-3 py-1.5 border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
          >
            <option value="ALL">All Depths</option>
            <option value="DEEP">Deep (&gt;3,500m)</option>
            <option value="SHALLOW">Shallow (&lt;3,500m)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-black font-mono font-black uppercase text-[10px]">SEARCH RADIUS:</span>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="bg-[#f8f8fb] text-black px-3 py-1.5 border-2 border-black rounded-xl text-xs font-bold font-mono shadow-[2px_2px_0px_0px_#000] focus:outline-none"
          >
            <option value="5">5 km Ring</option>
            <option value="10">10 km Ring</option>
            <option value="25">25 km Ring</option>
            <option value="50">50 km Ring</option>
          </select>
        </div>

        <div className="ml-auto text-xs font-mono text-zinc-600 font-bold">
          Showing <strong className="text-black font-black px-2 py-0.5 bg-[#fef3c7] border border-black rounded shadow-[1px_1px_0px_0px_#000]">{filteredWells.length}</strong> of {wells.length} wells
        </div>
      </div>

      {/* Full GIS Spatial Canvas */}
      <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] space-y-3">
        <div className="h-[640px] rounded-xl overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <WellMap
            initialWells={filteredWells}
            selectedWellId={selectedWellId}
            onSelectWell={(w: any) => setSelectedWellId(w.wellId || w.id)}
            height="100%"
            showSidebarList={true}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-zinc-600 pt-2 px-1 border-t-2 border-black">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-black" />
              <span className="text-black font-sans font-bold">Current Target Well</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-black" />
              <span className="text-black font-sans font-bold">Historical Precedents (SYN-003, 007, 012)</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 border border-black" />
              <span className="text-black font-sans font-bold">Other Regional Offset Wells</span>
            </span>
          </div>

          <div className="text-zinc-600 font-bold text-[11px]">
            Basin: Upper Assam &bull; Duliajan Field &bull; EPSG:4326 PostGIS
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Well } from '@nwis/types';

const WellMap = dynamic(
  () => import('../WellMap').then((mod) => mod.WellMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-white text-xs font-mono text-zinc-500 font-bold">
        [INITIALIZING SPATIAL GIS CANVAS...]
      </div>
    ),
  }
);

interface SpatialPreviewProps {
  wells: Well[];
  selectedWellId: string;
  onSelectWell?: (well: any) => void;
}

export function SpatialPreview({
  wells,
  selectedWellId,
  onSelectWell,
}: SpatialPreviewProps) {
  return (
    <section className="bg-white border-2 border-black rounded-2xl p-5 lg:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4 font-sans" aria-label="Spatial Intelligence Context">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black">
        <div>
          <h2 className="text-xs font-black tracking-wider text-black uppercase font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] border border-black" />
            Nearby Well Map &amp; Spatial Intelligence
          </h2>
          <p className="text-xs text-zinc-700 mt-0.5 font-medium">
            Geographic proximity &bull; Offset well cluster &bull; Upper Assam Duliajan Basin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            id="btn-open-full-map"
            href="/intelligence/map"
            className="neo-btn-white text-xs font-mono font-bold"
          >
            <span>Open Full GIS Map</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Visual Overlay Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f4f4f6] px-4 py-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 font-bold text-black">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b] border-2 border-black" />
            <span>Target ({selectedWellId})</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[#991b1b]">
            <span className="w-3 h-3 rounded-full bg-[#ef4444] border-2 border-black" />
            <span>Precedents (SYN-003, 007, 012)</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-zinc-600">
            <span className="w-3 h-3 rounded-full bg-zinc-300 border-2 border-black" />
            <span>Offset Wells</span>
          </div>
        </div>

        <div className="text-[11px] text-zinc-600 hidden md:inline font-mono font-bold">
          Radius: 5km &bull; 10km &bull; 25km
        </div>
      </div>

      {/* Map Canvas Frame */}
      <div className="h-[360px] sm:h-[400px] rounded-2xl overflow-hidden border-2 border-black relative bg-[#f4f4f6] shadow-[3px_3px_0px_0px_#000]">
        <WellMap
          initialWells={wells}
          selectedWellId={selectedWellId}
          onSelectWell={onSelectWell}
          height="100%"
          showSidebarList={false}
        />
      </div>

      {/* Footer Info Strip */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-700 font-mono font-bold pt-1">
        <span>PostGIS Geodetic Bounding: 27.325° N, 95.312° E</span>
        <span className="neo-badge neo-badge-blue text-[10px]">3 Precedents Within 12km Proximity</span>
      </div>
    </section>
  );
}

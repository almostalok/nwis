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
      <div className="h-full w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-xs font-mono text-zinc-400">
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
    <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 font-sans" aria-label="Spatial Intelligence Context">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 className="text-xs font-mono font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Nearby Well Map &amp; Spatial Intelligence
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Geographic proximity &bull; Offset well cluster &bull; Upper Assam Duliajan Basin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            id="btn-open-full-map"
            href="/intelligence/map"
            className="h-7 px-3 text-xs font-mono font-medium rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors inline-flex items-center gap-1"
          >
            <span>Full GIS Map</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Visual Overlay Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-900/40 px-3.5 py-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Target ({selectedWellId})</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Precedents (SYN-003, 007, 012)</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span>Offset Wells</span>
          </div>
        </div>

        <div className="text-[10px] text-zinc-400 hidden md:inline">
          Proximity: 5km &bull; 10km &bull; 25km
        </div>
      </div>

      {/* Map Canvas Frame */}
      <div className="h-[360px] sm:h-[400px] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 relative bg-zinc-100 dark:bg-zinc-900">
        <WellMap
          initialWells={wells}
          selectedWellId={selectedWellId}
          onSelectWell={onSelectWell}
          height="100%"
          showSidebarList={false}
        />
      </div>

      {/* Footer Info Strip */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 font-mono pt-1">
        <span>PostGIS Geodetic Bounding: 27.325° N, 95.312° E</span>
        <span className="tech-badge tech-badge-blue text-[10px]">3 Precedents Within 12km Proximity</span>
      </div>
    </section>
  );
}

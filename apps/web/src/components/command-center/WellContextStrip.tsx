'use client';

import React from 'react';
import { Well } from '@nwis/types';
import Link from 'next/link';

interface WellContextStripProps {
  selectedWellId: string;
  well?: Well | null;
  wells: Well[];
  onSelectWell: (wellId: string) => void;
  currentDepth: number;
  currentFormation: string;
  streamStatus: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';
}

const STRATIGRAPHIC_SEQUENCE = [
  { name: 'Surface Alluvium', top: 0, bottom: 450, code: 'ALV' },
  { name: 'Dhekiajuli Fm', top: 450, bottom: 1200, code: 'DKJ' },
  { name: 'Girujan Clay', top: 1200, bottom: 2100, code: 'GRJ' },
  { name: 'Tipam Sandstone', top: 2100, bottom: 2850, code: 'TPM' },
  { name: 'Barail Sandstone', top: 2850, bottom: 3450, code: 'BRL', isTarget: true },
  { name: 'Kopili Shale', top: 3450, bottom: 3800, code: 'KPL' },
  { name: 'Jaintia Group', top: 3800, bottom: 4200, code: 'JNT' },
];

export function WellContextStrip({
  selectedWellId,
  well,
  wells,
  onSelectWell,
  currentDepth = 3208,
  currentFormation = 'Barail Sandstone',
  streamStatus,
}: WellContextStripProps) {
  const currentWell = well || wells.find((w) => w.wellId === selectedWellId) || {
    wellId: selectedWellId,
    name: 'Duolian Field · Step-out 20',
    field: 'Duliajan Basin',
    status: 'DRILLING',
    totalDepth: 4150,
  };

  return (
    <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm font-sans" aria-label="Current Well Context">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        {/* Well Identification & Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
              Target Well
            </span>
            <div className="relative">
              <select
                id="well-selector"
                value={selectedWellId}
                onChange={(e) => onSelectWell(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-sm sm:text-base px-3 py-1.5 pr-8 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer appearance-none"
                aria-label="Select Target Well"
              >
                {wells.map((w) => (
                  <option key={w.wellId} value={w.wellId} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {w.wellId} — {w.name} [{w.status}]
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <span className="tech-badge tech-badge-emerald text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {currentWell.status || 'DRILLING'}
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-mono flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{currentWell.name || 'Duolian Field · Step-out 20'}</span>
            <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
            <span>Basin: <strong className="text-zinc-700 dark:text-zinc-300 font-normal">{currentWell.field || 'Duliajan Basin'}</strong></span>
            <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
            <span>Rig: <strong className="text-zinc-700 dark:text-zinc-300 font-normal">SYN-RIG-07 (OIL-Assam)</strong></span>
          </p>
        </div>

        {/* Right Status KPIs in Precision Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-2.5 text-right">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Bit Depth</div>
            <div className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              {currentDepth.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">m</span>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-2.5 text-right">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Formation</div>
            <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
              {currentFormation}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-2.5 text-right">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Telemetry</div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  streamStatus === 'CONNECTED'
                    ? 'bg-emerald-500 animate-pulse'
                    : streamStatus === 'CONNECTING'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
              <span
                className={`font-mono font-bold text-xs uppercase ${
                  streamStatus === 'CONNECTED'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : streamStatus === 'CONNECTING'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {streamStatus === 'CONNECTED' ? 'Live SSE' : streamStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stratigraphic Geological Horizon Sequence */}
      <div className="mt-3.5 pt-1">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Stratigraphy &amp; Horizon Sequence (Assam-Arakan Basin)
          </span>
          <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
            Target: Barail Reservoir (2,850m &ndash; 3,450m)
          </span>
        </div>

        {/* Geological Sequence Track */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 bg-zinc-50 dark:bg-zinc-900/40 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
          {STRATIGRAPHIC_SEQUENCE.map((formation) => {
            const isCurrent =
              currentDepth >= formation.top && currentDepth <= formation.bottom;
            return (
              <div
                key={formation.code}
                className={`relative px-2.5 py-2 rounded-md border text-center transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className={`text-[9px] uppercase font-mono tracking-tight truncate ${isCurrent ? 'text-amber-700 dark:text-amber-300 font-semibold' : 'text-zinc-400'}`}>
                  {formation.top}m - {formation.bottom}m
                </div>
                <div className="text-xs font-medium truncate mt-0.5">
                  {formation.name}
                </div>

                {isCurrent && (
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-amber-800 dark:text-amber-300">
                      BIT: {currentDepth}m
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stratigraphic Breadcrumbs */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
            <span className="text-zinc-400 uppercase">Strata:</span>
            <span>Surface</span>
            <span className="text-zinc-300 dark:text-zinc-700">&rarr;</span>
            <span>Tipam</span>
            <span className="text-zinc-300 dark:text-zinc-700">&rarr;</span>
            <span className="tech-badge tech-badge-amber text-[9px]">
              Barail Sandstone (Current Interval)
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">&rarr;</span>
            <span>Kopili</span>
            <span className="text-zinc-300 dark:text-zinc-700">&rarr;</span>
            <span>Jaintia</span>
          </div>

          <Link
            href={`/wells/${selectedWellId}`}
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Full Well Dossier</span>
            <span className="font-mono">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

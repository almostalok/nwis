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
    <section className="bg-white border-2 border-black rounded-2xl p-5 lg:p-6 shadow-[4px_4px_0px_0px_#000000] font-sans" aria-label="Current Well Context">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        {/* Well Identification & Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-mono font-black tracking-wider text-black uppercase bg-[#f4f4f6] px-2.5 py-1 rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              ACTIVE WELL
            </span>
            <select
              id="well-selector"
              value={selectedWellId}
              onChange={(e) => onSelectWell(e.target.value)}
              className="bg-[#f4f4f6] hover:bg-white text-black font-extrabold text-base sm:text-lg tracking-tight px-3.5 py-1.5 rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_0px_#000] focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] cursor-pointer transition-all"
              aria-label="Select Target Well"
            >
              {wells.map((w) => (
                <option key={w.wellId} value={w.wellId} className="bg-white text-black font-bold">
                  {w.wellId} — {w.name} [{w.status}]
                </option>
              ))}
            </select>

            <span className="neo-badge neo-badge-emerald text-xs">
              <span className="w-2 h-2 rounded-full bg-[#10b981] border border-black animate-pulse" />
              {currentWell.status || 'DRILLING'}
            </span>
          </div>

          <p className="text-xs text-zinc-700 mt-2 font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-black font-extrabold">{currentWell.name || 'Duolian Field · Step-out 20'}</span>
            <span className="text-black font-bold">&bull;</span>
            <span>Basin: <strong className="text-black font-bold">{currentWell.field || 'Duliajan Basin'}</strong></span>
            <span className="text-black font-bold">&bull;</span>
            <span>Rig: <strong className="text-black font-bold font-mono">SYN-RIG-07 (OIL-Assam)</strong></span>
          </p>
        </div>

        {/* Right Status Block */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-[#f4f4f6] border-2 border-black rounded-xl px-3.5 py-2 text-right shadow-[2.5px_2.5px_0px_0px_#000]">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-mono font-bold">Current Bit Depth</div>
            <div className="text-base sm:text-xl font-black text-[#d97706] font-mono">
              {currentDepth.toLocaleString()} <span className="text-xs text-black font-bold">m MD</span>
            </div>
          </div>

          <div className="bg-[#f4f4f6] border-2 border-black rounded-xl px-3.5 py-2 text-right shadow-[2.5px_2.5px_0px_0px_#000]">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-mono font-bold">Target Horizon</div>
            <div className="text-base sm:text-lg font-black text-black">
              {currentFormation}
            </div>
          </div>

          <div className="bg-[#f4f4f6] border-2 border-black rounded-xl px-3.5 py-2 text-right shadow-[2.5px_2.5px_0px_0px_#000]">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-mono font-bold">Telemetry Feed</div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full border border-black ${
                  streamStatus === 'CONNECTED'
                    ? 'bg-[#10b981] animate-pulse'
                    : streamStatus === 'CONNECTING'
                    ? 'bg-[#f59e0b] animate-ping'
                    : 'bg-[#ef4444]'
                }`}
              />
              <span
                className={`font-mono font-extrabold text-xs uppercase ${
                  streamStatus === 'CONNECTED'
                    ? 'text-[#065f46]'
                    : streamStatus === 'CONNECTING'
                    ? 'text-[#92400e]'
                    : 'text-[#991b1b]'
                }`}
              >
                {streamStatus === 'CONNECTED' ? 'Live SSE' : streamStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL ASSET #1: Stratigraphic Depth / Formation Strip */}
      <div className="mt-4 pt-2">
        <div className="flex items-center justify-between text-xs text-zinc-700 mb-2.5">
          <span className="font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-black font-mono text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-black" />
            Visual Stratigraphy &amp; Horizon Sequence (Assam-Arakan Basin)
          </span>
          <span className="text-[11px] text-black font-mono font-bold hidden sm:inline">
            Bit at {currentDepth}m &bull; Target: Barail Reservoir
          </span>
        </div>

        {/* Geological Sequence Horizontal Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 bg-[#f4f4f6] p-2.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          {STRATIGRAPHIC_SEQUENCE.map((formation) => {
            const isCurrent =
              currentDepth >= formation.top && currentDepth <= formation.bottom;
            return (
              <div
                key={formation.code}
                className={`relative px-3 py-2.5 rounded-xl border-2 border-black transition-all text-center ${
                  isCurrent
                    ? 'bg-[#fbbf24] text-black font-extrabold shadow-[2.5px_2.5px_0px_0px_#000] -translate-y-0.5'
                    : 'bg-white hover:bg-zinc-50 text-black shadow-[1.5px_1.5px_0px_0px_#000]'
                }`}
              >
                <div className={`text-[10px] uppercase font-mono tracking-tight truncate font-bold ${isCurrent ? 'text-black' : 'text-zinc-500'}`}>
                  {formation.top}m - {formation.bottom}m
                </div>
                <div className="text-xs font-black truncate mt-0.5 text-black">
                  {formation.name}
                </div>

                {isCurrent && (
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                    <span className="text-[10px] font-black text-black uppercase tracking-wider font-mono">
                      BIT: {currentDepth}m
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stratigraphic Breadcrumb & Telemetry Link */}
        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-zinc-700 gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-black font-mono font-bold uppercase text-[10px]">Strata:</span>
            <span className="text-zinc-700 font-semibold">Surface Alluvium</span>
            <span className="text-black font-bold">&rarr;</span>
            <span className="text-zinc-700 font-semibold">Tipam</span>
            <span className="text-black font-bold">&rarr;</span>
            <span className="neo-badge neo-badge-amber text-[10px]">
              Barail Sandstone (Current Interval)
            </span>
            <span className="text-black font-bold">&rarr;</span>
            <span className="text-zinc-700 font-semibold">Kopili</span>
            <span className="text-black font-bold">&rarr;</span>
            <span className="text-zinc-700 font-semibold">Jaintia</span>
          </div>

          <Link
            href={`/wells/${selectedWellId}`}
            className="text-xs font-bold text-black hover:underline flex items-center gap-1 font-mono"
          >
            <span>Inspect Full Telemetry &amp; Hydraulics</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';

interface LithologyColumnProps {
  currentDepth: number; // e.g. 3218
  totalDepth?: number;  // e.g. 3500
  formationName?: string;
  isStuckRisk?: boolean;
}

export function LithologyColumn({
  currentDepth = 3218,
  totalDepth = 3500,
  formationName = 'Barail Sandstone',
  isStuckRisk = false,
}: LithologyColumnProps) {
  // Depth bounds for visualization: 3150m to 3300m focused window
  const minDepth = 3150;
  const maxDepth = 3300;
  const depthRange = maxDepth - minDepth;

  // Formations in this zone
  const strata = [
    {
      name: 'Upper Barail Sandstone',
      from: 3150,
      to: 3215,
      color: '#fef3c7',
      borderColor: '#fde68a',
      textColor: '#92400e',
      pattern: 'sand',
      risk: 'LOW',
    },
    {
      name: 'Reactive Barail Coal & Shale',
      from: 3215,
      to: 3245,
      color: '#ffedd5',
      borderColor: '#fdba74',
      textColor: '#9a3412',
      pattern: 'coal',
      risk: 'HIGH',
      hazardTag: 'TIGHT HOLE / SWELLING',
    },
    {
      name: 'Lower Barail Sandstone (Reservoir)',
      from: 3245,
      to: 3300,
      color: '#d1fae5',
      borderColor: '#a7f3d0',
      textColor: '#065f46',
      pattern: 'sand',
      risk: 'NORMAL',
      target: true,
    },
  ];

  // Normalized bit position (0 to 100%)
  const clampedDepth = Math.max(minDepth, Math.min(maxDepth, currentDepth));
  const bitPosPercent = ((clampedDepth - minDepth) / depthRange) * 100;

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-black" />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            Stratigraphic Wellbore Column
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#78350f] border-2 border-black font-mono font-bold shadow-[2px_2px_0px_0px_#000]">
            Interval: {minDepth}m - {maxDepth}m
          </span>
        </div>
        <div className="text-xs text-zinc-600 font-mono">
          Bit Depth: <strong className="text-blue-900 font-black px-2 py-0.5 bg-[#dbeafe] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] ml-1">{currentDepth.toFixed(1)}m</strong>
        </div>
      </div>

      {/* Main Graphical Column Container */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column: Strata Graphic Canvas */}
        <div className="col-span-12 md:col-span-5 relative h-64 bg-zinc-50 border-2 border-black rounded-xl overflow-hidden select-none shadow-[3px_3px_0px_0px_#000]">
          {/* Depth Scale Markers */}
          <div className="absolute left-2 top-2 text-[9px] font-mono font-bold text-black z-10 px-1.5 py-0.5 bg-white/90 border border-black rounded">{minDepth}m</div>
          <div className="absolute left-2 bottom-2 text-[9px] font-mono font-bold text-black z-10 px-1.5 py-0.5 bg-white/90 border border-black rounded">{maxDepth}m</div>

          {/* Strata Layers */}
          {strata.map((s, idx) => {
            const topPct = ((s.from - minDepth) / depthRange) * 100;
            const heightPct = ((s.to - s.from) / depthRange) * 100;

            return (
              <div
                key={idx}
                style={{
                  top: `${topPct}%`,
                  height: `${heightPct}%`,
                  backgroundColor: s.color,
                  borderTop: '2px solid #000',
                  borderBottom: '2px solid #000',
                }}
                className="absolute inset-x-0 transition-all flex items-center justify-end pr-3 text-[10px] font-semibold"
              >
                {s.pattern === 'coal' && (
                  <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000,#000_4px,transparent_4px,transparent_8px)] pointer-events-none" />
                )}
                <span style={{ color: s.textColor }} className="relative z-10 text-[10px] font-mono font-black truncate max-w-[130px] bg-white/80 px-1.5 py-0.5 border border-black rounded shadow-[1px_1px_0px_0px_#000]">
                  {s.from}m - {s.to}m
                </span>
              </div>
            );
          })}

          {/* Casing Line (Left Wall) */}
          <div className="absolute left-8 top-0 bottom-0 w-2 border-r-2 border-black border-dashed opacity-40 pointer-events-none" />

          {/* Central Drillstring (Steel rod down to bit) */}
          <div
            style={{ height: `${bitPosPercent}%` }}
            className="absolute left-1/2 -translate-x-1/2 top-0 w-2.5 bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 border-x border-black shadow-md transition-all duration-300 z-20 rounded-b-sm"
          >
            {/* Tool Joint Markings */}
            <div className="absolute top-1/4 left-0 right-0 h-1 bg-black" />
            <div className="absolute top-2/4 left-0 right-0 h-1 bg-black" />
            <div className="absolute top-3/4 left-0 right-0 h-1 bg-black" />
          </div>

          {/* Drill Bit Head Cursor */}
          <div
            style={{ top: `${bitPosPercent}%` }}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-30 flex items-center"
          >
            {/* Bit Cone Icon */}
            <div className="relative">
              <div
                className={`w-6 h-5 flex items-center justify-center font-bold text-[9px] border border-black shadow-md ${
                  isStuckRisk
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-black text-white'
                }`}
                style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }}
              >
                ▼
              </div>
            </div>

            {/* Depth Guideline & Label */}
            <div className="ml-2 flex items-center">
              <span className="w-3 h-0.5 bg-black" />
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                  isStuckRisk
                    ? 'bg-[#ffe4e6] text-[#881337]'
                    : 'bg-black text-white'
                }`}
              >
                {currentDepth.toFixed(1)}m
              </span>
            </div>
          </div>
        </div>

        {/* Right Details: Layer Intelligence & Risk Warnings */}
        <div className="col-span-12 md:col-span-7 flex flex-col justify-between space-y-3">
          {/* Active Formation Banner */}
          <div className="p-3.5 bg-[#f8f8fb] border-2 border-black rounded-xl text-xs space-y-1 shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center justify-between text-[11px] text-zinc-600 font-bold uppercase tracking-wider">
              <span>PENETRATING LAYER</span>
              <span className="text-emerald-800 font-black">[Online BHA]</span>
            </div>
            <div className="text-sm font-black text-black flex items-center justify-between">
              <span>{formationName}</span>
              {currentDepth >= 3215 && currentDepth <= 3245 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#ffe4e6] text-[#881337] border-2 border-black font-mono font-black shadow-[2px_2px_0px_0px_#000]">
                  CRITICAL ZONE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#d1fae5] text-[#064e3b] border-2 border-black font-mono font-black shadow-[2px_2px_0px_0px_#000]">
                  NOMINAL INTERVAL
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-700 font-medium leading-relaxed pt-1">
              {currentDepth >= 3215 && currentDepth <= 3245
                ? 'High torque variance observed. Interbedded coal stringers prone to mechanical pack-off and drillstring binding.'
                : 'Sandstone sequence with moderate permeability. Filter cake stabilization nominal.'}
            </p>
          </div>

          {/* Subsurface Layer Legend & Precedent Markers */}
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-[#fef3c7] border-2 border-black rounded-xl flex items-center justify-between shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-black" />
                <span className="text-[#78350f] font-bold text-[11px]">3,215m - 3,245m: Barail Coal Seam</span>
              </div>
              <span className="text-[#78350f] font-mono font-black text-[10px] px-2 py-0.5 bg-white border border-black rounded">OIL-SYN-005 Precedent</span>
            </div>

            <div className="p-2.5 bg-[#d1fae5] border-2 border-black rounded-xl flex items-center justify-between shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
                <span className="text-[#064e3b] font-bold text-[11px]">3,245m+: Target Pay Sand</span>
              </div>
              <span className="text-[#064e3b] font-mono font-black text-[10px] px-2 py-0.5 bg-white border border-black rounded">Est. Entry: ~3.5 hrs</span>
            </div>
          </div>

          {/* Wellbore Clearance & Overpull Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t-2 border-zinc-200 text-[11px]">
            <div className="bg-white p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-500 block font-mono text-[10px] font-bold uppercase">CASING SHOE</span>
              <span className="font-black text-black">2,910m (9-5/8&quot;)</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-500 block font-mono text-[10px] font-bold uppercase">HOLE SIZE</span>
              <span className="font-black text-black">8-1/2&quot; Open Hole</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-500 block font-mono text-[10px] font-bold uppercase">MUD DENSITY</span>
              <span className="font-black text-blue-900 font-mono">1.28 SG (WBM)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

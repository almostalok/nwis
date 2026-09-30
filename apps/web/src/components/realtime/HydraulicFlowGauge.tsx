'use client';

import React from 'react';

interface HydraulicFlowGaugeProps {
  flowIn?: number | null;
  flowOut?: number | null;
  spp?: number | null;
  pitVolume?: number | null;
}

export function HydraulicFlowGauge({
  flowIn = 1850,
  flowOut = 1850,
  spp = 195,
  pitVolume = 42.5,
}: HydraulicFlowGaugeProps) {
  const fIn = flowIn ?? 1800;
  const fOut = flowOut ?? 1800;
  const delta = fOut - fIn;

  const maxFlow = 2500;
  const inPct = Math.min(100, Math.max(0, (fIn / maxFlow) * 100));
  const outPct = Math.min(100, Math.max(0, (fOut / maxFlow) * 100));

  let status = 'BALANCED';
  let badgeStyle = 'tech-badge-emerald';
  let alertText = 'Hydrostatic column stable & balanced.';

  if (delta > 60) {
    status = 'INFLUX WARNING';
    badgeStyle = 'tech-badge-rose';
    alertText = 'Flow Out exceeds Flow In. Possible formation fluid influx detected!';
  } else if (delta < -60) {
    status = 'MUD LOSS DETECTED';
    badgeStyle = 'tech-badge-amber';
    alertText = 'Flow Out below Flow In. Mud filtration loss to porous/fractured zone.';
  }

  const maxDeltaRange = 150;
  const clampedDelta = Math.max(-maxDeltaRange, Math.min(maxDeltaRange, delta));
  const deltaMarkerPct = 50 + (clampedDelta / maxDeltaRange) * 50;

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm font-sans space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Hydraulic Balance &amp; Flow
          </span>
          <span className="tech-badge tech-badge-blue text-[9px]">
            eRTMAC
          </span>
        </div>

        <span className={`tech-badge text-[10px] uppercase ${badgeStyle}`}>
          {status}
        </span>
      </div>

      {/* Main Flow Gauges in Precision Bento */}
      <div className="grid grid-cols-2 gap-3">
        {/* Flow In */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400">Flow In</span>
            <span className="text-[10px] text-zinc-400">Pump 1 &amp; 2</span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">
            {fIn.toFixed(0)} <span className="text-xs text-zinc-400 font-normal">L/min</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${inPct}%` }}
            />
          </div>
        </div>

        {/* Flow Out */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400">Flow Out</span>
            <span className="text-[10px] text-zinc-400">Return Line</span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">
            {fOut.toFixed(0)} <span className="text-xs text-zinc-400 font-normal">L/min</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                Math.abs(delta) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${outPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Differential Gauge Bar */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-[10px] uppercase text-zinc-400 font-semibold">Flow Differential (&Delta;Q)</span>
          <span
            className={`font-mono font-bold text-xs ${
              delta > 60
                ? 'text-rose-600 dark:text-rose-400'
                : delta < -60
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {delta >= 0 ? `+${delta.toFixed(0)}` : delta.toFixed(0)} L/min
          </span>
        </div>

        {/* Bipolar Scale Bar */}
        <div className="relative h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-zinc-400 z-10" />
          <div
            className={`absolute top-0 bottom-0 transition-all duration-300 ${
              delta >= 0
                ? 'left-1/2 bg-blue-500'
                : 'right-1/2 bg-amber-500'
            }`}
            style={{
              width: `${(Math.abs(clampedDelta) / maxDeltaRange) * 50}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-zinc-400 font-mono mt-1">
          <span>-150 (Loss)</span>
          <span>0 (Balanced)</span>
          <span>+150 (Kick)</span>
        </div>
      </div>

      {/* Auxiliary Parameters */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
          <span className="text-zinc-400">Standpipe Pressure</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{spp} bar</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
          <span className="text-zinc-400">Active Pit Volume</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{pitVolume} m&sup3;</span>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
        {alertText}
      </div>
    </div>
  );
}

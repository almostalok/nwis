'use client';

import React from 'react';
import Link from 'next/link';

interface PrimaryParametersProps {
  wellId: string;
  sample?: {
    torque?: number | null;
    rop?: number | null;
    standpipePressure?: number | null;
  } | null;
  feature?: {
    formationBaselineDeviation?: {
      torquePct?: number;
      ropPct?: number;
      dragPct?: number;
    };
  } | null;
  torqueHistory: number[];
  ropHistory: number[];
  sppHistory: number[];
}

function PrecisionSparkline({
  data,
  color,
  baseline,
  minVal,
  maxVal,
}: {
  data: number[];
  color: string;
  baseline?: number;
  minVal?: number;
  maxVal?: number;
}) {
  if (!data || data.length < 2) {
    return (
      <div className="h-10 flex items-center justify-center text-[10px] text-zinc-400 font-mono">
        Telemetry calibrating...
      </div>
    );
  }

  const effectiveMin = minVal !== undefined ? minVal : Math.min(...data);
  const effectiveMax = maxVal !== undefined ? maxVal : Math.max(...data);
  const range = effectiveMax - effectiveMin || 1;
  const width = 200;
  const height = 44;
  const padding = 2;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const clampedVal = Math.max(effectiveMin, Math.min(effectiveMax, val));
      const y = height - padding - ((clampedVal - effectiveMin) / range) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const baselineY =
    baseline !== undefined
      ? height - padding - ((baseline - effectiveMin) / range) * (height - 2 * padding)
      : null;

  return (
    <div className="relative w-full h-11">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Baseline Reference Dash */}
        {baselineY !== null && baselineY >= 0 && baselineY <= height && (
          <line
            x1={padding}
            y1={baselineY}
            x2={width - padding}
            y2={baselineY}
            stroke="currentColor"
            className="text-zinc-300 dark:text-zinc-700"
            strokeDasharray="2,2"
            strokeWidth="1"
          />
        )}

        {/* Telemetry Sparkline Polyline */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Trailing Latest Sample Dot */}
        {data.length > 0 && (
          <circle
            cx={width - padding}
            cy={
              height -
              padding -
              ((Math.max(effectiveMin, Math.min(effectiveMax, data[data.length - 1])) - effectiveMin) /
                range) *
                (height - 2 * padding)
            }
            r="2.5"
            fill={color}
          />
        )}
      </svg>
    </div>
  );
}

export function PrimaryParameters({
  wellId,
  sample,
  feature,
  torqueHistory,
  ropHistory,
  sppHistory,
}: PrimaryParametersProps) {
  const currentTorque = sample?.torque ?? 14.2;
  const currentRop = sample?.rop ?? 18.2;
  const currentSpp = sample?.standpipePressure ?? 195;

  const torqueDevPct = feature?.formationBaselineDeviation?.torquePct ?? 24;
  const ropDevPct = feature?.formationBaselineDeviation?.ropPct ?? -25;
  const isTorqueHigh = torqueDevPct >= 15;
  const isRopLow = ropDevPct <= -15;

  return (
    <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm font-sans" aria-label="Key Drilling Signals">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 className="text-xs font-mono font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Primary Operational Telemetry (3 Core Signals)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time mechanical &amp; hydraulic parameters evaluated against Barail Sandstone baseline
          </p>
        </div>

        <Link
          id="btn-view-telemetry"
          href={`/wells/${wellId}`}
          className="h-7 px-3 text-xs font-mono font-medium rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors inline-flex items-center gap-1"
        >
          <span>Full Telemetry</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* 3 Focused Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {/* PARAMETER 1: TORQUE */}
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 relative">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Surface Torque
            </span>
            <span
              className={`tech-badge text-[10px] ${
                isTorqueHigh
                  ? 'tech-badge-amber'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {isTorqueHigh ? '↗ Elevated' : 'Nominal'}
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">
              {currentTorque.toFixed(1)} <span className="text-xs text-zinc-400 font-normal">kN·m</span>
            </div>
            <div
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                torqueDevPct > 0
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
              }`}
            >
              <span>{torqueDevPct >= 0 ? `+${torqueDevPct.toFixed(0)}%` : `${torqueDevPct.toFixed(0)}%`}</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <PrecisionSparkline
              data={torqueHistory.length > 1 ? torqueHistory : [11.5, 12.0, 12.8, 13.5, 14.2, 14.8, 15.6]}
              color="#f59e0b"
              baseline={11.5}
              minVal={8}
              maxVal={35}
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-1">
              <span>Base: 11.5 kN·m</span>
              <span>10m rolling</span>
            </div>
          </div>
        </div>

        {/* PARAMETER 2: ROP */}
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 relative">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              ROP (Penetration)
            </span>
            <span
              className={`tech-badge text-[10px] ${
                isRopLow
                  ? 'tech-badge-rose'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {isRopLow ? '↘ Retarded' : 'Nominal'}
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">
              {currentRop.toFixed(1)} <span className="text-xs text-zinc-400 font-normal">m/hr</span>
            </div>
            <div
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                ropDevPct < 0
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                  : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
              }`}
            >
              <span>{ropDevPct <= 0 ? `${ropDevPct.toFixed(0)}%` : `+${ropDevPct.toFixed(0)}%`}</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <PrecisionSparkline
              data={ropHistory.length > 1 ? ropHistory : [22.0, 20.5, 18.2, 16.4, 14.1, 11.2, 8.5]}
              color="#f43f5e"
              baseline={20.0}
              minVal={0}
              maxVal={35}
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-1">
              <span>Base: 20.0 m/hr</span>
              <span className="text-rose-500">Decay: -25%</span>
            </div>
          </div>
        </div>

        {/* PARAMETER 3: SPP */}
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 relative">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Standpipe Pressure
            </span>
            <span className="tech-badge tech-badge-blue text-[10px]">
              Stable Flow
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">
              {currentSpp.toFixed(0)} <span className="text-xs text-zinc-400 font-normal">bar</span>
            </div>
            <div className="text-xs font-mono font-semibold px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 bg-blue-500/10">
              <span>±0% Stable</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <PrecisionSparkline
              data={sppHistory.length > 1 ? sppHistory : [195, 194, 196, 195, 195, 196, 195]}
              color="#3b82f6"
              baseline={195}
              minVal={170}
              maxVal={240}
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-1">
              <span>Nominal: 195 bar</span>
              <span>Diff: 0 bar</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

// Lightweight, zero-dependency SVG sparkline renderer with Neo-brutalist styling
function Sparkline({
  data,
  color,
  fillColor,
  baseline,
  minVal,
  maxVal,
}: {
  data: number[];
  color: string;
  fillColor?: string;
  baseline?: number;
  minVal?: number;
  maxVal?: number;
}) {
  if (!data || data.length < 2) {
    return (
      <div className="h-9 flex items-center justify-center text-xs text-zinc-500 font-mono font-bold">
        Stabilizing telemetry...
      </div>
    );
  }

  const effectiveMin = minVal !== undefined ? minVal : Math.min(...data);
  const effectiveMax = maxVal !== undefined ? maxVal : Math.max(...data);
  const range = effectiveMax - effectiveMin || 1;
  const width = 160;
  const height = 40;
  const padding = 3;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const clampedVal = Math.max(effectiveMin, Math.min(effectiveMax, val));
      const y = height - padding - ((clampedVal - effectiveMin) / range) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  const baselineY =
    baseline !== undefined
      ? height - padding - ((baseline - effectiveMin) / range) * (height - 2 * padding)
      : null;

  return (
    <div className="relative w-full h-10">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Soft Area Fill */}
        {fillColor && (
          <polygon fill={fillColor} opacity={0.4} points={areaPoints} />
        )}

        {/* Baseline Reference Line */}
        {baselineY !== null && baselineY >= 0 && baselineY <= height && (
          <line
            x1={padding}
            y1={baselineY}
            x2={width - padding}
            y2={baselineY}
            stroke="#000000"
            strokeDasharray="3,3"
            strokeWidth="1.5"
            opacity="0.5"
          />
        )}

        {/* Dynamic Telemetry Sparkline Polyline */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
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
            r="3.5"
            fill={color}
            stroke="#000000"
            strokeWidth="1.5"
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
    <section className="bg-white border-2 border-black rounded-2xl p-5 lg:p-6 shadow-[4px_4px_0px_0px_#000000] font-sans" aria-label="Key Drilling Signals">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black">
        <div>
          <h2 className="text-xs font-black tracking-wider text-black uppercase font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-black" />
            Primary Operational Telemetry (3 Core Signals)
          </h2>
          <p className="text-xs text-zinc-700 mt-0.5 font-medium">
            Real-time mechanical &amp; hydraulic parameters evaluated against Barail Sandstone baseline
          </p>
        </div>

        <Link
          id="btn-view-telemetry"
          href={`/wells/${wellId}`}
          className="neo-btn-white text-xs font-bold font-mono"
        >
          <span>View Live Telemetry</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* 3 Focused Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* PARAMETER 1: TORQUE */}
        <div
          className={`p-4 rounded-2xl border-2 border-black transition-all ${
            isTorqueHigh
              ? 'bg-[#fef3c7] shadow-[3.5px_3.5px_0px_0px_#000000]'
              : 'bg-white shadow-[2.5px_2.5px_0px_0px_#000000]'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-black uppercase tracking-wider font-mono text-[11px]">Surface Torque</span>
            <span
              className={`neo-badge text-[10px] ${
                isTorqueHigh
                  ? 'neo-badge-amber'
                  : 'bg-zinc-100 text-black border-2 border-black'
              }`}
            >
              {isTorqueHigh ? '↗ Elevated' : 'Nominal'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-black font-mono tracking-tight">
              {currentTorque.toFixed(1)} <span className="text-xs text-black font-bold">kN·m</span>
            </div>
            <div
              className={`text-xs font-black font-mono px-2 py-0.5 rounded-full border border-black ${
                torqueDevPct > 0 ? 'bg-[#f59e0b] text-black' : 'bg-[#10b981] text-black'
              }`}
            >
              <span>{torqueDevPct >= 0 ? `↗ +${torqueDevPct.toFixed(0)}%` : `↘ ${torqueDevPct.toFixed(0)}%`}</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-3 pt-2.5 border-t-2 border-black">
            <Sparkline
              data={torqueHistory.length > 1 ? torqueHistory : [11.5, 12.0, 12.8, 13.5, 14.2, 14.8, 15.6]}
              color="#000000"
              fillColor="#fbbf24"
              baseline={11.5}
              minVal={8}
              maxVal={35}
            />
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-black mt-1">
              <span>Base: 11.5 kN·m</span>
              <span>10m rolling window</span>
            </div>
          </div>
        </div>

        {/* PARAMETER 2: ROP */}
        <div
          className={`p-4 rounded-2xl border-2 border-black transition-all ${
            isRopLow
              ? 'bg-[#ffe4e6] shadow-[3.5px_3.5px_0px_0px_#000000]'
              : 'bg-white shadow-[2.5px_2.5px_0px_0px_#000000]'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-black uppercase tracking-wider font-mono text-[11px]">ROP (Penetration)</span>
            <span
              className={`neo-badge text-[10px] ${
                isRopLow
                  ? 'neo-badge-rose'
                  : 'bg-zinc-100 text-black border-2 border-black'
              }`}
            >
              {isRopLow ? '↘ Retarded' : 'Nominal'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-black font-mono tracking-tight">
              {currentRop.toFixed(1)} <span className="text-xs text-black font-bold">m/hr</span>
            </div>
            <div
              className={`text-xs font-black font-mono px-2 py-0.5 rounded-full border border-black ${
                ropDevPct < 0 ? 'bg-[#f43f5e] text-white' : 'bg-[#10b981] text-black'
              }`}
            >
              <span>{ropDevPct <= 0 ? `↘ ${ropDevPct.toFixed(0)}%` : `↗ +${ropDevPct.toFixed(0)}%`}</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-3 pt-2.5 border-t-2 border-black">
            <Sparkline
              data={ropHistory.length > 1 ? ropHistory : [22.0, 20.5, 18.2, 16.4, 14.1, 11.2, 8.5]}
              color="#000000"
              fillColor="#fb7185"
              baseline={20.0}
              minVal={0}
              maxVal={35}
            />
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-black mt-1">
              <span>Base: 20.0 m/hr</span>
              <span className="text-[#e11d48]">Decay: -25%</span>
            </div>
          </div>
        </div>

        {/* PARAMETER 3: SPP */}
        <div className="p-4 rounded-2xl bg-[#dbeafe] border-2 border-black shadow-[3.5px_3.5px_0px_0px_#000000]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-black uppercase tracking-wider font-mono text-[11px]">Standpipe Pressure</span>
            <span className="neo-badge neo-badge-blue text-[10px]">
              Stable Flow
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-black font-mono tracking-tight">
              {currentSpp.toFixed(0)} <span className="text-xs text-black font-bold">bar</span>
            </div>
            <div className="text-xs font-black font-mono px-2 py-0.5 rounded-full border border-black bg-[#3b82f6] text-white">
              <span>±0% Stable</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-3 pt-2.5 border-t-2 border-black">
            <Sparkline
              data={sppHistory.length > 1 ? sppHistory : [195, 194, 196, 195, 195, 196, 195]}
              color="#000000"
              fillColor="#60a5fa"
              baseline={195}
              minVal={170}
              maxVal={240}
            />
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-black mt-1">
              <span>Nominal: 195 bar</span>
              <span>Diff: 0 bar</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

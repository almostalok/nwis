'use client';

import React, { useState } from 'react';

interface ChartPoint {
  timestamp: string | Date;
  depth: number;
  torque?: number | null;
  rop?: number | null;
  drag?: number | null;
  flowIn?: number | null;
  flowOut?: number | null;
  spp?: number | null;
}

interface LiveParameterChartProps {
  history: ChartPoint[];
  selectedWell: string;
}

export function LiveParameterChart({ history, selectedWell }: LiveParameterChartProps) {
  const [overlayMode, setOverlayMode] = useState<'TORQUE_ROP' | 'TORQUE_DRAG' | 'FLOW_BALANCE' | 'SPP_FLOW'>('TORQUE_ROP');

  const points = history.slice(-Math.min(history.length, 60));

  let primaryKey: keyof ChartPoint = 'torque';
  let primaryLabel = 'Torque';
  let primaryColor = '#f59e0b';
  let primaryUnit = 'kNm';

  let secondaryKey: keyof ChartPoint = 'rop';
  let secondaryLabel = 'ROP';
  let secondaryColor = '#10b981';
  let secondaryUnit = 'm/hr';

  if (overlayMode === 'TORQUE_DRAG') {
    primaryKey = 'torque';
    primaryLabel = 'Torque';
    primaryColor = '#f59e0b';
    primaryUnit = 'kNm';

    secondaryKey = 'drag';
    secondaryLabel = 'Drag';
    secondaryColor = '#ef4444';
    secondaryUnit = 'kN';
  } else if (overlayMode === 'FLOW_BALANCE') {
    primaryKey = 'flowIn';
    primaryLabel = 'Flow In';
    primaryColor = '#3b82f6';
    primaryUnit = 'L/min';

    secondaryKey = 'flowOut';
    secondaryLabel = 'Flow Out';
    secondaryColor = '#f43f5e';
    secondaryUnit = 'L/min';
  } else if (overlayMode === 'SPP_FLOW') {
    primaryKey = 'spp';
    primaryLabel = 'SPP';
    primaryColor = '#3b82f6';
    primaryUnit = 'psi';

    secondaryKey = 'flowIn';
    secondaryLabel = 'Flow In';
    secondaryColor = '#10b981';
    secondaryUnit = 'L/min';
  }

  const pVals = points.map((p) => p[primaryKey] as number).filter((v) => typeof v === 'number');
  const sVals = points.map((p) => p[secondaryKey] as number).filter((v) => typeof v === 'number');

  const pMin = pVals.length > 0 ? Math.floor(Math.min(...pVals) * 0.9) : 0;
  const pMax = pVals.length > 0 ? Math.ceil(Math.max(...pVals) * 1.1) : 100;
  const pDiff = pMax - pMin || 1;

  const sMin = sVals.length > 0 ? Math.floor(Math.min(...sVals) * 0.9) : 0;
  const sMax = sVals.length > 0 ? Math.ceil(Math.max(...sVals) * 1.1) : 50;
  const sDiff = sMax - sMin || 1;

  const width = 640;
  const height = 180;
  const padding = { top: 16, bottom: 24, left: 45, right: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const primaryPath = points.length > 1
    ? points
        .map((pt, i) => {
          const val = pt[primaryKey] as number;
          if (val === null || val === undefined) return null;
          const x = padding.left + (i / (points.length - 1)) * innerWidth;
          const y = padding.top + innerHeight - ((val - pMin) / pDiff) * innerHeight;
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .filter(Boolean)
        .join(' ')
    : '';

  const secondaryPath = points.length > 1
    ? points
        .map((pt, i) => {
          const val = pt[secondaryKey] as number;
          if (val === null || val === undefined) return null;
          const x = padding.left + (i / (points.length - 1)) * innerWidth;
          const y = padding.top + innerHeight - ((val - sMin) / sDiff) * innerHeight;
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm font-sans">
      {/* Header & Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Live Real-Time Telemetry Stream
            </h3>
            <span className="tech-badge tech-badge-blue text-[9px]">
              {selectedWell}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Synchronized WITSML / eRTMAC time-series with multi-parameter overlay
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs font-mono">
          {[
            { mode: 'TORQUE_ROP', label: 'TORQUE + ROP' },
            { mode: 'TORQUE_DRAG', label: 'TORQUE + DRAG' },
            { mode: 'FLOW_BALANCE', label: 'FLOW IN / OUT' },
            { mode: 'SPP_FLOW', label: 'SPP + FLOW' },
          ].map((item) => (
            <button
              key={item.mode}
              onClick={() => setOverlayMode(item.mode as any)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                overlayMode === item.mode
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative mt-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 select-none">
          {/* Hairline Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = padding.top + innerHeight * r;
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-zinc-200 dark:text-zinc-800"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            );
          })}

          {/* Primary Trace */}
          {primaryPath && (
            <path
              d={primaryPath}
              fill="none"
              stroke={primaryColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Secondary Trace */}
          {secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke={secondaryColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Left Y Axis (Primary) */}
          <text x={padding.left - 6} y={padding.top + 4} fill={primaryColor} fontSize="10" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontWeight="600">
            {pMax}
          </text>
          <text x={padding.left - 6} y={padding.top + innerHeight} fill={primaryColor} fontSize="10" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontWeight="600">
            {pMin}
          </text>

          {/* Right Y Axis (Secondary) */}
          <text x={width - padding.right + 6} y={padding.top + 4} fill={secondaryColor} fontSize="10" textAnchor="start" fontFamily="JetBrains Mono, monospace" fontWeight="600">
            {sMax}
          </text>
          <text x={width - padding.right + 6} y={padding.top + innerHeight} fill={secondaryColor} fontSize="10" textAnchor="start" fontFamily="JetBrains Mono, monospace" fontWeight="600">
            {sMin}
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-xs font-mono">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">{primaryLabel} [{primaryUnit}]:</span>
              {points.length > 0 && (
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold tabular-nums">
                  {points[points.length - 1][primaryKey] ?? '---'}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">{secondaryLabel} [{secondaryUnit}]:</span>
              {points.length > 0 && (
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold tabular-nums">
                  {points[points.length - 1][secondaryKey] ?? '---'}
                </span>
              )}
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 font-mono">
            {points.length} samples streaming
          </div>
        </div>
      </div>
    </div>
  );
}

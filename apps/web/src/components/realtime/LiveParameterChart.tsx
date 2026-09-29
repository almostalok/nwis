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
  const [timeWindowSec, setTimeWindowSec] = useState<number>(300); // 5m default

  const points = history.slice(-Math.min(history.length, 60)); // recent points

  // Define active traces based on overlay mode
  let primaryKey: keyof ChartPoint = 'torque';
  let primaryLabel = 'Torque';
  let primaryColor = '#f59e0b'; // amber
  let primaryUnit = 'kNm';

  let secondaryKey: keyof ChartPoint = 'rop';
  let secondaryLabel = 'ROP';
  let secondaryColor = '#10b981'; // emerald
  let secondaryUnit = 'm/hr';

  if (overlayMode === 'TORQUE_DRAG') {
    primaryKey = 'torque';
    primaryLabel = 'Torque';
    primaryColor = '#f59e0b';
    primaryUnit = 'kNm';

    secondaryKey = 'drag';
    secondaryLabel = 'Drag';
    secondaryColor = '#ef4444'; // red
    secondaryUnit = 'kN';
  } else if (overlayMode === 'FLOW_BALANCE') {
    primaryKey = 'flowIn';
    primaryLabel = 'Flow In';
    primaryColor = '#3b82f6'; // blue
    primaryUnit = 'L/min';

    secondaryKey = 'flowOut';
    secondaryLabel = 'Flow Out';
    secondaryColor = '#a855f7'; // purple
    secondaryUnit = 'L/min';
  } else if (overlayMode === 'SPP_FLOW') {
    primaryKey = 'spp';
    primaryLabel = 'Standpipe Press.';
    primaryColor = '#06b6d4'; // cyan
    primaryUnit = 'bar';

    secondaryKey = 'flowIn';
    secondaryLabel = 'Flow In';
    secondaryColor = '#3b82f6';
    secondaryUnit = 'L/min';
  }

  // Calculate scales
  const primaryValues = points.map((p) => Number(p[primaryKey] ?? 0)).filter((v) => !isNaN(v));
  const secondaryValues = points.map((p) => Number(p[secondaryKey] ?? 0)).filter((v) => !isNaN(v));

  const pMin = primaryValues.length > 0 ? Math.floor(Math.min(...primaryValues) * 0.9) : 0;
  const pMax = primaryValues.length > 0 ? Math.ceil(Math.max(...primaryValues) * 1.1) || 10 : 10;

  const sMin = secondaryValues.length > 0 ? Math.floor(Math.min(...secondaryValues) * 0.9) : 0;
  const sMax = secondaryValues.length > 0 ? Math.ceil(Math.max(...secondaryValues) * 1.1) || 10 : 10;

  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 45, bottom: 25, left: 45 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (points.length <= 1) return padding.left;
    return padding.left + (index / (points.length - 1)) * innerWidth;
  };

  const getPrimaryY = (val: number) => {
    if (pMax === pMin) return padding.top + innerHeight / 2;
    return padding.top + innerHeight - ((val - pMin) / (pMax - pMin)) * innerHeight;
  };

  const getSecondaryY = (val: number) => {
    if (sMax === sMin) return padding.top + innerHeight / 2;
    return padding.top + innerHeight - ((val - sMin) / (sMax - sMin)) * innerHeight;
  };

  // Generate SVG path strings
  let primaryPath = '';
  let secondaryPath = '';

  points.forEach((pt, i) => {
    const x = getX(i);
    const pVal = Number(pt[primaryKey] ?? pMin);
    const sVal = Number(pt[secondaryKey] ?? sMin);

    const py = getPrimaryY(pVal);
    const sy = getSecondaryY(sVal);

    if (i === 0) {
      primaryPath += `M ${x} ${py}`;
      secondaryPath += `M ${x} ${sy}`;
    } else {
      primaryPath += ` L ${x} ${py}`;
      secondaryPath += ` L ${x} ${sy}`;
    }
  });

  return (
    <div className="bg-petro-900 border border-petro-800 rounded-lg p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-petro-800 gap-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center space-x-2">
            <span>Multi-Parameter Real-Time Correlation</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-petro-800 text-emerald-400 font-mono">
              Live Stream
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            Well: {selectedWell} &bull; Depth: {points.length > 0 ? `${points[points.length - 1].depth} m` : '---'}
          </div>
        </div>

        {/* Overlay Mode Selector */}
        <div className="flex items-center space-x-1 bg-petro-950 p-1 rounded-md border border-petro-800 text-[11px]">
          <button
            onClick={() => setOverlayMode('TORQUE_ROP')}
            className={`px-2 py-1 rounded transition-colors ${
              overlayMode === 'TORQUE_ROP'
                ? 'bg-amber-600/30 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Torque + ROP
          </button>
          <button
            onClick={() => setOverlayMode('TORQUE_DRAG')}
            className={`px-2 py-1 rounded transition-colors ${
              overlayMode === 'TORQUE_DRAG'
                ? 'bg-red-600/30 text-red-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Torque + Drag
          </button>
          <button
            onClick={() => setOverlayMode('FLOW_BALANCE')}
            className={`px-2 py-1 rounded transition-colors ${
              overlayMode === 'FLOW_BALANCE'
                ? 'bg-blue-600/30 text-blue-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Flow In vs Out
          </button>
          <button
            onClick={() => setOverlayMode('SPP_FLOW')}
            className={`px-2 py-1 rounded transition-colors ${
              overlayMode === 'SPP_FLOW'
                ? 'bg-cyan-600/30 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SPP + Flow
          </button>
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative mt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = padding.top + innerHeight * r;
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="4 4"
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
              strokeWidth="2.5"
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
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Left Y Axis (Primary) */}
          <text x={padding.left - 8} y={padding.top + 4} fill={primaryColor} fontSize="10" textAnchor="end" fontFamily="monospace">
            {pMax}
          </text>
          <text x={padding.left - 8} y={padding.top + innerHeight} fill={primaryColor} fontSize="10" textAnchor="end" fontFamily="monospace">
            {pMin}
          </text>

          {/* Right Y Axis (Secondary) */}
          <text x={width - padding.right + 8} y={padding.top + 4} fill={secondaryColor} fontSize="10" textAnchor="start" fontFamily="monospace">
            {sMax}
          </text>
          <text x={width - padding.right + 8} y={padding.top + innerHeight} fill={secondaryColor} fontSize="10" textAnchor="start" fontFamily="monospace">
            {sMin}
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-petro-800/60 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1 rounded" style={{ backgroundColor: primaryColor }} />
              <span className="text-slate-300 font-medium">{primaryLabel} ({primaryUnit})</span>
              {points.length > 0 && (
                <span className="font-mono text-white font-semibold">
                  {points[points.length - 1][primaryKey] ?? '---'}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1 rounded" style={{ backgroundColor: secondaryColor }} />
              <span className="text-slate-300 font-medium">{secondaryLabel} ({secondaryUnit})</span>
              {points.length > 0 && (
                <span className="font-mono text-white font-semibold">
                  {points[points.length - 1][secondaryKey] ?? '---'}
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {points.length} samples streaming
          </div>
        </div>
      </div>
    </div>
  );
}

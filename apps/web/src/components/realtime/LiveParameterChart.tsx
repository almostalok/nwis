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
  let primaryColor = '#d97706';
  let primaryUnit = 'kNm';

  let secondaryKey: keyof ChartPoint = 'rop';
  let secondaryLabel = 'ROP';
  let secondaryColor = '#059669';
  let secondaryUnit = 'm/hr';

  if (overlayMode === 'TORQUE_DRAG') {
    primaryKey = 'torque';
    primaryLabel = 'Torque';
    primaryColor = '#d97706';
    primaryUnit = 'kNm';

    secondaryKey = 'drag';
    secondaryLabel = 'Drag';
    secondaryColor = '#e11d48';
    secondaryUnit = 'kN';
  } else if (overlayMode === 'FLOW_BALANCE') {
    primaryKey = 'flowIn';
    primaryLabel = 'Flow In';
    primaryColor = '#2563eb';
    primaryUnit = 'L/min';

    secondaryKey = 'flowOut';
    secondaryLabel = 'Flow Out';
    secondaryColor = '#e11d48';
    secondaryUnit = 'L/min';
  } else if (overlayMode === 'SPP_FLOW') {
    primaryKey = 'spp';
    primaryLabel = 'SPP';
    primaryColor = '#2563eb';
    primaryUnit = 'psi';

    secondaryKey = 'flowIn';
    secondaryLabel = 'Flow In';
    secondaryColor = '#d97706';
    secondaryUnit = 'L/min';
  }

  const primaryValues = points.map((p) => p[primaryKey] as number).filter((v) => typeof v === 'number' && !isNaN(v));
  const secondaryValues = points.map((p) => p[secondaryKey] as number).filter((v) => typeof v === 'number' && !isNaN(v));

  const pMin = primaryValues.length > 0 ? Math.floor(Math.min(...primaryValues) * 0.9) : 0;
  const pMax = primaryValues.length > 0 ? Math.ceil(Math.max(...primaryValues) * 1.1) : 100;

  const sMin = secondaryValues.length > 0 ? Math.floor(Math.min(...secondaryValues) * 0.9) : 0;
  const sMax = secondaryValues.length > 0 ? Math.ceil(Math.max(...secondaryValues) * 1.1) : 100;

  const width = 640;
  const height = 180;
  const padding = { top: 20, right: 45, bottom: 20, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  let primaryPath = '';
  let secondaryPath = '';

  points.forEach((pt, i) => {
    const x = padding.left + (i / Math.max(points.length - 1, 1)) * innerWidth;

    const pVal = pt[primaryKey] as number;
    if (typeof pVal === 'number' && !isNaN(pVal) && pMax > pMin) {
      const pNorm = (pVal - pMin) / (pMax - pMin);
      const y1 = padding.top + innerHeight * (1 - pNorm);
      primaryPath += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y1.toFixed(1)} `;
    }

    const sVal = pt[secondaryKey] as number;
    if (typeof sVal === 'number' && !isNaN(sVal) && sMax > sMin) {
      const sNorm = (sVal - sMin) / (sMax - sMin);
      const y2 = padding.top + innerHeight * (1 - sNorm);
      secondaryPath += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y2.toFixed(1)} `;
    }
  });

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000000] font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-black gap-3">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-black font-black flex items-center space-x-2">
            <span>Real-Time Parameter Correlation</span>
            <span className="neo-badge neo-badge-emerald text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] border border-black animate-pulse" />
              Live Stream
            </span>
          </div>
          <div className="text-xs text-zinc-700 font-mono font-bold mt-1">
            WELL: <span className="text-black font-extrabold">{selectedWell}</span> &bull; DEPTH: <span className="text-black font-extrabold">{points.length > 0 ? `${points[points.length - 1].depth}m MD` : '---'}</span>
          </div>
        </div>

        {/* Overlay Mode Selector */}
        <div className="flex items-center space-x-1 bg-[#f4f4f6] p-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-mono">
          {[
            { mode: 'TORQUE_ROP', label: 'TORQUE + ROP' },
            { mode: 'TORQUE_DRAG', label: 'TORQUE + DRAG' },
            { mode: 'FLOW_BALANCE', label: 'FLOW IN / OUT' },
            { mode: 'SPP_FLOW', label: 'SPP + FLOW' },
          ].map((item) => (
            <button
              key={item.mode}
              onClick={() => setOverlayMode(item.mode as any)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                overlayMode === item.mode
                  ? 'bg-black text-white shadow-[1px_1px_0px_0px_#000]'
                  : 'text-black hover:bg-white'
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
                stroke="#000000"
                strokeDasharray="3 3"
                strokeWidth="1"
                opacity="0.15"
              />
            );
          })}

          {/* Primary Trace */}
          {primaryPath && (
            <path
              d={primaryPath}
              fill="none"
              stroke={primaryColor}
              strokeWidth="3"
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
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Left Y Axis (Primary) */}
          <text x={padding.left - 8} y={padding.top + 4} fill={primaryColor} fontSize="11" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontWeight="900">
            {pMax}
          </text>
          <text x={padding.left - 8} y={padding.top + innerHeight} fill={primaryColor} fontSize="11" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontWeight="900">
            {pMin}
          </text>

          {/* Right Y Axis (Secondary) */}
          <text x={width - padding.right + 8} y={padding.top + 4} fill={secondaryColor} fontSize="11" textAnchor="start" fontFamily="JetBrains Mono, monospace" fontWeight="900">
            {sMax}
          </text>
          <text x={width - padding.right + 8} y={padding.top + innerHeight} fill={secondaryColor} fontSize="11" textAnchor="start" fontFamily="JetBrains Mono, monospace" fontWeight="900">
            {sMin}
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-black text-xs font-mono">
          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: primaryColor }} />
              <span className="text-black font-extrabold uppercase">{primaryLabel} [{primaryUnit}]:</span>
              {points.length > 0 && (
                <span className="text-black font-black">
                  {points[points.length - 1][primaryKey] ?? '---'}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: secondaryColor }} />
              <span className="text-black font-extrabold uppercase">{secondaryLabel} [{secondaryUnit}]:</span>
              {points.length > 0 && (
                <span className="text-black font-black">
                  {points[points.length - 1][secondaryKey] ?? '---'}
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-zinc-600 font-mono font-bold">
            [{points.length} SAMPLES STREAMING]
          </div>
        </div>
      </div>
    </div>
  );
}

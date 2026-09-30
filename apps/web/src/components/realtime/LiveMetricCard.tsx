'use client';

import React from 'react';

interface LiveMetricCardProps {
  label: string;
  value?: number | null;
  unit: string;
  baseline?: number | null;
  deviationPct?: number | null;
  trend?: 'up' | 'down' | 'steady';
  quality?: string;
  isCritical?: boolean;
  isWarning?: boolean;
  accentColor?: 'amber' | 'emerald' | 'cyan' | 'purple' | 'red' | 'blue';
  history?: number[];
  maxRange?: number;
}

export function LiveMetricCard({
  label,
  value,
  unit,
  baseline,
  deviationPct,
  trend,
  quality = 'GOOD',
  isCritical = false,
  isWarning = false,
  accentColor = 'blue',
  history = [],
  maxRange = 100,
}: LiveMetricCardProps) {
  const isAvailable = value !== null && value !== undefined;

  const colorMap = {
    amber: {
      accent: '#f59e0b',
      fill: '#fbbf24',
      text: 'text-black',
      dot: 'bg-[#f59e0b]',
      track: 'bg-[#f59e0b]',
    },
    emerald: {
      accent: '#10b981',
      fill: '#34d399',
      text: 'text-black',
      dot: 'bg-[#10b981]',
      track: 'bg-[#10b981]',
    },
    cyan: {
      accent: '#06b6d4',
      fill: '#38bdf8',
      text: 'text-black',
      dot: 'bg-[#06b6d4]',
      track: 'bg-[#06b6d4]',
    },
    purple: {
      accent: '#8b5cf6',
      fill: '#c084fc',
      text: 'text-black',
      dot: 'bg-[#8b5cf6]',
      track: 'bg-[#8b5cf6]',
    },
    blue: {
      accent: '#3b82f6',
      fill: '#60a5fa',
      text: 'text-black',
      dot: 'bg-[#3b82f6]',
      track: 'bg-[#3b82f6]',
    },
    red: {
      accent: '#ef4444',
      fill: '#f87171',
      text: 'text-black',
      dot: 'bg-[#ef4444]',
      track: 'bg-[#ef4444]',
    },
  };

  const activeTheme = isCritical
    ? colorMap.red
    : isWarning
    ? colorMap.amber
    : colorMap[accentColor] || colorMap.blue;

  // Mini Sparkline SVG computation
  const sparkPoints = history.length > 2
    ? history.slice(-12)
    : isAvailable
    ? [value * 0.96, value * 0.99, value * 1.02, value * 0.98, value]
    : [10, 10, 10, 10];

  const minV = Math.min(...sparkPoints);
  const maxV = Math.max(...sparkPoints);
  const diff = maxV - minV || 1;
  const svgW = 76;
  const svgH = 26;

  const sparklinePath = sparkPoints
    .map((pt, i) => {
      const x = (i / (sparkPoints.length - 1)) * svgW;
      const y = svgH - ((pt - minV) / diff) * (svgH - 6) - 3;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPath = `${sparklinePath} L ${svgW} ${svgH} L 0 ${svgH} Z`;

  // Value fill percentage for mini gauge
  const fillPct = isAvailable && maxRange > 0
    ? Math.min(100, Math.max(5, (value / maxRange) * 100))
    : 30;

  return (
    <div
      className={`p-4 rounded-2xl border-2 border-black transition-all font-sans shadow-[3.5px_3.5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4.5px_4.5px_0px_0px_#000000] ${
        isCritical
          ? 'bg-[#ffe4e6]'
          : isWarning
          ? 'bg-[#fef3c7]'
          : 'bg-white'
      }`}
    >
      {/* Top Header: Label & Unit */}
      <div className="flex items-center justify-between text-xs font-mono mb-2">
        <div className="flex items-center space-x-2 truncate">
          <span className={`w-2.5 h-2.5 rounded-full border border-black ${activeTheme.dot}`} />
          <span className="font-extrabold text-black tracking-wider uppercase truncate text-[11px]">
            {label}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          {quality !== 'GOOD' && (
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-[#fef3c7] text-[#92400e] border border-black shadow-[1px_1px_0px_0px_#000]">
              {quality}
            </span>
          )}
          <span className="text-[10px] text-black font-mono font-bold">[{unit}]</span>
        </div>
      </div>

      {/* Main Metric Value & Sparkline */}
      <div className="flex items-baseline justify-between mt-1">
        <div className={`text-2xl font-black font-mono tracking-tight ${activeTheme.text}`}>
          {isAvailable ? (
            typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value
          ) : (
            <span className="text-zinc-400 text-lg font-normal">--</span>
          )}
        </div>

        {/* Graphical Mini Sparkline */}
        <div className="flex items-center space-x-2">
          {sparklinePath && (
            <svg width={svgW} height={svgH} className="overflow-visible select-none">
              <path d={areaPath} fill={activeTheme.fill} opacity={0.3} />
              <path
                d={sparklinePath}
                fill="none"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={svgW}
                cy={
                  svgH -
                  ((sparkPoints[sparkPoints.length - 1] - minV) / diff) * (svgH - 6) -
                  3
                }
                r="3.5"
                fill={activeTheme.accent}
                stroke="#000000"
                strokeWidth="1.5"
              />
            </svg>
          )}

          {deviationPct !== undefined && deviationPct !== null && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000] ${
                deviationPct > 0
                  ? 'text-[#991b1b] bg-[#fee2e2]'
                  : deviationPct < 0
                  ? 'text-[#065f46] bg-[#d1fae5]'
                  : 'text-black bg-[#f4f4f6]'
              }`}
            >
              {deviationPct > 0 ? '▲ +' : deviationPct < 0 ? '▼ ' : '• '}
              {Math.abs(deviationPct)}%
            </span>
          )}
        </div>
      </div>

      {/* Graphical Mini Fill Gauge */}
      <div className="h-2 bg-[#f4f4f6] rounded-full mt-3 relative overflow-hidden border border-black">
        <div
          style={{ width: `${fillPct}%` }}
          className={`h-full rounded-full transition-all duration-300 border-r border-black ${activeTheme.track}`}
        />
      </div>

      {/* Baseline Reference Row */}
      {baseline !== undefined && baseline !== null && (
        <div className="mt-2 text-[10px] font-mono font-bold text-zinc-600 flex items-center justify-between pt-1.5 border-t border-black/20">
          <span>BASELINE:</span>
          <span className="text-black font-extrabold">{baseline} {unit}</span>
        </div>
      )}
    </div>
  );
}

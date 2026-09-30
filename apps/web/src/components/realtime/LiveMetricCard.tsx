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
    amber: '#f59e0b',
    emerald: '#10b981',
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    blue: '#3b82f6',
    red: '#ef4444',
  };

  const strokeColor = isCritical
    ? colorMap.red
    : isWarning
    ? colorMap.amber
    : colorMap[accentColor] || colorMap.blue;

  // Mini Sparkline computation
  const sparkPoints = history.length > 2
    ? history.slice(-12)
    : isAvailable
    ? [value * 0.96, value * 0.99, value * 1.02, value * 0.98, value]
    : [10, 10, 10, 10];

  const minV = Math.min(...sparkPoints);
  const maxV = Math.max(...sparkPoints);
  const diff = maxV - minV || 1;
  const svgW = 70;
  const svgH = 24;

  const sparklinePath = sparkPoints
    .map((pt, i) => {
      const x = (i / (sparkPoints.length - 1)) * svgW;
      const y = svgH - ((pt - minV) / diff) * (svgH - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const fillPct = isAvailable && maxRange > 0
    ? Math.min(100, Math.max(5, (value / maxRange) * 100))
    : 30;

  return (
    <div
      className={`p-3.5 rounded-lg border font-sans transition-all relative ${
        isCritical
          ? 'bg-rose-500/5 border-rose-500/30'
          : isWarning
          ? 'bg-amber-500/5 border-amber-500/30'
          : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      {/* Top Header: Label & Quality */}
      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
        <div className="flex items-center space-x-1.5 truncate">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: strokeColor }}
          />
          <span className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate text-[10px]">
            {label}
          </span>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          {quality !== 'GOOD' && (
            <span className="px-1 py-0.2 text-[9px] font-mono font-medium rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {quality}
            </span>
          )}
          <span className="text-[10px] text-zinc-400 font-mono">[{unit}]</span>
        </div>
      </div>

      {/* Main Metric Value & Sparkline */}
      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
          {isAvailable ? (
            typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value
          ) : (
            <span className="text-zinc-400 text-base font-normal">--</span>
          )}
        </div>

        {/* Graphical Mini Sparkline */}
        <div className="flex items-center space-x-1.5">
          {sparklinePath && (
            <svg width={svgW} height={svgH} className="overflow-visible select-none">
              <path
                d={sparklinePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={svgW}
                cy={
                  svgH -
                  ((sparkPoints[sparkPoints.length - 1] - minV) / diff) * (svgH - 4) -
                  2
                }
                r="2"
                fill={strokeColor}
              />
            </svg>
          )}

          {trend && (
            <span
              className={`text-xs font-mono font-bold ${
                trend === 'up'
                  ? 'text-amber-500'
                  : trend === 'down'
                  ? 'text-blue-500'
                  : 'text-zinc-400'
              }`}
            >
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </span>
          )}
        </div>
      </div>

      {/* Baseline / Deviation Status Subtitle */}
      {(baseline !== undefined || deviationPct !== undefined) && (
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-900">
          {baseline !== null && baseline !== undefined && (
            <span>Base: {baseline.toFixed(1)}</span>
          )}
          {deviationPct !== null && deviationPct !== undefined && (
            <span
              className={`font-semibold ${
                Math.abs(deviationPct) >= 20
                  ? 'text-rose-500'
                  : Math.abs(deviationPct) >= 10
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}
            >
              {deviationPct >= 0 ? `+${deviationPct.toFixed(0)}%` : `${deviationPct.toFixed(0)}%`}
            </span>
          )}
        </div>
      )}

      {/* Mini Progress Range Bar */}
      <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${fillPct}%`,
            backgroundColor: strokeColor,
          }}
        />
      </div>
    </div>
  );
}

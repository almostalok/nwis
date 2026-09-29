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
}: LiveMetricCardProps) {
  const isAvailable = value !== null && value !== undefined;

  let borderColor = 'border-petro-800';
  let badgeColor = 'bg-slate-800 text-slate-300';

  if (isCritical) {
    borderColor = 'border-red-600 bg-red-950/20';
    badgeColor = 'bg-red-900/60 text-red-200 border border-red-700';
  } else if (isWarning) {
    borderColor = 'border-amber-600 bg-amber-950/20';
    badgeColor = 'bg-amber-900/60 text-amber-200 border border-amber-700';
  }

  return (
    <div className={`p-3.5 rounded-lg border ${borderColor} bg-petro-900/80 transition-all shadow-sm`}>
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span className="font-medium tracking-wide uppercase">{label}</span>
        <div className="flex items-center space-x-1.5">
          {quality !== 'GOOD' && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-900/80 text-amber-300">
              {quality}
            </span>
          )}
          <span className="text-[11px] text-slate-500 font-mono">{unit}</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-bold font-mono tracking-tight text-white">
          {isAvailable ? value : <span className="text-slate-500 text-sm">N/A</span>}
        </div>

        {deviationPct !== undefined && deviationPct !== null && (
          <div
            className={`text-xs font-mono font-semibold flex items-center ${
              deviationPct > 0
                ? 'text-red-400'
                : deviationPct < 0
                ? 'text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            {deviationPct > 0 ? '↑' : deviationPct < 0 ? '↓' : '→'}{' '}
            {Math.abs(deviationPct)}%
          </div>
        )}
      </div>

      {baseline !== undefined && baseline !== null && (
        <div className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between border-t border-petro-800/60 pt-1">
          <span>Formation Baseline:</span>
          <span className="font-mono text-slate-300">{baseline} {unit}</span>
        </div>
      )}
    </div>
  );
}

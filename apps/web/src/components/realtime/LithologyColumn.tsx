'use client';

import React from 'react';

interface LithologyColumnProps {
  currentDepth: number;
  totalDepth?: number;
  formationName?: string;
  isStuckRisk?: boolean;
}

export function LithologyColumn({
  currentDepth = 3218,
  formationName = 'Barail Sandstone',
  isStuckRisk = false,
}: LithologyColumnProps) {
  const minDepth = 3150;
  const maxDepth = 3300;
  const depthRange = maxDepth - minDepth;

  const strata = [
    {
      name: 'Upper Barail Sandstone',
      from: 3150,
      to: 3215,
      color: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
      textColor: '#b45309',
      risk: 'LOW',
    },
    {
      name: 'Reactive Barail Coal & Shale',
      from: 3215,
      to: 3245,
      color: 'rgba(244, 63, 94, 0.08)',
      borderColor: 'rgba(244, 63, 94, 0.25)',
      textColor: '#e11d48',
      risk: 'HIGH',
      hazardTag: 'TIGHT HOLE / SWELLING',
    },
    {
      name: 'Lower Barail Sandstone (Reservoir)',
      from: 3245,
      to: 3300,
      color: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
      textColor: '#047857',
      risk: 'NORMAL',
      target: true,
    },
  ];

  const clampedDepth = Math.max(minDepth, Math.min(maxDepth, currentDepth));
  const bitPosPercent = ((clampedDepth - minDepth) / depthRange) * 100;

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm font-sans space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Stratigraphic Wellbore Column
          </span>
          <span className="tech-badge tech-badge-amber text-[9px]">
            {minDepth}m &ndash; {maxDepth}m
          </span>
        </div>
        <div className="text-xs text-zinc-500 font-mono">
          Bit: <strong className="text-zinc-900 dark:text-zinc-100">{currentDepth.toFixed(1)}m</strong>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Wellbore Schematic */}
        <div className="col-span-12 md:col-span-5 relative h-60 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden select-none">
          {/* Depth Ticks */}
          <div className="absolute left-2 top-2 text-[9px] font-mono text-zinc-400 z-10">{minDepth}m</div>
          <div className="absolute left-2 bottom-2 text-[9px] font-mono text-zinc-400 z-10">{maxDepth}m</div>

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
                  borderTop: `1px solid ${s.borderColor}`,
                  borderBottom: `1px solid ${s.borderColor}`,
                }}
                className="absolute inset-x-0 flex items-center justify-end pr-2 text-[10px]"
              >
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                  {s.from}m &ndash; {s.to}m
                </span>
              </div>
            );
          })}

          {/* Drillstring Shaft */}
          <div
            style={{ height: `${bitPosPercent}%` }}
            className="absolute left-1/2 -translate-x-1/2 top-0 w-2 bg-zinc-400 dark:bg-zinc-600 transition-all duration-300 z-20"
          />

          {/* Bit Head Cursor */}
          <div
            style={{ top: `${bitPosPercent}%` }}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-30 flex items-center"
          >
            <div
              className={`w-4 h-3.5 flex items-center justify-center text-[8px] font-bold ${
                isStuckRisk ? 'bg-rose-500 text-white' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
              }`}
              style={{ clipPath: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)' }}
            >
              ▼
            </div>

            <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              {currentDepth.toFixed(1)}m
            </span>
          </div>
        </div>

        {/* Right: Formation Details */}
        <div className="col-span-12 md:col-span-7 flex flex-col justify-between space-y-2.5">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono uppercase">
              <span>Penetrating Interval</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">[Online BHA]</span>
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span>{formationName}</span>
              {currentDepth >= 3215 && currentDepth <= 3245 ? (
                <span className="tech-badge tech-badge-rose text-[9px]">CRITICAL ZONE</span>
              ) : (
                <span className="tech-badge tech-badge-emerald text-[9px]">NOMINAL FORMATION</span>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            {strata.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs"
              >
                <div className="truncate max-w-[200px]">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{s.name}</span>
                  {s.hazardTag && (
                    <span className="text-[9px] text-rose-500 font-mono block">{s.hazardTag}</span>
                  )}
                </div>
                <span className="font-mono text-zinc-400 text-[10px]">
                  {s.from}m &ndash; {s.to}m
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { SensorQualityStatus } from '@nwis/types';

interface SensorHealthPanelProps {
  sensors: SensorQualityStatus[];
}

export function SensorHealthPanel({ sensors }: SensorHealthPanelProps) {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm font-sans space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-bold flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Sensor Diagnostics</span>
          <span className="tech-badge tech-badge-emerald text-[9px]">
            ISO 19157 Validated
          </span>
        </div>
        <div className="text-[10px] font-mono text-zinc-400">
          eRTMAC PROTOCOL
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs font-mono">
        {sensors.map((s, idx) => {
          let dotColor = 'bg-emerald-500';
          let textColor = 'text-emerald-600 dark:text-emerald-400';

          if (s.quality === 'INVALID') {
            dotColor = 'bg-rose-500';
            textColor = 'text-rose-600 dark:text-rose-400';
          } else if (s.quality === 'SUSPECT' || s.quality === 'STALE') {
            dotColor = 'bg-amber-500';
            textColor = 'text-amber-600 dark:text-amber-400';
          } else if (s.quality === 'MISSING') {
            dotColor = 'bg-zinc-400';
            textColor = 'text-zinc-400';
          }

          return (
            <div
              key={idx}
              className="p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-500">
                  {s.parameter}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              </div>
              <div className="mt-2 flex items-baseline justify-between text-xs">
                <span className={`text-[10px] font-medium ${textColor}`}>[{s.quality}]</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{s.lastValue ?? '---'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

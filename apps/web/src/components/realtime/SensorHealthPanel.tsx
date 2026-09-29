'use client';

import React from 'react';
import { SensorQualityStatus } from '@nwis/types';

interface SensorHealthPanelProps {
  sensors: SensorQualityStatus[];
}

export function SensorHealthPanel({ sensors }: SensorHealthPanelProps) {
  return (
    <div className="bg-petro-900 border border-petro-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-petro-800 mb-3">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center space-x-2">
          <span>Sensor Quality & Stream Diagnostics</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Validated
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          ISO 19157 / eRTMAC Bounds
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
        {sensors.map((s, idx) => {
          let statusBg = 'bg-slate-950 border-petro-800 text-slate-300';
          let dotColor = 'bg-emerald-400';

          if (s.quality === 'INVALID') {
            statusBg = 'bg-red-950/40 border-red-800 text-red-200';
            dotColor = 'bg-red-400';
          } else if (s.quality === 'SUSPECT' || s.quality === 'STALE') {
            statusBg = 'bg-amber-950/40 border-amber-800 text-amber-200';
            dotColor = 'bg-amber-400';
          } else if (s.quality === 'MISSING') {
            statusBg = 'bg-slate-900 border-slate-700 text-slate-400';
            dotColor = 'bg-slate-500';
          }

          return (
            <div
              key={idx}
              className={`p-2 rounded border flex flex-col justify-between ${statusBg}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  {s.parameter}
                </span>
                <span className={`w-2 h-2 rounded-full ${dotColor}`} />
              </div>
              <div className="mt-1 flex items-baseline justify-between font-mono text-[11px]">
                <span className="text-slate-400 truncate">{s.quality}</span>
                <span className="text-white font-semibold">{s.lastValue ?? '---'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

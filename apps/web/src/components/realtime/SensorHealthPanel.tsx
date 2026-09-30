'use client';

import React from 'react';
import { SensorQualityStatus } from '@nwis/types';

interface SensorHealthPanelProps {
  sensors: SensorQualityStatus[];
}

export function SensorHealthPanel({ sensors }: SensorHealthPanelProps) {
  return (
    <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] font-sans">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
        <div className="text-xs font-mono uppercase tracking-wider text-black font-black flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
          <span>Sensor Health & Stream Diagnostics</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#d1fae5] text-[#064e3b] border-2 border-black font-mono font-bold shadow-[2px_2px_0px_0px_#000]">
            ISO 19157 Validated
          </span>
        </div>
        <div className="text-[10px] font-mono font-black text-zinc-500 px-2 py-0.5 bg-zinc-100 border border-black rounded">
          eRTMAC PROTOCOL CHECK
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
        {sensors.map((s, idx) => {
          let statusBg = 'bg-[#ecfdf5] text-[#064e3b]';
          let dotColor = 'bg-emerald-500';

          if (s.quality === 'INVALID') {
            statusBg = 'bg-[#ffe4e6] text-[#881337]';
            dotColor = 'bg-rose-500';
          } else if (s.quality === 'SUSPECT' || s.quality === 'STALE') {
            statusBg = 'bg-[#fef3c7] text-[#78350f]';
            dotColor = 'bg-amber-500';
          } else if (s.quality === 'MISSING') {
            statusBg = 'bg-zinc-100 text-zinc-600';
            dotColor = 'bg-zinc-400';
          }

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between ${statusBg} transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000]`}
            >
              <div className="flex items-center justify-between font-mono">
                <span className="font-black uppercase tracking-wider text-[11px] text-black">
                  {s.parameter}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full border border-black ${dotColor}`} />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between font-mono text-[11px]">
                <span className="font-bold opacity-80">[{s.quality}]</span>
                <span className="font-black text-black text-xs">{s.lastValue ?? '---'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

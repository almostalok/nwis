'use client';

import React, { useState } from 'react';

export interface StreamFeedItem {
  id: string;
  timestamp: string;
  type: 'SAMPLE' | 'FEATURE' | 'ANOMALY' | 'RISK' | 'ALERT' | 'SYSTEM';
  depth?: number;
  message: string;
  details?: string;
}

interface LiveEventStreamFeedProps {
  events: StreamFeedItem[];
  streamStatus: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';
}

export function LiveEventStreamFeed({
  events = [],
  streamStatus = 'CONNECTED',
}: LiveEventStreamFeedProps) {
  const [filter, setFilter] = useState<'ALL' | 'ALERTS' | 'ANOMALIES'>('ALL');
  const [isPaused, setIsPaused] = useState(false);

  const filteredEvents = events.filter((ev) => {
    if (filter === 'ALERTS') return ev.type === 'ALERT' || ev.type === 'RISK';
    if (filter === 'ANOMALIES') return ev.type === 'ANOMALY' || ev.type === 'FEATURE';
    return true;
  });

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-black mb-3.5 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            Live Telemetry & Event Stream Feed
          </span>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider font-mono border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
              streamStatus === 'CONNECTED'
                ? 'bg-[#d1fae5] text-[#064e3b]'
                : 'bg-[#ffe4e6] text-[#881337]'
            }`}
          >
            {streamStatus === 'CONNECTED' ? 'LIVE STREAM' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Filter Controls & Pause (Rounded Neo Capsules) */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex bg-[#f4f4f6] p-0.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            {(['ALL', 'ALERTS', 'ANOMALIES'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3 py-1 rounded-lg text-[11px] font-black font-mono transition ${
                  filter === mode
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black font-mono border-2 border-black shadow-[2px_2px_0px_0px_#000] transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 ${
              isPaused
                ? 'bg-[#fef3c7] text-[#78350f]'
                : 'bg-white text-black hover:bg-zinc-100'
            }`}
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      {/* Stream Window */}
      <div className="bg-[#f8f8fb] border-2 border-black rounded-xl p-3 h-52 overflow-y-auto space-y-2 text-xs shadow-[2px_2px_0px_0px_#000]">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 font-mono text-xs">
            Awaiting incoming real-time packets from rig sensors...
          </div>
        ) : (
          filteredEvents.slice(0, 30).map((ev) => {
            let badgeStyle = 'bg-white text-black border-black';
            let itemBg = 'bg-white';
            let msgColor = 'text-zinc-800';

            if (ev.type === 'ALERT') {
              badgeStyle = 'bg-[#ffe4e6] text-[#881337] border-black';
              itemBg = 'bg-[#fff1f2]';
              msgColor = 'text-rose-950 font-black';
            } else if (ev.type === 'RISK') {
              badgeStyle = 'bg-[#fef3c7] text-[#78350f] border-black';
              itemBg = 'bg-[#fffbeb]';
              msgColor = 'text-amber-950 font-bold';
            } else if (ev.type === 'ANOMALY') {
              badgeStyle = 'bg-[#fef9c3] text-[#713f12] border-black';
              itemBg = 'bg-[#fefce8]';
              msgColor = 'text-yellow-950 font-bold';
            } else if (ev.type === 'SAMPLE') {
              badgeStyle = 'bg-[#dbeafe] text-[#1e3a8a] border-black';
              itemBg = 'bg-white';
              msgColor = 'text-zinc-800';
            }

            return (
              <div
                key={ev.id}
                className={`flex items-start space-x-2 text-[11px] leading-tight p-2 border border-black rounded-lg ${itemBg} font-mono shadow-[1px_1px_0px_0px_#000]`}
              >
                <span className="text-zinc-500 font-bold shrink-0">[{ev.timestamp}]</span>
                <span className={`px-2 py-0.5 shrink-0 font-black text-[10px] rounded-md border ${badgeStyle}`}>
                  {ev.type}
                </span>
                {ev.depth && (
                  <span className="text-blue-900 font-black shrink-0">@{ev.depth}m</span>
                )}
                <span className={`${msgColor} truncate flex-1 font-sans font-medium`}>{ev.message}</span>
                {ev.details && (
                  <span className="text-zinc-500 hidden md:inline text-[10px] font-mono">
                    {ev.details}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

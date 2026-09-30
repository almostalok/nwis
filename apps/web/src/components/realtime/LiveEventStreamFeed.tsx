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
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm font-sans space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Live Stream Feed
          </span>
          <span
            className={`tech-badge text-[9px] uppercase ${
              streamStatus === 'CONNECTED' ? 'tech-badge-emerald' : 'tech-badge-rose'
            }`}
          >
            {streamStatus === 'CONNECTED' ? 'LIVE' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs font-mono">
            {(['ALL', 'ALERTS', 'ANOMALIES'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  filter === mode
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[11px] font-mono hover:text-black dark:hover:text-white"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      </div>

      {/* Stream Items List */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-900 max-h-72 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 font-mono">
            Awaiting streaming events from SSE pipeline...
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div key={ev.id} className="py-2 flex items-start justify-between gap-3 text-xs font-mono">
              <div className="flex items-start space-x-2.5">
                <span className="text-zinc-400 text-[10px] shrink-0 mt-0.5">
                  {ev.timestamp.split('T')[1]?.slice(0, 8) || ev.timestamp}
                </span>

                <span
                  className={`tech-badge text-[9px] uppercase shrink-0 ${
                    ev.type === 'ALERT'
                      ? 'tech-badge-rose'
                      : ev.type === 'ANOMALY'
                      ? 'tech-badge-amber'
                      : ev.type === 'FEATURE'
                      ? 'tech-badge-blue'
                      : 'tech-badge-emerald'
                  }`}
                >
                  {ev.type}
                </span>

                <span className="text-zinc-700 dark:text-zinc-300 text-xs">
                  {ev.message}
                </span>
              </div>

              {ev.depth && (
                <span className="text-zinc-400 text-[10px] shrink-0 font-medium">
                  {ev.depth.toFixed(1)}m
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

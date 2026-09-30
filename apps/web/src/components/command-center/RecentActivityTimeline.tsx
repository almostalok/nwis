'use client';

import React from 'react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  time: string;
  title: string;
  detail: string;
  severity?: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  type: 'ANOMALY' | 'MATCH' | 'RISK' | 'ALERT' | 'SYSTEM';
}

interface RecentActivityTimelineProps {
  items?: ActivityItem[];
}

export function RecentActivityTimeline({ items }: RecentActivityTimelineProps) {
  const defaultItems: ActivityItem[] = [
    {
      id: 'act-1',
      time: '12:04:15',
      title: 'Alert Dispatched',
      detail: 'WARNING Alert [53bfaea7]: Elevated STUCK PIPE Risk Pattern (Score 79/100) dispatched to rig floor and eRTMAC',
      severity: 'WARNING',
      type: 'ALERT',
    },
    {
      id: 'act-2',
      time: '12:03:50',
      title: 'Multifactor Risk Updated',
      detail: 'Stuck pipe risk engine escalated score from 34/100 to 79/100 based on parameter convergence',
      severity: 'WARNING',
      type: 'RISK',
    },
    {
      id: 'act-3',
      time: '12:03:10',
      title: 'Historical Precedents Matched',
      detail: '3 offset wells identified in Barail Sandstone (OIL-SYN-003, 007, 012) within 12km radius',
      severity: 'INFO',
      type: 'MATCH',
    },
    {
      id: 'act-4',
      time: '12:02:40',
      title: 'Telemetry Anomaly Detected',
      detail: 'Torque variance elevated +24% above formation baseline; ROP decay -25% recorded over 15m',
      severity: 'WARNING',
      type: 'ANOMALY',
    },
    {
      id: 'act-5',
      time: '12:00:00',
      title: 'Realtime WITSML / eRTMAC Stream Active',
      detail: 'Continuous 1Hz telemetry streaming nominal baseline through upper Barail Sandstone',
      severity: 'SUCCESS',
      type: 'SYSTEM',
    },
  ];

  const activityList = items && items.length > 0 ? items : defaultItems;

  return (
    <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 font-sans" aria-label="Recent Operational Activity">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 className="text-xs font-mono font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Recent Activity Timeline (Audit &amp; Intelligence Trace)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Realtime audit log tracing current signal &rarr; anomaly &rarr; precedent match &rarr; risk &rarr; alert
          </p>
        </div>

        <Link
          href="/alerts"
          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white font-mono flex items-center gap-1 transition-colors"
        >
          <span>All Alert Dossiers</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Chronological Audit List */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
        {activityList.map((act) => (
          <div key={act.id} className="py-2.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="text-[10px] text-zinc-400 font-mono shrink-0 mt-0.5">
                {act.time}
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      act.severity === 'CRITICAL'
                        ? 'bg-rose-500'
                        : act.severity === 'WARNING'
                        ? 'bg-amber-500'
                        : act.severity === 'SUCCESS'
                        ? 'bg-emerald-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <strong className="text-zinc-900 dark:text-zinc-100 text-xs font-semibold font-mono">
                    {act.title}
                  </strong>
                  <span className={`tech-badge text-[9px] uppercase ${
                    act.type === 'ALERT'
                      ? 'tech-badge-rose'
                      : act.type === 'RISK'
                      ? 'tech-badge-amber'
                      : act.type === 'ANOMALY'
                      ? 'tech-badge-amber'
                      : act.type === 'MATCH'
                      ? 'tech-badge-blue'
                      : 'tech-badge-emerald'
                  }`}>
                    {act.type}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 max-w-3xl leading-relaxed">
                  {act.detail}
                </p>
              </div>
            </div>

            {act.type === 'ALERT' && (
              <Link
                href="/alerts"
                className="self-start sm:self-center h-6 px-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-[11px] font-mono transition-colors shrink-0 border border-zinc-200 dark:border-zinc-800"
              >
                Inspect Alert &rarr;
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

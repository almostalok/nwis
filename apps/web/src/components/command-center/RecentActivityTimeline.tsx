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
    <section className="bg-white border-2 border-black rounded-2xl p-5 lg:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4 font-sans" aria-label="Recent Operational Activity">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black">
        <div>
          <h2 className="text-xs font-black tracking-wider text-black uppercase font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-black" />
            Recent Activity Timeline (Audit &amp; Intelligence Trace)
          </h2>
          <p className="text-xs text-zinc-700 mt-0.5 font-medium">
            Realtime audit log tracing current signal &rarr; anomaly &rarr; precedent match &rarr; risk &rarr; alert
          </p>
        </div>

        <Link
          href="/alerts"
          className="text-xs text-black font-mono font-bold hover:underline flex items-center gap-1"
        >
          <span>View All Alerts Dossiers</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Chronological Flow List */}
      <div className="divide-y-2 divide-zinc-200">
        {activityList.map((act) => (
          <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="text-[10px] text-black font-mono font-bold px-2 py-0.5 bg-[#f4f4f6] rounded-md border border-black shadow-[1px_1px_0px_0px_#000] shrink-0 mt-0.5">
                {act.time}
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full border border-black shrink-0 ${
                      act.severity === 'CRITICAL'
                        ? 'bg-[#ef4444]'
                        : act.severity === 'WARNING'
                        ? 'bg-[#f59e0b]'
                        : act.severity === 'SUCCESS'
                        ? 'bg-[#10b981]'
                        : 'bg-[#3b82f6]'
                    }`}
                  />
                  <strong className="text-black text-xs font-black font-mono">{act.title}</strong>
                  <span className={`neo-badge text-[9px] uppercase ${
                    act.type === 'ALERT'
                      ? 'neo-badge-rose'
                      : act.type === 'RISK'
                      ? 'neo-badge-amber'
                      : act.type === 'ANOMALY'
                      ? 'neo-badge-amber'
                      : act.type === 'MATCH'
                      ? 'neo-badge-blue'
                      : 'neo-badge-emerald'
                  }`}>
                    {act.type}
                  </span>
                </div>
                <p className="text-xs text-zinc-800 mt-1 max-w-3xl leading-relaxed font-medium">
                  {act.detail}
                </p>
              </div>
            </div>

            {act.type === 'ALERT' && (
              <Link
                href="/alerts"
                className="self-start sm:self-center px-3 py-1 bg-white hover:bg-zinc-100 text-black rounded-xl text-xs font-bold font-mono transition-all shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000]"
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

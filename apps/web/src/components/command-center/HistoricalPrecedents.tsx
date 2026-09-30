'use client';

import React from 'react';
import Link from 'next/link';

interface PrecedentItem {
  id?: string;
  wellId: string;
  wellName: string;
  distanceKm: number;
  similarityScore: number;
  eventType: string;
  severity: string;
  depth: number;
  formation: string;
  description?: string;
  mitigation?: string;
  evidence?: any[];
}

interface HistoricalPrecedentsProps {
  currentWellId: string;
  currentDepth: number;
  currentFormation: string;
  precedents: PrecedentItem[];
  onSelectPrecedent?: (precedent: PrecedentItem) => void;
}

export function HistoricalPrecedents({
  currentWellId,
  currentDepth = 3208,
  currentFormation = 'Barail Sandstone',
  precedents,
}: HistoricalPrecedentsProps) {
  const defaultPrecedents: PrecedentItem[] = [
    {
      wellId: 'OIL-SYN-003',
      wellName: 'NWIS Precedent Well 03 (Stuck Pipe)',
      distanceKm: 4.2,
      depth: 3210,
      formation: 'Barail Sandstone',
      eventType: 'STUCK_PIPE',
      severity: 'HIGH',
      similarityScore: 0.86,
      description: 'Differential and mechanical sticking across Barail carbonaceous shale. Torque rose 11.5 to 34.5 kNm. Pipe jarred for 54 hours.',
      mitigation: 'Spotted 12 m3 organic oil-based lubricant soaking pill across 3150-3210m interval with downward hydraulic jarring.',
    },
    {
      wellId: 'OIL-SYN-007',
      wellName: 'NWIS Precedent Well 07 (Barail Stuck Pipe)',
      distanceKm: 7.8,
      depth: 3180,
      formation: 'Barail Sandstone',
      eventType: 'STUCK_PIPE',
      severity: 'HIGH',
      similarityScore: 0.75,
      description: 'Stuck pipe during connection in Barail transition zone preceded by erratic torque and severe overpull.',
      mitigation: 'Pumped 10 m3 lubricating hydrocarbon pill. Jarred down repeatedly with 40-tonne impacts.',
    },
    {
      wellId: 'OIL-SYN-012',
      wellName: 'NWIS Precedent Well 12 (Barail Correlation)',
      distanceKm: 11.4,
      depth: 3205,
      formation: 'Barail Sandstone',
      eventType: 'STUCK_PIPE',
      severity: 'HIGH',
      similarityScore: 0.87,
      description: 'Stuck pipe at 3205m with identical signature to Well 003. Top drive stalled, ROP decayed from 14.8 to 0.6 m/h.',
      mitigation: 'Spotted 14 m3 low-viscosity surfactant soaking pill, continuous hydraulic jarring, intermittent circulation.',
    },
  ];

  const items = precedents && precedents.length > 0 ? precedents : defaultPrecedents;

  return (
    <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-5 font-sans" aria-label="Historical Precedent Intelligence">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 className="text-xs font-mono font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Historical Precedents &amp; Geological Corroboration
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Similar sticking events found in nearby and geologically congruent offset wells within Assam-Arakan Basin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/intelligence"
            className="h-7 px-3 text-xs font-mono font-medium rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors inline-flex items-center gap-1"
          >
            <span>All Precedents</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Cross-Well Correlation Strip */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-3.5">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-600 dark:text-zinc-400">
            Cross-Well Parametric Correlation
          </span>
          <span className="tech-badge tech-badge-amber text-[9px]">
            Identical Stratigraphic Horizon
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* CURRENT TARGET WELL */}
          <div className="p-3 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-lg">
            <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-amber-900 dark:text-amber-200 uppercase">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Current Target
              </span>
              <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1 py-0.2 rounded text-[9px] font-bold">LIVE</span>
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">{currentWellId}</div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-bold font-mono mt-0.5">{currentDepth}m MD</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 truncate mt-0.5">{currentFormation}</div>
            <div className="mt-2 pt-2 border-t border-amber-500/20 text-xs font-mono space-y-0.5">
              <div className="text-amber-600 dark:text-amber-400">Torque: ↗ +24%</div>
              <div className="text-rose-600 dark:text-rose-400">ROP: ↘ -25%</div>
            </div>
          </div>

          {/* PRECEDENT WELLS */}
          {items.slice(0, 3).map((item) => (
            <div
              key={item.wellId}
              className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-mono">
                <span>Offset Precedent</span>
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">{item.distanceKm} km</span>
              </div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">{item.wellId}</div>
              <div className="text-xs text-zinc-500 font-mono mt-0.5">{item.depth}m MD (Stuck Pipe)</div>
              <div className="text-xs text-zinc-400 truncate mt-0.5">{item.formation}</div>
              <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs font-mono flex items-center justify-between">
                <span className="text-zinc-400 text-[10px]">Match:</span>
                <span className="tech-badge tech-badge-amber text-[9px]">
                  {(item.similarityScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Depth Correlation Ruler */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-3.5">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-600 dark:text-zinc-400">
            Depth Alignment Comparison Ruler (3,150m &ndash; 3,250m)
          </span>
          <span className="text-[10px] font-mono text-zinc-400">Normalized Measured Depth Alignment</span>
        </div>

        {/* Ruler Track */}
        <div className="relative h-11 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 p-1 flex items-center overflow-hidden">
          <div className="absolute left-2 text-[9px] font-mono text-zinc-400">3,150m</div>
          <div className="absolute left-1/4 text-[9px] font-mono text-zinc-400">3,175m</div>
          <div className="absolute left-2/4 text-[9px] font-mono text-zinc-400">3,200m</div>
          <div className="absolute left-3/4 text-[9px] font-mono text-zinc-400">3,225m</div>
          <div className="absolute right-2 text-[9px] font-mono text-zinc-400">3,250m</div>

          {/* Sticking hazard interval band (3180m - 3220m) */}
          <div
            className="absolute top-1 bottom-1 bg-rose-500/10 border-x border-rose-500/30 rounded"
            style={{ left: '30%', width: '40%' }}
          >
            <div className="text-[9px] font-bold text-rose-600 dark:text-rose-400 text-center pt-0.5 uppercase tracking-wider font-mono">
              Recurrent Sticking Window
            </div>
          </div>

          {/* Historical markers */}
          <div className="absolute z-10 -translate-x-1/2 flex flex-col items-center" style={{ left: '30%' }}>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[8px] font-mono text-zinc-600 dark:text-zinc-400">SYN-007</span>
          </div>
          <div className="absolute z-10 -translate-x-1/2 flex flex-col items-center" style={{ left: '55%' }}>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[8px] font-mono text-zinc-600 dark:text-zinc-400">SYN-012</span>
          </div>
          <div className="absolute z-10 -translate-x-1/2 flex flex-col items-center" style={{ left: '60%' }}>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[8px] font-mono text-zinc-600 dark:text-zinc-400">SYN-003</span>
          </div>

          {/* Current Target Well Marker */}
          <div className="absolute z-20 -translate-x-1/2 flex flex-col items-center" style={{ left: '58%' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[8px] font-mono font-bold text-amber-700 dark:text-amber-300">
              TARGET ({currentDepth}m)
            </span>
          </div>
        </div>
      </div>

      {/* Offset Sticking Incidents with Mitigation */}
      <div className="space-y-2.5">
        <h3 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
          Offset Incidents &amp; Documented Mitigations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.wellId}
              className="bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="tech-badge tech-badge-rose text-[9px] uppercase">
                    {item.eventType}
                  </span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">{item.wellId}</h4>
                  <p className="text-[11px] text-zinc-500 truncate">{item.wellName}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    {(item.similarityScore * 100).toFixed(0)}%
                  </span>
                  <span className="text-[9px] text-zinc-400 block uppercase font-mono">Similarity</span>
                </div>
              </div>

              <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2.5 rounded border border-zinc-200/80 dark:border-zinc-800/80 leading-relaxed">
                {item.description}
              </div>

              {item.mitigation && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-mono">
                    Proven Mitigation:
                  </div>
                  <p className="text-emerald-800 dark:text-emerald-300 text-[11px] mt-0.5 leading-snug">
                    {item.mitigation}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[10px] font-mono text-zinc-400">{item.distanceKm} km offset</span>
                <Link
                  href={`/compare?wellA=${currentWellId}&wellB=${item.wellId}`}
                  className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white font-mono"
                >
                  Compare Logs &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

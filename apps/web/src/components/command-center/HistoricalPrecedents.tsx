'use client';

import React, { useState } from 'react';
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
  onSelectPrecedent,
}: HistoricalPrecedentsProps) {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

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
    <section className="bg-white border-2 border-black rounded-2xl p-5 lg:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-5 font-sans" aria-label="Historical Precedent Intelligence">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black">
        <div>
          <h2 className="text-xs font-black tracking-wider text-black uppercase font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-black" />
            Historical Precedents &amp; Geological Corroboration
          </h2>
          <p className="text-xs text-zinc-700 mt-0.5 font-medium">
            Similar sticking events found in nearby and geologically congruent offset wells within Assam-Arakan Basin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/intelligence"
            className="neo-btn-white text-xs font-mono font-bold"
          >
            View All Precedents &rarr;
          </Link>
        </div>
      </div>

      {/* VISUAL ASSET #3 — Well Comparison Strip */}
      <div className="bg-[#f4f4f6] border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_0px_#000]">
        <div className="flex items-center justify-between text-xs text-zinc-700 mb-3">
          <span className="font-mono font-black uppercase tracking-wider text-black">
            Cross-Well Parametric Correlation
          </span>
          <span className="neo-badge neo-badge-amber text-[10px]">
            Identical Stratigraphic Horizon
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* CURRENT WELL */}
          <div className="p-3.5 bg-[#fef3c7] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-black uppercase">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] border border-black animate-ping" />
                Current Target
              </span>
              <span className="bg-[#fbbf24] px-1.5 py-0.2 rounded border border-black text-[9px] font-black">LIVE</span>
            </div>
            <div className="text-base font-black text-black mt-1 font-mono">{currentWellId}</div>
            <div className="text-xs text-[#b45309] font-black font-mono mt-0.5">{currentDepth}m MD</div>
            <div className="text-xs text-zinc-800 truncate mt-0.5 font-bold">{currentFormation}</div>
            <div className="mt-2.5 pt-2 border-t-2 border-black text-xs font-mono space-y-0.5">
              <div className="text-[#b45309] font-bold">Torque: ↗ +24%</div>
              <div className="text-[#991b1b] font-bold">ROP: ↘ -25%</div>
            </div>
          </div>

          {/* PRECEDENT 1 */}
          <div className="p-3.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] transition-all">
            <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase font-mono font-bold">
              <span>Offset Precedent</span>
              <span className="text-black font-black">4.2 km</span>
            </div>
            <div className="text-base font-black text-black mt-1 font-mono">OIL-SYN-003</div>
            <div className="text-xs text-zinc-700 font-bold font-mono mt-0.5">3,210m MD (Stuck Pipe)</div>
            <div className="text-xs text-zinc-600 truncate mt-0.5 font-medium">Barail Sandstone</div>
            <div className="mt-2.5 pt-2 border-t-2 border-black text-xs font-mono flex items-center justify-between">
              <span className="text-zinc-500">Correlation:</span>
              <span className="neo-badge neo-badge-amber text-[9px]">86% Match</span>
            </div>
          </div>

          {/* PRECEDENT 2 */}
          <div className="p-3.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] transition-all">
            <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase font-mono font-bold">
              <span>Offset Precedent</span>
              <span className="text-black font-black">7.8 km</span>
            </div>
            <div className="text-base font-black text-black mt-1 font-mono">OIL-SYN-007</div>
            <div className="text-xs text-zinc-700 font-bold font-mono mt-0.5">3,180m MD (Stuck Pipe)</div>
            <div className="text-xs text-zinc-600 truncate mt-0.5 font-medium">Barail Transition</div>
            <div className="mt-2.5 pt-2 border-t-2 border-black text-xs font-mono flex items-center justify-between">
              <span className="text-zinc-500">Correlation:</span>
              <span className="neo-badge neo-badge-amber text-[9px]">75% Match</span>
            </div>
          </div>

          {/* PRECEDENT 3 */}
          <div className="p-3.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] transition-all">
            <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase font-mono font-bold">
              <span>Offset Precedent</span>
              <span className="text-black font-black">11.4 km</span>
            </div>
            <div className="text-base font-black text-black mt-1 font-mono">OIL-SYN-012</div>
            <div className="text-xs text-zinc-700 font-bold font-mono mt-0.5">3,205m MD (Stuck Pipe)</div>
            <div className="text-xs text-zinc-600 truncate mt-0.5 font-medium">Barail Sandstone</div>
            <div className="mt-2.5 pt-2 border-t-2 border-black text-xs font-mono flex items-center justify-between">
              <span className="text-zinc-500">Correlation:</span>
              <span className="neo-badge neo-badge-amber text-[9px]">87% Match</span>
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL ASSET #4 — Vertical Depth Correlation Ruler */}
      <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_0px_#000]">
        <div className="flex items-center justify-between text-xs text-zinc-700 mb-2">
          <span className="font-mono font-black uppercase text-black">
            Depth Alignment Comparison Ruler (3,150m - 3,250m)
          </span>
          <span className="text-[11px] font-mono text-zinc-600">Normalized True Vertical/Measured Alignment</span>
        </div>

        {/* Depth Correlation Ruler Track */}
        <div className="relative h-12 bg-[#f4f4f6] rounded-xl border-2 border-black p-1 flex items-center overflow-hidden">
          {/* Depth markings */}
          <div className="absolute left-2 text-[9px] font-mono font-bold text-zinc-500">3,150m</div>
          <div className="absolute left-1/4 text-[9px] font-mono font-bold text-zinc-500">3,175m</div>
          <div className="absolute left-2/4 text-[9px] font-mono font-bold text-zinc-500">3,200m</div>
          <div className="absolute left-3/4 text-[9px] font-mono font-bold text-zinc-500">3,225m</div>
          <div className="absolute right-2 text-[9px] font-mono font-bold text-zinc-500">3,250m</div>

          {/* Sticking hazard interval band (3180m - 3220m) */}
          <div
            className="absolute top-1 bottom-1 bg-[#fee2e2] border-2 border-[#ef4444] rounded-lg"
            style={{ left: '30%', width: '40%' }}
          >
            <div className="text-[9px] font-black text-[#991b1b] text-center pt-0.5 uppercase tracking-wider font-mono">
              Recurrent Sticking Window
            </div>
          </div>

          {/* Markers for historical stuck events */}
          <div
            className="absolute z-10 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
            style={{ left: '30%' }}
            title="OIL-SYN-007 Stuck at 3,180m"
          >
            <span className="w-3 h-3 rounded-full bg-[#ef4444] border-2 border-black shadow-[1px_1px_0px_0px_#000]" />
            <span className="text-[9px] font-mono font-bold text-black bg-white px-1 rounded border border-black shadow-xs mt-0.5">SYN-007</span>
          </div>

          <div
            className="absolute z-10 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
            style={{ left: '55%' }}
            title="OIL-SYN-012 Stuck at 3,205m"
          >
            <span className="w-3 h-3 rounded-full bg-[#ef4444] border-2 border-black shadow-[1px_1px_0px_0px_#000]" />
            <span className="text-[9px] font-mono font-bold text-black bg-white px-1 rounded border border-black shadow-xs mt-0.5">SYN-012</span>
          </div>

          <div
            className="absolute z-10 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
            style={{ left: '60%' }}
            title="OIL-SYN-003 Stuck at 3,210m"
          >
            <span className="w-3 h-3 rounded-full bg-[#ef4444] border-2 border-black shadow-[1px_1px_0px_0px_#000]" />
            <span className="text-[9px] font-mono font-bold text-black bg-white px-1 rounded border border-black shadow-xs mt-0.5">SYN-003</span>
          </div>

          {/* Current Target Well Marker */}
          <div
            className="absolute z-20 -translate-x-1/2 flex flex-col items-center"
            style={{ left: '58%' }}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] border-2 border-black shadow-[1px_1px_0px_0px_#000] animate-bounce" />
            <span className="text-[9px] font-black text-black bg-[#fbbf24] px-1 rounded border border-black shadow-xs mt-0.5">
              TARGET ({currentDepth}m)
            </span>
          </div>
        </div>
      </div>

      {/* Precedent Cards Detail Grid with Actionable Insights */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-black uppercase tracking-wider text-black">
          Offset Sticking Incidents &amp; Recommended Mitigations:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {items.slice(0, 3).map((item) => {
            const isExpanded = selectedCase === item.wellId;
            return (
              <div
                key={item.wellId}
                className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="neo-badge neo-badge-rose text-[9px] uppercase">
                      {item.eventType}
                    </span>
                    <h4 className="text-sm font-black text-black mt-1 font-mono">{item.wellId}</h4>
                    <p className="text-[11px] text-zinc-600 font-medium">{item.wellName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-black font-mono">
                      {(item.similarityScore * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold">Similarity</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-800 bg-[#f4f4f6] p-2.5 rounded-lg border border-black font-medium leading-relaxed">
                  {item.description}
                </div>

                {item.mitigation && (
                  <div className="p-2.5 bg-[#d1fae5] border border-black rounded-lg text-xs">
                    <div className="font-black text-[#064e3b] text-[10px] uppercase font-mono">Proven Mitigation:</div>
                    <p className="text-[#064e3b] text-[11px] mt-0.5 font-medium leading-snug">{item.mitigation}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200">
                  <span className="text-[11px] font-mono text-zinc-600 font-bold">{item.distanceKm} km away</span>
                  <Link
                    href={`/compare?wellA=${currentWellId}&wellB=${item.wellId}`}
                    className="text-xs font-bold text-black hover:underline font-mono"
                  >
                    Compare Logs &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

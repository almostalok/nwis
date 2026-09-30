'use client';

import React from 'react';
import Link from 'next/link';
import { AlertSeverity } from '@nwis/types';

interface RiskScorePanelProps {
  riskAssessment?: any;
  activeAlert?: any;
}

export function RiskScorePanel({ riskAssessment, activeAlert }: RiskScorePanelProps) {
  if (!riskAssessment) {
    return (
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[3.5px_3.5px_0px_0px_#000000] text-center font-sans">
        <div className="text-xs font-mono uppercase tracking-wider text-black font-extrabold mb-1">
          Operational Risk Evaluation
        </div>
        <div className="text-zinc-700 text-xs font-medium">
          Status: Nominal &bull; All parameters within baseline bounds.
        </div>
      </div>
    );
  }

  const score = riskAssessment.score ?? 0;
  const severity = riskAssessment.severity ?? 'NORMAL';
  const riskType = (riskAssessment.riskType ?? 'OPERATIONAL').replace(/_/g, ' ');
  const factors = riskAssessment.contributingFactors ?? [];
  const precedents = riskAssessment.historicalContext?.topPrecedentEvents ?? [];

  let badgeClass = 'neo-badge-emerald';
  let barColor = 'bg-[#10b981]';

  if (severity === AlertSeverity.CRITICAL) {
    badgeClass = 'neo-badge-rose';
    barColor = 'bg-[#ef4444]';
  } else if (severity === AlertSeverity.WARNING) {
    badgeClass = 'neo-badge-amber';
    barColor = 'bg-[#f59e0b]';
  } else if (severity === AlertSeverity.WATCH) {
    badgeClass = 'neo-badge-blue';
    barColor = 'bg-[#3b82f6]';
  }

  const segments = 10;
  const filledSegments = Math.round((score / 100) * segments);

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000000] font-sans">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-black font-black">
            {riskType} Risk Evaluation
          </div>
          <div className="text-[10px] text-zinc-600 font-mono font-bold mt-0.5">
            DECISION-SUPPORT EVALUATION &bull; NO AUTONOMOUS CONTROL
          </div>
        </div>
        <span className={`neo-badge text-[11px] uppercase ${badgeClass}`}>
          {severity}
        </span>
      </div>

      {/* Main Score Display */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider font-extrabold">
            Calculated Risk Index
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono mt-0.5 text-black">
            {score} <span className="text-sm text-zinc-500 font-bold">/ 100</span>
          </div>
        </div>

        {/* Rounded Segmented Bar */}
        <div className="w-full sm:w-1/2">
          <div className="flex space-x-1.5 p-1 bg-[#f4f4f6] rounded-xl border-2 border-black">
            {Array.from({ length: segments }).map((_, i) => (
              <div
                key={i}
                className={`h-4 flex-1 rounded-sm border border-black transition-all duration-300 ${
                  i < filledSegments ? `${barColor} shadow-[1px_1px_0px_0px_#000]` : 'bg-white'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-black font-mono font-bold mt-1.5">
            <span>Nominal (0)</span>
            <span>Watch (30)</span>
            <span>Warning (60)</span>
            <span>Critical (80+)</span>
          </div>
        </div>
      </div>

      {/* Contributing Factors Breakdown */}
      {factors.length > 0 && (
        <div className="mt-4 pt-3 border-t-2 border-black">
          <div className="text-[11px] font-mono font-black text-black uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Contributing Signal Breakdown</span>
            <span className="text-zinc-600 text-[10px]">WEIGHTED CALIBRATION</span>
          </div>

          <div className="space-y-1.5">
            {factors.map((f: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs bg-[#f4f4f6] px-3 py-2 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]"
              >
                <span className="text-black font-mono text-[11px] font-bold">{f.factor}</span>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-[10px] text-zinc-700 truncate max-w-xs hidden sm:inline font-medium">
                    {f.description}
                  </span>
                  <span className="text-black font-black text-xs bg-[#fef3c7] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
                    +{f.contribution}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Precedent Context Box */}
      {precedents.length > 0 && (
        <div className="mt-4 p-3.5 bg-[#fef3c7] border-2 border-black rounded-xl text-xs shadow-[2px_2px_0px_0px_#000]">
          <div className="flex items-center space-x-2 font-mono font-black text-black mb-1 text-[11px] tracking-wider uppercase">
            <span>Institutional Precedents Corroborated</span>
          </div>
          <div className="text-black text-xs leading-relaxed font-medium">
            Precedent search matched {precedents.length} comparable offset well events (
            {precedents.map((p: any) => p.wellId || p.wellName).slice(0, 3).join(', ')}).
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-600 font-bold">
          Model: BAYESIAN-HAZARD-ENSEMBLE
        </span>
        <Link
          href="/alerts"
          className="text-xs font-mono font-bold text-black hover:underline"
        >
          View Alert Details &rarr;
        </Link>
      </div>
    </div>
  );
}

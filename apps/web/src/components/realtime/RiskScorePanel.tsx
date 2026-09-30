'use client';

import React from 'react';
import Link from 'next/link';
import { AlertSeverity } from '@nwis/types';

interface RiskScorePanelProps {
  riskAssessment?: any;
  activeAlert?: any;
}

export function RiskScorePanel({ riskAssessment }: RiskScorePanelProps) {
  if (!riskAssessment) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm text-center font-sans">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1">
          Operational Risk Evaluation
        </div>
        <div className="text-zinc-500 text-xs">
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

  let badgeClass = 'tech-badge-emerald';
  let barColor = 'bg-emerald-500';

  if (severity === AlertSeverity.CRITICAL) {
    badgeClass = 'tech-badge-rose';
    barColor = 'bg-rose-500';
  } else if (severity === AlertSeverity.WARNING) {
    badgeClass = 'tech-badge-amber';
    barColor = 'bg-amber-500';
  } else if (severity === AlertSeverity.WATCH) {
    badgeClass = 'tech-badge-blue';
    barColor = 'bg-blue-500';
  }

  const segments = 10;
  const filledSegments = Math.round((score / 100) * segments);

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm font-sans space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-bold">
            {riskType} Risk Evaluation
          </div>
          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
            DECISION-SUPPORT &bull; NO AUTONOMOUS CONTROL
          </div>
        </div>
        <span className={`tech-badge text-[10px] uppercase ${badgeClass}`}>
          {severity}
        </span>
      </div>

      {/* Main Score Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            Calculated Risk Index
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono mt-0.5 text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">
            {score} <span className="text-xs text-zinc-400 font-normal">/ 100</span>
          </div>
        </div>

        {/* Segmented Bar */}
        <div className="w-full sm:w-1/2">
          <div className="flex space-x-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
            {Array.from({ length: segments }).map((_, i) => (
              <div
                key={i}
                className={`h-3 flex-1 rounded-xs transition-all duration-300 ${
                  i < filledSegments ? barColor : 'bg-zinc-200 dark:bg-zinc-800'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-zinc-400 font-mono mt-1">
            <span>Nom (0)</span>
            <span>Watch (30)</span>
            <span>Warn (60)</span>
            <span>Crit (80+)</span>
          </div>
        </div>
      </div>

      {/* Contributing Factors */}
      {factors.length > 0 && (
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 space-y-2">
          <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Contributing Signals</span>
            <span>WEIGHTED</span>
          </div>

          <div className="space-y-1.5">
            {factors.map((f: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-900/50 px-2.5 py-1.5 rounded-md border border-zinc-200/60 dark:border-zinc-800/60"
              >
                <span className="text-zinc-800 dark:text-zinc-200 font-mono text-[11px] font-medium">{f.factor}</span>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-[10px] text-zinc-400 truncate max-w-xs hidden sm:inline">
                    {f.description}
                  </span>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    +{f.contribution}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Precedents Box */}
      {precedents.length > 0 && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs">
          <div className="text-[10px] font-mono uppercase text-zinc-400 font-semibold mb-1">
            Corroborated Offset Wells:
          </div>
          <div className="text-zinc-600 dark:text-zinc-400 text-xs">
            {precedents.map((p: any) => p.wellId || p.wellName).slice(0, 3).join(', ')}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs font-mono">
        <span className="text-[10px] text-zinc-400">BAYESIAN-HAZARD-ENSEMBLE</span>
        <Link
          href="/alerts"
          className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
        >
          View Alert Details &rarr;
        </Link>
      </div>
    </div>
  );
}

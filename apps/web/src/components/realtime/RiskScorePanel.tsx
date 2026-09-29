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
      <div className="bg-petro-900 border border-petro-800 rounded-lg p-5 shadow-sm text-center">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
          Operational Risk Evaluation
        </div>
        <div className="text-slate-500 text-sm">
          No elevated risk patterns currently detected. Telemetry within nominal operational bounds.
        </div>
      </div>
    );
  }

  const score = riskAssessment.score ?? 0;
  const severity = riskAssessment.severity ?? 'NORMAL';
  const riskType = (riskAssessment.riskType ?? 'OPERATIONAL').replace(/_/g, ' ');
  const factors = riskAssessment.contributingFactors ?? [];
  const precedents = riskAssessment.historicalContext?.topPrecedentEvents ?? [];

  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let scoreColor = 'text-emerald-400';
  let progressBg = 'bg-emerald-500';

  if (severity === AlertSeverity.CRITICAL) {
    badgeColor = 'bg-red-950 text-red-200 border-red-700';
    scoreColor = 'text-red-400';
    progressBg = 'bg-red-500';
  } else if (severity === AlertSeverity.WARNING) {
    badgeColor = 'bg-amber-950 text-amber-200 border-amber-700';
    scoreColor = 'text-amber-400';
    progressBg = 'bg-amber-500';
  } else if (severity === AlertSeverity.WATCH) {
    badgeColor = 'bg-cyan-950 text-cyan-200 border-cyan-700';
    scoreColor = 'text-cyan-400';
    progressBg = 'bg-cyan-500';
  }

  return (
    <div className="bg-petro-900 border border-petro-800 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-petro-800">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            {riskType} Risk Evaluation
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Decision-Support Prototype Score &bull; Not Autonomous Control
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase tracking-wide border ${badgeColor}`}>
          {severity}
        </span>
      </div>

      {/* Main Score Display */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Prototype Risk Score</div>
          <div className={`text-4xl font-extrabold font-mono mt-1 ${scoreColor}`}>
            {score} <span className="text-lg text-slate-500 font-normal">/ 100</span>
          </div>
        </div>

        <div className="w-1/2">
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-petro-800">
            <div
              className={`h-full transition-all duration-500 ${progressBg}`}
              style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>0 Nom</span>
            <span>30 Watch</span>
            <span>60 Warn</span>
            <span>80+ Crit</span>
          </div>
        </div>
      </div>

      {/* Contributing Factors Breakdown */}
      {factors.length > 0 && (
        <div className="mt-4 pt-3 border-t border-petro-800/60">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Illustrative Signal Breakdown:</span>
            <span className="text-[10px] font-mono text-slate-500">Weight Calibration</span>
          </div>

          <div className="space-y-1.5">
            {factors.map((f: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs bg-petro-950/60 px-2.5 py-1.5 rounded border border-petro-800/40"
              >
                <span className="text-slate-300 font-medium">{f.factor}</span>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-[11px] text-slate-400 truncate max-w-xs hidden sm:inline">
                    {f.description}
                  </span>
                  <span className="text-emerald-400 font-semibold">+{f.contribution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Precedent Context Box */}
      {precedents.length > 0 && (
        <div className="mt-4 p-3 bg-amber-950/20 border border-amber-800/50 rounded-md text-xs">
          <div className="flex items-center space-x-2 font-semibold text-amber-300 mb-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Institutional Precedents Corroborated</span>
          </div>
          <div className="text-slate-300 text-[11px] leading-relaxed">
            Precedent search matched {precedents.length} comparable offset well events (
            {precedents.map((p: any) => p.wellId || p.wellName).slice(0, 3).join(', ')}).
          </div>
        </div>
      )}

      {/* Link to Alert Detail */}
      {activeAlert && (
        <div className="mt-4 pt-2">
          <Link
            href={`/alerts/${activeAlert.id}`}
            className="block text-center text-xs font-semibold py-2 px-3 rounded bg-petro-800 hover:bg-petro-700 text-emerald-400 border border-petro-700 transition-colors"
          >
            Open Complete Alert Dossier & Historical Citations &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

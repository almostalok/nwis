'use client';

import React from 'react';
import Link from 'next/link';

interface ContributingFactor {
  factor: string;
  weight?: number;
  contribution: number;
  description: string;
}

interface DecisionSupportHeroProps {
  wellId: string;
  riskAssessment?: {
    score?: number;
    severity?: string;
    riskType?: string;
    contributingFactors?: ContributingFactor[];
    signals?: string[];
    recommendations?: string[];
  } | null;
  activeAlert?: {
    id: string;
    title: string;
    severity: string;
    score: number;
    triggerSignals?: string[];
  } | null;
  precedentCount: number;
  onInspectEvidence?: () => void;
}

export function DecisionSupportHero({
  wellId,
  riskAssessment,
  activeAlert,
  precedentCount = 3,
  onInspectEvidence,
}: DecisionSupportHeroProps) {
  const score = riskAssessment?.score ?? activeAlert?.score ?? 79;
  const severity = riskAssessment?.severity ?? activeAlert?.severity ?? 'WARNING';
  const isCritical = severity === 'CRITICAL' || score >= 80;

  const defaultFactors = [
    { name: 'Torque Anomaly (+24% surge above baseline)', score: 85, weight: 'HIGH' },
    { name: 'ROP Deviation (-25% decay rate)', score: 72, weight: 'MEDIUM' },
    { name: 'Formation Similarity (Barail Sandstone)', score: 94, weight: 'GEOLOGY' },
    { name: 'Depth Proximity (within ±25m window)', score: 88, weight: 'SPATIAL' },
    { name: `Historical Precedent (${precedentCount} offset sticking cases)`, score: 92, weight: 'HISTORICAL' },
  ];

  const factors = riskAssessment?.contributingFactors && riskAssessment.contributingFactors.length > 0
    ? riskAssessment.contributingFactors.map((f) => ({
        name: f.description || f.factor,
        score: Math.min(100, Math.round((f.contribution / (f.weight || 25)) * 100)) || 80,
        weight: f.factor.toUpperCase(),
      }))
    : defaultFactors;

  return (
    <section
      id="decision-support-hero"
      className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm font-sans relative overflow-hidden"
      aria-label="Decision Support Advisory"
    >
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isCritical ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-1">
        {/* Left Column: Finding & Action Directives (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Warning Label */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`tech-badge text-[11px] ${
                isCritical ? 'tech-badge-rose' : 'tech-badge-amber'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCritical ? 'bg-rose-500' : 'bg-amber-500'
                } animate-pulse`}
              />
              <span>Stuck-Pipe Precursor Flagged</span>
            </span>

            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Advisory Decision Support &bull; Zero Rig Control
            </span>
          </div>

          {/* Incident Title & Narrative */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
              Elevated Historical Sticking Pattern in Barail Sandstone
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              Mechanical torque divergence combined with penetration decay matches known differential sticking precursors identified across <strong>{precedentCount} nearby offset wells</strong> at this precise stratigraphic depth.
            </p>
          </div>

          {/* Corroborating Signals Bento Box */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-3.5 space-y-2">
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              Corroborating Drilling Signals
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Torque ↑ 24% (spikes to 18.4 kNm)</span>
              </div>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>ROP ↓ 25% decay over last 15m</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>{precedentCount} offset wells (SYN-003, 007, 012)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Stratigraphy: Barail Sandstone</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              id="btn-inspect-evidence"
              onClick={() => {
                if (onInspectEvidence) {
                  onInspectEvidence();
                } else {
                  const el = document.getElementById('evidence-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="h-8 px-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold text-xs rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Inspect Corroborating Evidence</span>
              <span className="font-mono text-xs">&darr;</span>
            </button>

            {activeAlert && (
              <Link
                href={`/alerts/${activeAlert.id}`}
                className="h-8 px-3 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors inline-flex items-center gap-1"
              >
                <span>Alert Dossier</span>
                <span className="font-mono text-xs">&rarr;</span>
              </Link>
            )}

            <Link
              href={`/compare?wellA=${wellId}&wellB=OIL-SYN-003`}
              className="h-8 px-3 text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>Cross-Well Compare &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Composite Risk Score & Decomposition (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
          {/* Big Score Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                Composite Risk Score
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Multifactor Bayesian Precedent Corroboration
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">
                {score} <span className="text-xs font-normal text-zinc-400">/ 100</span>
              </div>
              <span
                className={`tech-badge text-[10px] mt-1 ${
                  isCritical ? 'tech-badge-rose' : 'tech-badge-amber'
                }`}
              >
                {severity}
              </span>
            </div>
          </div>

          {/* Risk Decomposition Bars */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Risk Decomposition Factors</span>
              <span>NORMALIZED</span>
            </div>

            <div className="space-y-2 text-xs">
              {factors.map((f, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[220px]">
                      {f.name}
                    </span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-mono font-semibold text-xs">
                      {f.score}%
                    </span>
                  </div>
                  {/* High-precision 3px progress bar */}
                  <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        f.score >= 85
                          ? 'bg-rose-500'
                          : f.score >= 70
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, f.score))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Advisory Safety Note */}
            <div className="pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
              <span>NWIS-BAYES-RISK-v1.4</span>
              <span className="tech-badge tech-badge-emerald text-[9px]">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                100% Grounded
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

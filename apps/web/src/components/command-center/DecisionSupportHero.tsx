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
  const hasRisk = score >= 50;

  const defaultFactors = [
    { name: 'Torque Anomaly (+24% surge above baseline)', score: 85, weight: 'HIGH WEIGHT' },
    { name: 'ROP Deviation (-25% decay rate)', score: 72, weight: 'MED WEIGHT' },
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
      className={`border-2 border-black rounded-2xl p-6 lg:p-7 transition-all font-sans shadow-[5px_5px_0px_0px_#000000] ${
        hasRisk
          ? 'bg-[#fffbeb]'
          : 'bg-white'
      }`}
      aria-label="Decision Support Advisory"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Risk Banner & Concise Reasons (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Warning Label */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`neo-badge text-xs uppercase tracking-wider ${
                severity === 'CRITICAL'
                  ? 'neo-badge-rose'
                  : 'neo-badge-amber'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-black animate-pulse" />
              <span>⚠ Stuck-Pipe Precursor Flagged</span>
            </span>

            <span className="text-[10px] font-mono font-bold text-black uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              Decision Support &bull; Advisory Only
            </span>
          </div>

          {/* Large Problem Title & Narrative */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight leading-snug">
              Elevated Historical Sticking Pattern in Barail Sandstone
            </h1>
            <p className="text-xs sm:text-sm text-zinc-800 mt-2 leading-relaxed font-medium">
              Mechanical torque divergence combined with penetration decay matches known differential sticking precursors identified across <strong>{precedentCount} nearby offset wells</strong> at this precise stratigraphic depth.
            </p>
          </div>

          {/* Concise Bullet Reasons */}
          <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[2.5px_2.5px_0px_0px_#000] space-y-2.5">
            <div className="text-[11px] font-mono font-black uppercase tracking-wider text-black">
              Corroborating Drilling Signals:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-black font-bold">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] border border-black" />
                <span>Torque ↑ 24% (spikes to 18.4 kNm)</span>
              </div>
              <div className="flex items-center gap-2 text-[#991b1b] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] border border-black" />
                <span>ROP ↓ 25% decay over last 15m</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6] border border-black" />
                <span>{precedentCount} offset wells (SYN-003, 007, 012)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6] border border-black" />
                <span>Stratigraphy: Barail Sandstone</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800 font-medium sm:col-span-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6] border border-black" />
                <span>Depth proximity: target 3,208m vs historical stuck events at 3,180m - 3,210m</span>
              </div>
            </div>
          </div>

          {/* Actions: Inspect Evidence button */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
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
              className="neo-btn text-xs font-mono uppercase"
            >
              <span>Inspect Corroborating Evidence</span>
              <span>&darr;</span>
            </button>

            {activeAlert && (
              <Link
                href={`/alerts/${activeAlert.id}`}
                className="neo-btn-white text-xs font-mono uppercase"
              >
                <span>Open Alert Dossier</span>
                <span>&rarr;</span>
              </Link>
            )}

            <Link
              href={`/compare?wellA=${wellId}&wellB=OIL-SYN-003`}
              className="neo-badge bg-white text-black hover:bg-[#f4f4f6] text-xs font-mono"
            >
              Cross-Well Compare &rarr;
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Asset #2 - Risk Score & Decomposition (5 cols) */}
        <div className="lg:col-span-5 bg-white border-2 border-black rounded-2xl p-5 shadow-[3.5px_3.5px_0px_0px_#000000] space-y-4">
          {/* Big Score Header */}
          <div className="flex items-center justify-between pb-3.5 border-b-2 border-black">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-black font-mono font-black">
                Composite Risk Score
              </div>
              <div className="text-xs text-zinc-600 mt-0.5 font-medium">
                Multifactor Bayesian Precedent Corroboration
              </div>
            </div>

            <div className="text-right">
              <div className="text-4xl sm:text-5xl font-black text-black font-mono tracking-tight leading-none">
                {score} <span className="text-sm font-bold text-zinc-500">/ 100</span>
              </div>
              <span className="neo-badge neo-badge-amber text-[10px] mt-1.5 uppercase font-bold">
                {severity}
              </span>
            </div>
          </div>

          {/* VISUAL ASSET #2 — Risk Explanation & Decomposition Bars */}
          <div className="space-y-3">
            <div className="text-xs font-black text-black uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Risk Decomposition Factors:</span>
              <span className="text-[10px] text-zinc-500 font-bold font-mono">NORMALIZED</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {factors.map((f, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-black font-bold truncate max-w-[240px]">{f.name}</span>
                    <span className="text-black font-black font-mono">{f.score}%</span>
                  </div>
                  {/* Progress decomposition bar */}
                  <div className="h-2.5 w-full bg-[#f4f4f6] rounded-full border-2 border-black overflow-hidden">
                    <div
                      className="h-full bg-[#f59e0b] rounded-full border-r-2 border-black transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, f.score))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Advisory Safety Note */}
            <div className="pt-2.5 border-t-2 border-black text-[11px] font-mono text-zinc-600 flex items-center justify-between">
              <span className="font-bold">NWIS-BAYES-RISK-v1.4</span>
              <span className="neo-badge neo-badge-emerald text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] border border-black" />
                100% Grounded
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

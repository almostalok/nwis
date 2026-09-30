'use client';

import React, { useState } from 'react';
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
  const [selectedDetailTab, setSelectedDetailTab] = useState<'MITIGATION' | 'PRECEDENTS' | 'GEOMECHANICS' | 'TELEMETRY'>('MITIGATION');
  const [checklist, setChecklist] = useState({
    wobSlump: false,
    rpmIncrease: false,
    spotPill: false,
    mudWeightAdj: false,
    jarArm: false,
    circulate: false,
  });

  const score = riskAssessment?.score ?? activeAlert?.score ?? 79;
  const severity = riskAssessment?.severity ?? activeAlert?.severity ?? 'WARNING';
  const isCritical = severity === 'CRITICAL' || score >= 80;
  const torque = 14.2;
  const rop = 18.2;

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const defaultFactors = [
    { name: 'Torque Anomaly (+24% surge above baseline)', score: 85, weight: 'HIGH' },
    { name: 'ROP Deviation (-25% decay rate over 15m)', score: 72, weight: 'MEDIUM' },
    { name: 'Formation Porosity (Barail Sandstone overbalance)', score: 94, weight: 'GEOLOGY' },
    { name: 'Spatial Proximity (within ±25m MD window)', score: 88, weight: 'SPATIAL' },
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
      className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm font-sans relative overflow-hidden"
      aria-label="ERMTAC Decision Support and Possible Outcomes"
    >
      {/* 1. High-Contrast Warning Banner (Top Header Strip) */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
        isCritical 
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200' 
          : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isCritical ? 'bg-rose-500' : 'bg-amber-500'
            }`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              isCritical ? 'bg-rose-600' : 'bg-amber-600'
            }`} />
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              isCritical
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-amber-600 text-white border-amber-700'
            }`}>
              OPERATIONAL WARNING: STUCK-PIPE PRECURSOR ACTIVE
            </span>
            <span className="text-xs font-mono font-medium">
              Time to irreversible wall freeze: <strong className="underline font-bold">~18 Minutes</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span>Target Well: <strong className="text-zinc-900 dark:text-zinc-100">{wellId}</strong></span>
          <span className="text-zinc-400">|</span>
          <span>Depth: <strong>3,208m MD</strong> (Barail Sand)</span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        
        {/* 2. Primary Finding & Corroborating Signals Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Finding Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-semibold mb-1">
                <span>BAYESIAN PREDICTIVE REASONING</span>
                <span>&bull;</span>
                <span>OIL INDIA ASSAM BASIN ADVISORY</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
                Differential Sticking Precursor in Barail Sandstone
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                ERMTAC telemetry indicates severe torque divergence (+24% surge) accompanied by a -25% penetration decay. Combined with a +38 bar hydrostatic overbalance across permeable Barail Sand, this pattern matches documented sticking incidents in <strong>{precedentCount} nearby offset wells</strong> (OIL-SYN-012, SYN-003, SYN-007).
              </p>
            </div>

            {/* Corroborating Signals 4-Cell Matrix */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                <span>Corroborating Telemetry &amp; Geological Signals</span>
                <span className="text-emerald-600 dark:text-emerald-400">4 / 4 CONGRUENT</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="font-semibold">Torque ↑ +24% (surge to 18.4 kN·m)</span>
                </div>
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  <span className="font-semibold">ROP ↓ -25% decay over last 15m</span>
                </div>
                <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="font-semibold">3 Offset Precedents (SYN-003, 007, 012)</span>
                </div>
                <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                  <span className="font-semibold">Overbalance: +38 bar in Barail Sand</span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="#possible-outcomes-matrix"
                className="h-8 px-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold text-xs rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Review Possible Outcomes Matrix</span>
                <span className="font-mono text-xs">&darr;</span>
              </a>

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
                className="h-8 px-3 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors inline-flex items-center gap-1"
              >
                <span>DDR Evidence &amp; Precedents</span>
                <span className="font-mono text-xs">&rarr;</span>
              </button>

              {activeAlert && (
                <Link
                  href={`/alerts/${activeAlert.id}`}
                  className="h-8 px-3 text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Alert Dossier &rarr;</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Composite Risk Score & Factor Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono font-bold">
                  COMPOSITE RISK INDEX
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Multifactor Bayesian Precedent Model
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">
                  {score} <span className="text-xs font-normal text-zinc-400">/ 100</span>
                </div>
                <span className={`tech-badge text-[10px] mt-1 ${isCritical ? 'tech-badge-rose' : 'tech-badge-amber'}`}>
                  {severity}
                </span>
              </div>
            </div>

            {/* Factor Decomposition Progress Bars */}
            <div className="space-y-2.5">
              <div className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
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
                      <span className="text-zinc-900 dark:text-zinc-100 font-mono font-bold text-xs">
                        {f.score}%
                      </span>
                    </div>
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

              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                <span>OIL INDIA NWIS-BAYES-v1.4</span>
                <span className="tech-badge tech-badge-emerald text-[9px]">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  100% Grounded
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. POSSIBLE OUTCOMES PREDICTIVE MATRIX (3 Color-Coded Engineering Scenarios) */}
        <div id="possible-outcomes-matrix" className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                PREDICTIVE SIMULATION: 3 POSSIBLE OPERATIONAL OUTCOMES
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Engineering Consequence Matrix &amp; Non-Productive Time (NPT) Forecast
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              Evaluated against offset well historical distributions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            {/* OUTCOME A: CATASTROPHIC STUCK PIPE (Rose / Red) */}
            <div className="p-4 rounded-lg border border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-bl">
                78% PROBABILITY
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-xs font-mono font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Outcome A: Unmitigated Freeze</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                  Irreversible Differential Sticking
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  Static filter cake dehydrates. Overbalance force (+38 bar) traps drill collars against borehole wall. Complete loss of rotation and pull.
                </p>
              </div>

              <div className="p-2.5 rounded bg-white/80 dark:bg-zinc-900/80 border border-rose-200 dark:border-rose-900/50 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Projected NPT:</span>
                  <strong className="text-rose-600 dark:text-rose-400 text-sm">124 Hours</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Est. Financial Loss:</span>
                  <strong className="text-rose-600 dark:text-rose-400 font-bold">₹1.85 Crore</strong>
                </div>
                <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  Resolution: Jarring failure &rarr; Chemical soak &rarr; Sever drill pipe &rarr; Sidetrack
                </div>
              </div>
            </div>

            {/* OUTCOME B: SEVERE PACK-OFF (Amber / Orange) */}
            <div className="p-4 rounded-lg border border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-bl">
                45% PROBABILITY
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Outcome B: Delayed Action</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                  Severe Annular Pack-off &amp; Torque Stall
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  Partial cutting evacuation failure and high friction drag. String remains tight with pump pressure spikes and intermittent stalling.
                </p>
              </div>

              <div className="p-2.5 rounded bg-white/80 dark:bg-zinc-900/80 border border-amber-200 dark:border-amber-900/50 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Projected NPT:</span>
                  <strong className="text-amber-600 dark:text-amber-400 text-sm">22 Hours</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Est. Financial Loss:</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-bold">₹34 Lakhs</strong>
                </div>
                <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  Resolution: Reaming pass, high-viscosity pill sweep, washdown to bottom
                </div>
              </div>
            </div>

            {/* OUTCOME C: NOMINAL RECOVERY (Emerald / Green - RECOMMENDED) */}
            <div className="p-4 rounded-lg border-2 border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col justify-between space-y-3 relative overflow-hidden shadow-xs">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-bl">
                96% TARGET SUCCESS
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Outcome C: Immediate Mitigation</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                  Full String Mobility &amp; Nominal Drilling
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  Continuous high-speed rotation, WOB slump &lt;8T, and prompt spotting of 40 bbl low-density lubricant pill prevents differential lock.
                </p>
              </div>

              <div className="p-2.5 rounded bg-white/80 dark:bg-zinc-900/80 border border-emerald-200 dark:border-emerald-900/50 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Projected NPT:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 text-sm">&lt; 1.5 Hours</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Est. Financial Loss:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">₹1.2 Lakhs</strong>
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  Target: Execute standard Oil India Barail SOP Checklist below &darr;
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. "ALL THE DETAILS" TABBED DRILL-DOWN DRAWER */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                COMPLETE ENGINEERING DOSSIER &amp; TECHNICAL DETAILS
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                All Operational Details, SOP Checklist &amp; Corroborating Science
              </h3>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
              <button
                onClick={() => setSelectedDetailTab('MITIGATION')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedDetailTab === 'MITIGATION'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                1. Mitigation SOP Checklist
              </button>
              <button
                onClick={() => setSelectedDetailTab('PRECEDENTS')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedDetailTab === 'PRECEDENTS'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                2. Offset Wells ({precedentCount})
              </button>
              <button
                onClick={() => setSelectedDetailTab('GEOMECHANICS')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedDetailTab === 'GEOMECHANICS'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                3. Overbalance Physics
              </button>
              <button
                onClick={() => setSelectedDetailTab('TELEMETRY')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedDetailTab === 'TELEMETRY'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                4. ERMTAC Packet Log
              </button>
            </div>
          </div>

          {/* TAB 1: MITIGATION SOP CHECKLIST */}
          {selectedDetailTab === 'MITIGATION' && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  STANDARD OPERATING PROCEDURE: DIFFERENTIAL STICKING MITIGATION (OIL-SOP-DR-042)
                </span>
                <span className="text-zinc-500">Assam-Arakan Field Manual v2.1</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                <label className="flex items-start gap-2.5 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400">
                  <input
                    type="checkbox"
                    checked={checklist.wobSlump}
                    onChange={() => toggleCheck('wobSlump')}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">1. Slump WOB to &lt; 8 Tonnes</span>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Relieve axial bit weight to prevent deep embedding in Barail sand face.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400">
                  <input
                    type="checkbox"
                    checked={checklist.rpmIncrease}
                    onChange={() => toggleCheck('rpmIncrease')}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">2. Accelerate Rotation to 120 RPM</span>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Generate hydrodynamic fluid film between drill collars and mud filter cake.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400">
                  <input
                    type="checkbox"
                    checked={checklist.spotPill}
                    onChange={() => toggleCheck('spotPill')}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">3. Spot 40 bbl Lubricant Pill</span>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Pump surfactant/glycol pill across 3,180m–3,230m interval to reduce friction coefficient.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400">
                  <input
                    type="checkbox"
                    checked={checklist.mudWeightAdj}
                    onChange={() => toggleCheck('mudWeightAdj')}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">4. Verify Mud Weight (1.18 SG)</span>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Ensure hydrostatic overbalance does not exceed 40 bar across depleted zone.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400">
                  <input
                    type="checkbox"
                    checked={checklist.jarArm}
                    onChange={() => toggleCheck('jarArm')}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">5. Arm Upward Hydraulic Jar</span>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Pre-calculate maximum overpull limit (65 kN over drag) before activating jar.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400">
                  <input
                    type="checkbox"
                    checked={checklist.circulate}
                    onChange={() => toggleCheck('circulate')}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">6. Bottoms-Up Circulation (2 Cycles)</span>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Evacuate disintegrated sand cuttings before resuming penetration.</p>
                  </div>
                </label>

              </div>
            </div>
          )}

          {/* TAB 2: CORROBORATING PRECEDENTS */}
          {selectedDetailTab === 'PRECEDENTS' && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3 font-mono text-xs">
              <div className="text-zinc-500 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                HISTORICAL CORRELATIONS FROM UPPER ASSAM OIL INDIA DRILLING RECORDS:
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                  <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                    <span>OIL-SYN-012 (Offset: 7.0 km) &bull; Depth: 3,205m MD</span>
                    <span className="text-rose-600 dark:text-rose-400">96 Hours NPT</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 font-sans mt-1 text-[11px]">
                    Differential sticking occurred in identical Barail Sandstone. Rig delayed rotation by 40 minutes while troubleshooting top-drive; pipe froze. Required 96 hours of jarring and surfactant soaking to free string.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                  <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                    <span>OIL-SYN-003 (Offset: 7.7 km) &bull; Depth: 3,210m MD</span>
                    <span className="text-emerald-600 dark:text-emerald-400">2.1 Hours NPT (SUCCESS)</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 font-sans mt-1 text-[11px]">
                    Torque spiked +22% at 3,210m. Drilling engineer immediately accelerated rotation to 120 RPM, reduced WOB, and pumped 35 bbl oil-based lubricant pill. Drillstring cleared in 2.1 hours without damage.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                  <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                    <span>OIL-SYN-007 (Offset: 7.3 km) &bull; Depth: 3,180m MD</span>
                    <span className="text-amber-600 dark:text-amber-400">24 Hours NPT</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 font-sans mt-1 text-[11px]">
                    Tight hole precursor detected during connection. Back-reaming required due to excessive mud filter cake thickness (8mm). Corrected by thinning mud with water-based polymer.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OVERBALANCE PHYSICS */}
          {selectedDetailTab === 'GEOMECHANICS' && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3 font-mono text-xs">
              <div className="text-zinc-500 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                BARAIL FORMATION GEOMECHANICAL OVERBALANCE CALCULATIONS:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                  <div className="text-zinc-400 text-[10px]">Mud Hydrostatic Pressure</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">368.2 bar</div>
                  <div className="text-[10px] text-zinc-500">1.18 SG Mud @ 3,208m</div>
                </div>

                <div className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                  <div className="text-zinc-400 text-[10px]">Formation Pore Pressure</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">330.1 bar</div>
                  <div className="text-[10px] text-zinc-500">Depleted Sand Zone</div>
                </div>

                <div className="p-2.5 bg-white dark:bg-zinc-900 border border-amber-500/40 bg-amber-500/5 rounded">
                  <div className="text-amber-600 dark:text-amber-400 text-[10px]">Differential Overbalance ΔP</div>
                  <div className="text-base font-bold text-amber-600 dark:text-amber-400">+38.1 bar</div>
                  <div className="text-[10px] text-amber-500">Hazard Zone (&gt;30 bar)</div>
                </div>

                <div className="p-2.5 bg-white dark:bg-zinc-900 border border-rose-500/40 bg-rose-500/5 rounded">
                  <div className="text-rose-600 dark:text-rose-400 text-[10px]">Calculated Sticking Force</div>
                  <div className="text-base font-bold text-rose-600 dark:text-rose-400">384 kN</div>
                  <div className="text-[10px] text-rose-500">Exceeds Rig Pull Capacity</div>
                </div>
              </div>

              <div className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                <strong>Physics Insight:</strong> Differential sticking occurs when the drill collars remain stationary against a porous, permeable bed (Barail Sandstone) where the hydrostatic pressure of the drilling mud column exceeds formation pore pressure by &Delta;P. The mud filter cake acts as a low-friction seal, creating a vacuum that clamps the steel pipe against the borehole wall with a force F = &Delta;P &times; Contact Area &times; Friction Coefficient.
              </div>
            </div>
          )}

          {/* TAB 4: ERMTAC TELEMETRY PACKET LOG */}
          {selectedDetailTab === 'TELEMETRY' && (
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2 font-mono text-[11px] text-zinc-300">
              <div className="flex items-center justify-between text-zinc-400 pb-1.5 border-b border-zinc-800 text-[10px]">
                <span>RAW WITSML 1.4.1.1 ETP STREAM CAPTURE &bull; RIG-SYN-07</span>
                <span className="text-cyan-400">ENCRYPTED SSE PIPE</span>
              </div>

              <pre className="p-2.5 bg-black/60 rounded border border-zinc-800/80 overflow-x-auto text-[10px] text-cyan-300 leading-tight">
{`{
  "packetId": "WITSML-07-3208-8472",
  "timestamp": "${new Date().toISOString()}",
  "rigId": "SYN-RIG-07",
  "wellId": "${wellId}",
  "measuredDepth_m": 3208.40,
  "trueVerticalDepth_m": 3142.10,
  "surfaceTorque_kNm": ${torque},
  "torqueVariance_sigma": 2.4,
  "rop_mhr": ${rop},
  "wob_tonnes": 14.5,
  "rpm": 118,
  "standpipePressure_bar": 195.0,
  "flowIn_lpm": 2450.0,
  "flowOut_lpm": 2462.0,
  "formation": "Barail Sandstone",
  "precursorStatus": "ELEVATED_TORQUE_STICKING_PRECURSOR",
  "checksum": "SHA256:8f4c2e...nominal"
}`}
              </pre>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

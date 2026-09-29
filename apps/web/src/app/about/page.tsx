'use client';

import React from 'react';

export default function AboutPage() {
  const stages = [
    {
      num: '01',
      title: 'Foundation & Spatial Data Platform',
      status: 'COMPLETE & VERIFIED',
      desc: 'PostgreSQL + PostGIS spatial engine, canonical well registry (20 OIL synthetic wells), 3D trajectory interpolation, stratigraphic horizon models, and WITSML ingestion pipeline.',
      tests: '35 Passing Tests',
    },
    {
      num: '02',
      title: 'AI Document Intelligence & Precedents',
      status: 'COMPLETE & VERIFIED',
      desc: 'Full NLP/OCR extraction on technical reports (DDR, WCR, Mud Reports), 64-dimensional semantic chunk embeddings, hybrid search (keyword + vector + metadata), and signature Precedent Engine.',
      tests: '37 Passing Tests',
    },
    {
      num: '03',
      title: 'Real-Time Streaming, Anomaly & Risk Engine',
      status: 'COMPLETE & VERIFIED',
      desc: 'RealtimeDrillingAdapter with rolling feature extraction (30s/60s/300s/900s), deterministic Z-Score/MAD anomaly detectors, 5 modular hazard risk engines, Bayesian fusion, and SSE streaming.',
      tests: '44 Passing Tests',
    },
    {
      num: '04',
      title: 'Final Integration, Hardening & Productionization',
      status: 'COMPLETE & VERIFIED',
      desc: 'Complete command center, SIH pitch demonstration mode, model registry & drift monitoring, ISO 19157 data quality governance, executive report generator, and OIL/eRTMAC integration specifications.',
      tests: 'Full Monorepo Build Clean',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider font-mono">
            SIH26121 &bull; Oil India Limited
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider font-mono">
            Technical Architecture
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
          NWIS — Nearby Wells Intelligence System
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
          An industrial-grade, AI-enabled drilling intelligence and historical precedent retrieval platform
          designed to augment Oil India Limited&apos;s real-time monitoring center (eRTMAC) with proactive hazard
          early warnings and decades of institutional memory.
        </p>
      </div>

      {/* Safety & Advisory Disclaimers */}
      <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-5 text-xs text-amber-200 space-y-2">
        <div className="font-bold text-amber-100 uppercase tracking-wider flex items-center space-x-2">
          <span className="text-base">⚠️</span>
          <span>SAFETY PRINCIPLES & DECISION-SUPPORT MANDATE</span>
        </div>
        <p className="leading-relaxed">
          NWIS is strictly a <strong>decision-support advisory system</strong> designed for qualified petroleum
          and drilling engineers. It does <strong>NOT</strong> autonomously command rig equipment, adjust drawworks,
          alter Weight-on-Bit (WOB), or manipulate mud pump strokes. Final operational authority remains
          with the certified Toolpusher, Drilling Superintendent, and OIL Rig Supervisor.
        </p>
      </div>

      {/* Four-Stage Evolution */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Four-Stage Architecture & Implementation Scope
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stages.map((st) => (
            <div key={st.num} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  STAGE {st.num}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {st.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{st.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                Validation: <strong className="text-slate-300">{st.tests}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anti-Hallucination & Provenance Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Anti-Hallucination & Explainability Guarantees
          </h2>
          <ul className="text-xs text-slate-300 space-y-2.5 list-disc list-inside">
            <li>
              <strong>100% Grounded Citations:</strong> Every RAG advisory response is tied directly to verified document chunk IDs, page numbers, and exact text excerpts.
            </li>
            <li>
              <strong>Explicit Confidence Scoring:</strong> Every risk assessment displays an evidence-weighted confidence score (0.0 to 1.0) rather than unverifiable probabilistic claims.
            </li>
            <li>
              <strong>Transparent Factor Attribution:</strong> Alerts break down positive and negative contributing factors (e.g., +28 Overpull, +18 Standpipe Pressure, +35 Barail Coal match).
            </li>
            <li>
              <strong>Deterministic Anomaly Detection:</strong> Telemetry deviations rely on rolling robust MAD and linear slope regression rather than black-box hallucinating neural networks.
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Technical Stack & Deployment Architecture
          </h2>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Database:</span>
              <span className="text-slate-200">PostgreSQL 16 + PostGIS + Prisma ORM</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Backend API:</span>
              <span className="text-slate-200">NestJS 10 (TypeScript, RxJS SSE, Swagger)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Frontend Command:</span>
              <span className="text-slate-200">Next.js 15 (React 19, Tailwind CSS)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Monorepo Tooling:</span>
              <span className="text-slate-200">Turborepo, pnpm workspaces</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Containerization:</span>
              <span className="text-slate-200">Multi-stage Docker, Docker Compose</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

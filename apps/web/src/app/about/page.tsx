'use client';

import React from 'react';
import Link from 'next/link';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-zinc-500 mb-1">
          <Link href="/dashboard" className="text-blue-700 hover:underline">
            ← Command Center
          </Link>
          <span>/</span>
          <span className="text-black font-bold">About NWIS</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#d1fae5] text-[#064e3b] border-2 border-black uppercase tracking-wider font-mono shadow-[2px_2px_0px_0px_#000]">
            SIH26121 &bull; Oil India Limited
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#dbeafe] text-[#1e3a8a] border-2 border-black uppercase tracking-wider font-mono shadow-[2px_2px_0px_0px_#000]">
            Technical Architecture
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-3">
          NWIS — Nearby Wells Intelligence System
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-3xl mt-2 leading-relaxed font-semibold">
          An industrial-grade, AI-enabled drilling intelligence and historical precedent retrieval platform
          designed to augment Oil India Limited&apos;s real-time monitoring center (eRTMAC) with proactive hazard
          early warnings and decades of institutional memory.
        </p>
      </div>

      {/* Safety & Advisory Disclaimers */}
      <div className="bg-[#fffbeb] border-2 border-black rounded-2xl p-6 text-xs text-black space-y-2 shadow-[4px_4px_0px_0px_#000]">
        <div className="font-black text-[#78350f] uppercase tracking-wider flex items-center space-x-2 font-mono">
          <span className="text-base">⚠️</span>
          <span>SAFETY PRINCIPLES &amp; DECISION-SUPPORT MANDATE</span>
        </div>
        <p className="leading-relaxed font-semibold">
          NWIS is strictly a <strong>decision-support advisory system</strong> designed for qualified petroleum
          and drilling engineers. It does <strong>NOT</strong> autonomously command rig equipment, adjust drawworks,
          alter Weight-on-Bit (WOB), or manipulate mud pump strokes. Final operational authority remains
          with the certified Toolpusher, Drilling Superintendent, and OIL Rig Supervisor.
        </p>
      </div>

      {/* Four-Stage Evolution */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <h2 className="text-xs font-black text-black uppercase tracking-wider font-mono">
            Four-Stage Architecture &amp; Implementation Scope
          </h2>
          <span className="text-xs font-black text-[#064e3b] bg-[#d1fae5] px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            100% Production Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stages.map((st) => (
            <div key={st.num} className="bg-[#f8f9fa] p-5 rounded-xl border-2 border-black space-y-2 shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#1e3a8a]">
                  STAGE {st.num}
                </span>
                <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-[#d1fae5] text-[#064e3b] border border-black">
                  {st.status}
                </span>
              </div>
              <h3 className="text-sm font-black text-black">{st.title}</h3>
              <p className="text-xs text-zinc-700 leading-relaxed font-medium">{st.desc}</p>
              <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t-2 border-black/10 font-bold">
                Validation: <strong className="text-black font-black">{st.tests}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anti-Hallucination & Provenance Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-3">
          <h2 className="text-xs font-black text-black uppercase tracking-wider font-mono">
            Anti-Hallucination &amp; Explainability Guarantees
          </h2>
          <ul className="text-xs text-zinc-800 space-y-2.5 leading-relaxed font-semibold">
            <li className="flex items-start gap-2">
              <span className="text-[#064e3b] font-black mt-0.5">✓</span>
              <span><strong className="text-black">100% Grounded Citations:</strong> Every RAG advisory response is tied directly to verified document chunk IDs, page numbers, and exact text excerpts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#064e3b] font-black mt-0.5">✓</span>
              <span><strong className="text-black">Explicit Confidence Scoring:</strong> Every risk assessment displays an evidence-weighted confidence score (0.0 to 1.0) rather than unverifiable probabilistic claims.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#064e3b] font-black mt-0.5">✓</span>
              <span><strong className="text-black">Transparent Factor Attribution:</strong> Alerts break down positive and negative contributing factors (e.g., +28 Overpull, +18 Standpipe Pressure, +35 Barail Coal match).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#064e3b] font-black mt-0.5">✓</span>
              <span><strong className="text-black">Deterministic Anomaly Detection:</strong> Telemetry deviations rely on rolling robust MAD and linear slope regression rather than black-box hallucinating neural networks.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-3">
          <h2 className="text-xs font-black text-black uppercase tracking-wider font-mono">
            Technical Stack &amp; Deployment Architecture
          </h2>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-3 rounded-xl bg-[#f8f9fa] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <span className="text-zinc-600 font-bold">Database:</span>
              <span className="text-black font-black">PostgreSQL 16 + PostGIS + Prisma</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#f8f9fa] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <span className="text-zinc-600 font-bold">Backend API:</span>
              <span className="text-black font-black">NestJS 10 (TypeScript, RxJS SSE, Swagger)</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#f8f9fa] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <span className="text-zinc-600 font-bold">Frontend Command:</span>
              <span className="text-black font-black">Next.js 15 (React 19, Tailwind CSS)</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#f8f9fa] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <span className="text-zinc-600 font-bold">Monorepo Tooling:</span>
              <span className="text-black font-black">Turborepo, pnpm workspaces</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-[#f8f9fa] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <span className="text-zinc-600 font-bold">Containerization:</span>
              <span className="text-black font-black">Multi-stage Docker, Docker Compose</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

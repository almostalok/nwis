'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface EvidenceDocument {
  id: string;
  type: string;
  wellId: string;
  title: string;
  depth: number;
  event: string;
  formation: string;
  page: number;
  date: string;
  confidence: number;
  author: string;
  verifiedBy: string;
  rawExcerpt: string;
  highlights: {
    event: string;
    depth: string;
    formation: string;
    conditions: string;
    action: string;
  };
}

export function EvidencePanel() {
  const [selectedDoc, setSelectedDoc] = useState<EvidenceDocument | null>(null);

  const evidenceItems: EvidenceDocument[] = [
    {
      id: 'DDR-003',
      type: 'DAILY DRILLING REPORT (DDR)',
      wellId: 'OIL-SYN-003',
      title: 'OIL Operations Daily Report — Well 003',
      depth: 3210,
      event: 'STUCK PIPE (HIGH SEVERITY)',
      formation: 'Barail Sandstone',
      page: 1,
      date: '15-APR-2023',
      confidence: 0.99,
      author: 'P. K. Gogoi (Tour Pusher)',
      verifiedBy: 'S. K. Saikia (Senior Drilling Engineer)',
      rawExcerpt: `Well ID: OIL-SYN-003 | Depth: 3210 m MD | Barail Sandstone\n` +
        `Observed gradual increase in rotary torque from 11.5 to 18.4 kN.m.\n` +
        `Torque spiked sharply to 34.5 kN.m (top drive stalled at 40 RPM).\n` +
        `ROP decayed progressively from 14.5 m/h to 4.1 m/h.\n` +
        `INCIDENT: STUCK_PIPE declared. Overpull reached 60 tonnes above normal string weight.\n` +
        `Root Cause: Differential sticking across high-permeability Barail Sandstone interval aggravated by reactive carbonaceous shale fragments.\n` +
        `Mitigation: Mixed and spotted 12 m3 organic oil-based lubricant soaking pill across BHA depth interval (3150 - 3210 m). Controlled jarring operations.`,
      highlights: {
        event: 'INCIDENT: STUCK_PIPE (Declared at 12:00)',
        depth: '3,210 m MD / 3,192 m TVD',
        formation: 'Barail Sandstone (carbonaceous shale interbeds)',
        conditions: 'Torque spiked from 11.5 to 34.5 kN.m; ROP dropped 14.5 to 4.1 m/h; 60 tonnes overpull',
        action: 'Spotted 12 m3 organic oil-based lubricant soaking pill across BHA; jarred with 6-1/2" hydraulic jars',
      },
    },
    {
      id: 'DDR-007',
      type: 'DAILY DRILLING REPORT (DDR)',
      wellId: 'OIL-SYN-007',
      title: 'OIL Operations Daily Report — Well 007',
      depth: 3180,
      event: 'STUCK PIPE (HIGH SEVERITY)',
      formation: 'Barail Sandstone',
      page: 1,
      date: '06-OCT-2023',
      confidence: 0.98,
      author: 'A. Borah (Toolpusher)',
      verifiedBy: 'N. C. Das (Lead Drilling Engineer)',
      rawExcerpt: `Well ID: OIL-SYN-007 | Depth: 3180 m MD | Barail Sandstone\n` +
        `Drillstring stuck at 3180m MD in Barail Sandstone carbonaceous shale interval during connection.\n` +
        `Erratic torque and severe drag preceded sticking (+40 tonnes overpull).\n` +
        `Mitigation: Pumped 10 m3 lubricating hydrocarbon pill. Jarred down repeatedly with 40-tonne impacts; rotated string after 36 hours of soaking.`,
      highlights: {
        event: 'STUCK PIPE DURING CONNECTION',
        depth: '3,180 m MD / 3,160 m TVD',
        formation: 'Barail Sandstone (reactive shale boundary)',
        conditions: 'Erratic torque fluctuations, +40 tonnes overpull during pickup',
        action: 'Pumped 10 m3 lubricating hydrocarbon pill, continuous 40-tonne jarring impacts',
      },
    },
    {
      id: 'DDR-012',
      type: 'DAILY DRILLING REPORT (DDR)',
      wellId: 'OIL-SYN-012',
      title: 'OIL Operations Daily Report — Well 012',
      depth: 3205,
      event: 'STUCK PIPE (HIGH SEVERITY)',
      formation: 'Barail Sandstone',
      page: 2,
      date: '19-JAN-2024',
      confidence: 0.97,
      author: 'M. Sharma (Night Toolpusher)',
      verifiedBy: 'R. K. Hazarika (Operations Superintendent)',
      rawExcerpt: `Well ID: OIL-SYN-012 | Depth: 3205 m MD | Barail Sandstone\n` +
        `Precursor signature mirrored OIL-SYN-003 and OIL-SYN-007:\n` +
        `Torque accelerated from 11.2 kN.m baseline to 33.8 kN.m.\n` +
        `ROP dropped from 14.8 m/h to 0.6 m/h within 45 minutes.\n` +
        `Rotary table bogged down at 35 RPM; string locked tight upon connection pickup.\n` +
        `Mitigation: Spotted 14 m3 low-viscosity surfactant soaking pill, applied continuous jarring. Freed after 45h.`,
      highlights: {
        event: 'RECURRENT STUCK PIPE IN SAME FAULT BLOCK',
        depth: '3,205 m MD',
        formation: 'Barail Sandstone Reservoir Margin',
        conditions: 'Torque accelerated 11.2 to 33.8 kN.m; ROP collapsed to 0.6 m/h',
        action: 'Spotted 14 m3 surfactant soaking pill with intermittent circulation',
      },
    },
  ];

  return (
    <section id="evidence-section" className="bg-white border-2 border-black rounded-2xl p-5 lg:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-5 font-sans" aria-label="Extracted Technical Evidence">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black">
        <div>
          <h2 className="text-xs font-black tracking-wider text-black uppercase font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-black" />
            Document Intelligence Evidence (DDR &amp; WCR Records)
          </h2>
          <p className="text-xs text-zinc-700 mt-0.5 font-medium">
            Verified technical excerpts with contextual highlighting extracted from canonical OIL drilling dossiers
          </p>
        </div>

        <Link
          id="btn-open-documents"
          href="/documents"
          className="neo-btn-white text-xs font-mono font-bold"
        >
          <span>Open Document Center</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Grid of Realistic Document Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {evidenceItems.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="group relative bg-white border-2 border-black rounded-2xl p-5 shadow-[3.5px_3.5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000000] transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Engineering Document Header */}
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b-2 border-black text-xs font-mono">
                <span className="font-black text-black tracking-wide text-[11px] uppercase">
                  Oil India Limited
                </span>
                <span className="px-2 py-0.5 bg-[#f4f4f6] text-black rounded-md text-[10px] font-bold border border-black">
                  Page {String(doc.page).padStart(2, '0')}
                </span>
              </div>

              {/* Title & Metadata */}
              <div className="mt-3">
                <div className="text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-wider">{doc.type}</div>
                <div className="text-base font-black text-black font-mono">
                  {doc.wellId}
                </div>
                <div className="text-xs font-mono text-[#d97706] font-black mt-0.5">
                  Depth: {doc.depth.toLocaleString()} m MD
                </div>
              </div>

              {/* Extracted Evidence Excerpt with Highlights */}
              <div className="mt-3.5 p-3 bg-[#fef3c7] border-2 border-black rounded-xl text-xs space-y-2 text-black shadow-[1.5px_1.5px_0px_0px_#000]">
                <div className="text-[10px] uppercase tracking-wider text-black font-mono font-black">
                  Extracted Advisory Evidence:
                </div>

                <div className="space-y-1.5 font-sans">
                  <div>
                    <span className="text-zinc-600 text-[10px] uppercase font-bold font-mono">Event: </span>
                    <mark className="bg-[#facc15] text-black px-1.5 py-0.5 rounded border border-black font-bold text-xs">
                      {doc.highlights.event}
                    </mark>
                  </div>

                  <div>
                    <span className="text-zinc-600 text-[10px] uppercase font-bold font-mono">Strata: </span>
                    <mark className="bg-[#93c5fd] text-black px-1.5 py-0.5 rounded border border-black font-bold text-xs">
                      {doc.highlights.formation}
                    </mark>
                  </div>

                  <div className="text-xs text-zinc-800 font-medium">
                    <span className="text-zinc-600 text-[10px] uppercase font-bold font-mono">Signals: </span>
                    {doc.highlights.conditions}
                  </div>

                  <div className="pt-1.5 border-t border-black/30">
                    <span className="text-zinc-600 text-[10px] uppercase font-bold font-mono">Action Taken: </span>
                    <mark className="bg-[#6ee7b7] text-black px-1.5 py-0.5 rounded border border-black font-bold text-xs">
                      {doc.highlights.action}
                    </mark>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Provenance */}
            <div className="mt-3.5 pt-2.5 border-t-2 border-black flex items-center justify-between text-xs font-mono font-bold text-black">
              <span>OCR: {Math.round(doc.confidence * 100)}%</span>
              <span className="text-black underline flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Inspect Record</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Modal for Detailed Document Inspection */}
      {selectedDoc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-100"
        >
          <div className="bg-white border-2 border-black max-w-2xl w-full p-6 sm:p-7 rounded-3xl shadow-[8px_8px_0px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-black">
              <div>
                <span className="neo-badge neo-badge-amber text-[10px] uppercase">
                  OIL Technical Archive &bull; Canonical DDR
                </span>
                <h3 className="text-xl font-black text-black mt-1 font-mono">
                  {selectedDoc.type} — {selectedDoc.wellId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="w-8 h-8 rounded-full bg-black text-white hover:bg-zinc-800 flex items-center justify-center font-bold text-sm border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Document Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-[#f4f4f6] p-3.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono">
              <div>
                <span className="text-zinc-600 block text-[10px] uppercase font-bold">Well:</span>
                <strong className="text-black font-black">{selectedDoc.wellId}</strong>
              </div>
              <div>
                <span className="text-zinc-600 block text-[10px] uppercase font-bold">Depth:</span>
                <strong className="text-[#b45309] font-black">{selectedDoc.depth}m MD</strong>
              </div>
              <div>
                <span className="text-zinc-600 block text-[10px] uppercase font-bold">Date:</span>
                <strong className="text-black font-black">{selectedDoc.date}</strong>
              </div>
              <div>
                <span className="text-zinc-600 block text-[10px] uppercase font-bold">Confidence:</span>
                <strong className="text-[#065f46] font-black">{(selectedDoc.confidence * 100).toFixed(0)}% OCR</strong>
              </div>
            </div>

            {/* Raw Excerpt with Yellow Highlights */}
            <div className="space-y-1.5">
              <div className="text-xs font-black text-black uppercase tracking-wider font-mono">
                Daily Drilling Log Transcript:
              </div>
              <pre className="p-4 bg-[#f4f4f6] rounded-2xl border-2 border-black text-xs text-black whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto shadow-inner">
                {selectedDoc.rawExcerpt}
              </pre>
            </div>

            {/* Verified Personnel Sign-off */}
            <div className="pt-2 border-t-2 border-black flex items-center justify-between text-xs text-black font-mono font-bold">
              <span>Author: <strong>{selectedDoc.author}</strong></span>
              <span>Verified: <strong className="text-[#065f46]">{selectedDoc.verifiedBy}</strong></span>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex justify-end gap-3">
              <Link
                href="/documents"
                className="neo-btn text-xs font-mono uppercase"
              >
                Open in Full Document Center &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

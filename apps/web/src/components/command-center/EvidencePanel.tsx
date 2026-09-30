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
    <section id="evidence-section" className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 font-sans" aria-label="Extracted Technical Evidence">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 className="text-xs font-mono font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Document Intelligence Evidence (DDR &amp; WCR Records)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Verified technical excerpts with contextual highlighting extracted from canonical OIL drilling dossiers
          </p>
        </div>

        <Link
          id="btn-open-documents"
          href="/documents"
          className="h-7 px-3 text-xs font-mono font-medium rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors inline-flex items-center gap-1"
        >
          <span>Document Center</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Grid of Document Dossier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {evidenceItems.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="group relative bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60 text-xs font-mono">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[10px] uppercase">
                  Oil India Limited
                </span>
                <span className="px-1.5 py-0.2 bg-white dark:bg-zinc-800 text-zinc-500 rounded text-[9px] border border-zinc-200 dark:border-zinc-700">
                  Page {String(doc.page).padStart(2, '0')}
                </span>
              </div>

              {/* Title & Metadata */}
              <div className="mt-2.5">
                <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">{doc.type}</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {doc.wellId}
                </div>
                <div className="text-xs font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  Depth: {doc.depth.toLocaleString()} m MD
                </div>
              </div>

              {/* Highlighted Evidence */}
              <div className="mt-3 p-3 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                  Extracted Advisory Evidence:
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-zinc-400 text-[10px] font-mono">Event: </span>
                    <span className="tech-badge tech-badge-rose text-[10px]">
                      {doc.highlights.event}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 text-[10px] font-mono">Strata: </span>
                    <span className="tech-badge tech-badge-amber text-[10px]">
                      {doc.highlights.formation}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                    <span className="text-zinc-400 text-[10px] font-mono block">Precursor:</span>
                    {doc.highlights.conditions}
                  </div>

                  <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-400 text-[10px] font-mono block">Documented Action:</span>
                    <span className="tech-badge tech-badge-emerald text-[10px] mt-0.5 inline-block">
                      {doc.highlights.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>{(doc.confidence * 100).toFixed(0)}% Confidence</span>
              <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                Inspect Document &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog for Full DDR Inspection */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="tech-badge tech-badge-blue text-[10px]">
                  {selectedDoc.type}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-zinc-400 block text-[10px]">Well:</span>
                <span className="font-bold">{selectedDoc.wellId}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Interval:</span>
                <span className="font-bold">{selectedDoc.depth}m MD</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Date:</span>
                <span>{selectedDoc.date}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Confidence:</span>
                <span className="text-emerald-600 font-bold">{(selectedDoc.confidence * 100).toFixed(0)}% Match</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold mb-1">
                Canonical Report Excerpt:
              </h4>
              <pre className="p-3.5 bg-zinc-900 text-zinc-100 rounded-lg text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
                {selectedDoc.rawExcerpt}
              </pre>
            </div>

            <div className="flex justify-between items-center text-xs text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800 font-mono">
              <span>Author: {selectedDoc.author}</span>
              <span>Verified: {selectedDoc.verifiedBy}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

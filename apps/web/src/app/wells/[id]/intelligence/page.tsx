'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';

export default function WellIntelligencePage() {
  const params = useParams();
  const router = useRouter();
  const wellId = params.id as string;

  const [well, setWell] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [similarWells, setSimilarWells] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Precedent Engine State
  const [targetDepth, setTargetDepth] = useState<number>(3200);
  const [targetFormation, setTargetFormation] = useState<string>('Barail Sandstone');
  const [simTorque, setSimTorque] = useState<number>(34);
  const [simRop, setSimRop] = useState<number>(4);
  const [precedentResult, setPrecedentResult] = useState<any>(null);
  const [precedentLoading, setPrecedentLoading] = useState(false);

  // AI Assistant State
  const [chatQuestion, setChatQuestion] = useState<string>('What happened in comparable wells around the current depth?');
  const [chatResponse, setChatResponse] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [wellData, summaryData, nearbyData, timelineData] = await Promise.all([
          api.wells.getById(wellId),
          api.intelligence.getSummary(wellId).catch(() => null),
          api.intelligence.getNearby(wellId, 5).catch(() => []),
          api.intelligence.getTimeline(wellId).catch(() => null),
        ]);

        setWell(wellData);
        setSummary(summaryData);
        setSimilarWells(nearbyData || []);
        setTimeline(timelineData);

        // Auto-run precedent detection on initial load
        runPrecedentEngine(wellData?.wellId || wellId, 3200, 'Barail Sandstone', 34, 4);
      } catch (err) {
        console.error('Failed to load well intelligence:', err);
      } finally {
        setLoading(false);
      }
    }

    if (wellId) {
      loadData();
    }
  }, [wellId]);

  const runPrecedentEngine = async (
    targetWellCode: string,
    depth: number,
    formation: string,
    torque: number,
    rop: number,
  ) => {
    setPrecedentLoading(true);
    try {
      const res = await api.intelligence.precedents({
        wellId: targetWellCode,
        targetDepth: depth,
        formationName: formation,
        parameters: { torque, rop },
      });
      setPrecedentResult(res);
    } catch (err: any) {
      console.error('Precedent engine failed:', err);
    } finally {
      setPrecedentLoading(false);
    }
  };

  const handleAskAI = async () => {
    if (!chatQuestion.trim()) return;
    setChatLoading(true);
    try {
      const res = await api.intelligence.ask({
        question: chatQuestion,
        currentWellId: well?.wellId || wellId,
        currentDepth: targetDepth,
        currentFormation: targetFormation,
      });
      setChatResponse(res);
    } catch (err: any) {
      console.error('RAG query failed:', err);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading AI Drilling Intelligence & Historical Evidence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-petro-800 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <a href="/wells" className="hover:text-emerald-400">Wells</a>
            <span>/</span>
            <a href={`/wells/${wellId}`} className="hover:text-emerald-400">{well?.wellId}</a>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">Historical Intelligence</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{well?.name}</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              {well?.wellId}
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-petro-800 text-slate-300 border border-petro-700">
              {well?.field}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={`/wells/${wellId}`}
            className="px-3 py-1.5 text-xs rounded bg-petro-800 hover:bg-petro-700 text-slate-200 border border-petro-700 font-medium"
          >
            ← Standard Dossier
          </a>
          <a
            href={`/compare?wellA=${well?.wellId}&wellB=OIL-SYN-003`}
            className="px-3 py-1.5 text-xs rounded bg-indigo-700 hover:bg-indigo-600 text-white font-medium shadow-sm"
          >
            Compare Offset Wells →
          </a>
        </div>
      </div>

      {/* Grid: Left Column Summary & Precedent Engine / Right Column AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Well Intelligence Summary (Section 41) */}
          <div className="bg-petro-900 border border-petro-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span>Well Intelligence Summary</span>
              <span className="text-xs font-normal text-emerald-400">Institutional Memory</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
                <span className="text-xs text-slate-400 block">Total Depth</span>
                <span className="text-lg font-bold text-white font-mono">{well?.totalDepth} m</span>
              </div>
              <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
                <span className="text-xs text-slate-400 block">Formations</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {summary?.formations?.length || well?.formations?.length || 0}
                </span>
              </div>
              <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
                <span className="text-xs text-slate-400 block">Major Risk Events</span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  {summary?.majorEvents?.reduce((acc: number, e: any) => acc + e.count, 0) || 0}
                </span>
              </div>
              <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
                <span className="text-xs text-slate-400 block">Comparable Wells</span>
                <span className="text-lg font-bold text-indigo-400 font-mono">
                  {similarWells?.length || 5} Offset
                </span>
              </div>
            </div>

            {/* Risk Intervals */}
            {summary?.riskIntervals && summary.riskIntervals.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Identified Historical Risk Intervals
                </h3>
                <div className="space-y-2">
                  {summary.riskIntervals.map((ri: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-petro-950 px-3 py-2 rounded border border-petro-800 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span className="font-mono text-slate-200">
                          {ri.startDepth}m – {ri.endDepth}m
                        </span>
                        <span className="text-slate-400">({ri.formation})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {ri.riskFactor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Signature Precedent Engine (Sections 32-34 & 58, 61) */}
          <div className="bg-petro-900 border border-emerald-900/60 rounded-xl p-6 shadow-md shadow-emerald-950/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-emerald-400">⚡</span>
                  <span>Precedent Engine — Scenario Analysis</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  "Has a comparable operational situation happened before in offset wells?"
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                Stage 02 Engine
              </span>
            </div>

            {/* Parameter Simulation Controls */}
            <div className="bg-petro-950 border border-petro-800 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Depth (m)</label>
                <input
                  type="number"
                  value={targetDepth}
                  onChange={(e) => setTargetDepth(Number(e.target.value))}
                  className="w-full bg-petro-900 border border-petro-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Formation</label>
                <input
                  type="text"
                  value={targetFormation}
                  onChange={(e) => setTargetFormation(e.target.value)}
                  className="w-full bg-petro-900 border border-petro-700 rounded px-2.5 py-1 text-xs text-white focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Observed Torque (kN.m)</label>
                <input
                  type="number"
                  value={simTorque}
                  onChange={(e) => setSimTorque(Number(e.target.value))}
                  className="w-full bg-petro-900 border border-petro-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Observed ROP (m/h)</label>
                <input
                  type="number"
                  value={simRop}
                  onChange={(e) => setSimRop(Number(e.target.value))}
                  className="w-full bg-petro-900 border border-petro-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-4 flex justify-end">
                <button
                  onClick={() =>
                    runPrecedentEngine(
                      well?.wellId || wellId,
                      targetDepth,
                      targetFormation,
                      simTorque,
                      simRop,
                    )
                  }
                  disabled={precedentLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition-colors flex items-center space-x-2"
                >
                  {precedentLoading ? 'Correlating Offset Wells...' : 'Detect Historical Precedents'}
                </button>
              </div>
            </div>

            {/* Precedent Results Display */}
            {precedentResult && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs text-amber-200">
                  <span className="font-bold block mb-1">
                    {precedentResult.summary}
                  </span>
                  <span className="text-amber-300/80 text-[11px]">
                    Analysis incorporates multi-well formation overlap, depth correlation (+/- 80m), and precursor parameter trends (Torque Spike & ROP Decay).
                  </span>
                </div>

                <div className="space-y-3">
                  {precedentResult.precedents?.map((prec: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-petro-950 border border-petro-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{prec.wellId}</span>
                            <span className="text-xs text-slate-400 font-mono">({prec.distanceKm} km away)</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              {prec.eventType}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">
                            Occurred at depth <strong className="text-white">{prec.depth}m</strong> in {prec.formation}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-emerald-400 font-mono">
                            {(prec.similarityScore * 100).toFixed(0)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block uppercase">Similarity</span>
                        </div>
                      </div>

                      {/* Explanation bullets */}
                      <ul className="text-xs text-slate-300 space-y-1 mb-3 bg-petro-900/60 p-2.5 rounded border border-petro-800">
                        {prec.relevanceExplanation?.map((exp: string, expIdx: number) => (
                          <li key={expIdx} className="flex items-center space-x-2">
                            <span className="text-emerald-400">✓</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Mitigation & Outcome */}
                      {prec.mitigation && (
                        <div className="text-xs text-slate-300 mb-3 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                          <span className="text-slate-400 font-semibold block text-[11px] uppercase">
                            Operational Action Taken:
                          </span>
                          <p className="mt-0.5 text-slate-200">{prec.mitigation}</p>
                        </div>
                      )}

                      {/* Document Citations & Evidence (Section 50) */}
                      {prec.evidence && prec.evidence.length > 0 && (
                        <div className="border-t border-petro-800/80 pt-2.5 mt-2">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Corroborating Document Evidence:
                          </span>
                          <div className="space-y-1.5">
                            {prec.evidence.map((evi: any, eviIdx: number) => (
                              <div
                                key={eviIdx}
                                className="bg-petro-900 p-2 rounded border border-petro-800 text-[11px] text-slate-300 flex items-start justify-between"
                              >
                                <div>
                                  <span className="font-semibold text-emerald-400 block">
                                    📄 {evi.documentTitle} (Page {evi.pageNumber})
                                  </span>
                                  <p className="text-slate-400 italic mt-0.5">
                                    "{evi.textExcerpt?.slice(0, 140)}..."
                                  </p>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 ml-2">
                                  {evi.fileName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Most Relevant Offset Wells (Section 46) */}
          <div className="bg-petro-900 border border-petro-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white mb-4">Most Relevant Offset Wells</h2>
            <div className="space-y-3">
              {similarWells.map((cand: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-petro-950 p-4 rounded-lg border border-petro-800 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{cand.candidateWellName}</span>
                      <span className="text-xs font-mono text-slate-400">({cand.distanceKm} km)</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {cand.sharedFormations?.slice(0, 2).map((sf: string, sfIdx: number) => (
                        <span
                          key={sfIdx}
                          className="px-2 py-0.5 rounded text-[10px] bg-petro-900 text-slate-300 border border-petro-800"
                        >
                          {sf}
                        </span>
                      ))}
                      {cand.riskEventsCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                          {cand.riskEventsCount} Risk Events
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-lg font-bold text-emerald-400 font-mono">
                        {(cand.overallSimilarity * 100).toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase">Similarity</span>
                    </div>
                    <a
                      href={`/compare?wellA=${well?.wellId}&wellB=${cand.targetWellId === well?.id ? cand.candidateWellId : cand.targetWellId}`}
                      className="px-3 py-1.5 bg-petro-800 hover:bg-petro-700 text-xs text-slate-200 border border-petro-700 rounded font-medium transition-colors"
                    >
                      Compare
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Grounded AI Assistant (Section 49 & 50) */}
        <div className="space-y-6">
          <div className="bg-petro-900 border border-emerald-900/60 rounded-xl p-6 shadow-md shadow-emerald-950/20 sticky top-24">
            <div className="flex items-center justify-between border-b border-petro-800 pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>🤖</span>
                  <span>Grounded Drilling Assistant</span>
                </h2>
                <span className="text-[11px] text-slate-400">
                  Strictly grounded in NWIS drilling reports
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                Zero Hallucination
              </span>
            </div>

            {/* Quick Questions */}
            <div className="space-y-1.5 mb-4">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase">Quick Queries:</span>
              <button
                onClick={() =>
                  setChatQuestion(
                    'What happened in comparable wells around the current depth in Barail Sandstone?',
                  )
                }
                className="w-full text-left text-xs bg-petro-950 hover:bg-petro-800 p-2 rounded border border-petro-800 text-slate-300 transition-colors"
              >
                "What happened in comparable wells around 3200m?"
              </button>
              <button
                onClick={() =>
                  setChatQuestion(
                    'Which wells experienced stuck pipe in Barail formation and what was the mitigation?',
                  )
                }
                className="w-full text-left text-xs bg-petro-950 hover:bg-petro-800 p-2 rounded border border-petro-800 text-slate-300 transition-colors"
              >
                "What was the mitigation for stuck pipe in Barail?"
              </button>
              <button
                onClick={() =>
                  setChatQuestion(
                    'What happened in well OIL-SYN-999?',
                  )
                }
                className="w-full text-left text-xs bg-rose-950/30 hover:bg-rose-900/40 p-2 rounded border border-rose-900/40 text-rose-300 transition-colors"
              >
                "Test anti-hallucination: OIL-SYN-999"
              </button>
            </div>

            {/* Question Input */}
            <div className="space-y-3 mb-6">
              <textarea
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                rows={3}
                className="w-full bg-petro-950 border border-petro-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Ask about historical precedents, mud losses, stuck pipe..."
              />
              <button
                onClick={handleAskAI}
                disabled={chatLoading}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition-colors"
              >
                {chatLoading ? 'Retrieving Evidence & Synthesizing...' : 'Ask Drilling Assistant'}
              </button>
            </div>

            {/* AI Response Card */}
            {chatResponse && (
              <div className="space-y-4">
                <div
                  className={`p-3.5 rounded-lg border text-xs ${
                    chatResponse.grounded
                      ? 'bg-petro-950 border-emerald-900/60 text-slate-200'
                      : 'bg-rose-950/40 border-rose-900/60 text-rose-200'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed mb-3">
                    {chatResponse.answer}
                  </div>

                  {/* Evidence Citations */}
                  {chatResponse.evidenceSources && chatResponse.evidenceSources.length > 0 && (
                    <div className="border-t border-petro-800 pt-2.5">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                        Verified Sources ({chatResponse.evidenceSources.length}):
                      </span>
                      <div className="space-y-1.5">
                        {chatResponse.evidenceSources.map((src: any, srcIdx: number) => (
                          <div
                            key={srcIdx}
                            className="bg-petro-900 p-2 rounded border border-petro-800 text-[11px]"
                          >
                            <span className="font-semibold text-emerald-400 block">
                              📄 {src.documentTitle} (Page {src.pageNumber})
                            </span>
                            <span className="text-slate-400 text-[10px] block">
                              File: {src.fileName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

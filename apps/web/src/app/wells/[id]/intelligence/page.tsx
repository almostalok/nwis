'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';

export default function WellIntelligencePage() {
  const params = useParams();
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-zinc-600">
        <div className="inline-block w-8 h-8 border-4 border-black border-t-[#2563eb] rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono font-bold">Loading AI Drilling Intelligence & Historical Evidence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-zinc-500 mb-1">
            <Link href="/dashboard" className="text-blue-700 hover:underline">
              ← Command Center
            </Link>
            <span>/</span>
            <Link href="/wells" className="text-zinc-600 hover:underline">Wells</Link>
            <span>/</span>
            <Link href={`/wells/${wellId}`} className="text-zinc-600 hover:underline">{well?.wellId}</Link>
            <span>/</span>
            <span className="text-black font-bold">Historical Intelligence</span>
          </div>

          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-black tracking-tight">{well?.name}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {well?.wellId}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f8f9fa] text-black border-2 border-black">
              {well?.field}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/wells/${wellId}`}
            className="px-4 py-2 text-xs rounded-xl bg-white hover:bg-zinc-100 text-black border-2 border-black font-bold shadow-[2px_2px_0px_0px_#000] transition-all"
          >
            ← Standard Dossier
          </Link>
          <Link
            href={`/compare?wellA=${well?.wellId}&wellB=OIL-SYN-003`}
            className="px-4 py-2 text-xs rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all"
          >
            Compare Offset Wells →
          </Link>
        </div>
      </div>

      {/* Grid: Left Column Summary & Precedent Engine / Right Column AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Well Intelligence Summary */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
            <h2 className="text-base font-black text-black mb-4 flex items-center justify-between">
              <span>Well Intelligence Summary</span>
              <span className="text-xs font-mono font-bold bg-[#d1fae5] text-[#064e3b] px-3 py-1 rounded-full border border-black">
                Institutional Memory
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase block">Total Depth</span>
                <span className="text-xl font-black text-black font-mono mt-1 block">{well?.totalDepth} m</span>
              </div>
              <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase block">Formations</span>
                <span className="text-xl font-black text-[#064e3b] font-mono mt-1 block">
                  {summary?.formations?.length || well?.formations?.length || 0}
                </span>
              </div>
              <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase block">Major Risk Events</span>
                <span className="text-xl font-black text-[#78350f] font-mono mt-1 block">
                  {summary?.majorEvents?.reduce((acc: number, e: any) => acc + e.count, 0) || 0}
                </span>
              </div>
              <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase block">Comparable Wells</span>
                <span className="text-xl font-black text-[#1e3a8a] font-mono mt-1 block">
                  {similarWells?.length || 5} Offset
                </span>
              </div>
            </div>

            {/* Risk Intervals */}
            {summary?.riskIntervals && summary.riskIntervals.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-black uppercase tracking-wider mb-2 font-mono">
                  Identified Historical Risk Intervals
                </h3>
                <div className="space-y-2">
                  {summary.riskIntervals.map((ri: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-[#f8f9fa] px-3.5 py-2.5 rounded-xl border-2 border-black text-xs shadow-[2px_2px_0px_0px_#000]"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-black"></span>
                        <span className="font-mono font-black text-black">
                          {ri.startDepth}m – {ri.endDepth}m
                        </span>
                        <span className="text-zinc-600 font-medium">({ri.formation})</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-[#ffe4e6] text-[#881337] border border-black">
                        {ri.riskFactor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Signature Precedent Engine */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-3">
              <div>
                <h2 className="text-base font-black text-black flex items-center space-x-2">
                  <span>⚡</span>
                  <span>Precedent Engine — Scenario Analysis</span>
                </h2>
                <p className="text-xs text-zinc-600 mt-0.5">
                  &quot;Has a comparable operational situation happened before in offset wells?&quot;
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-[#fef3c7] text-[#78350f] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                Stage 02 Engine
              </span>
            </div>

            {/* Parameter Simulation Controls */}
            <div className="bg-[#f8f9fa] border-2 border-black rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 shadow-[2px_2px_0px_0px_#000]">
              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-700 block mb-1 uppercase">Target Depth (m)</label>
                <input
                  type="number"
                  value={targetDepth}
                  onChange={(e) => setTargetDepth(Number(e.target.value))}
                  className="w-full bg-white border-2 border-black rounded-lg px-2.5 py-1.5 text-xs text-black font-mono font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-700 block mb-1 uppercase">Target Formation</label>
                <input
                  type="text"
                  value={targetFormation}
                  onChange={(e) => setTargetFormation(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-lg px-2.5 py-1.5 text-xs text-black font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-700 block mb-1 uppercase">Observed Torque (kN.m)</label>
                <input
                  type="number"
                  value={simTorque}
                  onChange={(e) => setSimTorque(Number(e.target.value))}
                  className="w-full bg-white border-2 border-black rounded-lg px-2.5 py-1.5 text-xs text-black font-mono font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-700 block mb-1 uppercase">Observed ROP (m/h)</label>
                <input
                  type="number"
                  value={simRop}
                  onChange={(e) => setSimRop(Number(e.target.value))}
                  className="w-full bg-white border-2 border-black rounded-lg px-2.5 py-1.5 text-xs text-black font-mono font-bold focus:outline-none"
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
                  className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] border-2 border-black transition-all flex items-center space-x-2 active:translate-x-0.5 active:translate-y-0.5"
                >
                  {precedentLoading ? 'Correlating Offset Wells...' : 'Detect Historical Precedents'}
                </button>
              </div>
            </div>

            {/* Precedent Results Display */}
            {precedentResult && (
              <div className="space-y-4">
                <div className="p-4 bg-[#fffbeb] border-2 border-black rounded-xl text-xs text-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="font-black block mb-1 text-sm text-[#78350f]">
                    {precedentResult.summary}
                  </span>
                  <span className="text-zinc-600 text-xs">
                    Analysis incorporates multi-well formation overlap, depth correlation (+/- 80m), and precursor parameter trends (Torque Spike & ROP Decay).
                  </span>
                </div>

                <div className="space-y-3">
                  {precedentResult.precedents?.map((prec: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-[#f8f9fa] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-black text-sm">{prec.wellId}</span>
                            <span className="text-xs text-zinc-600 font-mono">({prec.distanceKm} km away)</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-[#ffe4e6] text-[#881337] border border-black">
                              {prec.eventType}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-600 block mt-0.5">
                            Occurred at depth <strong className="text-black font-bold">{prec.depth}m</strong> in {prec.formation}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-[#064e3b] font-mono">
                            {(prec.similarityScore * 100).toFixed(0)}%
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold block uppercase font-mono">Similarity</span>
                        </div>
                      </div>

                      {/* Explanation bullets */}
                      <ul className="text-xs text-black space-y-1 mb-3 bg-white p-3 rounded-lg border border-black font-medium">
                        {prec.relevanceExplanation?.map((exp: string, expIdx: number) => (
                          <li key={expIdx} className="flex items-center space-x-2">
                            <span className="text-emerald-600 font-black">✓</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Mitigation & Outcome */}
                      {prec.mitigation && (
                        <div className="text-xs text-black mb-3 bg-[#d1fae5] p-3 rounded-lg border border-black">
                          <span className="text-[#064e3b] font-black block text-[11px] uppercase font-mono">
                            Operational Action Taken:
                          </span>
                          <p className="mt-0.5 font-bold text-black">{prec.mitigation}</p>
                        </div>
                      )}

                      {/* Document Citations & Evidence */}
                      {prec.evidence && prec.evidence.length > 0 && (
                        <div className="border-t-2 border-black/20 pt-2.5 mt-2">
                          <span className="text-[11px] font-black text-black uppercase font-mono block mb-1">
                            Corroborating Document Evidence:
                          </span>
                          <div className="space-y-2">
                            {prec.evidence.map((evi: any, eviIdx: number) => (
                              <div
                                key={eviIdx}
                                className="bg-white p-2.5 rounded-lg border border-black text-xs text-black flex items-start justify-between"
                              >
                                <div>
                                  <span className="font-bold text-[#1e3a8a] block">
                                    📄 {evi.documentTitle} (Page {evi.pageNumber})
                                  </span>
                                  <p className="text-zinc-600 italic mt-0.5">
                                    &quot;{evi.textExcerpt?.slice(0, 140)}...&quot;
                                  </p>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500 ml-2">
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

          {/* Section 3: Most Relevant Offset Wells */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
            <h2 className="text-base font-black text-black mb-4">Most Relevant Offset Wells</h2>
            <div className="space-y-3">
              {similarWells.map((cand: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_0px_#000]"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-black text-sm">{cand.candidateWellName}</span>
                      <span className="text-xs font-mono font-bold text-zinc-500">({cand.distanceKm} km)</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {cand.sharedFormations?.slice(0, 2).map((sf: string, sfIdx: number) => (
                        <span
                          key={sfIdx}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-black border border-black"
                        >
                          {sf}
                        </span>
                      ))}
                      {cand.riskEventsCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-[#ffe4e6] text-[#881337] border border-black">
                          {cand.riskEventsCount} Risk Events
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-xl font-black text-[#064e3b] font-mono">
                        {(cand.overallSimilarity * 100).toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase font-mono">Similarity</span>
                    </div>
                    <Link
                      href={`/compare?wellA=${well?.wellId}&wellB=${cand.targetWellId === well?.id ? cand.candidateWellId : cand.targetWellId}`}
                      className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-xs text-black border-2 border-black rounded-xl font-black shadow-[2px_2px_0px_0px_#000] transition-all"
                    >
                      Compare
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Grounded AI Assistant */}
        <div className="space-y-6">
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] sticky top-24 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <h2 className="text-base font-black text-black flex items-center space-x-2">
                  <span>🤖</span>
                  <span>Grounded Drilling Assistant</span>
                </h2>
                <span className="text-[11px] text-zinc-600 block mt-0.5 font-medium">
                  Strictly grounded in NWIS drilling reports
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#d1fae5] text-[#064e3b] font-mono font-black border border-black">
                Zero Hallucination
              </span>
            </div>

            {/* Quick Questions */}
            <div className="space-y-2">
              <span className="text-[11px] text-black font-black uppercase font-mono block">Quick Queries:</span>
              <button
                onClick={() =>
                  setChatQuestion(
                    'What happened in comparable wells around the current depth in Barail Sandstone?',
                  )
                }
                className="w-full text-left text-xs bg-[#f8f9fa] hover:bg-[#eff6ff] p-3 rounded-xl border-2 border-black text-black font-semibold shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                &quot;What happened in comparable wells around 3200m?&quot;
              </button>
              <button
                onClick={() =>
                  setChatQuestion(
                    'Which wells experienced stuck pipe in Barail formation and what was the mitigation?',
                  )
                }
                className="w-full text-left text-xs bg-[#f8f9fa] hover:bg-[#eff6ff] p-3 rounded-xl border-2 border-black text-black font-semibold shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                &quot;What was the mitigation for stuck pipe in Barail?&quot;
              </button>
              <button
                onClick={() =>
                  setChatQuestion(
                    'What happened in well OIL-SYN-999?',
                  )
                }
                className="w-full text-left text-xs bg-[#ffe4e6] hover:bg-rose-100 p-3 rounded-xl border-2 border-black text-[#881337] font-semibold shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                &quot;Test anti-hallucination: OIL-SYN-999&quot;
              </button>
            </div>

            {/* Question Input */}
            <div className="space-y-3 pt-2">
              <textarea
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                rows={3}
                className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl p-3 text-xs text-black placeholder-zinc-500 font-semibold focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#000]"
                placeholder="Ask about historical precedents, mud losses, stuck pipe..."
              />
              <button
                onClick={handleAskAI}
                disabled={chatLoading}
                className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] border-2 border-black transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                {chatLoading ? 'Retrieving Evidence & Synthesizing...' : 'Ask Drilling Assistant →'}
              </button>
            </div>

            {/* AI Response Card */}
            {chatResponse && (
              <div className="space-y-4 pt-2">
                <div
                  className={`p-4 rounded-xl border-2 border-black text-xs shadow-[3px_3px_0px_0px_#000] ${
                    chatResponse.grounded
                      ? 'bg-[#d1fae5] text-[#064e3b]'
                      : 'bg-[#ffe4e6] text-[#881337]'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed mb-3 font-semibold">
                    {chatResponse.answer}
                  </div>

                  {/* Evidence Citations */}
                  {chatResponse.evidenceSources && chatResponse.evidenceSources.length > 0 && (
                    <div className="border-t-2 border-black/20 pt-2.5">
                      <span className="text-[11px] font-black uppercase font-mono block mb-1.5 text-black">
                        Verified Sources ({chatResponse.evidenceSources.length}):
                      </span>
                      <div className="space-y-2">
                        {chatResponse.evidenceSources.map((src: any, srcIdx: number) => (
                          <div
                            key={srcIdx}
                            className="bg-white p-2.5 rounded-lg border border-black text-[11px]"
                          >
                            <span className="font-bold text-black block">
                              📄 {src.documentTitle} (Page {src.pageNumber})
                            </span>
                            <span className="text-zinc-600 text-[10px] block">
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

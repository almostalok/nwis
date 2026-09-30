'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Well } from '@nwis/types';
import { useToast } from '../../components/Toast';

export default function AssistantPage() {
  const toast = useToast();
  const [wells, setWells] = useState<Well[]>([]);
  const [selectedWellId, setSelectedWellId] = useState<string>('OIL-SYN-020');
  const [targetDepth, setTargetDepth] = useState<number>(3200);
  const [targetFormation, setTargetFormation] = useState<string>('Barail Sandstone');
  const [loadingWells, setLoadingWells] = useState(true);

  // RAG query state
  const [query, setQuery] = useState<string>('What happened in comparable wells around the current depth?');
  const [chatResponse, setChatResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.wells
      .list({ limit: 50 })
      .then((data) => {
        setWells(data);
      })
      .catch((err) => {
        console.error('Failed to load wells for assistant:', err);
      })
      .finally(() => setLoadingWells(false));
  }, []);

  const handleAsk = async (customPrompt?: string) => {
    const questionToAsk = customPrompt || query;
    if (!questionToAsk.trim()) return;

    setLoading(true);
    try {
      const res = await api.intelligence.ask({
        question: questionToAsk,
        currentWellId: selectedWellId || undefined,
        currentDepth: targetDepth || undefined,
        currentFormation: targetFormation || undefined,
      });
      setChatResponse(res);
      if (res.grounded) {
        toast.success('Grounded response synthesized from verified documentation.', 'AI Assistant');
      } else {
        toast.warning(res.answer, 'Insufficient Evidence');
      }
    } catch (err: any) {
      toast.error(`RAG Assistant query failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'What happened in comparable wells around the current depth?',
    'What stuck pipe precedents exist in Barail Sandstone around 3200m?',
    'What mud loss mitigations were successfully applied in offset wells?',
    'Summarize kick indicators observed in nearby exploration wells.',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-zinc-500 mb-1">
            <Link href="/dashboard" className="text-blue-700 hover:underline">
              ← Command Center
            </Link>
            <span>/</span>
            <span>Intelligence</span>
            <span>/</span>
            <span className="text-black font-bold">Grounded Assistant</span>
          </div>

          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black tracking-tight text-black">
              Grounded Drilling Assistant
            </h1>
            <span className="px-3 py-1 text-xs font-mono font-black uppercase tracking-wider bg-[#d1fae5] text-[#064e3b] border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000]">
              ZERO HALLUCINATION
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            Oil India Limited &bull; Verified citations across canonical offset drilling dossiers &bull; Deterministic Decision Support
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1.5 bg-[#fef3c7] text-[#78350f] rounded-full border-2 border-black font-bold shadow-[2px_2px_0px_0px_#000]">
            Knowledge Base: Canonical DDRs
          </span>
        </div>
      </div>

      {/* Filter & Context Selection Strip */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
        <h2 className="text-xs font-black text-black uppercase tracking-wider font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-black" />
          Operational Context Filters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-zinc-700 font-mono mb-1.5 text-xs uppercase font-black">TARGET WELL</label>
            <select
              value={selectedWellId}
              onChange={(e) => setSelectedWellId(e.target.value)}
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2.5 text-black text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">-- All Wells (Field-Wide) --</option>
              {wells.map((w) => (
                <option key={w.wellId} value={w.wellId}>
                  {w.wellId} — {w.name} [{w.field}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-700 font-mono mb-1.5 text-xs uppercase font-black">DEPTH INTERVAL (MD M)</label>
            <input
              type="number"
              value={targetDepth}
              onChange={(e) => setTargetDepth(Number(e.target.value))}
              placeholder="e.g. 3200"
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2.5 text-black font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-zinc-700 font-mono mb-1.5 text-xs uppercase font-black">STRATIGRAPHIC FORMATION</label>
            <input
              type="text"
              value={targetFormation}
              onChange={(e) => setTargetFormation(e.target.value)}
              placeholder="e.g. Barail Sandstone"
              className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2.5 text-black text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Query Formulation & Presets */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
        <label className="block text-xs font-black text-black uppercase tracking-wider font-mono">
          Technical Query Formulation
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a technical operational question regarding offset well experiences, sticking incidents, loss zones, or parameter signatures..."
            className="flex-1 bg-[#f8f9fa] border-2 border-black rounded-xl p-3 text-xs text-black font-semibold placeholder-zinc-500 shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black font-sans"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all flex items-center justify-center space-x-1.5 shrink-0 active:translate-x-0.5 active:translate-y-0.5"
          >
            {loading ? (
              <span>Searching...</span>
            ) : (
              <span>Ask Assistant →</span>
            )}
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] text-zinc-600 font-mono uppercase font-black">Presets:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                handleAsk(q);
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-[#f8f9fa] text-black text-xs font-bold rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5 text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* RAG Response Section */}
      {chatResponse && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Answer Card */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 text-xs font-mono font-black tracking-wider uppercase rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                    chatResponse.grounded
                      ? 'bg-[#d1fae5] text-[#064e3b]'
                      : 'bg-[#fef3c7] text-[#78350f]'
                  }`}
                >
                  {chatResponse.grounded ? '✓ Strictly Grounded in Evidence' : '⚠️ Insufficient Evidence'}
                </span>
                <span className="text-xs text-zinc-600 font-mono font-bold">
                  Confidence: <strong className="text-black font-black">{chatResponse.confidence}</strong>
                </span>
              </div>
              <span className="text-[11px] text-zinc-600 font-mono font-bold bg-[#f8f9fa] px-3 py-1 rounded-full border border-black">
                MODEL: NWIS-GROUNDED-SYNTHESIZER
              </span>
            </div>

            <div className="text-xs text-black leading-relaxed space-y-2 whitespace-pre-wrap font-sans font-semibold">
              {chatResponse.answer}
            </div>

            {/* Reasoning steps if present */}
            {chatResponse.reasoning && chatResponse.reasoning.length > 0 && (
              <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black text-xs font-mono space-y-1.5 text-black shadow-[2px_2px_0px_0px_#000]">
                <p className="font-black text-black uppercase text-[11px]">Grounding Audit Chain:</p>
                {chatResponse.reasoning.map((step: string, i: number) => (
                  <p key={i} className="text-zinc-800">&bull; {step}</p>
                ))}
              </div>
            )}
          </div>

          {/* Evidence Sources & Citations */}
          {chatResponse.evidenceSources && chatResponse.evidenceSources.length > 0 && (
            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
              <h3 className="text-xs font-black text-black uppercase tracking-wider font-mono">
                Corroborating Document Evidence ({chatResponse.evidenceSources.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chatResponse.evidenceSources.map((src: any, i: number) => (
                  <div
                    key={i}
                    className="p-5 bg-[#f8f9fa] border-2 border-black rounded-2xl space-y-2.5 text-xs shadow-[3px_3px_0px_0px_#000]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#1e3a8a] font-mono">
                        {src.wellId ? `WELL ${src.wellId}` : 'OFFSET REPORT'}
                      </span>
                      <span className="text-[10px] text-black font-bold px-2.5 py-0.5 bg-white border border-black rounded-full font-mono">
                        PAGE {src.pageNumber || 1}
                      </span>
                    </div>
                    <p className="text-xs text-black font-black truncate">
                      {src.documentTitle || src.fileName}
                    </p>
                    <blockquote className="text-xs text-zinc-900 italic bg-[#fef3c7] p-3.5 rounded-xl border-2 border-black font-medium">
                      &quot;{src.excerpt}&quot;
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Historical Precedents */}
          {chatResponse.relatedPrecedents && chatResponse.relatedPrecedents.length > 0 && (
            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
              <h3 className="text-xs font-black text-black uppercase tracking-wider font-mono">
                Historical Precedent Matches ({chatResponse.relatedPrecedents.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {chatResponse.relatedPrecedents.map((p: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 bg-[#f8f9fa] border-2 border-black rounded-xl space-y-2 text-xs shadow-[3px_3px_0px_0px_#000]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-black text-black font-mono text-sm">{p.wellId}</span>
                      <span className="text-[#1e3a8a] text-[10px] font-black bg-[#dbeafe] px-2.5 py-0.5 rounded-full border border-black font-mono">
                        {(p.similarityScore * 100).toFixed(0)}% MATCH
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 font-mono">
                      DISTANCE: <span className="text-black font-bold">{p.distanceKm} KM</span>
                    </p>
                    <p className="text-xs text-zinc-600 font-mono">
                      EVENT: <span className="text-[#881337] bg-[#ffe4e6] px-1.5 py-0.2 rounded font-black">{p.eventType}</span> AT {p.depth}M
                    </p>
                    {p.mitigation && (
                      <p className="text-xs text-black bg-white p-2 rounded-lg border border-black">
                        ACTION: <span className="text-[#064e3b] font-bold">{p.mitigation}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await api.knowledge.listDocuments();
      setDocuments(res || []);
      if (res && res.length > 0 && !selectedDoc) {
        loadDocDetails(res[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocDetails = async (id: string) => {
    try {
      const res = await api.knowledge.getDocument(id);
      setSelectedDoc(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleVerifyEntity = async (entityId: string) => {
    setVerifyingId(entityId);
    try {
      await api.knowledge.verifyEntity(entityId, {
        notes: 'Verified by Drilling Superintendent',
        confidence: 1.0,
      });
      if (selectedDoc) {
        await loadDocDetails(selectedDoc.id);
      }
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredDocs =
    filterType === 'ALL'
      ? documents
      : documents.filter((d) => d.documentType === filterType);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider font-mono">
              Stage 02 & Stage 04 &bull; Knowledge Platform
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Technical Document Intelligence Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            OCR analysis, domain entity extraction, semantic chunking, and human-in-the-loop verification
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          {['ALL', 'DAILY_DRILLING_REPORT', 'WELL_COMPLETION_REPORT', 'MUD_REPORT', 'INCIDENT_REPORT'].map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition-colors ${
                  filterType === type
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'ALL'
                  ? 'All Documents'
                  : type === 'DAILY_DRILLING_REPORT'
                  ? 'DDR'
                  : type === 'WELL_COMPLETION_REPORT'
                  ? 'WCR'
                  : type === 'MUD_REPORT'
                  ? 'Mud'
                  : 'Incidents'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Grid: Document List on Left, Inspection Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
            <span>Indexed Technical Reports ({filteredDocs.length})</span>
            <span className="text-emerald-400 font-mono">OIL Archive</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading documents...</div>
          ) : (
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => loadDocDetails(doc.id)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-emerald-500 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-900 text-emerald-400 border border-slate-800">
                        {doc.documentType}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {((doc.ocrConfidence || 0.98) * 100).toFixed(0)}% OCR
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-xs truncate mt-1">{doc.title}</h3>
                    <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{doc.fileName}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80 font-mono">
                      <span>Well: {doc.well?.wellId || 'Multi-well'}</span>
                      <span>Chunks: {doc._count?.chunks || 0}</span>
                      <span>Entities: {doc._count?.extractedEntities || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Document Detailed Inspection */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDoc ? (
            <div className="space-y-6">
              {/* Document Overview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {selectedDoc.documentType}
                      </span>
                      <h2 className="text-lg font-bold text-white">{selectedDoc.title}</h2>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      File: {selectedDoc.fileName} &bull; Linked Well: {selectedDoc.well?.wellId || 'Linked to field'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-400 font-mono">
                      {((selectedDoc.ocrConfidence || 0.98) * 100).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">OCR Quality Score</span>
                  </div>
                </div>

                {/* Extracted Entities Table with Human-in-the-Loop Verification */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                      Extracted Technical Entities ({selectedDoc.extractedEntities?.length || 0})
                    </span>
                    <span className="text-[11px] text-slate-400">Human Verification Available</span>
                  </div>

                  {selectedDoc.extractedEntities && selectedDoc.extractedEntities.length > 0 ? (
                    <div className="border border-slate-800 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
                          <tr>
                            <th className="p-2">Type</th>
                            <th className="p-2">Extracted Value</th>
                            <th className="p-2">Confidence</th>
                            <th className="p-2">Status</th>
                            <th className="p-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                          {selectedDoc.extractedEntities.map((ent: any) => {
                            const isVerified = (ent.metadata as any)?.humanVerified;
                            return (
                              <tr key={ent.id} className="hover:bg-slate-950/50">
                                <td className="p-2 text-emerald-400 font-semibold">{ent.entityType}</td>
                                <td className="p-2 text-slate-200">{ent.value}</td>
                                <td className="p-2 text-slate-300">{(ent.confidence * 100).toFixed(0)}%</td>
                                <td className="p-2">
                                  {isVerified ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                                      VERIFIED
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-800">
                                      AUTO-EXTRACTED
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-right">
                                  {!isVerified ? (
                                    <button
                                      onClick={() => handleVerifyEntity(ent.id)}
                                      disabled={verifyingId === ent.id}
                                      className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-semibold transition-colors disabled:opacity-40"
                                    >
                                      {verifyingId === ent.id ? 'Saving...' : 'Verify'}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">✓ Audited</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-950 rounded border border-slate-800">
                      No entities extracted for this document.
                    </div>
                  )}
                </div>
              </div>

              {/* Semantic Chunks Inspector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Semantic Chunks & 64-Dim Embeddings ({selectedDoc.chunks?.length || 0})
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">OIL Hybrid Embeddings</span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {selectedDoc.chunks?.map((chunk: any, idx: number) => (
                    <div
                      key={chunk.id || idx}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-emerald-400">Chunk #{chunk.chunkIndex + 1}</span>
                          <span>&bull;</span>
                          <span>Page {chunk.pageNumber}</span>
                          <span>&bull;</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
                            {chunk.section || 'SECTION'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">64-dim vector space</span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans bg-slate-950 p-3 rounded border border-slate-800/80">
                        {chunk.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              Select a technical document from the list to view its semantic breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

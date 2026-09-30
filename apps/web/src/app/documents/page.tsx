'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';

export default function DocumentsPage() {
  const toast = useToast();
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
      toast.success('Technical entity verified and updated in catalog.', 'Entity Verified');
      if (selectedDoc) {
        await loadDocDetails(selectedDoc.id);
      }
    } catch (err: any) {
      toast.error(`Verification failed: ${err.message}`, 'Verification Error');
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredDocs =
    filterType === 'ALL'
      ? documents
      : documents.filter((d) => d.documentType === filterType);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#dbeafe] text-[#1e3a8a] border-2 border-black uppercase tracking-wider font-mono shadow-[2px_2px_0px_0px_#000]">
              Stage 02 &amp; Stage 04 &bull; Knowledge Platform
            </span>
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight mt-2">
            Technical Document Intelligence Center
          </h1>
          <p className="text-xs text-zinc-600 font-medium mt-0.5">
            OCR analysis, domain entity extraction, semantic chunking, and human-in-the-loop verification
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-[#f4f4f6] p-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          {['ALL', 'DAILY_DRILLING_REPORT', 'WELL_COMPLETION_REPORT', 'MUD_REPORT', 'INCIDENT_REPORT'].map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                  filterType === type
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-700 hover:text-black'
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
        <div className="bg-white border-2 border-black rounded-2xl p-5 space-y-3 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black text-xs font-black text-black uppercase">
            <span>Indexed Technical Reports ({filteredDocs.length})</span>
            <span className="text-blue-900 font-mono text-[11px] font-black px-2 py-0.5 bg-[#dbeafe] border border-black rounded">OIL Archive</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-zinc-500 font-mono font-bold">Loading documents...</div>
          ) : (
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => loadDocDetails(doc.id)}
                    className={`p-4 rounded-2xl border-2 border-black text-left cursor-pointer transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                      isSelected
                        ? 'bg-[#dbeafe] shadow-[4px_4px_0px_0px_#000]'
                        : 'bg-white shadow-[2px_2px_0px_0px_#000] hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-black bg-white text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                        {doc.documentType}
                      </span>
                      <span className="text-[10px] font-mono text-[#064e3b] font-black bg-[#d1fae5] px-2 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_0px_#000]">
                        {((doc.ocrConfidence || 0.98) * 100).toFixed(0)}% OCR
                      </span>
                    </div>

                    <h3 className="font-black text-black text-xs truncate mt-1">{doc.title}</h3>
                    <p className="text-[11px] font-mono text-zinc-600 font-bold truncate mt-0.5">{doc.fileName}</p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-600 mt-2.5 pt-2 border-t-2 border-black/20 font-mono font-bold">
                      <span>Well: <strong className="text-black">{doc.well?.wellId || 'Multi-well'}</strong></span>
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
              <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        {selectedDoc.documentType}
                      </span>
                      <h2 className="text-lg font-black text-black">{selectedDoc.title}</h2>
                    </div>
                    <p className="text-xs text-zinc-600 font-mono font-bold mt-2">
                      File: <span className="text-black">{selectedDoc.fileName}</span> &bull; Linked Well:{' '}
                      <span className="text-blue-900 font-black">{selectedDoc.well?.wellId || 'Linked to field'}</span>
                    </p>
                  </div>
                  <div className="text-right bg-[#d1fae5] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
                    <div className="text-lg font-black text-[#064e3b] font-mono">
                      {((selectedDoc.ocrConfidence || 0.98) * 100).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-[#064e3b] uppercase font-mono font-black">OCR Quality Score</span>
                  </div>
                </div>

                {/* Extracted Entities Table with Human-in-the-Loop Verification */}
                <div className="pt-4 border-t-2 border-black">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-black uppercase tracking-wider font-mono">
                      Extracted Technical Entities ({selectedDoc.extractedEntities?.length || 0})
                    </span>
                    <span className="text-[11px] font-mono font-bold text-zinc-600">Human Verification Available</span>
                  </div>

                  {selectedDoc.extractedEntities && selectedDoc.extractedEntities.length > 0 ? (
                    <div className="border-2 border-black rounded-xl overflow-hidden max-h-56 overflow-y-auto shadow-[2px_2px_0px_0px_#000]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f4f4f6] text-black font-mono text-[10px] uppercase border-b-2 border-black font-black">
                          <tr>
                            <th className="p-2.5 font-black">Type</th>
                            <th className="p-2.5 font-black">Extracted Value</th>
                            <th className="p-2.5 font-black">Confidence</th>
                            <th className="p-2.5 font-black">Status</th>
                            <th className="p-2.5 text-right font-black">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-zinc-200 font-mono text-[11px]">
                          {selectedDoc.extractedEntities.map((ent: any) => {
                            const isVerified = (ent.metadata as any)?.humanVerified;
                            return (
                              <tr key={ent.id} className="hover:bg-zinc-100/70 transition-colors">
                                <td className="p-2.5 text-blue-900 font-black">{ent.entityType}</td>
                                <td className="p-2.5 text-black font-bold">{ent.value}</td>
                                <td className="p-2.5 text-zinc-700 font-bold">{(ent.confidence * 100).toFixed(0)}%</td>
                                <td className="p-2.5">
                                  {isVerified ? (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#d1fae5] text-[#064e3b] border border-black font-black shadow-[1px_1px_0px_0px_#000]">
                                      VERIFIED
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#fef3c7] text-[#78350f] border border-black font-black shadow-[1px_1px_0px_0px_#000]">
                                      AUTO-EXTRACTED
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 text-right">
                                  {!isVerified ? (
                                    <button
                                      onClick={() => handleVerifyEntity(ent.id)}
                                      disabled={verifyingId === ent.id}
                                      className="px-2.5 py-1 bg-black hover:bg-zinc-800 text-white rounded-lg text-[10px] font-black border border-black transition-all shadow-[1px_1px_0px_0px_#000] disabled:opacity-40"
                                    >
                                      {verifyingId === ent.id ? 'Saving...' : 'Verify'}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-[#064e3b] font-black">✓ Audited</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-zinc-500 font-bold bg-[#f8f8fb] rounded-xl border-2 border-black">
                      No entities extracted for this document.
                    </div>
                  )}
                </div>
              </div>

              {/* Semantic Chunks Inspector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black text-black uppercase tracking-wider font-mono">
                    Semantic Chunks &amp; 64-Dim Embeddings ({selectedDoc.chunks?.length || 0})
                  </h3>
                  <span className="text-[11px] text-zinc-600 font-mono font-bold">OIL Hybrid Embeddings</span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {selectedDoc.chunks?.map((chunk: any, idx: number) => (
                    <div
                      key={chunk.id || idx}
                      className="bg-white border-2 border-black rounded-2xl p-5 space-y-2 shadow-[3px_3px_0px_0px_#000]"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-600 border-b-2 border-black pb-2 font-mono font-bold">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-blue-900">Chunk #{chunk.chunkIndex + 1}</span>
                          <span>&bull;</span>
                          <span>Page {chunk.pageNumber}</span>
                          <span>&bull;</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-black border border-black font-black">
                            {chunk.section || 'SECTION'}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-black">64-dim vector space</span>
                      </div>
                      <div className="text-xs text-black whitespace-pre-line leading-relaxed font-mono bg-[#f8f8fb] p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        {chunk.text.split(/(STUCK_PIPE|stuck pipe|Barail Sandstone|Torque|ROP|soaking pill|jarring|overpull)/gi).map((part: string, i: number) => {
                          const isMatch = /(STUCK_PIPE|stuck pipe|Barail Sandstone|Torque|ROP|soaking pill|jarring|overpull)/i.test(part);
                          return isMatch ? (
                            <mark key={i} className="bg-[#fef08a] text-black border border-black px-1.5 py-0.5 rounded font-black font-mono shadow-[1px_1px_0px_0px_#000]">
                              {part}
                            </mark>
                          ) : (
                            <span key={i}>{part}</span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-black rounded-2xl p-12 text-center text-zinc-500 font-bold shadow-[4px_4px_0px_0px_#000]">
              Select a technical document from the list to view its semantic breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

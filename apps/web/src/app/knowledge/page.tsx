'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await api.knowledge.listDocuments();
      setDocuments(docs || []);
      if (docs && docs.length > 0 && !selectedDoc) {
        loadDocDetails(docs[0].id);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocDetails = async (id: string) => {
    try {
      const doc = await api.knowledge.getDocument(id);
      setSelectedDoc(doc);
    } catch (err) {
      console.error('Failed to load document details:', err);
    }
  };

  const handleProcessAll = async () => {
    setProcessing(true);
    try {
      await api.knowledge.processAll();
      await loadDocuments();
      alert('Full document intelligence pipeline executed successfully.');
    } catch (err: any) {
      alert(`Processing failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-petro-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Document Intelligence & Knowledge Base
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pipeline: Text Extraction → OCR → Semantic Chunking → Domain Entity & Event Extraction → Vector Embedding.
          </p>
        </div>
        <button
          onClick={handleProcessAll}
          disabled={processing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center space-x-2"
        >
          {processing ? 'Processing All Documents...' : '⚡ Re-run Knowledge Pipeline'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Documents List */}
        <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Indexed Drilling Reports ({documents.length})
            </h2>
            <span className="text-[10px] text-emerald-400 font-mono">OIL Synthetic Archive</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs">Loading documents...</div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => loadDocDetails(doc.id)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-petro-950 border-emerald-500 shadow-sm'
                        : 'bg-petro-950/60 border-petro-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-petro-900 text-emerald-400 border border-petro-800">
                        {doc.documentType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {doc.processingStatus}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-xs truncate">{doc.title}</h3>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {doc.fileName}
                    </span>

                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-2 pt-2 border-t border-petro-800/80">
                      <span>Chunks: <strong className="text-white">{doc._count?.chunks || 0}</strong></span>
                      <span>Entities: <strong className="text-white">{doc._count?.extractedEntities || 0}</strong></span>
                      <span>OCR: <strong className="text-emerald-400">{((doc.ocrConfidence || 0.98) * 100).toFixed(0)}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Document Details, Chunks & Extracted Entities */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDoc ? (
            <div className="space-y-6">
              {/* Document Header Card */}
              <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {selectedDoc.documentType}
                      </span>
                      <h2 className="text-lg font-bold text-white">{selectedDoc.title}</h2>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      File: {selectedDoc.fileName} • Well: {selectedDoc.well?.wellId || 'Linked from content'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {((selectedDoc.ocrConfidence || 0.98) * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block uppercase">OCR Quality</span>
                  </div>
                </div>

                {/* Extracted Entities Tag Cloud */}
                {selectedDoc.extractedEntities && selectedDoc.extractedEntities.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-petro-800">
                    <span className="text-xs font-semibold text-slate-300 block mb-2">
                      Extracted Domain Entities ({selectedDoc.extractedEntities.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {selectedDoc.extractedEntities.map((ent: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] bg-petro-950 text-slate-200 border border-petro-800 flex items-center space-x-1"
                        >
                          <span className="text-[9px] text-emerald-400 uppercase font-mono">{ent.entityType}:</span>
                          <span>{ent.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chunks List (Section 10 & 11) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Semantic Document Chunks & Vector Embeddings ({selectedDoc.chunks?.length || 0})
                  </h3>
                  <span className="text-[11px] text-slate-400">Boundary & Section Preserving</span>
                </div>

                {selectedDoc.chunks?.map((chunk: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-petro-900 border border-petro-800 rounded-xl p-4 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-petro-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-emerald-400 font-semibold">
                          Chunk #{chunk.chunkIndex + 1}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300">Page {chunk.pageNumber}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-petro-950 text-slate-300 border border-petro-800">
                          {chunk.section || 'GENERAL'}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {chunk.tokenCount} tokens • Embedding: 64-dim vector
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans bg-petro-950 p-3 rounded border border-petro-800">
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-petro-900 border border-petro-800 rounded-xl p-12 text-center text-slate-400">
              <p className="text-sm">Select a document from the archive list to inspect its semantic chunks and extracted entities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

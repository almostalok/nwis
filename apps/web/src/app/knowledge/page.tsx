'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';

export default function KnowledgeBasePage() {
  const toast = useToast();
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
      toast.success('Full document intelligence pipeline executed successfully.', 'Pipeline Complete');
    } catch (err: any) {
      toast.error(`Processing failed: ${err.message}`, 'Pipeline Error');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

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
            <span>Documents</span>
            <span>/</span>
            <span className="text-black font-bold">Knowledge Pipeline</span>
          </div>

          <h1 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
            Document Intelligence &amp; Knowledge Base
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#d1fae5] text-[#064e3b] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              CANONICAL DDRs
            </span>
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Pipeline: Text Extraction → OCR → Semantic Chunking → Domain Entity &amp; Event Extraction → Vector Embedding.
          </p>
        </div>

        <button
          onClick={handleProcessAll}
          disabled={processing}
          className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5 flex items-center space-x-2 disabled:opacity-50"
        >
          <span>{processing ? 'Processing All Documents...' : '⚡ Re-run Knowledge Pipeline'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Documents List */}
        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-xs font-black text-black uppercase tracking-wider font-mono">
              Indexed Drilling Reports ({documents.length})
            </h2>
            <span className="text-xs text-zinc-600 font-mono font-bold bg-[#f8f9fa] px-2.5 py-0.5 rounded-full border border-black">OIL Archive</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-600 text-xs font-mono font-bold">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-[#2563eb] mx-auto mb-2" />
              Loading documents...
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => loadDocDetails(doc.id)}
                    className={`p-4 rounded-xl border-2 border-black text-left cursor-pointer transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                      isSelected
                        ? 'bg-[#dbeafe] text-[#1e3a8a] ring-2 ring-blue-500'
                        : 'bg-[#f8f9fa] hover:bg-white text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-white text-black border border-black">
                        {doc.documentType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-[#d1fae5] text-[#064e3b] border border-black">
                        {doc.processingStatus}
                      </span>
                    </div>

                    <h3 className="font-black text-black text-xs truncate">{doc.title}</h3>
                    <span className="text-xs font-mono text-zinc-600 block mt-1 truncate">
                      {doc.fileName}
                    </span>

                    <div className="flex items-center space-x-3 text-xs text-black mt-2.5 pt-2 border-t-2 border-black/10 font-mono font-bold">
                      <span>Chunks: <strong className="text-black">{doc._count?.chunks || 0}</strong></span>
                      <span>Entities: <strong className="text-black">{doc._count?.extractedEntities || 0}</strong></span>
                      <span>OCR: <strong className="text-[#064e3b]">{((doc.ocrConfidence || 0.98) * 100).toFixed(0)}%</strong></span>
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
              <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                        {selectedDoc.documentType}
                      </span>
                      <h2 className="text-lg font-black text-black">{selectedDoc.title}</h2>
                    </div>
                    <p className="text-xs text-zinc-600 font-mono font-bold">
                      File: {selectedDoc.fileName} • Well: {selectedDoc.well?.wellId || 'Linked from content'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#064e3b] font-mono">
                      {((selectedDoc.ocrConfidence || 0.98) * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold">OCR Quality</span>
                  </div>
                </div>

                {/* Extracted Entities Tag Cloud */}
                {selectedDoc.extractedEntities && selectedDoc.extractedEntities.length > 0 && (
                  <div className="mt-5 pt-4 border-t-2 border-black">
                    <span className="text-xs font-black text-black uppercase font-mono block mb-2">
                      Extracted Domain Entities ({selectedDoc.extractedEntities.length}):
                    </span>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                      {selectedDoc.extractedEntities.map((ent: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs bg-[#f8f9fa] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] flex items-center space-x-1 font-bold"
                        >
                          <span className="text-[10px] text-[#1e3a8a] uppercase font-mono font-black">{ent.entityType}:</span>
                          <span>{ent.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chunks List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black text-black uppercase tracking-wider font-mono">
                    Semantic Document Chunks &amp; Vector Embeddings ({selectedDoc.chunks?.length || 0})
                  </h3>
                  <span className="text-xs text-zinc-600 font-mono font-bold">Boundary &amp; Section Preserving</span>
                </div>

                {selectedDoc.chunks?.map((chunk: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-black border-b-2 border-black pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[#1e3a8a] font-black">
                          Chunk #{chunk.chunkIndex + 1}
                        </span>
                        <span>•</span>
                        <span className="text-zinc-700 font-bold">Page {chunk.pageNumber}</span>
                        <span>•</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#f8f9fa] border border-black">
                          {chunk.section || 'GENERAL'}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-zinc-600 font-bold">
                        {chunk.tokenCount} tokens • 64-dim embedding
                      </span>
                    </div>

                    <p className="text-xs text-black whitespace-pre-line leading-relaxed font-sans bg-[#f8f9fa] p-4 rounded-xl border-2 border-black font-semibold shadow-[2px_2px_0px_0px_#000]">
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-black rounded-2xl p-12 text-center text-zinc-600 shadow-[4px_4px_0px_0px_#000]">
              <p className="text-sm text-black font-black">Select a document from the archive list to inspect its semantic chunks and extracted entities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

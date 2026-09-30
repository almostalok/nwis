'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { DataQualityReport, IngestionJob, DataSourceType } from '@nwis/types';

export default function DataPlatformPage() {
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [sourceName, setSourceName] = useState('OIL-SYNTHETIC-BATCH-02');
  const [sourceType, setSourceType] = useState<DataSourceType>(DataSourceType.CSV);
  const [entityType, setEntityType] = useState('WELL');
  const [rawPayload, setRawPayload] = useState(
    `wellId,name,field,operator,wellType,status,spudDate,completionDate,totalDepth,latitude,longitude\nOIL-SYN-021,NWIS Borbil Appraisal 21,NWIS-DEMO-FIELD,Oil India Limited (Synthetic Operations),APPRAISAL,PLANNED,2024-07-01T00:00:00Z,,4350.0,27.350,95.320`
  );
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const refreshData = () => {
    api.dataQuality.getReport().then((r) => setQualityReport(r));
    api.ingestion.getJobs().then((j) => setJobs(j));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportResult(null);
    try {
      const res = await api.ingestion.import({
        sourceName,
        sourceType,
        entityType,
        payload: rawPayload,
      });
      setImportResult(res);
      refreshData();
    } catch (err: any) {
      setImportResult({ success: false, errors: [{ message: err.message }] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-zinc-500 mb-1">
            <Link href="/dashboard" className="text-blue-700 hover:underline">
              ← Command Center
            </Link>
            <span>/</span>
            <span>Operations</span>
            <span>/</span>
            <span className="text-black font-bold">Data Platform</span>
          </div>

          <h1 className="text-2xl font-black text-black tracking-tight">
            Data Platform &amp; Ingestion Console
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            OIL-Compatible Ingestion Architecture &bull; Canonical Unit &amp; Terminology Normalization &bull; Data Quality Index
          </p>
        </div>

        <Link
          href="/data-quality"
          className="px-4 py-2 bg-[#fef08a] hover:bg-yellow-300 text-black border-2 border-black font-black text-xs rounded-xl shadow-[2px_2px_0px_0px_#000] transition-all"
        >
          View Quality Audit →
        </Link>
      </div>

      {/* PIPELINE ARCHITECTURE CARD */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
        <span className="text-xs font-black text-black uppercase tracking-wider block mb-4 font-mono">
          Canonical Ingestion Pipeline Architecture
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
          <div className="bg-[#f8f9fa] p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] text-zinc-500 font-mono font-black block">Stage 1</span>
            <span className="font-black text-black block mt-0.5">Data Source</span>
            <span className="text-[10px] text-[#064e3b] font-bold block mt-1 bg-[#d1fae5] py-0.5 rounded border border-black">Synthetic / WITSML</span>
          </div>
          <div className="bg-[#f8f9fa] p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] text-zinc-500 font-mono font-black block">Stage 2</span>
            <span className="font-black text-black block mt-0.5">Adapter</span>
            <span className="text-[10px] text-[#1e3a8a] font-bold block mt-1 bg-[#dbeafe] py-0.5 rounded border border-black">CSV / JSON / SOAP</span>
          </div>
          <div className="bg-[#f8f9fa] p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] text-zinc-500 font-mono font-black block">Stage 3</span>
            <span className="font-black text-black block mt-0.5">Parser</span>
            <span className="text-[10px] text-[#78350f] font-bold block mt-1 bg-[#fef3c7] py-0.5 rounded border border-black">Schema Extraction</span>
          </div>
          <div className="bg-[#f8f9fa] p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] text-zinc-500 font-mono font-black block">Stage 4</span>
            <span className="font-black text-black block mt-0.5">Validator</span>
            <span className="text-[10px] text-[#064e3b] font-bold block mt-1 bg-[#d1fae5] py-0.5 rounded border border-black">Zod Schema Rules</span>
          </div>
          <div className="bg-[#f8f9fa] p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] text-zinc-500 font-mono font-black block">Stage 5</span>
            <span className="font-black text-black block mt-0.5">Normalizer</span>
            <span className="text-[10px] text-[#5b21b6] font-bold block mt-1 bg-[#ede9fe] py-0.5 rounded border border-black">Units &amp; Synonyms</span>
          </div>
          <div className="bg-[#f8f9fa] p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <span className="text-[10px] text-zinc-500 font-mono font-black block">Stage 6</span>
            <span className="font-black text-black block mt-0.5">PostgreSQL</span>
            <span className="text-[10px] text-[#064e3b] font-bold block mt-1 bg-[#d1fae5] py-0.5 rounded border border-black">PostGIS Database</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INGESTION FORM */}
        <div className="lg:col-span-7 bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-black font-mono">
            Pipeline Import Execution
          </h2>

          <form onSubmit={handleImport} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-700 font-black mb-1 font-mono uppercase text-[11px]">Source Identifier</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2 text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-black mb-1 font-mono uppercase text-[11px]">Adapter Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2 text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value={DataSourceType.CSV}>CSV Adapter</option>
                  <option value={DataSourceType.SYNTHETIC}>JSON / Synthetic</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-black mb-1 font-mono uppercase text-[11px]">Target Entity</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3 py-2 text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="WELL">Well Master Record</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-700 font-black font-mono uppercase text-[11px]">Payload Content (Raw Data)</label>
                <button
                  type="button"
                  onClick={() =>
                    setRawPayload(
                      `wellId,name,field,operator,wellType,status,spudDate,completionDate,totalDepth,latitude,longitude\nOIL-SYN-021,NWIS Borbil Appraisal 21,NWIS-DEMO-FIELD,Oil India Limited (Synthetic Operations),APPRAISAL,PLANNED,2024-07-01T00:00:00Z,,4350.0,27.350,95.320`
                    )
                  }
                  className="text-xs text-blue-700 font-black hover:underline font-mono"
                >
                  Load Sample
                </button>
              </div>
              <textarea
                rows={5}
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl p-3 font-mono text-xs text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={importing}
              className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-black rounded-xl text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            >
              {importing ? 'Processing Ingestion Pipeline...' : 'Run Pipeline Import →'}
            </button>
          </form>

          {importResult && (
            <div
              className={`p-4 rounded-xl border-2 border-black text-xs shadow-[2px_2px_0px_0px_#000] ${
                importResult.success
                  ? 'bg-[#d1fae5] text-[#064e3b]'
                  : 'bg-[#ffe4e6] text-[#881337]'
              }`}
            >
              <div className="font-black mb-1 text-sm">
                {importResult.success ? '✓ Ingestion Successful' : '✗ Ingestion Errors Detected'}
              </div>
              <p className="font-semibold">Processed: {importResult.processedCount || 0} &bull; Valid: {importResult.validCount || 0} &bull; Errors: {importResult.errorCount || 0}</p>
              {importResult.errors && importResult.errors.length > 0 && (
                <ul className="mt-2 list-disc list-inside space-y-0.5 font-mono text-[11px]">
                  {importResult.errors.slice(0, 3).map((e: any, idx: number) => (
                    <li key={idx}>{e.message || JSON.stringify(e)}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* DATA QUALITY REPORT */}
        <div className="lg:col-span-5 bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-black font-mono">
            Data Quality &amp; Health Index
          </h2>

          {qualityReport ? (
            <div className="space-y-4 text-xs">
              <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[11px] font-mono font-bold uppercase">Overall Quality Index</span>
                  <span className="text-3xl font-black text-[#064e3b] font-mono">
                    {(qualityReport.overallScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 block text-[11px] font-mono font-bold uppercase">Total Records</span>
                  <span className="text-2xl font-black text-black font-mono">
                    {qualityReport.totalRecords}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-black block mb-2 font-black font-mono uppercase text-xs">Record Status Breakdown:</span>
                <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                  <div className="bg-[#d1fae5] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex justify-between">
                    <span className="text-[#064e3b] font-black">VALID:</span>
                    <span className="text-black font-black">{qualityReport.statusBreakdown.VALID || 0}</span>
                  </div>
                  <div className="bg-[#dbeafe] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex justify-between">
                    <span className="text-[#1e3a8a] font-black">VERIFIED:</span>
                    <span className="text-black font-black">{qualityReport.statusBreakdown.VERIFIED || 0}</span>
                  </div>
                  <div className="bg-[#fef3c7] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex justify-between">
                    <span className="text-[#78350f] font-black">WARNING:</span>
                    <span className="text-black font-black">{qualityReport.statusBreakdown.WARNING || 0}</span>
                  </div>
                  <div className="bg-[#ffe4e6] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex justify-between">
                    <span className="text-[#881337] font-black">INVALID:</span>
                    <span className="text-black font-black">{qualityReport.statusBreakdown.INVALID || 0}</span>
                  </div>
                </div>
              </div>

              {/* Anomaly flags */}
              <div>
                <span className="text-black block mb-2 font-black font-mono uppercase text-xs">
                  Detected Anomalies ({qualityReport.anomaliesCount}):
                </span>
                {qualityReport.recentFlags?.length === 0 ? (
                  <p className="text-zinc-500 text-xs font-semibold">No structural anomalies detected in active dataset.</p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {qualityReport.recentFlags?.map((flag: any, idx: number) => (
                      <div key={idx} className="bg-[#f8f9fa] p-2.5 rounded-lg text-xs border border-black">
                        <span className="font-black text-[#78350f]">[{flag.entityType}] </span>
                        <span className="text-black font-semibold">{flag.issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 font-mono">Loading quality metrics...</p>
          )}
        </div>
      </div>

      {/* RECENT INGESTION JOBS AUDIT */}
      <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
        <div className="p-5 border-b-2 border-black flex justify-between items-center bg-[#f8f9fa]">
          <h3 className="text-sm font-black text-black">Ingestion Pipeline Job Audit Trail</h3>
          <span className="text-xs font-mono text-black font-bold bg-white px-3 py-1 rounded-full border border-black shadow-[2px_2px_0px_0px_#000]">
            {jobs.length} total jobs
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-black uppercase tracking-wider text-[11px] font-mono border-b-2 border-black font-black">
              <tr>
                <th className="py-3 px-5">Job ID</th>
                <th className="py-3 px-5">Source Identifier</th>
                <th className="py-3 px-5">Source Type</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Records</th>
                <th className="py-3 px-5">Valid / Invalid</th>
                <th className="py-3 px-5">Started At</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 font-mono text-xs">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-sans">
                    No ingestion jobs recorded yet.
                  </td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3.5 px-5 font-black text-black">{j.id.slice(0, 8)}...</td>
                    <td className="py-3.5 px-5 text-black font-semibold">{j.sourceIdentifier}</td>
                    <td className="py-3.5 px-5 text-zinc-600">{j.sourceType}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black border border-black ${
                          j.status === 'COMPLETED'
                            ? 'bg-[#d1fae5] text-[#064e3b]'
                            : j.status === 'FAILED'
                            ? 'bg-[#ffe4e6] text-[#881337]'
                            : 'bg-[#fef3c7] text-[#78350f]'
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-black font-bold">{j.totalRecords}</td>
                    <td className="py-3.5 px-5">
                      <span className="text-[#064e3b] font-black">{j.validRecords}</span> /{' '}
                      <span className="text-[#881337] font-black">{j.invalidRecords}</span>
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600">
                      {new Date(j.startedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

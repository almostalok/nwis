'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DataQualityReport, IngestionJob, DataSourceType } from '@nwis/types';

export default function DataPlatformPage() {
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [sourceName, setSourceName] = useState('OIL-SYNTHETIC-BATCH-02');
  const [sourceType, setSourceType] = useState<DataSourceType>(DataSourceType.CSV);
  const [entityType, setEntityType] = useState('WELL');
  const [rawPayload, setRawPayload] = useState(
    `wellId,name,field,operator,wellType,status,spudDate,completionDate,totalDepth,latitude,longitude
OIL-SYN-021,NWIS Borbil Appraisal 21,NWIS-DEMO-FIELD,Oil India Limited (Synthetic Operations),APPRAISAL,PLANNED,2024-07-01T00:00:00Z,,4350.0,27.350,95.320`
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Data Platform & Ingestion Console</h1>
        <p className="text-sm text-slate-400 mt-1">
          OIL-Compatible Ingestion Architecture &bull; Canonical Unit & Terminology Normalization &bull; Data Quality Index
        </p>
      </div>

      {/* PIPELINE ARCHITECTURE CARD */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Canonical Ingestion Pipeline Architecture
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="bg-petro-950 p-2.5 rounded-lg border border-petro-800">
            <span className="text-[10px] text-slate-400 block">Stage 1</span>
            <span className="font-semibold text-white">Data Source</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Synthetic / WITSML</span>
          </div>
          <div className="bg-petro-950 p-2.5 rounded-lg border border-petro-800">
            <span className="text-[10px] text-slate-400 block">Stage 2</span>
            <span className="font-semibold text-white">Adapter</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">CSV / JSON / SOAP</span>
          </div>
          <div className="bg-petro-950 p-2.5 rounded-lg border border-petro-800">
            <span className="text-[10px] text-slate-400 block">Stage 3</span>
            <span className="font-semibold text-white">Parser</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Schema Extraction</span>
          </div>
          <div className="bg-petro-950 p-2.5 rounded-lg border border-petro-800">
            <span className="text-[10px] text-slate-400 block">Stage 4</span>
            <span className="font-semibold text-white">Validator</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Zod Schema Rules</span>
          </div>
          <div className="bg-petro-950 p-2.5 rounded-lg border border-petro-800">
            <span className="text-[10px] text-slate-400 block">Stage 5</span>
            <span className="font-semibold text-white">Normalizer</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Units & Synonyms</span>
          </div>
          <div className="bg-petro-950 p-2.5 rounded-lg border border-petro-800">
            <span className="text-[10px] text-slate-400 block">Stage 6</span>
            <span className="font-semibold text-white">PostgreSQL</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">PostGIS Database</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INGESTION FORM */}
        <div className="lg:col-span-7 bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-emerald-400">
            Pipeline Import Execution
          </h2>

          <form onSubmit={handleImport} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Source Identifier</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full bg-petro-950 border border-petro-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Adapter Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  className="w-full bg-petro-950 border border-petro-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value={DataSourceType.CSV}>CSV Adapter</option>
                  <option value={DataSourceType.SYNTHETIC}>JSON / Synthetic</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Entity</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full bg-petro-950 border border-petro-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="WELL">Well Master Record</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400">Payload Content (Raw Data)</label>
                <button
                  type="button"
                  onClick={() =>
                    setRawPayload(
                      `wellId,name,field,operator,wellType,status,spudDate,completionDate,totalDepth,latitude,longitude\nOIL-SYN-021,NWIS Borbil Appraisal 21,NWIS-DEMO-FIELD,Oil India Limited (Synthetic Operations),APPRAISAL,PLANNED,2024-07-01T00:00:00Z,,4350.0,27.350,95.320`
                    )
                  }
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Load Sample
                </button>
              </div>
              <textarea
                rows={5}
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                className="w-full bg-petro-950 border border-petro-700 rounded-lg p-2.5 font-mono text-[11px] text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={importing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50"
            >
              {importing ? 'Processing Ingestion Pipeline...' : 'Run Pipeline Import'}
            </button>
          </form>

          {importResult && (
            <div
              className={`p-3 rounded-lg border text-xs ${
                importResult.success
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  : 'bg-red-950/60 border-red-800 text-red-200'
              }`}
            >
              <div className="font-bold mb-1">
                {importResult.success ? '✓ Ingestion Successful' : '✗ Ingestion Errors Detected'}
              </div>
              <p>Processed: {importResult.processedCount || 0} &bull; Valid: {importResult.validCount || 0} &bull; Errors: {importResult.errorCount || 0}</p>
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
        <div className="lg:col-span-5 bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-emerald-400">
            Data Quality & Health Index
          </h2>

          {qualityReport ? (
            <div className="space-y-4 text-xs">
              <div className="bg-petro-950 p-4 rounded-lg border border-petro-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Overall Quality Index</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {(qualityReport.overallScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Total Canonical Records</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {qualityReport.totalRecords}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-2 font-semibold">Record Status Breakdown:</span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-petro-950 p-2 rounded border border-petro-800 flex justify-between">
                    <span className="text-emerald-400">VALID:</span>
                    <span className="text-white font-bold">{qualityReport.statusBreakdown.VALID || 0}</span>
                  </div>
                  <div className="bg-petro-950 p-2 rounded border border-petro-800 flex justify-between">
                    <span className="text-blue-400">VERIFIED:</span>
                    <span className="text-white font-bold">{qualityReport.statusBreakdown.VERIFIED || 0}</span>
                  </div>
                  <div className="bg-petro-950 p-2 rounded border border-petro-800 flex justify-between">
                    <span className="text-amber-400">WARNING:</span>
                    <span className="text-white font-bold">{qualityReport.statusBreakdown.WARNING || 0}</span>
                  </div>
                  <div className="bg-petro-950 p-2 rounded border border-petro-800 flex justify-between">
                    <span className="text-red-400">INVALID:</span>
                    <span className="text-white font-bold">{qualityReport.statusBreakdown.INVALID || 0}</span>
                  </div>
                </div>
              </div>

              {/* Anomaly flags */}
              <div>
                <span className="text-slate-400 block mb-2 font-semibold">
                  Detected Anomalies ({qualityReport.anomaliesCount}):
                </span>
                {qualityReport.recentFlags?.length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No structural anomalies detected in active dataset.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {qualityReport.recentFlags?.map((flag: any, idx: number) => (
                      <div key={idx} className="bg-petro-950 p-2 rounded text-[11px] border border-petro-800">
                        <span className="font-semibold text-amber-400">[{flag.entityType}] </span>
                        <span className="text-slate-300">{flag.issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Loading quality metrics...</p>
          )}
        </div>
      </div>

      {/* RECENT INGESTION JOBS AUDIT */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-petro-950 border-b border-petro-800">
          <h3 className="text-sm font-semibold text-white">Ingestion Pipeline Job Audit Trail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-petro-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-petro-800">
              <tr>
                <th className="py-2.5 px-4">Job ID</th>
                <th className="py-2.5 px-4">Source Identifier</th>
                <th className="py-2.5 px-4">Source Type</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Records</th>
                <th className="py-2.5 px-4">Valid / Invalid</th>
                <th className="py-2.5 px-4">Started At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-petro-800 font-mono text-[11px]">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No ingestion jobs recorded yet.
                  </td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-petro-800/40">
                    <td className="py-2.5 px-4 font-bold text-white">{j.id.slice(0, 8)}...</td>
                    <td className="py-2.5 px-4 text-slate-200">{j.sourceIdentifier}</td>
                    <td className="py-2.5 px-4 text-slate-400">{j.sourceType}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          j.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300'
                            : j.status === 'FAILED'
                            ? 'bg-red-950 text-red-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-200">{j.totalRecords}</td>
                    <td className="py-2.5 px-4 text-slate-300">
                      <span className="text-emerald-400">{j.validRecords}</span> /{' '}
                      <span className="text-red-400">{j.invalidRecords}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
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

'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'WELL' | 'ALERT' | 'DAILY'>('DAILY');
  const [wells, setWells] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedWellId, setSelectedWellId] = useState('OIL-SYN-001');
  const [selectedAlertId, setSelectedAlertId] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch wells and alerts
    api.wells.list({ limit: 30 }).then((res) => {
      setWells(res);
      if (res.length > 0) setSelectedWellId(res[0].wellId);
    });

    api.alerts.list({ limit: 20 }).then((res) => {
      setAlerts(res);
      if (res.length > 0) setSelectedAlertId(res[0].id);
    });
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      if (reportType === 'DAILY') {
        const res = await api.reports.getDailyReport();
        setReportData(res);
      } else if (reportType === 'WELL') {
        const res = await api.reports.getWellReport(selectedWellId);
        setReportData(res);
      } else if (reportType === 'ALERT') {
        if (!selectedAlertId) return;
        const res = await api.reports.getAlertReport(selectedAlertId);
        setReportData(res);
      }
    } catch (err: any) {
      alert(`Error generating report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, [reportType]);

  const handleCopyMarkdown = () => {
    if (reportData?.markdownReport) {
      navigator.clipboard.writeText(reportData.markdownReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider font-mono">
              Oil India Limited &bull; Executive Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Reports & Dossier Generator
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-grade drilling intelligence reports, well dossiers, and incident post-mortem summaries
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyMarkdown}
            disabled={!reportData}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition-colors"
          >
            {copied ? '✓ Copied Markdown' : '📋 Copy Markdown'}
          </button>
          <button
            onClick={handlePrint}
            disabled={!reportData}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white disabled:opacity-40 transition-colors shadow-sm"
          >
            🖨 Print / Export PDF
          </button>
        </div>
      </div>

      {/* Control Bar: Report Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Report Type:</span>
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            {(['DAILY', 'WELL', 'ALERT'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  reportType === type
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'DAILY' ? 'Daily Operations' : type === 'WELL' ? 'Well Dossier' : 'Alert Investigation'}
              </button>
            ))}
          </div>
        </div>

        {reportType === 'WELL' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Target Well:</span>
            <select
              value={selectedWellId}
              onChange={(e) => setSelectedWellId(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              {wells.map((w) => (
                <option key={w.id} value={w.wellId}>
                  {w.wellId} ({w.name})
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateReport}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold text-white rounded transition-colors"
            >
              Generate
            </button>
          </div>
        )}

        {reportType === 'ALERT' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Target Alert:</span>
            <select
              value={selectedAlertId}
              onChange={(e) => setSelectedAlertId(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none max-w-xs truncate"
            >
              {alerts.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.severity}] {a.title} ({a.wellId})
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateReport}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold text-white rounded transition-colors"
            >
              Generate
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3 font-mono">Compiling intelligence report from PostgreSQL & Knowledge Store...</p>
        </div>
      )}

      {/* Rendered Report Preview */}
      {reportData && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Report Header */}
            <div className="border-b border-slate-800 pb-5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>OIL INDIA LIMITED &bull; DRILLING SERVICES</span>
                <span>Generated: {new Date(reportData.generatedAt).toLocaleString()}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">
                {reportType === 'DAILY'
                  ? 'Daily Operations & Safety Intelligence Summary'
                  : reportType === 'WELL'
                  ? `Well Intelligence Dossier: ${reportData.wellName} (${reportData.wellId})`
                  : `Alert Investigation & Post-Mortem: ${reportData.title}`}
              </h2>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  CLASSIFICATION: RESTRICTED ADVISORY
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  SYNTHETIC DEMO ENVIRONMENT
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            {reportType === 'DAILY' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Total Tracked Wells</div>
                  <div className="text-2xl font-bold text-white mt-1">{reportData.wellsCount}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Active Drilling Rigs</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{reportData.drillingWellsCount}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Total Alerts (24h)</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{reportData.totalAlerts}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400">Data Quality Index</div>
                  <div className="text-2xl font-bold text-blue-400 mt-1">
                    {(reportData.dataQualityScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            )}

            {/* Markdown Report Render */}
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/40 p-6 rounded-lg border border-slate-800/80">
              {reportData.markdownReport}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

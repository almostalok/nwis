'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';

export default function ReportsPage() {
  const toast = useToast();
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
      toast.error(`Error generating report: ${err.message}`, 'Report Error');
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
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#dbeafe] text-[#1e3a8a] border-2 border-black uppercase tracking-wider font-mono shadow-[2px_2px_0px_0px_#000]">
              Oil India Limited &bull; Executive Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight mt-2">
            Reports &amp; Dossier Generator
          </h1>
          <p className="text-xs text-zinc-600 font-medium mt-0.5">
            Audit-grade drilling intelligence reports, well dossiers, and incident post-mortem summaries
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyMarkdown}
            disabled={!reportData}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-white hover:bg-zinc-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] disabled:opacity-40 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            {copied ? '✓ Copied Markdown' : '📋 Copy Markdown'}
          </button>
          <button
            onClick={handlePrint}
            disabled={!reportData}
            className="px-4 py-2 rounded-xl text-xs font-black bg-black hover:bg-zinc-800 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] disabled:opacity-40 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            🖨 Print / Export PDF
          </button>
        </div>
      </div>

      {/* Control Bar: Report Selection */}
      <div className="bg-white border-2 border-black rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-black text-black uppercase font-mono">Report Type:</span>
          <div className="flex rounded-xl bg-[#f4f4f6] p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            {(['DAILY', 'WELL', 'ALERT'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                  reportType === type
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-700 hover:text-black'
                }`}
              >
                {type === 'DAILY' ? 'Daily Operations' : type === 'WELL' ? 'Well Dossier' : 'Alert Investigation'}
              </button>
            ))}
          </div>
        </div>

        {reportType === 'WELL' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-black uppercase font-mono">Target Well:</span>
            <select
              value={selectedWellId}
              onChange={(e) => setSelectedWellId(e.target.value)}
              className="bg-[#f8f8fb] text-xs text-black border-2 border-black rounded-xl px-3 py-2 font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
            >
              {wells.map((w) => (
                <option key={w.id} value={w.wellId}>
                  {w.wellId} ({w.name})
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-black hover:bg-zinc-800 text-xs font-black text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              Generate
            </button>
          </div>
        )}

        {reportType === 'ALERT' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-black uppercase font-mono">Target Alert:</span>
            <select
              value={selectedAlertId}
              onChange={(e) => setSelectedAlertId(e.target.value)}
              className="bg-[#f8f8fb] text-xs text-black border-2 border-black rounded-xl px-3 py-2 max-w-xs truncate font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
            >
              {alerts.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.severity}] {a.title} ({a.wellId})
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-black hover:bg-zinc-800 text-xs font-black text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              Generate
            </button>
          </div>
        )}
      </div>

      {/* EXECUTIVE SUMMARY */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black text-xs">
          <span className="font-black text-black tracking-tight flex items-center gap-2 uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-black" />
            Executive Drilling Intelligence Summary
          </span>
          <span className="text-[11px] text-zinc-600 font-mono font-bold">
            OIL INDIA LIMITED &bull; ASSAM-ARAKAN BASIN
          </span>
        </div>

        {/* Large Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#dbeafe] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <span className="text-[10px] text-blue-950 uppercase font-black font-mono block">MONITORED WELLS</span>
            <div className="text-3xl font-black text-blue-900 font-mono mt-1">20 <span className="text-xs text-blue-800 font-bold">Wells</span></div>
            <span className="text-[11px] text-blue-950 font-bold mt-1 block">4 Active &bull; 16 Offset History</span>
          </div>

          <div className="bg-[#fef3c7] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <span className="text-[10px] text-amber-950 uppercase font-black font-mono block">STUCK-PIPE PRECEDENTS</span>
            <div className="text-3xl font-black text-[#78350f] font-mono mt-1">3 <span className="text-xs text-amber-800 font-bold">Cases</span></div>
            <span className="text-[11px] text-amber-950 font-bold mt-1 block">SYN-003, 007, 012 Clustered</span>
          </div>

          <div className="bg-[#ffe4e6] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <span className="text-[10px] text-rose-950 uppercase font-black font-mono block">PEAK RISK (BARAIL)</span>
            <div className="text-3xl font-black text-[#881337] font-mono mt-1">79 <span className="text-xs text-rose-800 font-bold">/ 100</span></div>
            <span className="text-[11px] text-rose-950 font-bold mt-1 block">[WARNING] Stuck Pipe Precursor</span>
          </div>

          <div className="bg-[#d1fae5] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <span className="text-[10px] text-emerald-950 uppercase font-black font-mono block">EVIDENCE COVERAGE</span>
            <div className="text-3xl font-black text-[#064e3b] font-mono mt-1">100%</div>
            <span className="text-[11px] text-emerald-950 font-bold mt-1 block">Audit-grade DDR &amp; WCR logs</span>
          </div>
        </div>

        {/* Risk Distribution Horizontal Bar */}
        <div className="space-y-2 pt-3 border-t-2 border-black text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-black uppercase font-black">Field Operational Risk Distribution:</span>
            <span className="text-black font-bold">65% Nominal &bull; 25% Elevated &bull; 10% Critical</span>
          </div>
          <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden flex border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <div className="bg-emerald-500 h-full border-r border-black" style={{ width: '65%' }} title="Nominal (65%)" />
            <div className="bg-amber-400 h-full border-r border-black" style={{ width: '25%' }} title="Warning (25%)" />
            <div className="bg-rose-500 h-full" style={{ width: '10%' }} title="Critical (10%)" />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-16 text-center bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-black mt-3 font-mono font-bold">Compiling intelligence report from PostgreSQL &amp; Knowledge Store...</p>
        </div>
      )}

      {/* Rendered Report Preview */}
      {reportData && !loading && (
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[4px_4px_0px_0px_#000] print:bg-white print:text-black print:border-none print:shadow-none">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Report Header */}
            <div className="border-b-2 border-black pb-5">
              <div className="flex items-center justify-between text-xs text-zinc-600 font-mono font-bold">
                <span>OIL INDIA LIMITED &bull; DRILLING SERVICES</span>
                <span>Generated: {new Date(reportData.generatedAt).toLocaleString()}</span>
              </div>
              <h2 className="text-2xl font-black text-black mt-2">
                {reportType === 'DAILY'
                  ? 'Daily Operations & Safety Intelligence Summary'
                  : reportType === 'WELL'
                  ? `Well Intelligence Dossier: ${reportData.wellName} (${reportData.wellId})`
                  : `Alert Investigation & Post-Mortem: ${reportData.title}`}
              </h2>
              <div className="flex items-center space-x-2 mt-2.5">
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#d1fae5] text-[#064e3b] border-2 border-black font-black shadow-[1px_1px_0px_0px_#000]">
                  CLASSIFICATION: RESTRICTED ADVISORY
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 text-black border-2 border-black font-bold shadow-[1px_1px_0px_0px_#000]">
                  SYNTHETIC DEMO ENVIRONMENT
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            {reportType === 'DAILY' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-xs text-zinc-600 font-bold uppercase font-mono">Total Tracked Wells</div>
                  <div className="text-2xl font-black text-black font-mono mt-1">{reportData.wellsCount}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-xs text-zinc-600 font-bold uppercase font-mono">Active Drilling Rigs</div>
                  <div className="text-2xl font-black text-blue-900 font-mono mt-1">{reportData.drillingWellsCount}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-xs text-zinc-600 font-bold uppercase font-mono">Total Alerts (24h)</div>
                  <div className="text-2xl font-black text-[#78350f] font-mono mt-1">{reportData.totalAlerts}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-xs text-zinc-600 font-bold uppercase font-mono">Data Quality Index</div>
                  <div className="text-2xl font-black text-[#064e3b] font-mono mt-1">
                    {(reportData.dataQualityScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            )}

            {/* Markdown Report Render */}
            <div className="text-black text-sm leading-relaxed whitespace-pre-wrap font-mono bg-[#f8f8fb] p-6 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
              {reportData.markdownReport}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

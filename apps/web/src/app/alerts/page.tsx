'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';
import Link from 'next/link';

export default function AlertsCatalogPage() {
  const toast = useToast();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedRiskType, setSelectedRiskType] = useState<string>('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.alerts.list({
        severity: selectedSeverity || undefined,
        status: selectedStatus || undefined,
        riskType: selectedRiskType || undefined,
        limit: 50,
      });
      setAlerts(res || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [selectedSeverity, selectedStatus, selectedRiskType]);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.alerts.acknowledge(id, 'Drilling Engineer', 'Acknowledged via Alerts Catalog');
      toast.success('Alert successfully acknowledged.', 'Alert Updated');
      fetchAlerts();
    } catch (err: any) {
      toast.error(`Could not acknowledge alert: ${err.message}`, 'Alert Error');
    }
  };

  const handleResolve = async (id: string) => {
    const note = prompt('Enter resolution note:', 'Telemetry normalized; operational verification complete.');
    if (!note) return;
    try {
      await api.alerts.resolve(id, 'Drilling Engineer', note);
      toast.success('Alert marked as RESOLVED.', 'Alert Resolved');
      fetchAlerts();
    } catch (err: any) {
      toast.error(`Could not resolve alert: ${err.message}`, 'Alert Error');
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black flex items-center space-x-2.5">
            <span>Operational Risk Alerts Catalog</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {alerts.length} Total
            </span>
          </h1>
          <p className="text-xs text-zinc-600 font-medium mt-1">
            Real-time anomaly detection and precedent-backed decision support alerts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAlerts}
            className="px-4 py-2 rounded-xl bg-white hover:bg-black text-xs font-black text-black hover:text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
          >
            Refresh Alerts
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-black font-mono font-black uppercase text-[10px]">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-[#f8f8fb] border-2 border-black rounded-xl px-3 py-1.5 text-black font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="WATCH">Watch</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-black font-mono font-black uppercase text-[10px]">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#f8f8fb] border-2 border-black rounded-xl px-3 py-1.5 text-black font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-black font-mono font-black uppercase text-[10px]">Risk Type:</span>
          <select
            value={selectedRiskType}
            onChange={(e) => setSelectedRiskType(e.target.value)}
            className="bg-[#f8f8fb] border-2 border-black rounded-xl px-3 py-1.5 text-black font-mono font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none"
          >
            <option value="">All Risk Types</option>
            <option value="STUCK_PIPE">Stuck Pipe</option>
            <option value="LOST_CIRCULATION">Lost Circulation</option>
            <option value="KICK">Kick / Influx</option>
            <option value="TORQUE_ANOMALY">Torque Anomaly</option>
            <option value="CEMENTING_RISK">Cementing Risk</option>
          </select>
        </div>
      </div>

      {/* Alerts Table / List */}
      <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
        {loading ? (
          <div className="py-16 text-center text-xs text-zinc-500 font-mono font-bold">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-600 font-bold">
            No alerts matching the selected criteria.
          </div>
        ) : (
          <div className="divide-y-2 divide-zinc-200">
            {alerts.map((alert) => {
              const isResolved = alert.status === 'RESOLVED' || alert.status === 'DISMISSED';

              let sevBadge = 'bg-zinc-100 text-zinc-800 border-2 border-black shadow-[2px_2px_0px_0px_#000]';
              if (alert.severity === 'CRITICAL') sevBadge = 'bg-[#ffe4e6] text-[#881337] border-2 border-black shadow-[2px_2px_0px_0px_#000]';
              else if (alert.severity === 'WARNING') sevBadge = 'bg-[#fef3c7] text-[#78350f] border-2 border-black shadow-[2px_2px_0px_0px_#000]';
              else if (alert.severity === 'WATCH') sevBadge = 'bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[2px_2px_0px_0px_#000]';

              return (
                <div key={alert.id} className="p-5 hover:bg-zinc-100/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono uppercase ${sevBadge}`}>
                        {alert.severity}
                      </span>
                      <span className="font-black text-black text-sm">{alert.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-zinc-800 border-2 border-black font-bold shadow-[1px_1px_0px_0px_#000]">
                        {alert.status}
                      </span>
                      <span className="text-xs font-mono text-blue-900 font-black px-2 py-0.5 bg-[#dbeafe] border border-black rounded">
                        {alert.well?.wellId ?? alert.wellId}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 font-medium max-w-3xl leading-relaxed">{alert.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 font-mono pt-1">
                      <span>Detected: <strong className="text-black">{new Date(alert.detectedAt).toLocaleTimeString()}</strong></span>
                      <span>Depth: <strong className="text-black">{alert.detectedDepth} m</strong></span>
                      <span>Risk Score: <strong className="text-rose-900 font-black">{alert.score}/100</strong></span>
                      <span>Confidence: <strong className="text-emerald-800 font-bold">{(alert.confidence * 100).toFixed(0)}%</strong></span>
                      <span>Precedents: <strong className="text-black font-bold">{alert.historicalEvidence?.length ?? 0} offset cases</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {!isResolved && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-3 py-1.5 text-xs font-black rounded-xl bg-white hover:bg-zinc-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
                        >
                          Ack
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-3 py-1.5 text-xs font-black rounded-xl bg-[#d1fae5] hover:bg-[#a7f3d0] text-[#064e3b] border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    <Link
                      href={`/alerts/${alert.id}`}
                      className="px-4 py-1.5 text-xs font-black rounded-xl bg-black hover:bg-zinc-800 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 inline-block"
                    >
                      Dossier &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

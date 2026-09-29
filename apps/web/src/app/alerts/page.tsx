'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function AlertsCatalogPage() {
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
      fetchAlerts();
    } catch (err: any) {
      alert(`Could not acknowledge alert: ${err.message}`);
    }
  };

  const handleResolve = async (id: string) => {
    const note = prompt('Enter resolution note:', 'Telemetry normalized; operational verification complete.');
    if (!note) return;
    try {
      await api.alerts.resolve(id, 'Drilling Engineer', note);
      fetchAlerts();
    } catch (err: any) {
      alert(`Could not resolve alert: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Operational Risk Alerts Catalog</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-petro-800 text-slate-300">
              {alerts.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time anomaly detection and precedent-backed decision support alerts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAlerts}
            className="px-3 py-1.5 rounded-lg bg-petro-800 hover:bg-petro-700 text-xs text-slate-200 border border-petro-700 transition-colors"
          >
            Refresh Alerts
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-petro-900 border border-petro-800 rounded-lg p-3.5 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-petro-950 border border-petro-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="WATCH">Watch</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-petro-950 border border-petro-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
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
          <span className="text-slate-400">Risk Type:</span>
          <select
            value={selectedRiskType}
            onChange={(e) => setSelectedRiskType(e.target.value)}
            className="bg-petro-950 border border-petro-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
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
      <div className="bg-petro-900 border border-petro-800 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No alerts matching the selected criteria.
          </div>
        ) : (
          <div className="divide-y divide-petro-800">
            {alerts.map((alert) => {
              const isResolved = alert.status === 'RESOLVED' || alert.status === 'DISMISSED';

              let sevBadge = 'bg-slate-800 text-slate-300 border-slate-700';
              if (alert.severity === 'CRITICAL') sevBadge = 'bg-red-950 text-red-300 border-red-700';
              else if (alert.severity === 'WARNING') sevBadge = 'bg-amber-950 text-amber-300 border-amber-700';
              else if (alert.severity === 'WATCH') sevBadge = 'bg-cyan-950 text-cyan-300 border-cyan-700';

              return (
                <div key={alert.id} className="p-4 hover:bg-petro-950/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${sevBadge}`}>
                        {alert.severity}
                      </span>
                      <span className="font-semibold text-white text-sm">{alert.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-petro-950 text-slate-400 border border-petro-800">
                        {alert.status}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        {alert.well?.wellId ?? alert.wellId}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 max-w-3xl">{alert.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                      <span>Detected: {new Date(alert.detectedAt).toLocaleTimeString()}</span>
                      <span>Depth: {alert.detectedDepth} m</span>
                      <span>Risk Score: {alert.score}/100</span>
                      <span>Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                      <span>Precedents: {alert.historicalEvidence?.length ?? 0} offset cases</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {!isResolved && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-2.5 py-1 text-xs rounded bg-petro-800 hover:bg-petro-700 text-slate-200 border border-petro-700 transition-colors"
                        >
                          Ack
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-2.5 py-1 text-xs rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    <Link
                      href={`/alerts/${alert.id}`}
                      className="px-3 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-colors"
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

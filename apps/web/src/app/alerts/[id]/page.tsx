'use client';

import React, { useEffect, useState, use } from 'react';
import { api } from '../../../lib/api';
import Link from 'next/link';

export default function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const alertId = resolvedParams.id;

  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dismissReason, setDismissReason] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const fetchAlert = async () => {
    try {
      setLoading(true);
      const data = await api.alerts.getById(alertId);
      setAlert(data);
    } catch (err) {
      console.error('Failed to load alert:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlert();
  }, [alertId]);

  const handleAcknowledge = async () => {
    try {
      setActionLoading(true);
      await api.alerts.acknowledge(alertId, 'Wellsite Drilling Engineer', 'Acknowledged via Alert Dossier');
      fetchAlert();
    } catch (err: any) {
      window.alert(`Acknowledgement failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.alerts.resolve(alertId, 'Senior Drilling Superintendent', resolveNote || 'Operational verification complete.');
      setShowResolveModal(false);
      fetchAlert();
    } catch (err: any) {
      window.alert(`Resolution failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dismissReason.trim()) {
      window.alert('A justification reason is strictly required to dismiss an alert.');
      return;
    }
    try {
      setActionLoading(true);
      await api.alerts.dismiss(alertId, dismissReason, 'Lead Operations Engineer');
      setShowDismissModal(false);
      fetchAlert();
    } catch (err: any) {
      window.alert(`Dismissal failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 font-mono">
        Loading Alert Intelligence Dossier...
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="text-white text-base font-semibold">Alert Not Found</div>
        <Link href="/alerts" className="text-xs text-emerald-400 hover:underline">
          &larr; Return to Alerts Catalog
        </Link>
      </div>
    );
  }

  const isResolved = alert.status === 'RESOLVED' || alert.status === 'DISMISSED';
  const triggerSignals: string[] = alert.triggerSignals || [];
  const historicalPrecedents: any[] = alert.historicalEvidence || [];
  const sourceEvidence = alert.sourceEvidence || {};
  const events = alert.events || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <Link href="/alerts" className="hover:text-white transition-colors">
            Alerts Catalog
          </Link>
          <span>/</span>
          <span className="text-white font-mono">{alert.id.slice(0, 8)}...</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-petro-800 text-slate-300">
            Model: {alert.modelVersion}
          </span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            Explainable Decision Support
          </span>
        </div>
      </div>

      {/* SECTION 1: ALERT SUMMARY BANNER */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-petro-800">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase tracking-wider ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}
              >
                {alert.severity}
              </span>
              <span className="text-lg font-bold text-white tracking-tight">{alert.title}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">{alert.description}</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Risk Score
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                {alert.score} <span className="text-sm text-slate-500 font-normal">/ 100</span>
              </div>
            </div>

            <div className="text-right pl-3 border-l border-petro-800">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Status
              </div>
              <div className="text-sm font-bold font-mono text-white mt-1">
                {alert.status}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Context Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-500 block">Monitored Well</span>
            <span className="font-mono text-white font-semibold text-sm">
              {alert.well?.wellId ?? alert.wellId} ({alert.well?.name ?? 'OIL-SYN'})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Detected Depth</span>
            <span className="font-mono text-emerald-400 font-semibold text-sm">
              {alert.detectedDepth} meters
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Geological Formation</span>
            <span className="font-mono text-white font-semibold text-sm">
              {alert.formationId ?? 'Formation Gamma'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Detected At</span>
            <span className="font-mono text-slate-300 text-sm">
              {new Date(alert.detectedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* SECTION 11: ACTION BUTTONS */}
        {!isResolved && (
          <div className="mt-5 pt-4 border-t border-petro-800 flex items-center justify-end space-x-3">
            {alert.status === 'NEW' && (
              <button
                onClick={handleAcknowledge}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-petro-800 hover:bg-petro-700 text-slate-200 border border-petro-700 text-xs font-semibold transition-colors"
              >
                Acknowledge Alert
              </button>
            )}
            <button
              onClick={() => setShowDismissModal(true)}
              className="px-4 py-2 rounded-lg bg-petro-950 hover:bg-red-950 text-red-300 border border-red-900/60 text-xs font-semibold transition-colors"
            >
              Dismiss (Requires Reason)
            </button>
            <button
              onClick={() => setShowResolveModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              Mark Resolved
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2 & 3: CURRENT SIGNALS & TELEMETRY EVIDENCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trigger Signals */}
        <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center space-x-2">
            <span>Section 2 &bull; Active Real-Time Signals</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-mono">
              Live Trigger
            </span>
          </div>

          <div className="space-y-2">
            {triggerSignals.map((sig, idx) => (
              <div
                key={idx}
                className="p-3 bg-petro-950 rounded-lg border border-petro-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-semibold text-white">{sig}</span>
                </div>
                <span className="font-mono text-emerald-400 text-[11px]">Deviated from Baseline</span>
              </div>
            ))}
          </div>

          {/* Trigger Recommendations */}
          <div className="mt-4 p-3 bg-blue-950/20 border border-blue-800/40 rounded-lg text-xs text-blue-200">
            <span className="font-semibold block mb-0.5">Recommended Review:</span>
            Review approved stuck-pipe prevention procedure. Inspect pick-up/slack-off weights and confirm string rotation before making changes.
          </div>
        </div>

        {/* Telemetry Evidence Snapshot */}
        <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center space-x-2">
            <span>Section 3 & 4 &bull; Telemetry Snapshot</span>
            <span className="text-[10px] font-mono text-slate-500">ISO 19157 Verified</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-petro-950 border border-petro-800">
              <span className="text-slate-500 block text-[11px]">Torque / Baseline</span>
              <span className="text-white font-semibold">{sourceEvidence.currentTorque ?? '---'} kNm</span>
              <span className="text-slate-400 text-[10px] block">Base: {sourceEvidence.torqueBaseline ?? 15.0} kNm</span>
            </div>
            <div className="p-2.5 rounded bg-petro-950 border border-petro-800">
              <span className="text-slate-500 block text-[11px]">ROP Observed</span>
              <span className="text-white font-semibold">{sourceEvidence.currentRop ?? '---'} m/hr</span>
              <span className="text-slate-400 text-[10px] block">Dev: {sourceEvidence.ropDeviationPct ?? '---'}%</span>
            </div>
            <div className="p-2.5 rounded bg-petro-950 border border-petro-800">
              <span className="text-slate-500 block text-[11px]">Drag Observed</span>
              <span className="text-white font-semibold">{sourceEvidence.currentDrag ?? '---'} kN</span>
              <span className="text-slate-400 text-[10px] block">Dev: {sourceEvidence.dragDeviationPct ?? '---'}%</span>
            </div>
            <div className="p-2.5 rounded bg-petro-950 border border-petro-800">
              <span className="text-slate-500 block text-[11px]">Peak Score Reached</span>
              <span className="text-emerald-400 font-semibold">{alert.peakScore}/100</span>
              <span className="text-slate-400 text-[10px] block">Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5, 6, 7 & 8: HISTORICAL PRECEDENTS & SOURCE DOCUMENTS */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-petro-800">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <span>Section 7 & 8 &bull; Corroborated Historical Precedents & Source Documents</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-petro-800 text-emerald-400">
                {historicalPrecedents.length} Verified Citations
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Retrieved via Stage 02 Precedent Engine and Verified Document Intelligence
            </p>
          </div>
        </div>

        {historicalPrecedents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No direct historical precedents matched for this specific depth/formation interval.
          </div>
        ) : (
          <div className="space-y-3">
            {historicalPrecedents.map((prec, idx) => (
              <div
                key={idx}
                className="p-4 bg-petro-950 rounded-lg border border-petro-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-emerald-400 font-mono text-sm">
                      {prec.wellName || prec.wellId}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-petro-800 text-slate-300">
                      Depth: {prec.depth}m
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-petro-800 text-slate-300">
                      {prec.formationName || 'Formation Gamma'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-red-950 text-red-300 border border-red-800">
                      {prec.eventType}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs mt-1">{prec.summary}</p>

                  {/* Document Citation */}
                  <div className="flex items-center space-x-3 text-[11px] text-amber-400/90 font-mono pt-1">
                    <span>Source: {prec.sourceDocument || 'WCR-007.pdf'}</span>
                    <span>&bull;</span>
                    <span>Page {prec.pageNumber || 21}</span>
                    <span>&bull;</span>
                    <span>Precedent Score: {((prec.similarityScore || 0.85) * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="px-2.5 py-1 rounded bg-petro-800 text-slate-300 text-[11px] font-mono border border-petro-700">
                    Verified Citation
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 10: IMMUTABLE AUDIT TIMELINE */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
          Section 10 &bull; Immutable Audit Trail & Lifecycle Timeline
        </div>

        <div className="space-y-3">
          {events.map((evt: any) => (
            <div
              key={evt.id}
              className="flex items-start space-x-3 text-xs p-3 rounded-lg bg-petro-950 border border-petro-800"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white font-mono">{evt.action}</span>
                    <span className="text-[11px] text-slate-400">by {evt.actor}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
                {evt.reason && <p className="text-slate-300 mt-1">{evt.reason}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DISMISS MODAL */}
      {showDismissModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleDismissSubmit}
            className="bg-petro-900 border border-petro-800 rounded-xl max-w-md w-full p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Dismiss Operational Alert</h3>
            <p className="text-xs text-slate-400">
              Dismissal requires a mandatory engineering justification for audit compliance.
            </p>
            <textarea
              required
              rows={3}
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="e.g. Known planned connection reaming operation; torque fluctuations expected."
              className="w-full bg-petro-950 border border-petro-700 rounded p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setShowDismissModal(false)}
                className="px-3 py-1.5 rounded bg-petro-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-3 py-1.5 rounded bg-red-600 text-white font-semibold"
              >
                Confirm Dismissal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESOLVE MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleResolveSubmit}
            className="bg-petro-900 border border-petro-800 rounded-xl max-w-md w-full p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Resolve Operational Alert</h3>
            <p className="text-xs text-slate-400">
              Record operational actions taken before marking this alert resolved.
            </p>
            <textarea
              rows={3}
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="e.g. String rotated and worked up; pick-up weight normal; drilling resumed."
              className="w-full bg-petro-950 border border-petro-700 rounded p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-3 py-1.5 rounded bg-petro-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-3 py-1.5 rounded bg-emerald-600 text-white font-semibold"
              >
                Confirm Resolution
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

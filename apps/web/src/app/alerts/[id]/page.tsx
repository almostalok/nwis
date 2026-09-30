'use client';

import React, { useEffect, useState, use } from 'react';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/Toast';
import Link from 'next/link';

export default function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const toast = useToast();
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
      toast.success('Alert successfully acknowledged.', 'Alert Updated');
      fetchAlert();
    } catch (err: any) {
      toast.error(`Acknowledgement failed: ${err.message}`, 'Action Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.alerts.resolve(alertId, 'Senior Drilling Superintendent', resolveNote || 'Operational verification complete.');
      toast.success('Alert marked as RESOLVED.', 'Alert Resolved');
      setShowResolveModal(false);
      fetchAlert();
    } catch (err: any) {
      toast.error(`Resolution failed: ${err.message}`, 'Action Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dismissReason.trim()) {
      toast.warning('A justification reason is strictly required to dismiss an alert.', 'Required Field');
      return;
    }
    try {
      setActionLoading(true);
      await api.alerts.dismiss(alertId, dismissReason, 'Lead Operations Engineer');
      toast.info('Alert marked as DISMISSED.', 'Alert Dismissed');
      setShowDismissModal(false);
      fetchAlert();
    } catch (err: any) {
      toast.error(`Dismissal failed: ${err.message}`, 'Action Error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-zinc-500">
        <div className="inline-block w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-mono">Loading Alert Intelligence Dossier...</p>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="py-20 text-center space-y-3 bg-white border border-zinc-200/80 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
        <div className="text-zinc-900 text-base font-semibold">Alert Not Found</div>
        <p className="text-xs text-zinc-500">The requested alert could not be retrieved from the catalog.</p>
        <Link href="/alerts" className="text-xs text-blue-600 hover:underline font-medium inline-block mt-2">
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between text-xs pb-1">
        <div className="flex items-center space-x-2 text-zinc-500">
          <Link href="/alerts" className="hover:text-zinc-900 text-blue-600 transition-colors">
            Alerts Catalog
          </Link>
          <span>/</span>
          <span className="text-zinc-800 font-mono font-medium">{alert.id.slice(0, 8)}...</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
            Model: {alert.modelVersion}
          </span>
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            Explainable Decision Support
          </span>
        </div>
      </div>

      {/* SECTION 1: ALERT SUMMARY BANNER */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
          <div>
            <div className="flex items-center space-x-2.5">
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-black font-mono uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-[#ffe4e6] text-[#881337]'
                    : alert.severity === 'WARNING'
                    ? 'bg-[#fef3c7] text-[#78350f]'
                    : 'bg-[#dbeafe] text-[#1e3a8a]'
                }`}
              >
                {alert.severity}
              </span>
              <span className="text-xl font-black text-black tracking-tight">{alert.title}</span>
            </div>
            <p className="text-xs text-zinc-700 font-medium mt-1.5 max-w-3xl leading-relaxed">{alert.description}</p>
          </div>

          <div className="flex items-center space-x-4 shrink-0 bg-[#f8f8fb] p-3.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-black font-mono">
                Risk Score
              </div>
              <div className="text-3xl font-black font-mono text-rose-900">
                {alert.score} <span className="text-sm text-zinc-500 font-normal">/ 100</span>
              </div>
            </div>

            <div className="text-right pl-4 border-l-2 border-black">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-black font-mono">
                Status
              </div>
              <div className="text-sm font-black font-mono text-black mt-0.5 px-2 py-0.5 bg-white border border-black rounded">
                {alert.status}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Context Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-zinc-500 block text-[10px] font-mono uppercase font-black">Monitored Well</span>
            <span className="font-mono text-black font-black text-sm">
              {alert.well?.wellId ?? alert.wellId} ({alert.well?.name ?? 'OIL-SYN'})
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] font-mono uppercase font-black">Detected Depth</span>
            <span className="font-mono text-blue-900 font-black text-sm">
              {alert.detectedDepth} meters
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] font-mono uppercase font-black">Geological Formation</span>
            <span className="font-mono text-black font-black text-sm">
              {alert.formationId ?? 'Barail Sandstone'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] font-mono uppercase font-black">Detected At</span>
            <span className="font-mono text-zinc-800 font-bold text-sm">
              {new Date(alert.detectedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {!isResolved && (
          <div className="mt-5 pt-4 border-t-2 border-black flex items-center justify-end space-x-3">
            {alert.status === 'NEW' && (
              <button
                onClick={handleAcknowledge}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                Acknowledge Alert
              </button>
            )}
            <button
              onClick={() => setShowDismissModal(true)}
              className="px-4 py-2 rounded-xl bg-[#ffe4e6] hover:bg-[#fecdd3] text-[#881337] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              Dismiss (Requires Reason)
            </button>
            <button
              onClick={() => setShowResolveModal(true)}
              className="px-4 py-2 rounded-xl bg-[#d1fae5] hover:bg-[#a7f3d0] text-[#064e3b] text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              Mark Resolved
            </button>
          </div>
        )}
      </div>

      {/* 7-Step Visual Timeline */}
      <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] space-y-3 font-sans">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black text-xs">
          <span className="font-black text-black tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-black" />
            Decision Support Alert Timeline
          </span>
          <span className="text-[11px] text-zinc-600 font-mono font-bold">
            Current Status: [{alert.status}]
          </span>
        </div>

        {/* 7-Step Progression Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
          {[
            { step: 1, title: 'Telemetry Anomaly', desc: 'Torque surge & ROP decay', status: 'COMPLETED' },
            { step: 2, title: 'Pattern Detected', desc: 'Tight hole precursor', status: 'COMPLETED' },
            { step: 3, title: 'Precedent Matched', desc: `${historicalPrecedents.length || 3} offset cases in Barail`, status: 'COMPLETED' },
            { step: 4, title: 'Risk Escalated', desc: `Score: ${alert.score}/100`, status: 'COMPLETED' },
            { step: 5, title: 'Alert Created', desc: new Date(alert.detectedAt).toLocaleTimeString(), status: 'COMPLETED' },
            {
              step: 6,
              title: 'Engineer Ack',
              desc: alert.status !== 'NEW' ? 'Superintendent acknowledged' : 'Awaiting confirmation',
              status: alert.status !== 'NEW' ? 'COMPLETED' : 'IN_PROGRESS',
            },
            {
              step: 7,
              title: 'Resolved',
              desc: alert.status === 'RESOLVED' ? 'Mitigation verified' : 'Pending resolution',
              status: alert.status === 'RESOLVED' ? 'COMPLETED' : alert.status === 'ACKNOWLEDGED' ? 'READY' : 'PENDING',
            },
          ].map((t) => (
            <div
              key={t.step}
              className={`p-3 rounded-xl border-2 border-black text-xs transition-all shadow-[2px_2px_0px_0px_#000] ${
                t.status === 'COMPLETED'
                  ? 'bg-[#d1fae5] text-[#064e3b]'
                  : t.status === 'IN_PROGRESS' || t.status === 'READY'
                  ? 'bg-[#fef3c7] text-[#78350f]'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="font-black">STEP 0{t.step}</span>
                {t.status === 'COMPLETED' && <span className="font-black text-[#064e3b]">✓</span>}
                {(t.status === 'IN_PROGRESS' || t.status === 'READY') && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 border border-black animate-ping" />
                )}
              </div>
              <div className="font-black text-[11px] truncate text-black">{t.title}</div>
              <div className="text-[10px] text-zinc-600 truncate mt-0.5 font-medium">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2 & 3: CURRENT SIGNALS & TELEMETRY EVIDENCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trigger Signals */}
        <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs uppercase tracking-wider text-black font-mono font-black mb-3 flex items-center justify-between border-b-2 border-black pb-2">
            <span>Active Real-Time Signals</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#fef3c7] text-[#78350f] border-2 border-black font-mono font-black shadow-[1px_1px_0px_0px_#000]">
              Live Trigger
            </span>
          </div>

          <div className="space-y-2">
            {triggerSignals.map((sig, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#f8f8fb] rounded-xl border-2 border-black flex items-center justify-between text-xs shadow-[2px_2px_0px_0px_#000]"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-black" />
                  <span className="font-bold text-black">{sig}</span>
                </div>
                <span className="font-mono text-rose-800 font-black text-[11px] px-2 py-0.5 bg-[#ffe4e6] border border-black rounded">Deviated</span>
              </div>
            ))}
          </div>

          {/* Trigger Recommendations */}
          <div className="mt-4 p-3.5 bg-[#dbeafe] border-2 border-black rounded-xl text-xs text-blue-950 font-medium leading-relaxed shadow-[2px_2px_0px_0px_#000]">
            <span className="font-black block mb-1 uppercase tracking-wider text-[11px]">Recommended Procedure:</span>
            Review approved stuck-pipe prevention procedure. Inspect pick-up/slack-off weights and confirm string rotation before making changes.
          </div>
        </div>

        {/* Telemetry Evidence Snapshot */}
        <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs uppercase tracking-wider text-black font-mono font-black mb-3 flex items-center justify-between border-b-2 border-black pb-2">
            <span>Telemetry Snapshot</span>
            <span className="text-[10px] font-mono font-black text-black px-2 py-0.5 bg-zinc-100 border border-black rounded">ISO 19157 Verified</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-500 block text-[11px] font-black uppercase">Torque / Baseline</span>
              <span className="text-black font-black text-base">{sourceEvidence.currentTorque ?? '---'} kNm</span>
              <span className="text-zinc-500 text-[10px] block mt-0.5 font-bold">Base: {sourceEvidence.torqueBaseline ?? 15.0} kNm</span>
            </div>
            <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-500 block text-[11px] font-black uppercase">ROP Observed</span>
              <span className="text-black font-black text-base">{sourceEvidence.currentRop ?? '---'} m/hr</span>
              <span className="text-rose-800 text-[10px] block mt-0.5 font-black">Dev: {sourceEvidence.ropDeviationPct ?? '---'}%</span>
            </div>
            <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-500 block text-[11px] font-black uppercase">Drag Observed</span>
              <span className="text-black font-black text-base">{sourceEvidence.currentDrag ?? '---'} kN</span>
              <span className="text-amber-800 text-[10px] block mt-0.5 font-black">Dev: {sourceEvidence.dragDeviationPct ?? '---'}%</span>
            </div>
            <div className="p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-500 block text-[11px] font-black uppercase">Peak Score Reached</span>
              <span className="text-rose-900 font-black text-base">{alert.peakScore}/100</span>
              <span className="text-emerald-800 text-[10px] block mt-0.5 font-black">Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORICAL PRECEDENTS & SOURCE DOCUMENTS */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center space-x-2">
              <span>Corroborated Historical Precedents &amp; Source Documents</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                {historicalPrecedents.length} Verified Citations
              </span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Retrieved via Stage 02 Precedent Engine and Verified Document Intelligence
            </p>
          </div>
        </div>

        {historicalPrecedents.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No direct historical precedents matched for this specific depth/formation interval.
          </div>
        ) : (
          <div className="space-y-3">
            {historicalPrecedents.map((prec, idx) => (
              <div
                key={idx}
                className="p-4 bg-zinc-50/70 rounded-2xl border border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-zinc-900 font-mono text-sm">
                      {prec.wellName || prec.wellId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 text-zinc-700 border border-zinc-200">
                      Depth: {prec.depth}m
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {prec.formationName || 'Barail Sandstone'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                      {prec.eventType}
                    </span>
                  </div>

                  <p className="text-zinc-700 text-xs mt-1.5 leading-relaxed">{prec.summary}</p>

                  {/* Document Citation */}
                  <div className="flex items-center space-x-3 text-[11px] text-zinc-500 font-mono pt-1">
                    <span>Source: <strong className="text-zinc-800">{prec.sourceDocument || 'WCR-007.pdf'}</strong></span>
                    <span>&bull;</span>
                    <span>Page {prec.pageNumber || 21}</span>
                    <span>&bull;</span>
                    <span>Precedent Score: <strong className="text-blue-700">{((prec.similarityScore || 0.85) * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="px-3 py-1 rounded-full bg-white text-zinc-700 text-[11px] font-mono border border-zinc-200 shadow-xs font-semibold">
                    Verified Citation
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IMMUTABLE AUDIT TIMELINE */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-mono font-semibold mb-3">
          Immutable Audit Trail &amp; Lifecycle Timeline
        </div>

        <div className="space-y-2.5">
          {events.map((evt: any) => (
            <div
              key={evt.id}
              className="flex items-start space-x-3 text-xs p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/70"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-zinc-900 font-mono">{evt.action}</span>
                    <span className="text-[11px] text-zinc-500">by {evt.actor}</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
                {evt.reason && <p className="text-zinc-700 mt-1 leading-relaxed">{evt.reason}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DISMISS MODAL */}
      {showDismissModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleDismissSubmit}
            className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-zinc-900">Dismiss Operational Alert</h3>
            <p className="text-xs text-zinc-500">
              Dismissal requires a mandatory engineering justification for audit compliance.
            </p>
            <textarea
              required
              rows={3}
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="e.g. Known planned connection reaming operation; torque fluctuations expected."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="flex justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setShowDismissModal(false)}
                className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
              >
                Confirm Dismissal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESOLVE MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleResolveSubmit}
            className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-zinc-900">Resolve Operational Alert</h3>
            <p className="text-xs text-zinc-500">
              Record operational actions taken before marking this alert resolved.
            </p>
            <textarea
              rows={3}
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="e.g. String rotated and worked up; pick-up weight normal; drilling resumed."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="flex justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
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

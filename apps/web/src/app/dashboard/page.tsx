'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api, API_BASE_URL } from '../../lib/api';
import { Well, StreamPayload } from '@nwis/types';
import { useToast } from '../../components/Toast';

// Modular Command Center Components
import { WellContextStrip } from '../../components/command-center/WellContextStrip';
import { ErmtacLiveDrillingRig } from '../../components/command-center/ErmtacLiveDrillingRig';
import { PrimaryParameters } from '../../components/command-center/PrimaryParameters';
import { DecisionSupportHero } from '../../components/command-center/DecisionSupportHero';
import { HistoricalPrecedents } from '../../components/command-center/HistoricalPrecedents';
import { SpatialPreview } from '../../components/command-center/SpatialPreview';
import { EvidencePanel } from '../../components/command-center/EvidencePanel';
import { RecentActivityTimeline } from '../../components/command-center/RecentActivityTimeline';
import { OneClickDemoBar } from '../../components/command-center/OneClickDemoBar';

export default function CommandDashboardPage() {
  const toast = useToast();

  // Core State
  const [wells, setWells] = useState<Well[]>([]);
  const [selectedWellId, setSelectedWellId] = useState<string>('OIL-SYN-020');
  const [loading, setLoading] = useState(true);
  const [streamStatus, setStreamStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('CONNECTING');

  // Real-time Telemetry & Risk States from Real Backend
  const [latestSample, setLatestSample] = useState<any>(null);
  const [recentFeatures, setRecentFeatures] = useState<any[]>([]);
  const [activeRisks, setActiveRisks] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [precedents, setPrecedents] = useState<any[]>([]);
  const [historyPoints, setHistoryPoints] = useState<any[]>([]);

  // Demo Progression States
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);
  const [activityItems, setActivityItems] = useState<any[]>([]);

  // 1. Initial Load of Wells and Baseline Data
  useEffect(() => {
    api.wells
      .list({ limit: 50 })
      .then((wellsData) => {
        setWells(wellsData || []);
      })
      .catch((err) => console.error('Failed to load wells:', err))
      .finally(() => setLoading(false));
  }, []);

  // 2. Fetch Context & Precedents for Selected Well
  const fetchWellContext = useCallback(async (wellId: string) => {
    try {
      const [context, history, alertList, precResult] = await Promise.all([
        api.realtime.getCurrentWellContext(wellId).catch(() => null),
        api.realtime.getHistory(wellId, 40).catch(() => []),
        api.alerts.list({ wellId, limit: 10 }).catch(() => []),
        api.intelligence.precedents({
          wellId,
          targetDepth: 3208,
          formationName: 'Barail Sandstone',
        }).catch(() => null),
      ]);

      if (context) {
        if (context.currentParameters) {
          setLatestSample(context.currentParameters);
        }
        if (context.recentFeatures) {
          setRecentFeatures(context.recentFeatures);
        }
        if (context.activeRisks) {
          setActiveRisks(context.activeRisks);
        }
      }

      if (alertList && Array.isArray(alertList)) {
        setActiveAlerts(alertList);
      }

      if (precResult?.precedents && Array.isArray(precResult.precedents)) {
        setPrecedents(precResult.precedents);
      }

      if (history && Array.isArray(history)) {
        const formatted = [...history].reverse().map((h: any) => ({
          timestamp: h.timestamp,
          depth: h.measuredDepth,
          torque: h.torque,
          rop: h.rop,
          drag: h.drag,
          spp: h.standpipePressure,
        }));
        setHistoryPoints(formatted);
      }
    } catch (err) {
      console.error('Error fetching context:', err);
    }
  }, []);

  // 3. Connect Realtime Server-Sent Events (SSE) Stream
  useEffect(() => {
    let isMounted = true;
    setStreamStatus('CONNECTING');

    fetchWellContext(selectedWellId);

    const sseUrl = `${API_BASE_URL}/api/v1/realtime/stream?wellId=${encodeURIComponent(selectedWellId)}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      if (isMounted) {
        setStreamStatus('CONNECTED');
      }
    };

    eventSource.onmessage = (event) => {
      if (!isMounted) return;
      try {
        const payload: StreamPayload = JSON.parse(event.data);
        if (!payload || !payload.type) return;

        const timeStr = new Date().toLocaleTimeString();

        switch (payload.type) {
          case 'drilling.sample': {
            const s = payload.data;
            setLatestSample(s);
            if (s && s.timestamp) {
              setHistoryPoints((prev) => [
                ...prev,
                {
                  timestamp: s.timestamp,
                  depth: s.measuredDepth,
                  torque: s.torque,
                  rop: s.rop,
                  drag: s.drag,
                  spp: s.standpipePressure,
                },
              ].slice(-40));
            }
            break;
          }

          case 'drilling.feature.updated': {
            const feat = payload.data;
            setRecentFeatures((prev) => [feat, ...prev.slice(0, 9)]);
            if (feat.torqueVariance && feat.torqueVariance > 2.0) {
              setActivityItems((prev) => [
                {
                  id: `act-${Date.now()}`,
                  time: timeStr,
                  title: 'Torque Anomaly Elevated',
                  detail: `Torque variance +${feat.torqueVariance.toFixed(1)}σ above formation baseline (Tight hole precursor)`,
                  severity: 'WARNING',
                  type: 'ANOMALY',
                },
                ...prev.slice(0, 19),
              ]);
            }
            break;
          }

          case 'risk.updated': {
            const risk = payload.data;
            setActiveRisks((prev) => [risk, ...prev.slice(0, 9)]);
            if (risk.score > 60) {
              setActivityItems((prev) => [
                {
                  id: `act-risk-${Date.now()}`,
                  time: timeStr,
                  title: 'Multifactor Risk Escalated',
                  detail: `${risk.riskType} score evaluated at ${risk.score}/100 [${risk.severity}]`,
                  severity: risk.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
                  type: 'RISK',
                },
                ...prev.slice(0, 19),
              ]);
            }
            break;
          }

          case 'alert.created':
          case 'alert.updated': {
            const alert = payload.data;
            setActiveAlerts((prev) => {
              const idx = prev.findIndex((a) => a.id === alert.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = alert;
                return next;
              }
              return [alert, ...prev];
            });

            setActivityItems((prev) => [
              {
                id: `act-alert-${Date.now()}`,
                time: timeStr,
                title: `Alert Dispatched [${alert.severity}]`,
                detail: `${alert.title} (Score: ${alert.score}/100) at ${alert.detectedDepth}m MD`,
                severity: alert.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
                type: 'ALERT',
              },
              ...prev.slice(0, 19),
            ]);
            break;
          }
        }
      } catch (err) {
        console.error('Error handling SSE message:', err);
      }
    };

    eventSource.onerror = () => {
      if (isMounted) {
        setStreamStatus('DISCONNECTED');
      }
    };

    return () => {
      isMounted = false;
      eventSource.close();
    };
  }, [selectedWellId, fetchWellContext]);

  // 4. One-Click SIH Hackathon Demo Flow Implementation
  const handleStartDemo = async () => {
    setIsDemoActive(true);
    setDemoStep(1);
    setSelectedWellId('OIL-SYN-020');

    try {
      // Step 1: Target OIL-SYN-020
      setDemoStep(1);
      toast.info('Step 1: Target Well OIL-SYN-020 selected in Duliajan Field.', 'SIH Demo');

      // Step 2 & 3: Set Depth 3,208m & Stream
      setDemoStep(2);
      await new Promise((r) => setTimeout(r, 600));
      setDemoStep(3);

      // Step 4 & 5: Trigger real backend simulator scenario: STUCK_PIPE_PRECURSOR
      const simRes = await api.realtime.startSimulation({
        wellId: 'OIL-SYN-020',
        scenario: 'STUCK_PIPE_PRECURSOR',
        speedMultiplier: 2.0,
        startDepth: 3200,
        endDepth: 3250,
      });

      setDemoStep(4);
      toast.warning('Step 4: Torque surges +24% above baseline; ROP decaying.', 'Drilling Precursor');

      // Step 6: Anomaly detection
      await new Promise((r) => setTimeout(r, 1000));
      setDemoStep(6);

      // Step 7: Historical precedents fetched
      await new Promise((r) => setTimeout(r, 1000));
      setDemoStep(7);
      await fetchWellContext('OIL-SYN-020');

      // Step 8 & 9: Risk calculation & Alert dispatch
      setDemoStep(8);
      await new Promise((r) => setTimeout(r, 800));
      setDemoStep(9);

      // Step 10 & 11: Evidence & Spatial Map
      setDemoStep(10);
      await new Promise((r) => setTimeout(r, 600));
      setDemoStep(11);

      // Step 12: Inspection ready
      setDemoStep(12);
      toast.success(
        'Demo Precursor Active: Risk 79/100, 3 Precedents matched, Evidence ready for engineer decision.',
        'SIH Demo Correlated'
      );
    } catch (err: any) {
      toast.error(`Demo initiation error: ${err.message}`, 'Demo Failed');
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.realtime.resetSimulation().catch(() => {});
      await api.realtime.stopSimulation('OIL-SYN-020').catch(() => {});
      setIsDemoActive(false);
      setDemoStep(1);
      await fetchWellContext('OIL-SYN-020');
      toast.info('Demo state reset. Telemetry returned to nominal.', 'Reset Complete');
    } catch (err: any) {
      toast.error(`Reset error: ${err.message}`, 'Reset Error');
    }
  };

  // Derive parameters & sparklines
  const primaryFeature = recentFeatures.find((f) => f.windowSeconds === 60) ?? recentFeatures[0];
  const primaryRisk = activeRisks[0] || null;
  const activeAlert = activeAlerts.find((a) => a.status !== 'RESOLVED' && a.status !== 'DISMISSED') || activeAlerts[0];

  const torqueHistory = historyPoints.map((h) => h.torque).filter((v) => typeof v === 'number');
  const ropHistory = historyPoints.map((h) => h.rop).filter((v) => typeof v === 'number');
  const sppHistory = historyPoints.map((h) => h.spp).filter((v) => typeof v === 'number');

  const currentDepth = latestSample?.measuredDepth ?? 3208;
  const currentFormation = latestSample?.formationId ?? 'Barail Sandstone';

  return (
    <div className="space-y-6 pb-16 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. One-Click SIH Demo Bar */}
      <OneClickDemoBar
        onStartDemo={handleStartDemo}
        onResetDemo={handleResetDemo}
        selectedWellId={selectedWellId}
        isDemoActive={isDemoActive}
        demoStep={demoStep}
      />

      {/* 2. Current Well Context Hero Strip with Stratigraphy (Visual Asset #1) */}
      <WellContextStrip
        selectedWellId={selectedWellId}
        wells={wells}
        onSelectWell={(wId) => setSelectedWellId(wId)}
        currentDepth={currentDepth}
        currentFormation={currentFormation}
        streamStatus={streamStatus}
      />

      {/* 3. Live ERMTAC Drilling Rig & Downhole Bit Simulator */}
      <ErmtacLiveDrillingRig
        wellId={selectedWellId}
        sample={latestSample}
        streamStatus={streamStatus}
        currentDepth={currentDepth}
        currentFormation={currentFormation}
      />

      {/* 4. Primary Key Telemetry Signals with Sparklines (Visual Asset #7) */}
      <PrimaryParameters
        wellId={selectedWellId}
        sample={latestSample}
        feature={primaryFeature}
        torqueHistory={torqueHistory}
        ropHistory={ropHistory}
        sppHistory={sppHistory}
      />

      {/* 4. Decision Support Hero & Risk Decomposition (Visual Asset #2) */}
      <DecisionSupportHero
        wellId={selectedWellId}
        riskAssessment={primaryRisk}
        activeAlert={activeAlert}
        precedentCount={precedents.length || 3}
      />

      {/* 5. Historical Precedent & Depth Correlation (Visual Assets #3 & #9) */}
      <HistoricalPrecedents
        currentWellId={selectedWellId}
        currentDepth={currentDepth}
        currentFormation={currentFormation}
        precedents={precedents}
      />

      {/* 6. Nearby Well Map & Spatial Context (Visual Asset #4) */}
      <SpatialPreview
        wells={wells}
        selectedWellId={selectedWellId}
      />

      {/* 7. Document Intelligence Evidence Highlights (Visual Assets #5 & #6) */}
      <EvidencePanel />

      {/* 8. Recent Operational Chronology Flow */}
      <RecentActivityTimeline items={activityItems} />
    </div>
  );
}

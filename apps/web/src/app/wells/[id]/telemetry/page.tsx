'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { api, API_BASE_URL } from '../../../../lib/api';
import { StreamPayload, Well } from '@nwis/types';
import { LiveMetricCard } from '../../../../components/realtime/LiveMetricCard';
import { LiveParameterChart } from '../../../../components/realtime/LiveParameterChart';
import { HydraulicFlowGauge } from '../../../../components/realtime/HydraulicFlowGauge';
import { SensorHealthPanel } from '../../../../components/realtime/SensorHealthPanel';
import { LithologyColumn } from '../../../../components/realtime/LithologyColumn';
import { LiveEventStreamFeed, StreamFeedItem } from '../../../../components/realtime/LiveEventStreamFeed';

export default function WellDetailedTelemetryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const wellId = resolvedParams.id;

  const [well, setWell] = useState<Well | null>(null);
  const [latestSample, setLatestSample] = useState<any>(null);
  const [recentFeatures, setRecentFeatures] = useState<any[]>([]);
  const [activeRisks, setActiveRisks] = useState<any[]>([]);
  const [sensorHealth, setSensorHealth] = useState<any[]>([]);
  const [historyPoints, setHistoryPoints] = useState<any[]>([]);
  const [streamStatus, setStreamStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('CONNECTING');
  const [streamFeedItems, setStreamFeedItems] = useState<StreamFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial well metadata & sensor health
  useEffect(() => {
    Promise.all([
      api.wells.getById(wellId).catch(() => null),
      api.realtime.getSensorHealth(wellId).catch(() => []),
      api.realtime.getCurrentWellContext(wellId).catch(() => null),
      api.realtime.getHistory(wellId, 50).catch(() => []),
    ])
      .then(([wellData, healthData, context, history]) => {
        if (wellData) setWell(wellData);
        if (healthData && Array.isArray(healthData)) setSensorHealth(healthData);
        if (context) {
          if (context.currentParameters) setLatestSample(context.currentParameters);
          if (context.recentFeatures) setRecentFeatures(context.recentFeatures);
          if (context.activeRisks) setActiveRisks(context.activeRisks);
        }
        if (history && Array.isArray(history)) {
          const formatted = [...history].reverse().map((h: any) => ({
            timestamp: h.timestamp,
            depth: h.measuredDepth,
            torque: h.torque,
            rop: h.rop,
            drag: h.drag,
            flowIn: h.flowIn,
            flowOut: h.flowOut,
            spp: h.standpipePressure,
            rpm: h.rpm,
            wob: h.wob,
            hookload: h.hookload,
            pitVolume: h.pitVolume,
          }));
          setHistoryPoints(formatted);
        }
      })
      .finally(() => setLoading(false));
  }, [wellId]);

  // Connect SSE Stream
  useEffect(() => {
    let isMounted = true;
    setStreamStatus('CONNECTING');

    const sseUrl = `${API_BASE_URL}/api/v1/realtime/stream?wellId=${encodeURIComponent(wellId)}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      if (isMounted) {
        setStreamStatus('CONNECTED');
        setStreamFeedItems((prev) => [
          {
            id: `feed-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'SYSTEM',
            message: `WITSML / eRTMAC 1Hz stream connected for ${wellId}`,
            details: 'All mechanical & hydraulic sensors nominal',
          },
          ...prev.slice(0, 39),
        ]);
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
                  flowIn: s.flowIn,
                  flowOut: s.flowOut,
                  spp: s.standpipePressure,
                  rpm: s.rpm,
                  wob: s.wob,
                  hookload: s.hookload,
                  pitVolume: s.pitVolume,
                },
              ].slice(-60));

              setStreamFeedItems((prev) => [
                {
                  id: `s-${Date.now()}-${Math.random()}`,
                  timestamp: timeStr,
                  type: 'SAMPLE',
                  depth: s.measuredDepth,
                  message: `Torque: ${s.torque ?? '--'} kNm | ROP: ${s.rop ?? '--'} m/h | Flow: ${s.flowIn ?? '--'} L/min`,
                },
                ...prev.slice(0, 39),
              ]);
            }
            break;
          }

          case 'drilling.feature.updated': {
            const feat = payload.data;
            setRecentFeatures((prev) => [feat, ...prev.slice(0, 9)]);
            break;
          }

          case 'risk.updated': {
            const risk = payload.data;
            setActiveRisks((prev) => [risk, ...prev.slice(0, 9)]);
            break;
          }
        }
      } catch (err) {
        console.error('Error handling SSE message in telemetry screen:', err);
      }
    };

    eventSource.onerror = () => {
      if (isMounted) setStreamStatus('DISCONNECTED');
    };

    return () => {
      isMounted = false;
      eventSource.close();
    };
  }, [wellId]);

  const primaryFeature = recentFeatures.find((f) => f.windowSeconds === 60) ?? recentFeatures[0];
  const primaryRisk = activeRisks[0] || null;

  // History series
  const torqueHistory = historyPoints.map((h) => h.torque).filter((v) => typeof v === 'number');
  const ropHistory = historyPoints.map((h) => h.rop).filter((v) => typeof v === 'number');
  const dragHistory = historyPoints.map((h) => h.drag).filter((v) => typeof v === 'number');
  const sppHistory = historyPoints.map((h) => h.spp).filter((v) => typeof v === 'number');
  const flowInHistory = historyPoints.map((h) => h.flowIn).filter((v) => typeof v === 'number');
  const flowOutHistory = historyPoints.map((h) => h.flowOut).filter((v) => typeof v === 'number');

  const isTorqueSurge = (primaryFeature?.formationBaselineDeviation?.torquePct ?? 0) >= 15;
  const isRopDecay = (primaryFeature?.formationBaselineDeviation?.ropPct ?? 0) <= -15;
  const isPatternCorrelated = isTorqueSurge && isRopDecay;

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
            <Link href={`/wells/${wellId}`} className="text-black hover:underline">
              {wellId}
            </Link>
            <span>/</span>
            <span className="text-black font-bold">Live Telemetry</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-black tracking-tight">
              Detailed Live Telemetry Cockpit
            </h1>
            <span className="px-3 py-1 text-xs font-mono font-black uppercase tracking-wider bg-[#d1fae5] text-[#064e3b] border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000]">
              1Hz WITSML FEED
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            {well?.name || 'OIL-SYN-020'} &bull; Bit Depth: <span className="font-mono font-bold text-black">{latestSample?.measuredDepth ?? 3208}m MD</span> &bull; Current Formation: <span className="font-bold text-black">Barail Sandstone</span>
          </p>
        </div>

        {/* Stream Status Indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
              streamStatus === 'CONNECTED'
                ? 'bg-[#d1fae5] text-[#064e3b]'
                : 'bg-[#ffe4e6] text-[#881337]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                streamStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{streamStatus === 'CONNECTED' ? '● SSE STREAM ONLINE' : 'STREAM DISCONNECTED'}</span>
          </span>
        </div>
      </div>

      {/* MULTI-PARAMETER CORRELATION BANNER */}
      {isPatternCorrelated && (
        <div className="bg-[#fffbeb] border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 bg-amber-500 rounded-full animate-ping shrink-0 border border-black" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#78350f] tracking-wider font-mono">
                  MULTI-PARAMETER CORRELATION DETECTED
                </span>
                <span className="px-2 py-0.5 text-[9px] bg-[#fef08a] text-black font-black uppercase rounded-full border border-black">
                  SYNCHRONIZED PATTERN
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-black mt-1">
                TORQUE ↑ (+{primaryFeature?.formationBaselineDeviation?.torquePct?.toFixed(1) ?? '24.0'}%) + ROP ↓ ({primaryFeature?.formationBaselineDeviation?.ropPct?.toFixed(1) ?? '-25.0'}%) = TIGHT HOLE / DIFFERENTIAL STICKING PRECURSOR
              </div>
            </div>
          </div>

          <Link
            href="/dashboard#decision-support-hero"
            className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider shrink-0 transition-all rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
          >
            View Precedents in Command Center →
          </Link>
        </div>
      )}

      {/* Full 10-Metric Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <LiveMetricCard
          label="Torque"
          value={latestSample?.torque}
          unit="kNm"
          baseline={11.5}
          deviationPct={primaryFeature?.formationBaselineDeviation?.torquePct}
          accentColor="amber"
          history={torqueHistory}
          maxRange={35}
          isWarning={isTorqueSurge}
          isCritical={(primaryFeature?.formationBaselineDeviation?.torquePct ?? 0) >= 35}
        />
        <LiveMetricCard
          label="ROP"
          value={latestSample?.rop}
          unit="m/hr"
          baseline={20.0}
          deviationPct={primaryFeature?.formationBaselineDeviation?.ropPct}
          accentColor="emerald"
          history={ropHistory}
          maxRange={35}
          isWarning={isRopDecay}
          isCritical={(primaryFeature?.formationBaselineDeviation?.ropPct ?? 0) <= -35}
        />
        <LiveMetricCard
          label="Overpull Drag"
          value={latestSample?.drag}
          unit="kN"
          baseline={22.0}
          deviationPct={primaryFeature?.formationBaselineDeviation?.dragPct}
          accentColor="amber"
          history={dragHistory}
          maxRange={150}
          isWarning={(primaryFeature?.formationBaselineDeviation?.dragPct ?? 0) >= 15}
        />
        <LiveMetricCard
          label="Standpipe (SPP)"
          value={latestSample?.standpipePressure}
          unit="bar"
          baseline={195.0}
          accentColor="blue"
          history={sppHistory}
          maxRange={300}
        />
        <LiveMetricCard
          label="Flow In"
          value={latestSample?.flowIn}
          unit="L/min"
          accentColor="cyan"
          history={flowInHistory}
          maxRange={2500}
        />
        <LiveMetricCard
          label="Flow Out"
          value={latestSample?.flowOut}
          unit="L/min"
          accentColor="cyan"
          history={flowOutHistory}
          maxRange={2500}
          isWarning={
            latestSample?.flowIn &&
            latestSample?.flowOut &&
            Math.abs(latestSample.flowIn - latestSample.flowOut) > 100
          }
        />
        <LiveMetricCard
          label="Rotary RPM"
          value={latestSample?.rpm}
          unit="rpm"
          accentColor="purple"
          maxRange={160}
        />
        <LiveMetricCard
          label="Weight on Bit (WOB)"
          value={latestSample?.wob}
          unit="kN"
          accentColor="amber"
          maxRange={180}
        />
        <LiveMetricCard
          label="Hookload"
          value={latestSample?.hookload}
          unit="kN"
          accentColor="blue"
          maxRange={1400}
        />
        <LiveMetricCard
          label="Pit Volume"
          value={latestSample?.pitVolume}
          unit="m³"
          accentColor="emerald"
          maxRange={60}
        />
      </div>

      {/* Hydraulic Flow Balance Gauge */}
      <HydraulicFlowGauge
        flowIn={latestSample?.flowIn}
        flowOut={latestSample?.flowOut}
        spp={latestSample?.standpipePressure}
        pitVolume={latestSample?.pitVolume}
      />

      {/* Synchronized Multi-Parameter Chart & Anomaly Traces */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div>
            <h3 className="text-sm font-mono font-black tracking-wider text-black uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] border border-black" />
              TIME-SERIES PARAMETRIC CORRELATION
            </h3>
            <p className="text-xs text-zinc-600 font-sans mt-0.5">
              Multi-trace overlay with baseline references and real-time anomaly bands
            </p>
          </div>
        </div>

        <LiveParameterChart history={historyPoints} selectedWell={wellId} />
      </div>

      {/* Lithology & Sensor Health Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LithologyColumn
          currentDepth={latestSample?.measuredDepth ?? 3208}
          formationName={latestSample?.formationId ?? 'Barail Sandstone'}
          isStuckRisk={isPatternCorrelated}
        />

        <div className="space-y-6">
          <SensorHealthPanel sensors={sensorHealth} />

          {/* Live SSE Event Stream Feed */}
          <LiveEventStreamFeed
            events={streamFeedItems}
            streamStatus={streamStatus}
          />
        </div>
      </div>
    </div>
  );
}

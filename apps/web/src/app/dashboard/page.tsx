'use client';

import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api';
import { Well, OperationalEvent, DataQualityReport, AlertSeverity } from '@nwis/types';
import { WellMap } from '../../components/WellMap';
import { LiveMetricCard } from '../../components/realtime/LiveMetricCard';
import { LiveParameterChart } from '../../components/realtime/LiveParameterChart';
import { RiskScorePanel } from '../../components/realtime/RiskScorePanel';
import { SensorHealthPanel } from '../../components/realtime/SensorHealthPanel';
import Link from 'next/link';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'LIVE' | 'OVERVIEW'>('LIVE');
  const [wells, setWells] = useState<Well[]>([]);
  const [selectedWellId, setSelectedWellId] = useState<string>('OIL-SYN-020');
  const [loading, setLoading] = useState(true);

  // Live Telemetry & Risk States
  const [latestSample, setLatestSample] = useState<any>(null);
  const [recentFeatures, setRecentFeatures] = useState<any[]>([]);
  const [activeRisks, setActiveRisks] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [sensorHealth, setSensorHealth] = useState<any[]>([]);
  const [historyPoints, setHistoryPoints] = useState<any[]>([]);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  // Field Overview States
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);

  // Initial Load
  useEffect(() => {
    Promise.all([
      api.wells.list({ limit: 50 }),
      api.events.list({ limit: 10 }),
      api.dataQuality.getReport(),
    ])
      .then(([wellsData, eventsData, qualityData]) => {
        setWells(wellsData);
        setEvents(eventsData);
        setQualityReport(qualityData);
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  // Poll real-time stream status and latest telemetry
  useEffect(() => {
    let isMounted = true;

    const fetchLiveTelemetry = async () => {
      try {
        const [context, history, alerts, health] = await Promise.all([
          api.realtime.getCurrentWellContext(selectedWellId),
          api.realtime.getHistory(selectedWellId, 40),
          api.alerts.list({ wellId: selectedWellId, limit: 10 }),
          api.realtime.getSensorHealth(selectedWellId),
        ]);

        if (!isMounted) return;

        if (context) {
          setLatestSample(context.currentParameters);
          setRecentFeatures(context.recentFeatures || []);
          setActiveRisks(context.activeRisks || []);
        }

        if (alerts) {
          setActiveAlerts(alerts);
        }

        if (health) {
          setSensorHealth(health);
        }

        if (history && Array.isArray(history)) {
          // Format for chart
          const formatted = history.reverse().map((h) => ({
            timestamp: h.timestamp,
            depth: h.measuredDepth,
            torque: h.torque,
            rop: h.rop,
            drag: h.drag,
            flowIn: h.flowIn,
            flowOut: h.flowOut,
            spp: h.standpipePressure,
          }));
          setHistoryPoints(formatted);
        }
      } catch (err) {
        // Quietly handle poll errors when stream is idle
      }
    };

    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedWellId]);

  const handleRunDemo = async () => {
    try {
      setDemoMessage('Initializing NWIS Live Demonstration on OIL-SYN-020...');
      const res = await api.realtime.runHackathonDemo();
      setSelectedWellId('OIL-SYN-020');
      setDemoMessage(res.narrative);
      setTimeout(() => setDemoMessage(null), 8000);
    } catch (err: any) {
      alert(`Could not start demo: ${err.message}`);
    }
  };

  const activeDrillingCount = wells.filter((w) => w.status === 'DRILLING').length;
  const completedCount = wells.filter((w) => w.status === 'COMPLETED').length;

  const primaryFeature = recentFeatures.find((f) => f.windowSeconds === 60) ?? recentFeatures[0];
  const primaryRisk = activeRisks[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Nearby Wells Intelligence System
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
              Stage 03 Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Oil India Limited &bull; Decision Support Platform &bull; No Autonomous Rig Control
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="bg-petro-950 p-1 rounded-lg border border-petro-800 flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('LIVE')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-2 transition-colors ${
                activeTab === 'LIVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Drilling Stream</span>
            </button>
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'OVERVIEW'
                  ? 'bg-petro-800 text-slate-200'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Field Overview & Map
            </button>
          </div>

          <button
            onClick={handleRunDemo}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5"
          >
            <span>▶</span>
            <span>Run NWIS Demo</span>
          </button>
        </div>
      </div>

      {/* Demo Notification Toast */}
      {demoMessage && (
        <div className="p-3.5 bg-amber-950/80 border border-amber-600/80 rounded-lg text-xs text-amber-200 shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-semibold">{demoMessage}</span>
          </div>
          <span className="text-[11px] text-amber-400/80 font-mono">OIL-SYN-020 Replay</span>
        </div>
      )}

      {/* TAB 1: LIVE DRILLING INTELLIGENCE */}
      {activeTab === 'LIVE' && (
        <div className="space-y-6">
          {/* Stream Banner Controls */}
          <div className="bg-petro-900 border border-petro-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Active Well Stream:
              </span>
              <select
                value={selectedWellId}
                onChange={(e) => setSelectedWellId(e.target.value)}
                className="bg-petro-950 border border-petro-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                {wells.map((w) => (
                  <option key={w.wellId} value={w.wellId}>
                    {w.wellId} — {w.name} ({w.status})
                  </option>
                ))}
              </select>

              <span className="text-slate-500 font-mono">
                Formation: <span className="text-slate-300 font-semibold">{latestSample?.formationId ?? 'Formation Gamma'}</span>
              </span>
              <span className="text-slate-500 font-mono">
                Depth: <span className="text-emerald-400 font-semibold">{latestSample?.measuredDepth ?? 3200} m</span>
              </span>
            </div>

            <div className="flex items-center space-x-2 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                LIVE &bull; SYNTHETIC DEMONSTRATION DATA
              </span>
              <Link
                href="/simulation"
                className="px-2 py-0.5 rounded bg-petro-800 text-slate-300 hover:text-white border border-petro-700"
              >
                Simulator Controls &rarr;
              </Link>
            </div>
          </div>

          {/* Real-Time Parameter Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <LiveMetricCard
              label="Torque"
              value={latestSample?.torque}
              unit="kNm"
              baseline={15.0}
              deviationPct={primaryFeature?.formationBaselineDeviation?.torquePct}
              quality={latestSample?.quality}
              isWarning={(primaryFeature?.formationBaselineDeviation?.torquePct ?? 0) >= 20}
              isCritical={(primaryFeature?.formationBaselineDeviation?.torquePct ?? 0) >= 35}
            />
            <LiveMetricCard
              label="ROP"
              value={latestSample?.rop}
              unit="m/hr"
              baseline={18.0}
              deviationPct={primaryFeature?.formationBaselineDeviation?.ropPct}
              quality={latestSample?.quality}
              isWarning={(primaryFeature?.formationBaselineDeviation?.ropPct ?? 0) <= -20}
              isCritical={(primaryFeature?.formationBaselineDeviation?.ropPct ?? 0) <= -35}
            />
            <LiveMetricCard
              label="Overpull Drag"
              value={latestSample?.drag}
              unit="kN"
              baseline={22.0}
              deviationPct={primaryFeature?.formationBaselineDeviation?.dragPct}
              quality={latestSample?.quality}
              isWarning={(primaryFeature?.formationBaselineDeviation?.dragPct ?? 0) >= 15}
            />
            <LiveMetricCard
              label="Flow In"
              value={latestSample?.flowIn}
              unit="L/min"
              quality={latestSample?.quality}
            />
            <LiveMetricCard
              label="Flow Out"
              value={latestSample?.flowOut}
              unit="L/min"
              quality={latestSample?.quality}
              isWarning={
                latestSample?.flowIn &&
                latestSample?.flowOut &&
                Math.abs(latestSample.flowIn - latestSample.flowOut) > 200
              }
            />
            <LiveMetricCard
              label="Standpipe Press."
              value={latestSample?.standpipePressure}
              unit="bar"
              baseline={195.0}
              quality={latestSample?.quality}
            />
            <LiveMetricCard
              label="Rotary RPM"
              value={latestSample?.rpm}
              unit="rpm"
              quality={latestSample?.quality}
            />
            <LiveMetricCard
              label="WOB"
              value={latestSample?.wob}
              unit="kN"
              quality={latestSample?.quality}
            />
            <LiveMetricCard
              label="Hookload"
              value={latestSample?.hookload}
              unit="kN"
              quality={latestSample?.quality}
            />
            <LiveMetricCard
              label="Pit Volume"
              value={latestSample?.pitVolume}
              unit="m³"
              quality={latestSample?.quality}
            />
          </div>

          {/* Main Visual Intelligence Row: Chart + Risk Evaluation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LiveParameterChart history={historyPoints} selectedWell={selectedWellId} />
            </div>
            <div>
              <RiskScorePanel
                riskAssessment={primaryRisk}
                activeAlert={activeAlerts.find((a) => a.status !== 'RESOLVED' && a.status !== 'DISMISSED')}
              />
            </div>
          </div>

          {/* Active Alerts Dossier Preview */}
          <div className="bg-petro-900 border border-petro-800 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-petro-800">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white text-sm">Active Decision-Support Alerts</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-petro-800 text-slate-300">
                  {activeAlerts.length} Total
                </span>
              </div>
              <Link href="/alerts" className="text-xs text-emerald-400 hover:underline">
                View All Alerts Catalog &rarr;
              </Link>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No active alerts. All drilling signals within verified operational thresholds.
              </div>
            ) : (
              <div className="divide-y divide-petro-800/60 mt-2">
                {activeAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="py-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : alert.severity === 'WARNING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-semibold text-white">{alert.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-petro-950 text-slate-400">
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-[11px] text-slate-500 font-mono mt-1">
                        <span>Depth: {alert.detectedDepth} m</span>
                        <span>Score: {alert.score}/100</span>
                        <span>Precedents: {alert.historicalEvidence?.length ?? 0} offset cases</span>
                      </div>
                    </div>

                    <Link
                      href={`/alerts/${alert.id}`}
                      className="px-3 py-1.5 text-xs rounded bg-petro-800 hover:bg-petro-700 text-emerald-400 border border-petro-700 transition-colors"
                    >
                      Inspect Dossier
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sensor Diagnostics */}
          <SensorHealthPanel sensors={sensorHealth} />
        </div>
      )}

      {/* TAB 2: FIELD OVERVIEW & SPATIAL MAP */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-petro-900 border border-petro-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-400">Total Monitored Wells</span>
              <div className="text-2xl font-bold text-white mt-1">{loading ? '...' : wells.length}</div>
              <div className="text-[11px] text-emerald-400 mt-1">
                {completedCount} Completed &bull; {activeDrillingCount} Active
              </div>
            </div>

            <div className="bg-petro-900 border border-petro-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-400">Active Drilling Operations</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{loading ? '...' : activeDrillingCount}</div>
              <div className="text-[11px] text-blue-300 mt-1">Real-time parameters tracking</div>
            </div>

            <div className="bg-petro-900 border border-petro-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-400">Historical Precedent Events</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{loading ? '...' : events.length}</div>
              <div className="text-[11px] text-amber-300 mt-1">Stuck pipe, losses & kicks logged</div>
            </div>

            <div className="bg-petro-900 border border-petro-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-400">Data Platform Quality Index</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {loading ? '...' : qualityReport ? `${(qualityReport.overallScore * 100).toFixed(1)}%` : '100%'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {qualityReport?.totalRecords || 0} canonical records verified
              </div>
            </div>
          </div>

          {/* Spatial Field Map */}
          <div className="bg-petro-900 border border-petro-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-petro-800 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Spatial Field Map</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  NWIS-DEMO-FIELD &bull; Coordinates & PostGIS Spatial Clustering
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {wells.length} Wells Plotted
              </span>
            </div>

            <div className="h-[520px] rounded-lg overflow-hidden border border-petro-800">
              <WellMap initialWells={wells} selectedWellId={selectedWellId} height="100%" />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

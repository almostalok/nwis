'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { api } from '../../../lib/api';
import { LiveMetricCard } from '../../../components/realtime/LiveMetricCard';
import { LiveParameterChart } from '../../../components/realtime/LiveParameterChart';
import { RiskScorePanel } from '../../../components/realtime/RiskScorePanel';
import Link from 'next/link';

export default function WellDetailPage() {
  const params = useParams();
  const wellId = params.id as string;

  const [well, setWell] = useState<any>(null);
  const [drillingParams, setDrillingParams] = useState<any[]>([]);
  const [mudSamples, setMudSamples] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'LIVE' | 'HISTORICAL'>('HISTORICAL');
  const [liveContext, setLiveContext] = useState<any>(null);
  const [liveHistory, setLiveHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'formations' | 'trajectory' | 'parameters' | 'mud' | 'events' | 'casing' | 'documents'
  >('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wellId) return;

    Promise.all([
      api.wells.getById(wellId),
      api.wells.getParameters(wellId, 50).catch(() => []),
      api.wells.getMud(wellId, 50).catch(() => []),
    ])
      .then(([wellData, paramsData, mudData]) => {
        setWell(wellData);
        setDrillingParams(paramsData);
        setMudSamples(mudData);
        if (wellData.status === 'DRILLING') {
          setViewMode('LIVE');
        }
      })
      .catch((err) => console.error('Failed to load well detail:', err))
      .finally(() => setLoading(false));

    let isMounted = true;
    const fetchLive = async () => {
      try {
        const [context, history] = await Promise.all([
          api.realtime.getCurrentWellContext(wellId),
          api.realtime.getHistory(wellId, 40),
        ]);
        if (!isMounted) return;
        setLiveContext(context);
        if (history && Array.isArray(history)) {
          setLiveHistory(
            history.reverse().map((h: any) => ({
              timestamp: h.timestamp,
              depth: h.measuredDepth,
              torque: h.torque,
              rop: h.rop,
              drag: h.drag,
              flowIn: h.flowIn,
              flowOut: h.flowOut,
              spp: h.standpipePressure,
            }))
          );
        }
      } catch (err) {}
    };

    fetchLive();
    const interval = setInterval(fetchLive, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [wellId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-zinc-500">
        <div className="inline-block w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-mono">Loading Well Dossier for {wellId}...</p>
      </div>
    );
  }

  if (!well) {
    return (
      <div className="py-20 text-center bg-white border border-zinc-200/80 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-1">Well Not Found</h2>
        <p className="text-xs text-zinc-500 mb-4">No record matching identifier {wellId} exists.</p>
        <Link href="/wells" className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs rounded-xl font-medium transition-all inline-block shadow-sm">
          &larr; Back to Wells
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview & Location' },
    { key: 'formations', label: `Formations (${well.formations?.length || 0})` },
    { key: 'trajectory', label: `Trajectory (${well.trajectoryPoints?.length || 0})` },
    { key: 'parameters', label: `Drilling Samples (${drillingParams.length})` },
    { key: 'mud', label: `Mud Logs (${mudSamples.length})` },
    { key: 'events', label: `Operational Events (${well.events?.length || 0})` },
    { key: 'casing', label: `Casing & Cement (${(well.casingSections?.length || 0) + (well.cementingJobs?.length || 0)})` },
    { key: 'documents', label: `Documents (${well.documents?.length || 0})` },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Mode Switch: Live Stream vs Historical Dossier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 bg-[#f4f4f6] p-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <button
            onClick={() => setViewMode('LIVE')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black flex items-center space-x-2 transition-all ${
              viewMode === 'LIVE'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-700 hover:text-black'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-pulse" />
            <span>Live Stream Telemetry</span>
          </button>
          <button
            onClick={() => setViewMode('HISTORICAL')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
              viewMode === 'HISTORICAL'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-700 hover:text-black'
            }`}
          >
            Historical Well Dossier &amp; Logs
          </button>
        </div>

        {viewMode === 'LIVE' && (
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#d1fae5] text-[#064e3b] border-2 border-black font-black inline-flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Real-Time Stream Active &bull; Synthetic Demo
          </span>
        )}
      </div>

      {/* Top Dossier Header */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {well.wellId}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                  well.status === 'DRILLING'
                    ? 'bg-[#dbeafe] text-[#1e3a8a]'
                    : well.status === 'COMPLETED'
                    ? 'bg-[#d1fae5] text-[#064e3b]'
                    : 'bg-zinc-100 text-zinc-800'
                }`}
              >
                {well.status}
              </span>
              <span className="text-xs font-mono font-bold bg-[#fef3c7] text-[#78350f] px-2.5 py-0.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {well.wellType}
              </span>
            </div>
            <h1 className="text-2xl font-black text-black tracking-tight">{well.name}</h1>
            <p className="text-xs text-zinc-600 font-medium mt-1">
              Field: <span className="text-black font-bold">{well.field}</span> &bull; Operator:{' '}
              <span className="text-black font-bold">{well.operator}</span>
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs text-black bg-[#f8f8fb] border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <div>
              <span className="text-zinc-500 block text-[10px] font-mono uppercase font-black">
                {viewMode === 'LIVE' ? 'Current Depth (MD)' : 'Total Depth (MD)'}
              </span>
              <span className="text-xl font-black font-mono text-blue-900">
                {viewMode === 'LIVE'
                  ? `${liveContext?.currentDepth ?? well.totalDepth} m`
                  : `${well.totalDepth} m`}
              </span>
            </div>
            <div className="border-l-2 border-black pl-6">
              <span className="text-zinc-500 block text-[10px] font-mono uppercase font-black">Coordinates</span>
              <span className="text-sm font-mono font-bold text-black">
                {well.latitude?.toFixed(4)}°N, {well.longitude?.toFixed(4)}°E
              </span>
            </div>
            <div className="border-l-2 border-black pl-6">
              <span className="text-zinc-500 block text-[10px] font-mono uppercase font-black">Data Quality Score</span>
              <span className="text-sm font-mono text-emerald-900 font-black">
                {(well.qualityScore * 100).toFixed(0)}% ({well.qualityStatus})
              </span>
            </div>
          </div>
        </div>

        {/* Tab navigation (Shown only in Historical mode) */}
        {viewMode === 'HISTORICAL' && (
          <div className="flex border-b-2 border-black mt-6 -mb-6 overflow-x-auto space-x-1.5 pb-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`py-2 px-3.5 text-xs font-black transition-all rounded-lg whitespace-nowrap ${
                  activeTab === t.key
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LIVE VIEW MODE */}
      {viewMode === 'LIVE' && (
        <div className="space-y-6">
          {/* Live Parameter Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <LiveMetricCard
              label="Torque"
              value={liveContext?.currentParameters?.torque}
              unit="kNm"
              baseline={15.0}
              accentColor="amber"
              deviationPct={liveContext?.recentFeatures?.[0]?.formationBaselineDeviation?.torquePct}
            />
            <LiveMetricCard
              label="ROP"
              value={liveContext?.currentParameters?.rop}
              unit="m/hr"
              baseline={18.0}
              accentColor="red"
              deviationPct={liveContext?.recentFeatures?.[0]?.formationBaselineDeviation?.ropPct}
            />
            <LiveMetricCard
              label="Overpull Drag"
              value={liveContext?.currentParameters?.drag}
              unit="kN"
              accentColor="amber"
              baseline={22.0}
            />
            <LiveMetricCard
              label="Flow In"
              value={liveContext?.currentParameters?.flowIn}
              unit="L/min"
              accentColor="cyan"
            />
            <LiveMetricCard
              label="Flow Out"
              value={liveContext?.currentParameters?.flowOut}
              unit="L/min"
              accentColor="cyan"
            />
            <LiveMetricCard
              label="Standpipe Press."
              value={liveContext?.currentParameters?.standpipePressure}
              unit="bar"
              accentColor="blue"
              baseline={195.0}
            />
            <LiveMetricCard
              label="Rotary RPM"
              value={liveContext?.currentParameters?.rpm}
              unit="rpm"
              accentColor="purple"
            />
            <LiveMetricCard
              label="WOB"
              value={liveContext?.currentParameters?.wob}
              unit="kN"
              accentColor="blue"
            />
            <LiveMetricCard
              label="Hookload"
              value={liveContext?.currentParameters?.hookload}
              unit="kN"
              accentColor="blue"
            />
            <LiveMetricCard
              label="Pit Volume"
              value={liveContext?.currentParameters?.pitVolume}
              unit="m³"
              accentColor="emerald"
            />
          </div>

          {/* Chart + Risk Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LiveParameterChart history={liveHistory} selectedWell={well.wellId} />
            </div>
            <div>
              <RiskScorePanel
                riskAssessment={liveContext?.activeRisks?.[0]}
                activeAlert={liveContext?.activeAlerts?.[0]}
              />
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL VIEW MODE */}
      {viewMode === 'HISTORICAL' && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-wider">
                  Well Metadata &amp; Operational Summary
                </h3>
                <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Well Identifier:</span>
                    <span className="font-mono text-zinc-900 font-bold">{well.wellId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Field / Asset:</span>
                    <span className="text-zinc-800 font-medium">{well.field}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Spud Date:</span>
                    <span className="font-mono text-zinc-800">
                      {well.spudDate ? new Date(well.spudDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Completion Date:</span>
                    <span className="font-mono text-zinc-800">
                      {well.completionDate ? new Date(well.completionDate).toLocaleDateString() : 'Active in progress'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Latitude:</span>
                    <span className="font-mono text-zinc-800">{well.latitude}° N</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Longitude:</span>
                    <span className="font-mono text-zinc-800">{well.longitude}° E</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Total Depth (TD):</span>
                    <span className="font-mono text-zinc-900 font-bold">{well.totalDepth} meters</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Data Source:</span>
                    <span className="text-blue-700 font-mono font-medium">OIL-COMPATIBLE-SYNTHETIC-DATASET</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-wider">
                  Drilling Dossier Index
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80">
                    <span className="text-zinc-500 font-medium">Formations</span>
                    <div className="text-2xl font-bold text-zinc-900 mt-1">{well.formations?.length || 0}</div>
                    <span className="text-[11px] text-zinc-500">Stratigraphic zones</span>
                  </div>
                  <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80">
                    <span className="text-zinc-500 font-medium">Surveys</span>
                    <div className="text-2xl font-bold text-zinc-900 mt-1">{well.trajectoryPoints?.length || 0}</div>
                    <span className="text-[11px] text-zinc-500">Survey stations</span>
                  </div>
                  <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80">
                    <span className="text-zinc-500 font-medium">Precedent Events</span>
                    <div className="text-2xl font-bold text-amber-700 mt-1">{well.events?.length || 0}</div>
                    <span className="text-[11px] text-amber-800">Incidents logged</span>
                  </div>
                  <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80">
                    <span className="text-zinc-500 font-medium">Technical Reports</span>
                    <div className="text-2xl font-bold text-zinc-900 mt-1">{well.documents?.length || 0}</div>
                    <span className="text-[11px] text-zinc-500">DDR &amp; WCR attached</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMATIONS */}
          {activeTab === 'formations' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900">Geological Formation Intervals</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-200 font-mono">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Formation Name</th>
                      <th className="py-3 px-4 font-semibold">Top Depth (MD)</th>
                      <th className="py-3 px-4 font-semibold">Bottom Depth (MD)</th>
                      <th className="py-3 px-4 font-semibold">Interval Thickness</th>
                      <th className="py-3 px-4 font-semibold">Lithology</th>
                      <th className="py-3 px-4 font-semibold">Reservoir Pay</th>
                      <th className="py-3 px-4 font-semibold">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                    {well.formations?.map((f: any) => (
                      <tr key={f.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold font-sans text-zinc-900">{f.formationName}</td>
                        <td className="py-3 px-4 text-zinc-700">{f.topDepth} m</td>
                        <td className="py-3 px-4 text-zinc-700">{f.bottomDepth} m</td>
                        <td className="py-3 px-4 text-blue-600 font-medium">
                          {(f.bottomDepth - f.topDepth).toFixed(0)} m
                        </td>
                        <td className="py-3 px-4 text-zinc-600 font-sans">{f.lithology}</td>
                        <td className="py-3 px-4">
                          {f.reservoir ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold font-sans">
                              PAY ZONE
                            </span>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-emerald-700 font-semibold">
                          {(f.confidence * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TRAJECTORY */}
          {activeTab === 'trajectory' && (
            <div className="space-y-6">
              {/* DIRECTIONAL WELL TRAJECTORY */}
              <div className="bg-zinc-50/60 border border-zinc-200/80 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/70 text-xs">
                  <span className="font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    2D Directional Well Trajectory Profile
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">
                    TVD VS HORIZONTAL DEPARTURE
                  </span>
                </div>

                {/* Trajectory Profile SVG Diagram */}
                <div className="relative w-full h-56 bg-white border border-zinc-200 rounded-xl p-2 shadow-xs">
                  <svg viewBox="0 0 700 200" className="w-full h-full select-none">
                    {/* Grid Lines */}
                    <line x1="60" y1="20" x2="680" y2="20" stroke="#f4f4f5" strokeDasharray="3,3" />
                    <line x1="60" y1="80" x2="680" y2="80" stroke="#f4f4f5" strokeDasharray="3,3" />
                    <line x1="60" y1="140" x2="680" y2="140" stroke="#f4f4f5" strokeDasharray="3,3" />

                    {/* Depth Axis Labels */}
                    <text x="15" y="24" fill="#a1a1aa" fontSize="10" fontFamily="SF Pro, Inter, monospace">0m</text>
                    <text x="15" y="84" fill="#a1a1aa" fontSize="10" fontFamily="SF Pro, Inter, monospace">2000m</text>
                    <text x="15" y="144" fill="#a1a1aa" fontSize="10" fontFamily="SF Pro, Inter, monospace">3500m</text>

                    {/* Formation Horizons */}
                    <rect x="60" y="125" width="620" height="40" fill="#fef3c7" fillOpacity="0.5" stroke="#f59e0b" strokeOpacity="0.4" strokeDasharray="4,4" />
                    <text x="520" y="140" fill="#b45309" fontSize="10" fontFamily="SF Pro, Inter, sans-serif" fontWeight="bold">BARAIL RESERVOIR ZONE</text>

                    {/* Directional Wellbore Trajectory Path */}
                    <path
                      d="M 120 20 L 120 60 Q 120 100 220 120 L 480 150"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Surface Wellhead Marker */}
                    <circle cx="120" cy="20" r="5" fill="#0284c7" />
                    <text x="132" y="24" fill="#0369a1" fontSize="10" fontFamily="SF Pro, Inter, sans-serif" fontWeight="bold">Surface Wellhead (0m MD)</text>

                    {/* Kick-off Point (KOP) */}
                    <circle cx="120" cy="60" r="4" fill="#d97706" />
                    <text x="132" y="64" fill="#92400e" fontSize="10" fontFamily="SF Pro, Inter, sans-serif">KOP: 1,450m (Build to 32°)</text>

                    {/* Current Bit Position */}
                    <circle cx="380" cy="138" r="6" fill="#f59e0b" className="animate-ping" opacity="0.6" />
                    <circle cx="380" cy="138" r="4.5" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="395" y="135" fill="#9f1239" fontSize="10" fontFamily="SF Pro, Inter, sans-serif" fontWeight="bold">
                      Bit at 3,208m MD (Inc: 28.5°, Az: 142°)
                    </text>

                    {/* Target TD */}
                    <circle cx="480" cy="150" r="4" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="492" y="165" fill="#6d28d9" fontSize="10" fontFamily="SF Pro, Inter, sans-serif">Target TD: 4,150m</text>
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">Directional Survey Stations ({well.trajectoryPoints?.length || 0})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-200 font-mono">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Measured Depth (MD)</th>
                      <th className="py-3 px-4 font-semibold">True Vertical Depth (TVD)</th>
                      <th className="py-3 px-4 font-semibold">Inclination</th>
                      <th className="py-3 px-4 font-semibold">Azimuth</th>
                      <th className="py-3 px-4 font-semibold">Dog-leg Severity (DLS)</th>
                      <th className="py-3 px-4 font-semibold">Latitude / Longitude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                    {well.trajectoryPoints?.map((t: any) => (
                      <tr key={t.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-zinc-900">{t.measuredDepth} m</td>
                        <td className="py-2.5 px-4 text-zinc-700">{t.trueVerticalDepth} m</td>
                        <td className="py-2.5 px-4 text-blue-600 font-medium">{t.inclination.toFixed(2)}°</td>
                        <td className="py-2.5 px-4 text-zinc-700">{t.azimuth.toFixed(1)}°</td>
                        <td className="py-2.5 px-4 text-zinc-500">
                          {t.dogLegSeverity !== null ? `${t.dogLegSeverity.toFixed(2)}°/30m` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-zinc-500">
                          {t.latitude?.toFixed(4)}°N, {t.longitude?.toFixed(4)}°E
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DRILLING PARAMETERS */}
          {activeTab === 'parameters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">Time-Series Drilling Parameter Samples</h3>
                <span className="text-xs text-zinc-500">Canonical Units: ROP (m/h), WOB (kN), Torque (kN.m)</span>
              </div>

              {drillingParams.length === 0 ? (
                <p className="text-xs text-zinc-400 py-8 text-center">No sensor samples recorded for this well.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-200 font-mono">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Timestamp</th>
                        <th className="py-3 px-4 font-semibold">Depth (MD)</th>
                        <th className="py-3 px-4 font-semibold">ROP (m/h)</th>
                        <th className="py-3 px-4 font-semibold">WOB (kN)</th>
                        <th className="py-3 px-4 font-semibold">RPM</th>
                        <th className="py-3 px-4 font-semibold">Torque (kN.m)</th>
                        <th className="py-3 px-4 font-semibold">Hookload (kN)</th>
                        <th className="py-3 px-4 font-semibold">SPP (bar)</th>
                        <th className="py-3 px-4 font-semibold">Flow (lpm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                      {drillingParams.map((p: any) => {
                        const isHighTorque = p.torque > 20;
                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-zinc-50/80 transition-colors ${isHighTorque ? 'bg-amber-50/60' : ''}`}
                          >
                            <td className="py-2.5 px-4 text-zinc-500 text-[11px]">
                              {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-zinc-900">{p.measuredDepth} m</td>
                            <td className="py-2.5 px-4 text-zinc-700">{p.rop?.toFixed(1) || '—'}</td>
                            <td className="py-2.5 px-4 text-zinc-700">{p.wob?.toFixed(0) || '—'}</td>
                            <td className="py-2.5 px-4 text-zinc-700">{p.rpm || '—'}</td>
                            <td className={`py-2.5 px-4 font-bold ${isHighTorque ? 'text-amber-800' : 'text-zinc-900'}`}>
                              {p.torque?.toFixed(1) || '—'} {isHighTorque && '⚠️'}
                            </td>
                            <td className="py-2.5 px-4 text-zinc-700">{p.hookLoad?.toFixed(0) || '—'}</td>
                            <td className="py-2.5 px-4 text-zinc-700">{p.standpipePressure?.toFixed(0) || '—'}</td>
                            <td className="py-2.5 px-4 text-zinc-700">{p.flowRate?.toFixed(0) || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MUD LOGS */}
          {activeTab === 'mud' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900">Drilling Fluid Properties &amp; Mud Logs</h3>
              {mudSamples.length === 0 ? (
                <p className="text-xs text-zinc-400 py-8 text-center">No mud samples recorded for this well.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-200 font-mono">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Depth (MD)</th>
                        <th className="py-3 px-4 font-semibold">Mud Weight (sg)</th>
                        <th className="py-3 px-4 font-semibold">Plastic Viscosity (cP)</th>
                        <th className="py-3 px-4 font-semibold">Yield Point</th>
                        <th className="py-3 px-4 font-semibold">Funnel Viscosity</th>
                        <th className="py-3 px-4 font-semibold">Fluid Loss (ml)</th>
                        <th className="py-3 px-4 font-semibold">pH</th>
                        <th className="py-3 px-4 font-semibold">Chlorides (mg/l)</th>
                        <th className="py-3 px-4 font-semibold">Pit Vol (m³)</th>
                        <th className="py-3 px-4 font-semibold">Gas (units)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                      {mudSamples.map((m: any) => (
                        <tr key={m.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-zinc-900">{m.measuredDepth} m</td>
                          <td className="py-2.5 px-4 text-blue-600 font-bold">{m.mudWeight} sg</td>
                          <td className="py-2.5 px-4 text-zinc-700">{m.plasticViscosity}</td>
                          <td className="py-2.5 px-4 text-zinc-700">{m.yieldPoint}</td>
                          <td className="py-2.5 px-4 text-zinc-700">{m.funnelViscosity} s</td>
                          <td className="py-2.5 px-4 text-zinc-700">{m.fluidLoss}</td>
                          <td className="py-2.5 px-4 text-zinc-700">{m.ph}</td>
                          <td className="py-2.5 px-4 text-zinc-700">{m.chlorides}</td>
                          <td className="py-2.5 px-4 text-zinc-700">{m.pitVolume}</td>
                          <td className="py-2.5 px-4 text-zinc-700">{m.gasReading}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: OPERATIONAL EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900">Historical Operational Incidents &amp; Precedents</h3>
              {well.events?.length === 0 ? (
                <p className="text-xs text-zinc-400 py-8 text-center">
                  No adverse drilling events recorded on this well.
                </p>
              ) : (
                <div className="space-y-4">
                  {well.events?.map((ev: any) => (
                    <div
                      key={ev.id}
                      className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              ev.eventType === 'STUCK_PIPE'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : ev.eventType === 'LOST_CIRCULATION'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {ev.eventType}
                          </span>
                          <span className="text-xs font-mono font-bold text-zinc-900">
                            At {ev.startDepth} m MD
                          </span>
                          {ev.formation && (
                            <span className="text-xs text-zinc-500">
                              in <strong className="text-zinc-800">{ev.formation.formationName}</strong>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700 font-medium">
                          Confidence: {(ev.confidence * 100).toFixed(0)}% ({ev.qualityStatus})
                        </span>
                      </div>

                      <p className="text-xs text-zinc-700 leading-relaxed font-sans">{ev.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-zinc-200/70">
                        <div>
                          <span className="text-zinc-400 block font-semibold text-[11px]">Root Cause:</span>
                          <span className="text-zinc-800">{ev.rootCause || 'Under investigation'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block font-semibold text-[11px]">Mitigation &amp; Recovery:</span>
                          <span className="text-zinc-800">{ev.mitigation || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Provenance Footer */}
                      <div className="pt-2 border-t border-zinc-200/60 flex flex-wrap items-center justify-between text-[11px] text-zinc-500">
                        <div>
                          Source Document:{' '}
                          <span className="font-mono text-blue-700 font-medium">
                            {ev.document?.fileName || 'Daily Drilling Report (DDR)'}
                          </span>{' '}
                          (Page {ev.sourcePage || 1})
                        </div>
                        <div>
                          Verified By: <span className="text-zinc-700">{ev.verifiedBy || 'Superintendent'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CASING & CEMENT */}
          {activeTab === 'casing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">Casing Program</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-200 font-mono">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Section</th>
                        <th className="py-3 px-4 font-semibold">Casing Size</th>
                        <th className="py-3 px-4 font-semibold">Setting Depth (MD)</th>
                        <th className="py-3 px-4 font-semibold">Grade &amp; Weight</th>
                        <th className="py-3 px-4 font-semibold">Top of Cement (TOC)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                      {well.casingSections?.map((c: any) => (
                        <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-zinc-900">{c.section}</td>
                          <td className="py-2.5 px-4 text-blue-600 font-medium">{c.casingSize}&quot;</td>
                          <td className="py-2.5 px-4 text-zinc-800">{c.settingDepth} m</td>
                          <td className="py-2.5 px-4 text-zinc-500">
                            {c.grade || 'K-55'} / {c.weight ? `${c.weight} lb/ft` : '—'}
                          </td>
                          <td className="py-2.5 px-4 text-zinc-700">
                            {c.cementTop !== null ? `${c.cementTop} m` : 'Surface'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900">Attached Technical Reports &amp; Documents</h3>
              {well.documents?.length === 0 ? (
                <p className="text-xs text-zinc-400 py-8 text-center">No documents uploaded for this well.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {well.documents?.map((d: any) => (
                    <div key={d.id} className="bg-zinc-50/70 border border-zinc-200/80 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-blue-700 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                          {d.documentType}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {d.documentDate ? new Date(d.documentDate).toLocaleDateString() : '2023'}
                        </span>
                      </div>
                      <div className="font-semibold text-zinc-900 text-xs">{d.title}</div>
                      <div className="text-[11px] text-zinc-500 font-mono truncate">{d.fileName}</div>
                      <div className="pt-2 flex items-center justify-between text-[11px] border-t border-zinc-200/60">
                        <span className="text-zinc-400">Checksum: {d.checksum?.slice(0, 10)}...</span>
                        <span className="text-emerald-700 font-medium">Verified Source</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

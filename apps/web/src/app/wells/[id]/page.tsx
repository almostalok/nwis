'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';

export default function WellDetailPage() {
  const params = useParams();
  const wellId = params.id as string;

  const [well, setWell] = useState<any>(null);
  const [drillingParams, setDrillingParams] = useState<any[]>([]);
  const [mudSamples, setMudSamples] = useState<any[]>([]);
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
      })
      .catch((err) => console.error('Failed to load well detail:', err))
      .finally(() => setLoading(false));
  }, [wellId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-xs">Loading Well Dossier for {wellId}...</p>
      </div>
    );
  }

  if (!well) {
    return (
      <div className="py-20 text-center text-slate-400">
        <h2 className="text-lg font-bold text-white mb-2">Well Not Found</h2>
        <p className="text-xs mb-4">No record matching identifier {wellId} exists.</p>
        <a href="/wells" className="px-3 py-1.5 bg-petro-800 text-slate-200 text-xs rounded">
          &larr; Back to Wells
        </a>
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
    <div className="space-y-6">
      {/* Top Dossier Header */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-petro-800 text-emerald-400 border border-petro-700">
                {well.wellId}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  well.status === 'DRILLING'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : well.status === 'COMPLETED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {well.status}
              </span>
              <span className="text-xs font-mono bg-petro-950 text-slate-300 px-2 py-0.5 rounded">
                {well.wellType}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{well.name}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Field: <span className="text-slate-200">{well.field}</span> &bull; Operator:{' '}
              <span className="text-slate-200">{well.operator}</span>
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Total Depth (MD)</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{well.totalDepth} m</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Coordinates</span>
              <span className="text-sm font-mono text-slate-200">
                {well.latitude?.toFixed(4)}°N, {well.longitude?.toFixed(4)}°E
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Data Quality Score</span>
              <span className="text-sm font-mono text-emerald-400 font-bold">
                {(well.qualityScore * 100).toFixed(0)}% ({well.qualityStatus})
              </span>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-petro-800 mt-6 -mb-6 overflow-x-auto space-x-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`py-3 px-3.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === t.key
                  ? 'border-emerald-500 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-6 shadow-sm">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-emerald-400">
                Well Metadata & Operational Summary
              </h3>
              <div className="bg-petro-950 border border-petro-800 rounded-lg p-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-petro-800/60">
                  <span className="text-slate-400">Well Identifier:</span>
                  <span className="font-mono text-white font-bold">{well.wellId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-petro-800/60">
                  <span className="text-slate-400">Field / Asset:</span>
                  <span className="text-slate-200">{well.field}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-petro-800/60">
                  <span className="text-slate-400">Spud Date:</span>
                  <span className="font-mono text-slate-200">
                    {well.spudDate ? new Date(well.spudDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-petro-800/60">
                  <span className="text-slate-400">Completion Date:</span>
                  <span className="font-mono text-slate-200">
                    {well.completionDate ? new Date(well.completionDate).toLocaleDateString() : 'Active in progress'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-petro-800/60">
                  <span className="text-slate-400">Latitude:</span>
                  <span className="font-mono text-slate-200">{well.latitude}° N</span>
                </div>
                <div className="flex justify-between py-1 border-b border-petro-800/60">
                  <span className="text-slate-400">Longitude:</span>
                  <span className="font-mono text-slate-200">{well.longitude}° E</span>
                </div>
                <div className="flex justify-between py-1 border-b border-petro-800/60">
                  <span className="text-slate-400">Total Depth (TD):</span>
                  <span className="font-mono text-emerald-400 font-bold">{well.totalDepth} meters</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Data Source:</span>
                  <span className="text-amber-400 font-mono">OIL-COMPATIBLE-SYNTHETIC-DATASET</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-emerald-400">
                Drilling Dossier Index
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
                  <span className="text-slate-400">Formations</span>
                  <div className="text-xl font-bold text-white mt-1">{well.formations?.length || 0}</div>
                  <span className="text-[10px] text-emerald-400">Stratigraphic zones</span>
                </div>
                <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
                  <span className="text-slate-400">Surveys</span>
                  <div className="text-xl font-bold text-white mt-1">{well.trajectoryPoints?.length || 0}</div>
                  <span className="text-[10px] text-emerald-400">Survey stations</span>
                </div>
                <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
                  <span className="text-slate-400">Precedent Events</span>
                  <div className="text-xl font-bold text-amber-400 mt-1">{well.events?.length || 0}</div>
                  <span className="text-[10px] text-amber-300">Incidents logged</span>
                </div>
                <div className="bg-petro-950 p-3 rounded-lg border border-petro-800">
                  <span className="text-slate-400">Technical Reports</span>
                  <div className="text-xl font-bold text-white mt-1">{well.documents?.length || 0}</div>
                  <span className="text-[10px] text-emerald-400">DDR & WCR attached</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FORMATIONS */}
        {activeTab === 'formations' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Geological Formation Intervals</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-petro-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-petro-800">
                  <tr>
                    <th className="py-2.5 px-4">Formation Name</th>
                    <th className="py-2.5 px-4">Top Depth (MD)</th>
                    <th className="py-2.5 px-4">Bottom Depth (MD)</th>
                    <th className="py-2.5 px-4">Interval Thickness</th>
                    <th className="py-2.5 px-4">Lithology</th>
                    <th className="py-2.5 px-4">Reservoir Pay</th>
                    <th className="py-2.5 px-4">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petro-800">
                  {well.formations?.map((f: any) => (
                    <tr key={f.id} className="hover:bg-petro-800/40">
                      <td className="py-2.5 px-4 font-semibold text-white">{f.formationName}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-300">{f.topDepth} m</td>
                      <td className="py-2.5 px-4 font-mono text-slate-300">{f.bottomDepth} m</td>
                      <td className="py-2.5 px-4 font-mono text-emerald-400 font-medium">
                        {(f.bottomDepth - f.topDepth).toFixed(0)} m
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{f.lithology}</td>
                      <td className="py-2.5 px-4">
                        {f.reservoir ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                            PAY ZONE
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-emerald-400">
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
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Well Trajectory & Directional Survey Stations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-petro-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-petro-800">
                  <tr>
                    <th className="py-2.5 px-4">Measured Depth (MD)</th>
                    <th className="py-2.5 px-4">True Vertical Depth (TVD)</th>
                    <th className="py-2.5 px-4">Inclination</th>
                    <th className="py-2.5 px-4">Azimuth</th>
                    <th className="py-2.5 px-4">Dog-leg Severity (DLS)</th>
                    <th className="py-2.5 px-4">Latitude / Longitude</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petro-800 font-mono">
                  {well.trajectoryPoints?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-petro-800/40">
                      <td className="py-2.5 px-4 font-bold text-white">{t.measuredDepth} m</td>
                      <td className="py-2.5 px-4 text-slate-300">{t.trueVerticalDepth} m</td>
                      <td className="py-2.5 px-4 text-emerald-400">{t.inclination.toFixed(2)}°</td>
                      <td className="py-2.5 px-4 text-slate-300">{t.azimuth.toFixed(1)}°</td>
                      <td className="py-2.5 px-4 text-slate-400">
                        {t.dogLegSeverity !== null ? `${t.dogLegSeverity.toFixed(2)}°/30m` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">
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
              <h3 className="text-sm font-semibold text-white">Time-Series Drilling Parameter Samples</h3>
              <span className="text-xs text-slate-400">Canonical Units: ROP (m/h), WOB (kN), Torque (kN.m)</span>
            </div>

            {drillingParams.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sensor samples recorded for this well.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-petro-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-petro-800">
                    <tr>
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Depth (MD)</th>
                      <th className="py-2.5 px-4">ROP (m/h)</th>
                      <th className="py-2.5 px-4">WOB (kN)</th>
                      <th className="py-2.5 px-4">RPM</th>
                      <th className="py-2.5 px-4">Torque (kN.m)</th>
                      <th className="py-2.5 px-4">Hookload (kN)</th>
                      <th className="py-2.5 px-4">SPP (bar)</th>
                      <th className="py-2.5 px-4">Flow (lpm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-petro-800 font-mono">
                    {drillingParams.map((p: any) => {
                      const isHighTorque = p.torque > 20;
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-petro-800/40 ${isHighTorque ? 'bg-red-950/20 text-red-200' : ''}`}
                        >
                          <td className="py-2 px-4 text-slate-400 text-[11px]">
                            {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2 px-4 font-bold text-white">{p.measuredDepth} m</td>
                          <td className="py-2 px-4 text-slate-300">{p.rop?.toFixed(1) || '—'}</td>
                          <td className="py-2 px-4 text-slate-300">{p.wob?.toFixed(0) || '—'}</td>
                          <td className="py-2 px-4 text-slate-300">{p.rpm || '—'}</td>
                          <td className={`py-2 px-4 font-bold ${isHighTorque ? 'text-red-400' : 'text-emerald-400'}`}>
                            {p.torque?.toFixed(1) || '—'} {isHighTorque && '⚠'}
                          </td>
                          <td className="py-2 px-4 text-slate-300">{p.hookLoad?.toFixed(0) || '—'}</td>
                          <td className="py-2 px-4 text-slate-300">{p.standpipePressure?.toFixed(0) || '—'}</td>
                          <td className="py-2 px-4 text-slate-300">{p.flowRate?.toFixed(0) || '—'}</td>
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
            <h3 className="text-sm font-semibold text-white">Drilling Fluid Properties & Mud Logs</h3>
            {mudSamples.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No mud samples recorded for this well.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-petro-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-petro-800">
                    <tr>
                      <th className="py-2.5 px-4">Depth (MD)</th>
                      <th className="py-2.5 px-4">Mud Weight (sg)</th>
                      <th className="py-2.5 px-4">Plastic Viscosity (cP)</th>
                      <th className="py-2.5 px-4">Yield Point</th>
                      <th className="py-2.5 px-4">Funnel Viscosity</th>
                      <th className="py-2.5 px-4">Fluid Loss (ml)</th>
                      <th className="py-2.5 px-4">pH</th>
                      <th className="py-2.5 px-4">Chlorides (mg/l)</th>
                      <th className="py-2.5 px-4">Pit Vol (m³)</th>
                      <th className="py-2.5 px-4">Gas (units)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-petro-800 font-mono">
                    {mudSamples.map((m: any) => (
                      <tr key={m.id} className="hover:bg-petro-800/40">
                        <td className="py-2 px-4 font-bold text-white">{m.measuredDepth} m</td>
                        <td className="py-2 px-4 text-emerald-400 font-bold">{m.mudWeight} sg</td>
                        <td className="py-2 px-4 text-slate-300">{m.plasticViscosity}</td>
                        <td className="py-2 px-4 text-slate-300">{m.yieldPoint}</td>
                        <td className="py-2 px-4 text-slate-300">{m.funnelViscosity} s</td>
                        <td className="py-2 px-4 text-slate-300">{m.fluidLoss}</td>
                        <td className="py-2 px-4 text-slate-300">{m.ph}</td>
                        <td className="py-2 px-4 text-slate-300">{m.chlorides}</td>
                        <td className="py-2 px-4 text-slate-300">{m.pitVolume}</td>
                        <td className="py-2 px-4 text-slate-300">{m.gasReading}</td>
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
            <h3 className="text-sm font-semibold text-white">Historical Operational Incidents & Precedents</h3>
            {well.events?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No adverse drilling events recorded on this well.
              </p>
            ) : (
              <div className="space-y-4">
                {well.events?.map((ev: any) => (
                  <div
                    key={ev.id}
                    className="bg-petro-950 border border-petro-800 rounded-lg p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            ev.eventType === 'STUCK_PIPE'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : ev.eventType === 'LOST_CIRCULATION'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}
                        >
                          {ev.eventType}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          At {ev.startDepth} m MD
                        </span>
                        {ev.formation && (
                          <span className="text-xs text-slate-400">
                            in <strong className="text-slate-200">{ev.formation.formationName}</strong>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400">
                        Confidence: {(ev.confidence * 100).toFixed(0)}% ({ev.qualityStatus})
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{ev.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-petro-900/60 p-3 rounded border border-petro-800/80">
                      <div>
                        <span className="text-slate-400 block font-semibold text-[11px]">Root Cause:</span>
                        <span className="text-slate-300">{ev.rootCause || 'Under investigation'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[11px]">Mitigation & Recovery:</span>
                        <span className="text-slate-300">{ev.mitigation || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Provenance Footer */}
                    <div className="pt-2 border-t border-petro-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                      <div>
                        Source Document:{' '}
                        <span className="font-mono text-emerald-400">
                          {ev.document?.fileName || 'Daily Drilling Report (DDR)'}
                        </span>{' '}
                        (Page {ev.sourcePage || 1})
                      </div>
                      <div>
                        Verified By: <span className="text-slate-300">{ev.verifiedBy || 'Superintendent'}</span>
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
              <h3 className="text-sm font-semibold text-white mb-3">Casing Program</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-petro-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-petro-800">
                    <tr>
                      <th className="py-2.5 px-4">Section</th>
                      <th className="py-2.5 px-4">Casing Size</th>
                      <th className="py-2.5 px-4">Setting Depth (MD)</th>
                      <th className="py-2.5 px-4">Grade & Weight</th>
                      <th className="py-2.5 px-4">Top of Cement (TOC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-petro-800 font-mono">
                    {well.casingSections?.map((c: any) => (
                      <tr key={c.id}>
                        <td className="py-2.5 px-4 font-bold text-white">{c.section}</td>
                        <td className="py-2.5 px-4 text-emerald-400">{c.casingSize}&quot;</td>
                        <td className="py-2.5 px-4 text-slate-200">{c.settingDepth} m</td>
                        <td className="py-2.5 px-4 text-slate-400">
                          {c.grade || 'K-55'} / {c.weight ? `${c.weight} lb/ft` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-300">
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
            <h3 className="text-sm font-semibold text-white">Attached Technical Reports & Documents</h3>
            {well.documents?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No documents uploaded for this well.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {well.documents?.map((d: any) => (
                  <div key={d.id} className="bg-petro-950 border border-petro-800 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-petro-900 border border-petro-800">
                        {d.documentType}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {d.documentDate ? new Date(d.documentDate).toLocaleDateString() : '2023'}
                      </span>
                    </div>
                    <div className="font-semibold text-white text-xs">{d.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{d.fileName}</div>
                    <div className="pt-2 flex items-center justify-between text-[11px] border-t border-petro-800/60">
                      <span className="text-slate-400">Checksum: {d.checksum?.slice(0, 10)}...</span>
                      <span className="text-emerald-400 font-medium">Verified Source</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

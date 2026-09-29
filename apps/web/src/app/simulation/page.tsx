'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Well, SimulationScenario } from '@nwis/types';
import Link from 'next/link';

export default function SimulationControlPage() {
  const [wells, setWells] = useState<Well[]>([]);
  const [selectedWell, setSelectedWell] = useState<string>('OIL-SYN-020');
  const [scenario, setScenario] = useState<SimulationScenario>(SimulationScenario.STUCK_PIPE_PRECURSOR);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(10);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogMessages((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    api.wells.list({ limit: 50 }).then((res) => setWells(res || []));

    const pollStatus = async () => {
      try {
        const res = await api.realtime.getSimulatorStatus();
        setStatus(res);
      } catch (err) {}
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    try {
      setLoading(true);
      await api.realtime.startSimulation({
        wellId: selectedWell,
        scenario,
        speedMultiplier,
        startDepth: 3200,
        endDepth: 3250,
      });
      addLog(`Started simulation on ${selectedWell} (${scenario}) at ${speedMultiplier}x speed`);
    } catch (err: any) {
      alert(`Start failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await api.realtime.stopSimulation(selectedWell);
      addLog(`Stopped simulation on ${selectedWell}`);
    } catch (err: any) {
      alert(`Stop failed: ${err.message}`);
    }
  };

  const handlePause = async () => {
    try {
      await api.realtime.pauseSimulation(selectedWell);
      addLog(`Paused simulation on ${selectedWell}`);
    } catch (err: any) {
      alert(`Pause failed: ${err.message}`);
    }
  };

  const handleResume = async () => {
    try {
      await api.realtime.resumeSimulation(selectedWell);
      addLog(`Resumed simulation on ${selectedWell}`);
    } catch (err: any) {
      alert(`Resume failed: ${err.message}`);
    }
  };

  const handleRunDemo = async () => {
    try {
      setLoading(true);
      const res = await api.realtime.runHackathonDemo();
      setSelectedWell('OIL-SYN-020');
      setScenario(SimulationScenario.STUCK_PIPE_PRECURSOR);
      addLog(`Initiated NWIS Hackathon Demo on OIL-SYN-020: ${res.narrative}`);
    } catch (err: any) {
      alert(`Demo start failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const activeSim = status?.activeSimulations?.find((s: any) => s.wellId === selectedWell);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Real-Time Simulation & Demo Control Room
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-950 text-amber-300 border border-amber-800">
              Synthetic Replay
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure drilling telemetry scenarios, inject physical anomalies, or run the deterministic Hackathon demo.
          </p>
        </div>

        <button
          onClick={handleRunDemo}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-colors flex items-center space-x-2"
        >
          <span>▶</span>
          <span>Run NWIS Demo (1-Click)</span>
        </button>
      </div>

      {/* Main Simulation Control Card */}
      <div className="bg-petro-900 border border-petro-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          {/* Well Selection */}
          <div>
            <label className="text-slate-400 block font-semibold mb-1">Target Well</label>
            <select
              value={selectedWell}
              onChange={(e) => setSelectedWell(e.target.value)}
              className="w-full bg-petro-950 border border-petro-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              {wells.map((w) => (
                <option key={w.wellId} value={w.wellId}>
                  {w.wellId} ({w.name})
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Selection */}
          <div>
            <label className="text-slate-400 block font-semibold mb-1">Drilling Scenario</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as SimulationScenario)}
              className="w-full bg-petro-950 border border-petro-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="NORMAL_DRILLING">Normal Drilling (Nominal)</option>
              <option value="STUCK_PIPE_PRECURSOR">Stuck Pipe Precursor (Torque ↑, ROP ↓, Drag ↑)</option>
              <option value="TORQUE_SPIKE">Torque Spike (Top Drive Feedback)</option>
              <option value="ROP_DROP">ROP Drop / Bit Dull</option>
              <option value="LOST_CIRCULATION">Lost Circulation (Flow Out ↓, Pit Loss)</option>
              <option value="KICK_PRECURSOR">Kick Precursor (Flow Out ↑, Pit Gain)</option>
              <option value="PRESSURE_ANOMALY">Standpipe Pressure Surge</option>
              <option value="FORMATION_INSTABILITY">Formation Instability / Sloughing</option>
            </select>
          </div>

          {/* Speed Multiplier */}
          <div>
            <label className="text-slate-400 block font-semibold mb-1">
              Replay Speed ({speedMultiplier}x)
            </label>
            <div className="flex items-center space-x-1.5 pt-1">
              {[1, 5, 10, 50, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={`flex-1 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                    speedMultiplier === s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-petro-950 text-slate-400 hover:text-white border border-petro-800'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-petro-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              {activeSim ? 'Restart Stream' : 'Start Simulation'}
            </button>

            {activeSim && (
              <>
                {activeSim.isPaused ? (
                  <button
                    onClick={handleResume}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-semibold transition-colors"
                  >
                    Pause
                  </button>
                )}

                <button
                  onClick={handleStop}
                  className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                >
                  Stop Stream
                </button>
              </>
            )}
          </div>

          <Link
            href="/dashboard"
            className="px-3.5 py-2 rounded-lg bg-petro-800 hover:bg-petro-700 text-emerald-400 border border-petro-700 text-xs font-semibold transition-colors"
          >
            Inspect Live Dashboard &rarr;
          </Link>
        </div>
      </div>

      {/* Real-time Status Card */}
      {activeSim && (
        <div className="bg-petro-900 border border-emerald-800/60 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-white">Simulation Session Active</span>
              <span className="px-2 py-0.5 rounded bg-petro-950 font-mono text-emerald-400">
                {activeSim.wellId}
              </span>
            </div>
            <span className="font-mono text-slate-400">
              Depth: <span className="text-white font-bold">{activeSim.currentDepth} m</span> / {activeSim.endDepth} m
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 border border-petro-800 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (activeSim.stepIndex / activeSim.totalSteps) * 100)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Scenario: {activeSim.scenario}</span>
            <span>Speed: {activeSim.speedMultiplier}x</span>
            <span>Steps: {activeSim.stepIndex} / {activeSim.totalSteps}</span>
          </div>
        </div>
      )}

      {/* Simulator Event Console */}
      <div className="bg-petro-950 border border-petro-800 rounded-xl p-4 shadow-inner">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center justify-between">
          <span>Simulation Event Stream Log</span>
          <span className="text-[10px] font-mono text-slate-600">Local Telemetry Ticker</span>
        </div>

        <div className="font-mono text-[11px] text-slate-300 space-y-1 h-44 overflow-y-auto pr-2">
          {logMessages.length === 0 ? (
            <div className="text-slate-600 italic">No events logged yet. Start a simulation or run the demo.</div>
          ) : (
            logMessages.map((msg, i) => (
              <div key={i} className="text-slate-300 hover:text-white">
                {msg}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Well, SimulationScenario } from '@nwis/types';
import { useToast } from '../../components/Toast';

export default function SimulationControlPage() {
  const toast = useToast();
  const [wells, setWells] = useState<Well[]>([]);
  const [selectedWell, setSelectedWell] = useState<string>('OIL-SYN-020');
  const [scenario, setScenario] = useState<SimulationScenario>(SimulationScenario.STUCK_PIPE_PRECURSOR);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(2);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<number>(1);

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
      const msg = `Started simulation on ${selectedWell} (${scenario}) at ${speedMultiplier}x speed`;
      addLog(msg);
      toast.success(msg, 'Simulation Active');
      setActiveStep(2);
    } catch (err: any) {
      toast.error(`Start failed: ${err.message}`, 'Simulation Error');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await api.realtime.stopSimulation(selectedWell);
      const msg = `Stopped simulation on ${selectedWell}`;
      addLog(msg);
      toast.info(msg, 'Simulation Stopped');
      setActiveStep(1);
    } catch (err: any) {
      toast.error(`Stop failed: ${err.message}`, 'Simulation Error');
    }
  };

  const handlePause = async () => {
    try {
      await api.realtime.pauseSimulation(selectedWell);
      const msg = `Paused simulation on ${selectedWell}`;
      addLog(msg);
      toast.info(msg, 'Simulation Paused');
    } catch (err: any) {
      toast.error(`Pause failed: ${err.message}`, 'Simulation Error');
    }
  };

  const handleResume = async () => {
    try {
      await api.realtime.resumeSimulation(selectedWell);
      const msg = `Resumed simulation on ${selectedWell}`;
      addLog(msg);
      toast.success(msg, 'Simulation Resumed');
    } catch (err: any) {
      toast.error(`Resume failed: ${err.message}`, 'Simulation Error');
    }
  };

  const handleReset = async () => {
    try {
      await api.realtime.resetSimulation();
      const msg = `Reset all simulation states on all wells`;
      addLog(msg);
      toast.info(msg, 'Simulation Reset');
      setActiveStep(1);
    } catch (err: any) {
      toast.error(`Reset failed: ${err.message}`, 'Simulation Error');
    }
  };

  const scenarioTimeline = [
    { time: '00:00', label: 'Normal Drilling', desc: 'Nominal torque & ROP in Upper Barail Sandstone at 3,200m' },
    { time: '00:20', label: 'Torque Increases', desc: 'Torque variance elevated +24% above baseline (tight hole condition)' },
    { time: '00:35', label: 'ROP Declines', desc: 'Penetration rate decays -25% as cuttings accumulate' },
    { time: '00:50', label: 'Pattern Detected', desc: 'Multi-parameter correlation triggers feature anomaly' },
    { time: '01:00', label: 'Precedents Matched', desc: 'Precedent Engine identifies OIL-SYN-003, 007, 012 in Barail' },
    { time: '01:10', label: 'Risk Score Rises', desc: 'Bayesian risk engine escalates score to 79/100 [WARNING]' },
    { time: '01:20', label: 'Alert Dispatched', desc: 'Actionable decision-support advisory sent to rig & eRTMAC' },
  ];

  const scenariosList = [
    { key: SimulationScenario.NORMAL_DRILLING, label: 'Normal Drilling' },
    { key: SimulationScenario.TORQUE_SPIKE, label: 'Torque Spike' },
    { key: SimulationScenario.ROP_DROP, label: 'ROP Drop' },
    { key: SimulationScenario.STUCK_PIPE_PRECURSOR, label: 'Stuck Pipe Precursor' },
    { key: SimulationScenario.LOST_CIRCULATION, label: 'Lost Circulation' },
    { key: SimulationScenario.KICK_PRECURSOR, label: 'Kick Precursor' },
    { key: SimulationScenario.PRESSURE_ANOMALY, label: 'Pressure Anomaly' },
    { key: SimulationScenario.FORMATION_INSTABILITY, label: 'Formation Instability' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-zinc-500 mb-1">
            <Link href="/dashboard" className="text-blue-700 hover:underline">
              ← Command Center
            </Link>
            <span>/</span>
            <span>Operations</span>
            <span>/</span>
            <span className="text-black font-bold">Simulator</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-black tracking-tight">
              Realtime Drilling Simulator
            </h1>
            <span className="px-3 py-1 text-xs font-mono font-black uppercase tracking-wider bg-[#fef3c7] text-[#78350f] border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000]">
              OPERATIONS TOOL
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            Playback synthetic incident precursors to evaluate anomaly detection, risk escalation, and precedent matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all"
          >
            Observe in Command Center →
          </Link>
        </div>
      </div>

      {/* Simulator Control Panel */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Well Selection */}
          <div>
            <label className="text-zinc-700 font-mono font-black uppercase text-xs block mb-2">
              TARGET MONITORED WELL:
            </label>
            <select
              value={selectedWell}
              onChange={(e) => setSelectedWell(e.target.value)}
              className="w-full bg-[#f8f9fa] text-black px-3 py-2.5 border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            >
              {wells.map((w) => (
                <option key={w.wellId} value={w.wellId}>
                  {w.wellId} — {w.name} [{w.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Speed Multiplier */}
          <div>
            <label className="text-zinc-700 font-mono font-black uppercase text-xs block mb-2">
              STREAM PLAYBACK SPEED:
            </label>
            <select
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              className="w-full bg-[#f8f9fa] text-black px-3 py-2.5 border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="1">1x (Realtime 1Hz)</option>
              <option value="2">2x Speed (SIH Demo Recommended)</option>
              <option value="5">5x Speed</option>
              <option value="10">10x Speed (Fast Forward)</option>
            </select>
          </div>

          {/* Live Status Output */}
          <div className="bg-[#f8f9fa] p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 font-mono font-black uppercase">SIMULATOR ENGINE STATE:</span>
            <div className="text-base font-black text-black mt-1">
              {status?.activeSimulations > 0 ? (
                <span className="text-[#064e3b] bg-[#d1fae5] px-2.5 py-1 rounded-full border border-black inline-flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black" />
                  Running ({status.activeSimulations} Active)
                </span>
              ) : (
                <span className="text-zinc-500">Idle / Ready</span>
              )}
            </div>
          </div>
        </div>

        {/* Scenario Selector Grid */}
        <div>
          <label className="text-zinc-700 font-mono font-black uppercase text-xs block mb-3">
            Pre-Configured Operational Scenarios:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {scenariosList.map((sc) => {
              const isSelected = scenario === sc.key;
              return (
                <button
                  key={sc.key}
                  type="button"
                  onClick={() => setScenario(sc.key)}
                  className={`p-4 text-left rounded-xl border-2 border-black text-xs transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                    isSelected
                      ? 'bg-[#dbeafe] text-[#1e3a8a] font-black ring-2 ring-blue-500'
                      : 'bg-white text-zinc-800 hover:bg-[#f8f9fa]'
                  }`}
                >
                  <div className="text-[10px] text-zinc-500 font-mono uppercase font-black">SCENARIO</div>
                  <div className="font-bold truncate mt-1">{sc.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Controls */}
        <div className="pt-4 border-t-2 border-black flex flex-wrap items-center gap-3">
          <button
            onClick={handleStart}
            disabled={loading}
            className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>▶ Play Scenario</span>
          </button>

          <button
            onClick={handlePause}
            className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            ❚❚ Pause
          </button>

          <button
            onClick={handleResume}
            className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            ▶ Resume
          </button>

          <button
            onClick={handleStop}
            className="px-4 py-2.5 bg-[#ffe4e6] hover:bg-rose-200 text-[#881337] font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            ■ Stop
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-[#fef08a] hover:bg-yellow-300 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all ml-auto active:translate-x-0.5 active:translate-y-0.5"
          >
            ↺ Reset Simulator
          </button>
        </div>
      </div>

      {/* SIMULATION TIMELINE */}
      <section className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div>
            <h2 className="text-sm font-black text-black tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 border border-black" />
              Scenario Unfolding Timeline
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Chronological milestone sequence demonstrating how NWIS moves from raw sensor drift to actionable precedent corroboration.
            </p>
          </div>
          <span className="text-xs text-[#78350f] font-mono font-black uppercase bg-[#fef3c7] px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            STUCK_PIPE_PRECURSOR
          </span>
        </div>

        {/* Timeline Horizontal Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
          {scenarioTimeline.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#f8f9fa] border-2 border-black rounded-xl space-y-1.5 shadow-[2px_2px_0px_0px_#000]"
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#1e3a8a] font-black">{step.time}</span>
                <span className="text-zinc-500 font-bold">STEP {idx + 1}</span>
              </div>
              <div className="text-xs font-black text-black tracking-tight">{step.label}</div>
              <p className="text-[10px] text-zinc-600 leading-relaxed font-sans">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Execution Logs */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-3 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center justify-between text-xs border-b-2 border-black pb-3">
          <span className="font-black uppercase text-xs font-mono text-black">Simulator Event Log:</span>
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f8f9fa] border border-black">{logMessages.length} Entries</span>
        </div>

        <div className="h-44 overflow-y-auto font-mono text-xs text-black space-y-1.5 bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          {logMessages.length === 0 ? (
            <div className="text-zinc-400">No events logged yet. Click [ Play Scenario ] to execute.</div>
          ) : (
            logMessages.map((log, i) => (
              <div key={i} className="text-black font-semibold">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

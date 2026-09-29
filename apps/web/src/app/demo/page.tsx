'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface StoryboardPhase {
  id: number;
  title: string;
  tagline: string;
  depth: number;
  formation: string;
  narrative: string;
  signals: { name: string; value: string; status: 'NORMAL' | 'ANOMALOUS' | 'CRITICAL' }[];
  precedentsFound: string[];
  recommendation: string;
  leadTime: string;
}

const STORYBOARD_PHASES: StoryboardPhase[] = [
  {
    id: 1,
    title: 'Phase 1: Baseline Drilling Operations',
    tagline: 'Normal ROP in Upper Barail Sandstone at 3,200m depth',
    depth: 3200,
    formation: 'Barail Sandstone (Upper Unit)',
    narrative:
      'Rig #07 is drilling with steady 18.5 m/h ROP and 110 kN WOB. Baseline torque fluctuates smoothly around 14.5 kN-m. All parameters are within 1.0 standard deviation of historical offset normal ranges.',
    signals: [
      { name: 'Standpipe Pressure', value: '195 bar', status: 'NORMAL' },
      { name: 'Drilling Torque', value: '14.5 kN-m', status: 'NORMAL' },
      { name: 'Overpull Margin', value: '0 kN', status: 'NORMAL' },
      { name: 'Active Flow Delta', value: '0 L/min', status: 'NORMAL' },
    ],
    precedentsFound: ['OIL-SYN-001 (Normal drilling through Upper Barail)'],
    recommendation: 'Continue drilling with current hydraulic and mechanical parameters.',
    leadTime: 'Nominal Operations',
  },
  {
    id: 2,
    title: 'Phase 2: Micro-Trend Anomaly & Lithology Transition',
    tagline: 'Entering reactive coal seam; torque variance rises above 2.5σ',
    depth: 3218,
    formation: 'Barail Coal & Carbonaceous Shale',
    narrative:
      'At 3,218m, the bit enters a coal-bearing interval. NWIS feature engine detects erratic torque oscillation (variance increases +68%) and standpipe pressure slope rises +1.8 bar/min, signaling cuttings accumulation and tight hole conditions.',
    signals: [
      { name: 'Standpipe Pressure', value: '208 bar (+13)', status: 'ANOMALOUS' },
      { name: 'Torque Variance', value: '+2.8σ (Robust MAD)', status: 'ANOMALOUS' },
      { name: 'Overpull on Connections', value: '+45 kN', status: 'ANOMALOUS' },
      { name: 'Cuttings Recovery', value: '-22% vs Theoretical', status: 'ANOMALOUS' },
    ],
    precedentsFound: [
      'OIL-SYN-005 (Tight hole & pack-off at 3,215m in Barail Coal, 36h NPT)',
      'OIL-SYN-012 (Severe sticking precursor at 3,225m)',
    ],
    recommendation:
      'Circulate bottoms up before next single. Check shaker screens for cavings. Prepare low-viscosity pill.',
    leadTime: '~32 Minutes Lead Time',
  },
  {
    id: 3,
    title: 'Phase 3: Offset Precedent Matching & Correlation Corridor',
    tagline: 'Precedent Engine identifies 94% match with historical offset incident',
    depth: 3232,
    formation: 'Barail Coal Member (Thief / Reactive Seam)',
    narrative:
      'NWIS signature Precedent Engine cross-references 20 historical offset wells within 12km. It detects that well OIL-SYN-005 suffered a complete mechanical stuck pipe event at 3,235m under identical differential pressure and coal seam thickness.',
    signals: [
      { name: 'Precedent Similarity', value: '94.2% Match (OIL-SYN-005)', status: 'CRITICAL' },
      { name: 'Geological Offset Dist.', value: '4.8 km Northeast', status: 'ANOMALOUS' },
      { name: 'Historical NPT Risk', value: '36.5 Hours ($142,000)', status: 'CRITICAL' },
      { name: 'Mud Weight Delta', value: '1.28 SG vs 1.34 SG Required', status: 'ANOMALOUS' },
    ],
    precedentsFound: [
      'OIL-SYN-005: Stuck pipe at 3,235m; pipe severed, sidetracked',
      'OIL-SYN-009: Successful wiper trip prevented packing off at 3,240m',
    ],
    recommendation:
      'Immediate Precautionary Wiper Trip recommended. Increase mud weight from 1.25 to 1.30 SG. Maintain rotary speed > 100 RPM.',
    leadTime: '~24 Minutes Lead Time',
  },
  {
    id: 4,
    title: 'Phase 4: Bayesian Risk Fusion & Proactive Alert Dispatch',
    tagline: 'Risk Engine escalates alert to CRITICAL with 28.5 min lead time',
    depth: 3244,
    formation: 'Barail Coal & Under-gauge Section',
    narrative:
      'RiskFusionEngine fuses mechanical sensors, lithology friction factors, and offset precedent weights. A high-priority CRITICAL alert is dispatched to the rig floor and central eRTMAC command with 28.5 minutes estimated lead time prior to potential pack-off.',
    signals: [
      { name: 'Stuck Pipe Risk Score', value: '88.4 / 100', status: 'CRITICAL' },
      { name: 'Combined Confidence', value: '92.4% Grounded', status: 'CRITICAL' },
      { name: 'Overpull Surge', value: '+140 kN', status: 'CRITICAL' },
      { name: 'Annular Pressure', value: '+18 bar above baseline', status: 'CRITICAL' },
    ],
    precedentsFound: [
      'OIL-SYN-005 (Lost assembly; side-track required)',
      'OIL-SYN-018 (Controlled reaming prevented pack-off)',
    ],
    recommendation:
      'Pick up off bottom immediately. Circulate with maximum allowable flow rate. Pump high-density sweep. DO NOT shut down pumps.',
    leadTime: '28.5 Minutes Proactive Lead Time',
  },
  {
    id: 5,
    title: 'Phase 5: Human-in-the-Loop Action & Prevented Incident',
    tagline: 'Engineer executes verified offset playbook; incident avoided (0 NPT)',
    depth: 3248,
    formation: 'Barail Formation (Stabilized Section)',
    narrative:
      'Drilling engineer acknowledges alert and authorizes the precedent-proven mitigation procedure (verified from OIL-SYN-018 DDR report). Mud weight is adjusted, hole is reamed back to gauge, torque stabilizes, and drilling resumes with zero Non-Productive Time.',
    signals: [
      { name: 'Alert State', value: 'RESOLVED (Audited)', status: 'NORMAL' },
      { name: 'Hole Friction', value: 'Normal (15.2 kN-m)', status: 'NORMAL' },
      { name: 'NPT Saved', value: '36.5 Hours Saved', status: 'NORMAL' },
      { name: 'Cost Impact', value: '₹48+ Lakhs Saved', status: 'NORMAL' },
    ],
    precedentsFound: ['Playbook from OIL-SYN-018 successfully executed and audited'],
    recommendation: 'Well stabilized. Continue drilling ahead to target depth.',
    leadTime: 'Incident Successfully Prevented',
  },
];

export default function DemoPage() {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [isLiveRunning, setIsLiveRunning] = useState(false);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [isSnapshotMode, setIsSnapshotMode] = useState(true);

  const activePhase = STORYBOARD_PHASES[activePhaseIndex];

  const handleStartLiveDemo = async () => {
    try {
      setIsLiveRunning(true);
      setLiveLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Triggering Hackathon Precedent Demo on OIL-SYN-020...`,
        ...prev,
      ]);
      const res = await api.realtime.runHackathonDemo();
      setLiveLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Simulator started: Scenario STUCK_PIPE_PRECURSOR at 3,200m depth.`,
        `[${new Date().toLocaleTimeString()}] Speed: 10x | Real-time SSE broadcast active.`,
        ...prev,
      ]);
    } catch (err: any) {
      setLiveLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Error triggering demo: ${err.message}`,
        ...prev,
      ]);
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.realtime.resetSimulation();
      setIsLiveRunning(false);
      setActivePhaseIndex(0);
      setLiveLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Simulator reset to initial state. All sessions cleared.`,
        ...prev,
      ]);
    } catch (err: any) {
      setLiveLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Reset error: ${err.message}`,
        ...prev,
      ]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Pitch Header */}
      <div className="bg-gradient-to-r from-slate-900 via-petro-950 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider font-mono">
                SIH26121 &bull; Oil India Limited
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider font-mono">
                1-Click Pitch Storyboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              NWIS Live Demonstration & Pitch Mode
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Demonstrating how NWIS transforms raw eRTMAC sensor streams into proactive,
              precedent-backed risk intelligence—saving 30+ hours of Non-Productive Time (NPT) per
              well.
            </p>
          </div>

          {/* Demonstration Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleStartLiveDemo}
              disabled={isLiveRunning}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                isLiveRunning
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isLiveRunning ? '● Live Simulation Active' : '▶ Trigger Live Demo'}
            </button>
            <button
              onClick={handleResetDemo}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              ↺ Reset
            </button>
            <a
              href="/dashboard"
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors"
            >
              View Live Cockpit →
            </a>
          </div>
        </div>

        {/* Phase Stepper Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 pt-5 border-t border-slate-800/80">
          {STORYBOARD_PHASES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActivePhaseIndex(idx)}
              className={`p-2.5 rounded-lg text-left transition-all border ${
                activePhaseIndex === idx
                  ? 'bg-emerald-950/80 border-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Phase {p.id}
              </div>
              <div className="text-xs font-semibold mt-0.5 truncate">{p.title.split(': ')[1]}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">{p.depth}m Depth</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Storyboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Deep Dive into Active Phase */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase Hero Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Active Demonstration Scenario
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{activePhase.title}</h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                {activePhase.leadTime}
              </span>
            </div>

            <p className="text-sm font-medium text-emerald-300/90 mt-3">{activePhase.tagline}</p>
            <p className="text-sm text-slate-300 leading-relaxed mt-2 bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
              {activePhase.narrative}
            </p>

            {/* Key Telemetry Signals in this Phase */}
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Real-Time Telemetry & Micro-Trend Signatures
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activePhase.signals.map((sig) => (
                  <div
                    key={sig.name}
                    className={`p-3 rounded-lg border ${
                      sig.status === 'CRITICAL'
                        ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                        : sig.status === 'ANOMALOUS'
                        ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 uppercase font-mono">{sig.name}</div>
                    <div className="text-base font-bold mt-1 font-mono">{sig.value}</div>
                    <div
                      className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${
                        sig.status === 'CRITICAL'
                          ? 'text-rose-400'
                          : sig.status === 'ANOMALOUS'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {sig.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched Historical Precedents */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Institutional Memory & Historical Precedents Retrieved
              </h3>
              <div className="space-y-2">
                {activePhase.precedentsFound.map((prec, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-2 text-xs bg-slate-950/60 p-2.5 rounded border border-slate-800 text-slate-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="font-mono text-emerald-300 font-semibold">[MATCH]:</span>
                    <span>{prec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Engineering Advisory */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-lg p-3.5 flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-800/80 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Proactive Decision-Support Advisory
                  </div>
                  <div className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                    {activePhase.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Phase Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
              <button
                disabled={activePhaseIndex === 0}
                onClick={() => setActivePhaseIndex((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors"
              >
                ← Previous Phase
              </button>
              <span className="text-xs font-mono text-slate-400">
                Phase {activePhase.id} of {STORYBOARD_PHASES.length}
              </span>
              <button
                disabled={activePhaseIndex === STORYBOARD_PHASES.length - 1}
                onClick={() =>
                  setActivePhaseIndex((prev) => Math.min(STORYBOARD_PHASES.length - 1, prev + 1))
                }
                className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-700 text-white disabled:opacity-40 hover:bg-emerald-600 transition-colors shadow-sm"
              >
                Next Phase →
              </button>
            </div>
          </div>

          {/* Live Action Stream Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Real-Time Replay Event Log
              </span>
              <span className="text-[10px] font-mono text-emerald-400">SSE: CONNECTED</span>
            </div>
            <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-400 max-h-36 overflow-y-auto space-y-1 border border-slate-800">
              {liveLog.length === 0 ? (
                <div className="text-slate-600">
                  Ready. Click &quot;Trigger Live Demo&quot; or step through phases above.
                </div>
              ) : (
                liveLog.map((log, idx) => (
                  <div key={idx} className="text-emerald-400/90 leading-tight">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: High-Impact Pitch Comparison & Value Metrics */}
        <div className="space-y-6">
          {/* Without NWIS vs With NWIS Comparison */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3">
              The NWIS Difference
            </h3>

            <div className="space-y-4">
              <div className="bg-rose-950/30 border border-rose-800/60 rounded-lg p-3">
                <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Without NWIS (Current eRTMAC Alone)</span>
                </div>
                <ul className="text-xs text-slate-300 mt-2 space-y-1 list-disc list-inside">
                  <li>Tells engineer <strong className="text-white">what is happening</strong> now</li>
                  <li>No automatic correlation with offset well events</li>
                  <li>Incident detected only when pipe is already stuck</li>
                  <li>Average NPT: <span className="text-rose-300 font-bold">36+ hours</span> ($150,000+)</li>
                  <li>Lessons in PDFs remain unread on rig sites</li>
                </ul>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-lg p-3">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>With NWIS Paired to eRTMAC</span>
                </div>
                <ul className="text-xs text-slate-200 mt-2 space-y-1 list-disc list-inside">
                  <li>Tells engineer <strong className="text-white">what is about to happen</strong></li>
                  <li>20+ min proactive lead time before pack-off</li>
                  <li>Signature Precedent Engine matches historical fixes</li>
                  <li>Institutional memory surfaced in &lt;1 second</li>
                  <li>100% human-in-the-loop with immutable audit</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quantitative Value Return */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3">
              Estimated Return for OIL Operations
            </h3>

            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-400">NPT Reduction</div>
                  <div className="text-lg font-bold text-emerald-400">22% – 35%</div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Industry benchmark</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-400">Mean Early Warning Lead Time</div>
                  <div className="text-lg font-bold text-blue-400">28.5 Minutes</div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Stuck Pipe Precursors</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-400">Historical DDR/WCR Retrieval</div>
                  <div className="text-lg font-bold text-purple-400">&lt; 250 ms</div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Hybrid Vector Search</span>
              </div>
            </div>
          </div>

          {/* Safety & Compliance Badge */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Safety Mandate & Integrity
            </div>
            <p className="text-[11px] leading-relaxed">
              NWIS operates strictly as a <strong>decision-support advisory system</strong>. It
              does not issue autonomous commands to drilling drives, drawworks, or mud pumps.
              Rig control remains exclusively with the certified Toolpusher and Drilling Superintendent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

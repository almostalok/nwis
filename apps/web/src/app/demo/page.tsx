'use client';

import React, { useState } from 'react';
import { api } from '../../lib/api';
import Link from 'next/link';

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
    title: 'Phase 3: Automated Offset Precedent Matching',
    tagline: 'Signature Precedent Engine links pattern to OIL-SYN-003 mechanical stuck-pipe event',
    depth: 3222,
    formation: 'Barail Reactive Sandstone / Coal Interface',
    narrative:
      'Multi-parameter vector query across PostGIS and document embeddings matches OIL-SYN-003 (drilled 2021, 6.2km away). In OIL-SYN-003, identical torque ramp-up occurred at 3,220m, resulting in 48 hours of jarring and a $240,000 side-track operation.',
    signals: [
      { name: 'Standpipe Pressure', value: '215 bar (+20)', status: 'CRITICAL' },
      { name: 'Drilling Torque', value: '26.5 kN-m (+82%)', status: 'CRITICAL' },
      { name: 'ROP Decay', value: '4.8 m/h (-74%)', status: 'CRITICAL' },
      { name: 'Bayesian Risk Index', value: '79 / 100', status: 'CRITICAL' },
    ],
    precedentsFound: [
      'OIL-SYN-003 (Mechanical Stuck Pipe at 3,220m, 48h jarring, sidetrack required)',
      'OIL-SYN-007 (Pack-off at 3,218m relieved by 12m³ lubricant soaking pill)',
    ],
    recommendation:
      'IMMEDIATE REVIEW: Stop rotary drilling immediately. Pick up off bottom to clean interval. Pump 12m³ oil-base lubricant pill as proven in OIL-SYN-007.',
    leadTime: '21.5 Minutes Lead Time',
  },
  {
    id: 4,
    title: 'Phase 4: Decision Support & Grounded Explanation',
    tagline: 'Superintendent receives auditable evidence dossier and verified mitigation plan',
    depth: 3222,
    formation: 'Barail Reactive Sandstone / Coal Interface',
    narrative:
      'NWIS dispatches an actionable advisory to rig floor and eRTMAC center. The alert is 100% grounded in Daily Drilling Reports (DDR #42) and Well Completion Reports with verifiable citations—eliminating AI hallucination risk.',
    signals: [
      { name: 'Grounded Evidence Passages', value: '4 Verified Passages', status: 'NORMAL' },
      { name: 'Confidence Score', value: '94% Confidence', status: 'NORMAL' },
      { name: 'Precedent Corroboration', value: '3 Offset Wells', status: 'NORMAL' },
      { name: 'Action Recommendation', value: '12m³ Lub Pill', status: 'NORMAL' },
    ],
    precedentsFound: [
      'WCR OIL-SYN-007 Section 4.2: Successful release after 4.5h soaking',
      'DDR OIL-SYN-003 Page 12: Jarring ineffective; sidetrack initiated',
    ],
    recommendation:
      'Work string while circulating. Displace lubricant pill across Barail coal interval. Monitor torque normalization.',
    leadTime: 'Decision Dispatched',
  },
  {
    id: 5,
    title: 'Phase 5: Mitigation Verification & NPT Averted',
    tagline: 'Parameters normalize following recommended procedure; $180,000 saved',
    depth: 3224,
    formation: 'Barail Sandstone (Middle Unit)',
    narrative:
      'Drilling crew pumped the recommended lubricant pill and worked the string. Torque variance returned to 15.2 kN-m (nominal). Normal circulation restored with zero pack-off. Rig resumes penetration without sticking.',
    signals: [
      { name: 'Standpipe Pressure', value: '197 bar (Nominal)', status: 'NORMAL' },
      { name: 'Drilling Torque', value: '15.2 kN-m (Normal)', status: 'NORMAL' },
      { name: 'Overpull Margin', value: '0 kN', status: 'NORMAL' },
      { name: 'NPT Averted', value: '36+ Hours Saved', status: 'NORMAL' },
    ],
    precedentsFound: ['OIL-SYN-020 (Mitigation recorded in continuous audit log)'],
    recommendation:
      'Incident successfully averted. Resume rotary drilling at nominal parameters. Log precedent into canonical repository.',
    leadTime: 'Incident Averted',
  },
];

export default function DemoStoryboardPage() {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [isLiveRunning, setIsLiveRunning] = useState(false);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const activePhase = STORYBOARD_PHASES[activePhaseIndex];

  const handleStartLiveDemo = async () => {
    setIsLiveRunning(true);
    setLiveLog((prev) => [
      `[${new Date().toLocaleTimeString()}] Initiating real-time stuck pipe simulation on OIL-SYN-020...`,
      ...prev,
    ]);
    try {
      const res = await api.realtime.startSimulation({
        wellId: 'OIL-SYN-020',
        scenario: 'STUCK_PIPE_RISK' as any,
        speedMultiplier: 2.0,
      });
      setLiveLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Live stream broadcasting: ${res.scenario} at 2x real-time speed.`,
        `[${new Date().toLocaleTimeString()}] Real-time correlation pipeline active. Watch alerts page or telemetry cockpit.`,
        ...prev,
      ]);
    } catch (err: any) {
      setLiveLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Simulation start failed: ${err.message}`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Pitch Header */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 font-mono text-[10px]">
              <span className="px-3 py-1 rounded-full font-black bg-[#dbeafe] text-[#1e3a8a] border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                SIH26121 &bull; Oil India Limited
              </span>
              <span className="px-3 py-1 rounded-full font-black bg-[#ede9fe] text-[#5b21b6] border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                1-Click Pitch Storyboard
              </span>
            </div>
            <h1 className="text-2xl font-black text-black tracking-tight mt-2">
              NWIS Live Demonstration &amp; Pitch Walkthrough
            </h1>
            <p className="text-xs text-zinc-600 max-w-3xl mt-1 leading-relaxed font-semibold">
              Transforming raw eRTMAC sensor streams into proactive, precedent-backed risk intelligence—saving 30+ hours of Non-Productive Time (NPT) per well.
            </p>
          </div>

          {/* Demonstration Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleStartLiveDemo}
              disabled={isLiveRunning}
              className={`px-5 py-2.5 text-xs font-black rounded-xl border-2 border-black transition-all shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                isLiveRunning
                  ? 'bg-amber-400 text-black animate-pulse'
                  : 'bg-[#fef08a] hover:bg-yellow-300 text-black'
              }`}
            >
              {isLiveRunning ? '● Live Simulation Active' : '▶ Trigger Live Demo'}
            </button>
            <button
              onClick={handleResetDemo}
              className="px-4 py-2.5 text-xs font-black rounded-xl bg-white hover:bg-zinc-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Reset
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2.5 text-xs font-black rounded-xl bg-black hover:bg-zinc-800 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Cockpit →
            </Link>
          </div>
        </div>

        {/* Phase Stepper Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t-2 border-black">
          {STORYBOARD_PHASES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActivePhaseIndex(idx)}
              className={`p-3.5 text-left rounded-xl transition-all border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                activePhaseIndex === idx
                  ? 'bg-[#dbeafe] text-[#1e3a8a] ring-2 ring-blue-500'
                  : 'bg-[#f8f9fa] hover:bg-white text-black'
              }`}
            >
              <div className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-500">
                PHASE 0{p.id}
              </div>
              <div className="text-xs font-black mt-1 truncate text-black">{p.title.split(': ')[1]}</div>
              <div className="text-[11px] mt-1 font-mono text-zinc-600 font-bold">{p.depth}m Depth</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Storyboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Deep Dive into Active Phase */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase Hero Card */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1e3a8a] font-mono">
                  Scenario Telemetry Breakdown
                </span>
                <h2 className="text-lg font-black text-black mt-0.5">{activePhase.title}</h2>
              </div>
              <span className="px-3 py-1 text-xs font-mono font-black uppercase tracking-wider rounded-full bg-[#fef3c7] text-[#78350f] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {activePhase.leadTime}
              </span>
            </div>

            <p className="text-xs font-mono font-black text-[#1e3a8a] uppercase tracking-wider">{activePhase.tagline}</p>
            <p className="text-xs text-black leading-relaxed bg-[#f8f9fa] p-4 rounded-xl border-2 border-black font-semibold shadow-[2px_2px_0px_0px_#000]">
              {activePhase.narrative}
            </p>

            {/* Key Telemetry Signals in this Phase */}
            <div className="mt-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-black font-mono mb-2">
                Telemetry Signals &amp; Sensor Signatures
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activePhase.signals.map((sig) => (
                  <div
                    key={sig.name}
                    className={`p-3.5 rounded-xl border-2 border-black font-mono shadow-[2px_2px_0px_0px_#000] ${
                      sig.status === 'CRITICAL'
                        ? 'bg-[#ffe4e6] text-[#881337]'
                        : sig.status === 'ANOMALOUS'
                        ? 'bg-[#fef3c7] text-[#78350f]'
                        : 'bg-[#f8f9fa] text-black'
                    }`}
                  >
                    <div className="text-[10px] text-zinc-600 font-bold uppercase">{sig.name}</div>
                    <div className="text-base font-black mt-1">{sig.value}</div>
                    <div
                      className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
                        sig.status === 'CRITICAL'
                          ? 'text-[#881337]'
                          : sig.status === 'ANOMALOUS'
                          ? 'text-[#78350f]'
                          : 'text-[#064e3b]'
                      }`}
                    >
                      [{sig.status}]
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched Historical Precedents */}
            <div className="mt-4 pt-4 border-t-2 border-black/10">
              <h3 className="text-xs font-black uppercase tracking-wider text-black font-mono mb-2">
                Institutional Precedents Corroborated
              </h3>
              <div className="space-y-2">
                {activePhase.precedentsFound.map((prec, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-2 text-xs bg-[#f8f9fa] p-3 rounded-xl border-2 border-black text-black font-bold shadow-[2px_2px_0px_0px_#000]"
                  >
                    <span className="font-black text-[#78350f] font-mono">[MATCH]:</span>
                    <span>{prec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Engineering Advisory */}
            <div className="mt-4 pt-4 border-t-2 border-black/10">
              <div className="bg-[#d1fae5] border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_#000]">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#064e3b] font-mono">
                  Proactive Advisory Action
                </div>
                <div className="text-xs text-black mt-1 leading-relaxed font-sans font-bold">
                  {activePhase.recommendation}
                </div>
              </div>
            </div>

            {/* Phase Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-black">
              <button
                disabled={activePhaseIndex === 0}
                onClick={() => setActivePhaseIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 text-xs font-black rounded-xl bg-white hover:bg-zinc-100 text-black border-2 border-black disabled:opacity-40 transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                ← Previous Phase
              </button>
              <span className="text-xs font-mono font-bold text-zinc-600">
                Phase {activePhase.id} of {STORYBOARD_PHASES.length}
              </span>
              <button
                disabled={activePhaseIndex === STORYBOARD_PHASES.length - 1}
                onClick={() =>
                  setActivePhaseIndex((prev) => Math.min(STORYBOARD_PHASES.length - 1, prev + 1))
                }
                className="px-5 py-2 text-xs font-black rounded-xl bg-black hover:bg-zinc-800 text-white border-2 border-black disabled:opacity-40 transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                Next Phase →
              </button>
            </div>
          </div>

          {/* Live Action Stream Log */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-3">
            <div className="flex items-center justify-between mb-1 pb-2 border-b-2 border-black">
              <span className="text-xs font-black uppercase tracking-wider text-black font-mono">
                Real-Time Replay Telemetry Log
              </span>
              <span className="text-[10px] text-[#064e3b] bg-[#d1fae5] px-2.5 py-0.5 rounded-full border border-black font-black font-mono">
                SSE: Connected
              </span>
            </div>
            <div className="bg-[#f8f9fa] p-4 text-xs text-black max-h-36 overflow-y-auto space-y-1.5 rounded-xl border-2 border-black font-mono shadow-[2px_2px_0px_0px_#000]">
              {liveLog.length === 0 ? (
                <div className="text-zinc-500 font-bold">
                  Ready &bull; Click [ Trigger Live Demo ] or step through phases above.
                </div>
              ) : (
                liveLog.map((log, idx) => (
                  <div key={idx} className="text-black font-semibold leading-tight">
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
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
            <h3 className="text-xs font-black text-black uppercase tracking-wider font-mono">
              The NWIS Value Proposition
            </h3>

            <div className="space-y-4">
              <div className="bg-[#ffe4e6] border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000]">
                <div className="text-xs font-black text-[#881337] uppercase tracking-wider font-mono">
                  Without NWIS &bull; eRTMAC Alone
                </div>
                <ul className="text-xs text-black mt-2 space-y-1.5 list-disc list-inside leading-relaxed font-semibold">
                  <li>Tells engineer <strong className="text-[#881337]">what is happening</strong> now</li>
                  <li>No automatic correlation with offset well events</li>
                  <li>Incident detected only when pipe is already stuck</li>
                  <li>Average NPT: <span className="text-[#881337] font-black">36+ hours</span> ($150,000+)</li>
                  <li>Lessons in PDFs remain unread on rig sites</li>
                </ul>
              </div>

              <div className="bg-[#d1fae5] border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000]">
                <div className="text-xs font-black text-[#064e3b] uppercase tracking-wider font-mono">
                  With NWIS Paired to eRTMAC
                </div>
                <ul className="text-xs text-black mt-2 space-y-1.5 list-disc list-inside leading-relaxed font-semibold">
                  <li>Tells engineer <strong className="text-[#064e3b]">what is about to happen</strong></li>
                  <li>20+ min proactive lead time before pack-off</li>
                  <li>Signature Precedent Engine matches historical fixes</li>
                  <li>Institutional memory surfaced in &lt;1 second</li>
                  <li>100% human-in-the-loop with immutable audit</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quantitative Value Return */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-3">
            <h3 className="text-xs font-black text-black uppercase tracking-wider font-mono">
              Estimated Quantitative Impact for OIL
            </h3>

            <div className="space-y-3">
              <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black flex justify-between items-center shadow-[2px_2px_0px_0px_#000]">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono font-black">NPT Reduction</div>
                  <div className="text-xl font-black text-[#064e3b] font-mono">22% – 35%</div>
                </div>
                <span className="text-[10px] text-black font-mono uppercase bg-white px-2.5 py-0.5 rounded-full border border-black font-bold">Benchmark</span>
              </div>

              <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black flex justify-between items-center shadow-[2px_2px_0px_0px_#000]">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono font-black">Early Warning Lead Time</div>
                  <div className="text-xl font-black text-[#1e3a8a] font-mono">28.5 Minutes</div>
                </div>
                <span className="text-[10px] text-black font-mono uppercase bg-white px-2.5 py-0.5 rounded-full border border-black font-bold">Lead Time</span>
              </div>

              <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black flex justify-between items-center shadow-[2px_2px_0px_0px_#000]">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-mono font-black">Offset Precedent Retrieval</div>
                  <div className="text-xl font-black text-[#78350f] font-mono">&lt; 250 ms</div>
                </div>
                <span className="text-[10px] text-black font-mono uppercase bg-white px-2.5 py-0.5 rounded-full border border-black font-bold">Hybrid Vector</span>
              </div>
            </div>
          </div>

          {/* Safety & Compliance Badge */}
          <div className="bg-[#f8f9fa] border-2 border-black rounded-2xl p-5 text-xs text-black space-y-2 shadow-[3px_3px_0px_0px_#000]">
            <div className="font-black text-black uppercase tracking-wider text-xs font-mono">
              Safety Mandate &amp; Integrity
            </div>
            <p className="leading-relaxed font-semibold">
              NWIS operates strictly as a <strong>decision-support advisory system</strong>. It does not issue autonomous commands to drilling drives, drawworks, or mud pumps. Rig control remains exclusively with the certified Toolpusher and Drilling Superintendent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

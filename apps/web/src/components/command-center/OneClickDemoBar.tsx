'use client';

import React, { useState } from 'react';
import { useToast } from '../Toast';

interface OneClickDemoBarProps {
  onStartDemo: () => Promise<void>;
  onResetDemo: () => Promise<void>;
  isDemoActive: boolean;
  demoStep: number;
  selectedWellId?: string;
}

export function OneClickDemoBar({
  onStartDemo,
  onResetDemo,
  isDemoActive,
  demoStep,
}: OneClickDemoBarProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const demoSteps = [
    { num: 1, label: 'Realtime Telemetry' },
    { num: 2, label: 'Feature Extraction' },
    { num: 3, label: 'Anomaly Detected' },
    { num: 4, label: 'Precedent Corroboration' },
    { num: 5, label: 'Formation Context' },
    { num: 6, label: 'Spatial Proximity' },
    { num: 7, label: 'Document Grounding' },
    { num: 8, label: 'Decision Support' },
    { num: 9, label: 'Bayesian Fusion' },
    { num: 10, label: 'Advisory Alert' },
    { num: 11, label: 'Timeline Audit' },
    { num: 12, label: 'Operator Confirmation' },
    { num: 13, label: 'Report Generated' },
    { num: 14, label: 'Model Registry' },
    { num: 15, label: 'Data Governance' },
  ];

  const handleStart = async () => {
    setLoading(true);
    try {
      await onStartDemo();
      toast.success(
        '1-Click Demo sequence initiated for SIH Evaluator review.',
        'SIH Demo Stream'
      );
    } catch (err: any) {
      toast.error(`Demo start failed: ${err.message}`, 'Demo Error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await onResetDemo();
      toast.info('Demo state reset to nominal baseline.', 'Simulation Reset');
    } catch (err: any) {
      toast.error(`Reset failed: ${err.message}`, 'Reset Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fef3c7] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000000] font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Demo Banner & Explanation */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-black border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <span className="w-3 h-3 rounded-full bg-[#facc15] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-black font-mono">
                SIH 2026 Evaluation Demo Controller
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#f59e0b] text-black rounded-full border border-black shadow-[1px_1px_0px_0px_#000]">
                1-CLICK PITCH
              </span>
            </div>
            <p className="text-xs text-zinc-800 font-medium mt-0.5">
              Live simulation of stuck-pipe precursor on OIL-SYN-020 (3,208m Barail Sandstone) with precedent corroboration
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-start-demo"
            onClick={handleStart}
            disabled={loading}
            className="px-4 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span>▶</span>
            <span>{isDemoActive ? 'RE-RUN SIH DEMO' : 'START SIH DEMO'}</span>
          </button>

          <button
            id="btn-reset-demo"
            onClick={handleReset}
            disabled={loading}
            className="px-3.5 py-2.5 bg-white hover:bg-zinc-100 text-black font-bold text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 15-Step Progression Breadcrumb */}
      <div className="mt-3.5 pt-3 border-t-2 border-black overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-[700px] text-xs">
          <span className="text-black font-mono font-bold text-[10px] uppercase tracking-wider mr-1">Flow:</span>
          {demoSteps.map((step) => {
            const isCompleted = isDemoActive && demoStep >= step.num;
            const isCurrent = isDemoActive && demoStep === step.num;
            return (
              <React.Fragment key={step.num}>
                <span
                  className={`px-2.5 py-1 whitespace-nowrap text-[11px] font-mono transition-all ${
                    isCurrent
                      ? 'bg-black text-white font-bold rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                      : isCompleted
                      ? 'bg-[#fbbf24] text-black font-bold rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]'
                      : 'bg-white text-zinc-600 rounded-lg border border-black/40 font-medium'
                  }`}
                >
                  {step.num}. {step.label}
                </span>
                {step.num < demoSteps.length && (
                  <span className="text-black font-bold text-[10px]">&rarr;</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

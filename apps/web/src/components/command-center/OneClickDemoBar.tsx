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
    { num: 1, label: 'Telemetry Stream' },
    { num: 2, label: 'Feature Extraction' },
    { num: 3, label: 'Anomaly Triggered' },
    { num: 4, label: 'Precedent Match' },
    { num: 5, label: 'Barail Formation' },
    { num: 6, label: 'Spatial Offset' },
    { num: 7, label: 'DDR Grounding' },
    { num: 8, label: 'Decision Output' },
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
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Scenario Header */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
            ▶
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                SIH 2026 Evaluation Demo Controller
              </span>
              <span className="tech-badge tech-badge-amber text-[10px]">
                1-CLICK PITCH
              </span>
              {isDemoActive && (
                <span className="tech-badge tech-badge-blue text-[10px] animate-pulse">
                  SIMULATION RUNNING (STEP {demoStep}/8)
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live simulation of stuck-pipe precursor on OIL-SYN-020 (3,208m Barail Sandstone) with multi-well precedent corroboration.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-start-demo"
            onClick={handleStart}
            disabled={loading}
            className="h-8 px-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold text-xs rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{isDemoActive ? '↻ Re-run Demo' : '▶ Start SIH Demo'}</span>
          </button>

          <button
            id="btn-reset-demo"
            onClick={handleReset}
            disabled={loading}
            className="h-8 px-3 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Structured Pipeline Progression */}
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-[650px] text-xs font-mono">
          <span className="text-zinc-400 text-[10px] uppercase tracking-wider mr-1">Pipeline:</span>
          {demoSteps.map((step) => {
            const isCompleted = isDemoActive && demoStep >= step.num;
            const isCurrent = isDemoActive && demoStep === step.num;
            return (
              <React.Fragment key={step.num}>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold'
                      : isCompleted
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-400 dark:text-zinc-600 border border-zinc-200/60 dark:border-zinc-800/60'
                  }`}
                >
                  {step.num}. {step.label}
                </span>
                {step.num < demoSteps.length && (
                  <span className="text-zinc-300 dark:text-zinc-700 text-[10px]">&rarr;</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

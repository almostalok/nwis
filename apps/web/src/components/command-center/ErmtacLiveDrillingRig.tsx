'use client';

import React, { useState, useEffect } from 'react';
import { RealtimeDrillingSample } from '@nwis/types';

interface ErmtacLiveDrillingRigProps {
  wellId: string;
  sample?: RealtimeDrillingSample | null;
  streamStatus: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';
  currentDepth: number;
  currentFormation: string;
}

export function ErmtacLiveDrillingRig({
  wellId,
  sample,
  streamStatus,
  currentDepth = 3208,
  currentFormation = 'Barail Sandstone',
}: ErmtacLiveDrillingRigProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [mudFlowOffset, setMudFlowOffset] = useState(0);
  const [activeSubView, setActiveSubView] = useState<'SCHEMATIC' | 'HYDRAULICS' | 'PACKETS'>('SCHEMATIC');

  // Real or derived live telemetry figures from ERMTAC
  const depth = sample?.measuredDepth ?? currentDepth;
  const tvd = sample?.trueVerticalDepth ?? (depth * 0.979).toFixed(1);
  const rop = sample?.rop ?? 18.2;
  const torque = sample?.torque ?? 14.2;
  const wob = sample?.wob ?? 14.5;
  const rpm = sample?.rpm ?? 118;
  const spp = sample?.standpipePressure ?? 195;
  const flowIn = sample?.flowIn ?? 2450;
  const flowOut = sample?.flowOut ?? 2462;
  const flowDelta = flowOut - flowIn;

  // Differential sticking overbalance calculation in Barail sand
  const differentialOverbalance = 38; // bar

  // Telemetry status conditions
  const isTorqueSurge = torque > 13.5;
  const isRopDecay = rop < 20.0;
  const isStickingPrecursor = isTorqueSurge && isRopDecay;

  // Animation frame loop for rotary and mud flow
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + (rpm / 20)) % 360);
      setMudFlowOffset((prev) => (prev + 3) % 24);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, rpm]);

  return (
    <section 
      id="ermtac-drilling-console"
      className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm font-sans"
      aria-label="ERMTAC Real-Time Drilling Rig Simulator"
    >
      {/* 1. ERMTAC Stream Header Bar */}
      <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Pulsing Status Dot */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                streamStatus === 'CONNECTED' ? 'bg-cyan-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                streamStatus === 'CONNECTED' ? 'bg-cyan-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              ERMTAC LIVE DRILLING STREAM
            </span>
          </div>

          <span className="hidden sm:inline-block text-zinc-300 dark:text-zinc-700">|</span>

          {/* Rig Source */}
          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
            RIG: <strong className="text-zinc-900 dark:text-zinc-200">SYN-RIG-07 (OIL-Assam)</strong>
          </span>

          <span className="hidden md:inline-block text-xs font-mono text-zinc-500 dark:text-zinc-400">
            FEED: <span className="text-cyan-600 dark:text-cyan-400 font-semibold">WITSML 1.4.1.1 ETP</span> (Latency: 84ms)
          </span>
        </div>

        {/* Right Controls: View Switcher & Animation Toggle */}
        <div className="flex items-center gap-2">
          {isStickingPrecursor && (
            <span className="tech-badge tech-badge-amber text-[10px] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>PRECURSOR ACTIVE: TORQUE SURGE</span>
            </span>
          )}

          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 rounded-md p-0.5 border border-zinc-200 dark:border-zinc-700 text-[11px] font-mono">
            <button
              onClick={() => setActiveSubView('SCHEMATIC')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeSubView === 'SCHEMATIC'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Downhole Rig
            </button>
            <button
              onClick={() => setActiveSubView('HYDRAULICS')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeSubView === 'HYDRAULICS'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Hydraulics
            </button>
            <button
              onClick={() => setActiveSubView('PACKETS')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeSubView === 'PACKETS'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              WITSML Log
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause drill simulation' : 'Resume drill simulation'}
            className="h-7 px-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            {isPlaying ? (
              <>
                <span className="w-2 h-2 bg-amber-500 rounded-xs" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <span className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-emerald-500" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Live Drilling Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
        
        {/* LEFT / CENTER: Animated Downhole Drilling Rig & Formation Cross-Section (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between bg-zinc-50/40 dark:bg-black/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                PHYSICAL DOWNHOLE BOREHOLE SCHEMATIC (ASSAM BASIN)
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Active Bit Penetration at <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{depth.toLocaleString()}m MD</strong> into <span className="text-amber-600 dark:text-amber-400 font-semibold">{currentFormation}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-semibold">
                RPM: {rpm}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
                Torque: {Number(torque).toFixed(1)} kN·m
              </span>
            </div>
          </div>

          {/* Graphical Rig Canvas / SVG Cross-Section */}
          <div className="relative w-full h-[360px] bg-zinc-900 dark:bg-[#070709] border border-zinc-200 dark:border-zinc-800/80 rounded-lg overflow-hidden shadow-inner flex">
            
            {/* Strata Depth Legend on Left (Width: 160px) */}
            <div className="w-36 sm:w-44 border-r border-zinc-800 bg-zinc-950/70 p-2 flex flex-col justify-between text-[10px] font-mono text-zinc-400 select-none z-10">
              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold border-b border-zinc-800 pb-1">
                  Stratigraphy MD
                </div>
                
                {/* 0 - 450m Alluvium */}
                <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800/60">
                  <div className="text-zinc-300 font-semibold truncate">Surface Alluvium</div>
                  <div className="text-[9px] text-zinc-500">0 - 450m</div>
                </div>

                {/* 450 - 1200m Dhekiajuli */}
                <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800/60">
                  <div className="text-zinc-300 font-semibold truncate">Dhekiajuli Fm</div>
                  <div className="text-[9px] text-zinc-500">450 - 1,200m</div>
                </div>

                {/* 1200 - 2100m Girujan Clay */}
                <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800/60">
                  <div className="text-zinc-300 font-semibold truncate">Girujan Clay</div>
                  <div className="text-[9px] text-zinc-500">1,200 - 2,100m</div>
                </div>

                {/* 2100 - 2850m Tipam Sandstone */}
                <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800/60">
                  <div className="text-zinc-300 font-semibold truncate">Tipam Sandstone</div>
                  <div className="text-[9px] text-zinc-500">2,100 - 2,850m</div>
                </div>

                {/* 2850 - 3450m BARAIL SANDSTONE (ACTIVE BIT ZONE) */}
                <div className="p-1.5 rounded bg-amber-950/40 border border-amber-500/40 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-300 font-bold truncate">Barail Sandstone</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  <div className="text-[9px] text-amber-400/80 font-semibold">2,850 - 3,450m</div>
                  <div className="mt-0.5 text-[8px] bg-amber-500/20 text-amber-200 px-1 py-0.2 rounded font-mono">
                    BIT: {depth}m MD
                  </div>
                </div>

                {/* 3450m+ Kopili Shale */}
                <div className="p-1 rounded bg-zinc-900/60 border border-zinc-800/40">
                  <div className="text-zinc-400 truncate">Kopili Shale</div>
                  <div className="text-[9px] text-zinc-600">3,450m+</div>
                </div>
              </div>

              {/* Casing Marker */}
              <div className="text-[9px] text-zinc-500 pt-1 border-t border-zinc-800/80">
                <span>9-5/8&quot; Casing Shoe @ 2,850m</span>
              </div>
            </div>

            {/* Borehole Visual Animation Area */}
            <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-zinc-950 via-[#0a0a0d] to-[#120f0a]">
              
              {/* Geological Stratum Background Bands */}
              <div className="absolute inset-0 pointer-events-none flex flex-col opacity-25">
                <div className="h-[12%] bg-stone-700 border-b border-stone-600/40" />
                <div className="h-[20%] bg-stone-800 border-b border-stone-700/40" />
                <div className="h-[22%] bg-zinc-800 border-b border-zinc-700/40" />
                <div className="h-[18%] bg-amber-900/30 border-b border-amber-700/40" />
                <div className="h-[28%] bg-amber-800/40 border-b border-amber-600/60" />
              </div>

              {/* Surface Rig Mast & Derrick Crown (at Top) */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  RIG FLOOR • TOP DRIVE
                </div>
                {/* Rotating Top Drive Swivel */}
                <div className="w-12 h-6 bg-zinc-700 border border-zinc-500 rounded-sm flex items-center justify-center shadow-lg relative">
                  <div 
                    className="w-8 h-3 bg-cyan-500/80 rounded-xs transition-transform duration-75 flex items-center justify-center text-[8px] font-mono text-black font-bold"
                    style={{ transform: `rotate(${rotationAngle}deg)` }}
                  >
                    ⟳
                  </div>
                </div>
              </div>

              {/* Drillstring Borehole Centerline */}
              <div className="absolute top-8 bottom-16 left-1/2 -translate-x-1/2 w-14 border-x border-zinc-700/80 bg-zinc-950/80 flex justify-center relative">
                
                {/* Steel Casing (Top half down to 2850m marker) */}
                <div className="absolute top-0 left-0 right-0 h-[68%] border-x-2 border-zinc-500/80 bg-zinc-900/40">
                  <div className="absolute bottom-0 -left-1 text-[8px] font-mono text-zinc-400">◢</div>
                  <div className="absolute bottom-0 -right-1 text-[8px] font-mono text-zinc-400">◣</div>
                </div>

                {/* Open Hole Below Casing Shoe in Barail Sandstone (Permeable Sand) */}
                <div className="absolute top-[68%] bottom-0 left-0 right-0 border-x border-dashed border-amber-500/60 bg-amber-950/20">
                  {/* Warning Differential Sticking Contact Zone Indicator */}
                  {isStickingPrecursor && (
                    <div className="absolute inset-y-0 right-0 w-2.5 bg-rose-500/30 animate-pulse border-l border-rose-500" title="Differential Sticking Contact Zone" />
                  )}
                </div>

                {/* Drill Pipe (Thin steel pipe running inside hole) */}
                <div className="w-4 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 h-full relative z-10 flex flex-col justify-between">
                  {/* Internal Mud Flow Lines (Cyan streaming downwards) */}
                  <div 
                    className="w-full h-full opacity-60 bg-[repeating-linear-gradient(180deg,#06b6d4_0px,#06b6d4_4px,transparent_4px,transparent_12px)]"
                    style={{ backgroundPositionY: `${mudFlowOffset * 2}px` }}
                  />
                </div>

                {/* Annular Return Mud Flow (Upward flow on both sides of drill pipe) */}
                <div 
                  className="absolute inset-y-0 left-0 w-4 opacity-50 bg-[repeating-linear-gradient(0deg,#38bdf8_0px,#38bdf8_3px,transparent_3px,transparent_10px)]"
                  style={{ backgroundPositionY: `-${mudFlowOffset * 1.5}px` }}
                />
                <div 
                  className="absolute inset-y-0 right-0 w-4 opacity-50 bg-[repeating-linear-gradient(0deg,#38bdf8_0px,#38bdf8_3px,transparent_3px,transparent_10px)]"
                  style={{ backgroundPositionY: `-${mudFlowOffset * 1.5}px` }}
                />

                {/* Downhole Bit Assembly (BHA) at Depth */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 flex flex-col items-center z-20">
                  {/* MWD / LWD Telemetry Sub (Pulser) */}
                  <div className="w-6 h-5 bg-blue-600 border border-blue-400 rounded-xs flex items-center justify-center relative">
                    <span className="text-[7px] font-mono font-bold text-white">MWD</span>
                    {/* Pulsing Acoustic Waves */}
                    <span className="absolute -top-1 w-8 h-2 border-t border-cyan-400 animate-ping opacity-60" />
                  </div>

                  {/* Heavy Drill Collars */}
                  <div className="w-7 h-6 bg-zinc-700 border-x-2 border-zinc-400 flex items-center justify-center">
                    <span className="text-[6px] font-mono text-zinc-300">COLLAR</span>
                  </div>

                  {/* Rotary Drill Bit (PDC / Tri-Cone with animated cutter rotation) */}
                  <div className="relative flex flex-col items-center">
                    <div 
                      className="w-10 h-5 bg-gradient-to-b from-amber-600 via-amber-500 to-zinc-800 rounded-b-md border border-amber-300 shadow-lg flex items-center justify-around transition-transform duration-75"
                      style={{ transform: `scaleX(${Math.cos((rotationAngle * Math.PI) / 90)})` }}
                    >
                      {/* Bit Cutters */}
                      <span className="w-1.5 h-2 bg-stone-100 rounded-xs" />
                      <span className="w-1.5 h-2.5 bg-stone-100 rounded-xs" />
                      <span className="w-1.5 h-2 bg-stone-100 rounded-xs" />
                    </div>

                    {/* Mud Jet Nozzles Spraying */}
                    <div className="flex gap-2 -mt-0.5">
                      <div className="w-1 h-3 bg-cyan-400/80 rounded-full animate-bounce" />
                      <div className="w-1 h-3 bg-cyan-400/80 rounded-full animate-bounce delay-75" />
                    </div>
                  </div>

                  {/* Rock Cuttings Shearing Particle Animation */}
                  <div className="absolute -bottom-3 flex gap-1">
                    <span className="w-1 h-1 bg-amber-400 rounded-full animate-ping" />
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-pulse" />
                    <span className="w-1 h-1 bg-amber-300 rounded-full animate-ping delay-100" />
                  </div>
                </div>
              </div>

              {/* Bottom Hole Depth Floating Callout */}
              <div className="absolute bottom-3 right-3 bg-zinc-950/90 border border-zinc-700 px-3 py-1.5 rounded-md shadow-xl text-right z-20 backdrop-blur-xs">
                <div className="text-[9px] font-mono text-zinc-400 uppercase">Current Bit Position</div>
                <div className="text-base font-mono font-bold text-white tracking-tight tabular-nums">
                  {depth.toLocaleString()} <span className="text-xs font-normal text-zinc-400">m MD</span>
                </div>
                <div className="text-[10px] font-mono text-amber-400 flex items-center justify-end gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>TVD: {tvd}m • Barail Sand</span>
                </div>
              </div>

              {/* Differential Overbalance Warning Banner inside Canvas */}
              {isStickingPrecursor && (
                <div className="absolute top-12 right-3 max-w-[210px] bg-rose-950/90 border border-rose-500/60 p-2 rounded-md shadow-lg z-20 backdrop-blur-xs text-[10px] font-mono text-rose-200">
                  <div className="font-bold flex items-center gap-1.5 text-rose-300">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>OVERBALANCE: +{differentialOverbalance} BAR</span>
                  </div>
                  <div className="text-[9px] text-rose-300/80 mt-1 leading-tight">
                    Depleted sand pore pressure (330 bar) vs mud column (368 bar). Wall suction force active on drill collar.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Schematic Footer Legend */}
          <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Drilling Mud Inflow (2,450 L/min)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Rock Cuttings Lift</span>
              </span>
            </div>
            <span>MWD Telemetry: Acoustic Pulser Active</span>
          </div>
        </div>

        {/* RIGHT: Live ERMTAC Telemetry Gauge Cluster (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-white dark:bg-zinc-950">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  ERMTAC TELEMETRY CLUSTER
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Real-time surface &amp; downhole sensors
                </div>
              </div>
              <span className="tech-badge tech-badge-blue text-[9px]">
                Rig 07 Stream
              </span>
            </div>

            {/* 6-Cell Telemetry Bento Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              
              {/* 1. Surface Torque (Critical Anomaly Signal) */}
              <div className={`p-3 rounded-lg border transition-all ${
                isTorqueSurge
                  ? 'bg-amber-500/10 border-amber-500/40 dark:bg-amber-950/20'
                  : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                  <span>Surface Torque</span>
                  <span className={`font-bold ${isTorqueSurge ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500'}`}>
                    {isTorqueSurge ? 'SURGING' : 'NOMINAL'}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {Number(torque).toFixed(1)} <span className="text-xs font-normal text-zinc-500">kN·m</span>
                  </div>
                  {isTorqueSurge && (
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                      +24%
                    </span>
                  )}
                </div>
                <div className="mt-1.5 w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isTorqueSurge ? 'bg-amber-500' : 'bg-blue-500'}`} 
                    style={{ width: `${Math.min(100, (torque / 22) * 100)}%` }} 
                  />
                </div>
                <div className="mt-1 text-[9px] font-mono text-zinc-400 flex justify-between">
                  <span>Base: 11.5</span>
                  <span>Trip: 18.0</span>
                </div>
              </div>

              {/* 2. Rate of Penetration ROP (Decay Signal) */}
              <div className={`p-3 rounded-lg border transition-all ${
                isRopDecay
                  ? 'bg-rose-500/10 border-rose-500/40 dark:bg-rose-950/20'
                  : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                  <span>ROP Penetration</span>
                  <span className={`font-bold ${isRopDecay ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500'}`}>
                    {isRopDecay ? 'RETARDED' : 'NOMINAL'}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {Number(rop).toFixed(1)} <span className="text-xs font-normal text-zinc-500">m/hr</span>
                  </div>
                  {isRopDecay && (
                    <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded">
                      -25%
                    </span>
                  )}
                </div>
                <div className="mt-1.5 w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isRopDecay ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min(100, (rop / 30) * 100)}%` }} 
                  />
                </div>
                <div className="mt-1 text-[9px] font-mono text-zinc-400 flex justify-between">
                  <span>Base: 24.0</span>
                  <span>Stall: 8.0</span>
                </div>
              </div>

              {/* 3. Weight on Bit (WOB) */}
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                  <span>Weight on Bit</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">OPTIMAL</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {Number(wob).toFixed(1)} <span className="text-xs font-normal text-zinc-500">T</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Target 12-16</span>
                </div>
                <div className="mt-1.5 w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (wob / 25) * 100)}%` }} />
                </div>
                <div className="mt-1 text-[9px] font-mono text-zinc-400 flex justify-between">
                  <span>0 T</span>
                  <span>Max: 22 T</span>
                </div>
              </div>

              {/* 4. Rotary Speed (RPM) */}
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                  <span>Top Drive Speed</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">ROTATING</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {rpm} <span className="text-xs font-normal text-zinc-500">RPM</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">Continuous</span>
                </div>
                <div className="mt-1.5 w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, (rpm / 160) * 100)}%` }} />
                </div>
                <div className="mt-1 text-[9px] font-mono text-zinc-400 flex justify-between">
                  <span>0 RPM</span>
                  <span>Max: 150</span>
                </div>
              </div>

              {/* 5. Standpipe Pressure (SPP) */}
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                  <span>Standpipe Press.</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">STABLE</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {spp} <span className="text-xs font-normal text-zinc-500">bar</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Nominal 195</span>
                </div>
                <div className="mt-1.5 w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (spp / 300) * 100)}%` }} />
                </div>
                <div className="mt-1 text-[9px] font-mono text-zinc-400 flex justify-between">
                  <span>0 bar</span>
                  <span>Trip: 240</span>
                </div>
              </div>

              {/* 6. Differential Overbalance (Hazard Gauge) */}
              <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                  <span>Differential ΔP</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">ELEVATED</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    +{differentialOverbalance} <span className="text-xs font-normal text-zinc-500">bar</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">Threshold &gt;30</span>
                </div>
                <div className="mt-1.5 w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '76%' }} />
                </div>
                <div className="mt-1 text-[9px] font-mono text-zinc-400 flex justify-between">
                  <span>Pore: 330</span>
                  <span>Mud: 368 bar</span>
                </div>
              </div>

            </div>
          </div>

          {/* Mud Flow Balance Tile */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs font-mono">
            <div className="flex items-center justify-between text-[10px] uppercase text-zinc-500 mb-1.5">
              <span>Mud Flow Hydraulics Loop</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">ZERO INFLUX / LOSS</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white dark:bg-zinc-900 p-1.5 rounded border border-zinc-200 dark:border-zinc-800">
                <div className="text-[9px] text-zinc-400">Flow In</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">{flowIn} L/m</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-1.5 rounded border border-zinc-200 dark:border-zinc-800">
                <div className="text-[9px] text-zinc-400">Flow Out</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">{flowOut} L/m</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-1.5 rounded border border-zinc-200 dark:border-zinc-800">
                <div className="text-[9px] text-zinc-400">Delta</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">+{flowDelta} L/m</div>
              </div>
            </div>
          </div>

          {/* ERMTAC Advisory Dispatch Link */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500">Target Well: {wellId}</span>
            <a 
              href="#decision-support-hero"
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
            >
              <span>View Possible Outcomes &darr;</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}

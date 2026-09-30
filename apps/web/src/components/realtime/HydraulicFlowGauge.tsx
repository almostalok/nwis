'use client';

import React from 'react';

interface HydraulicFlowGaugeProps {
  flowIn?: number | null;
  flowOut?: number | null;
  spp?: number | null;
  pitVolume?: number | null;
}

export function HydraulicFlowGauge({
  flowIn = 1850,
  flowOut = 1850,
  spp = 195,
  pitVolume = 42.5,
}: HydraulicFlowGaugeProps) {
  const fIn = flowIn ?? 1800;
  const fOut = flowOut ?? 1800;
  const delta = fOut - fIn;

  // Max flow reference for gauge scaling
  const maxFlow = 2500;
  const inPct = Math.min(100, Math.max(0, (fIn / maxFlow) * 100));
  const outPct = Math.min(100, Math.max(0, (fOut / maxFlow) * 100));

  // Determine hydraulic status
  let status = 'BALANCED';
  let statusColor = 'text-emerald-700';
  let badgeStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700';
  let alertText = 'Hydrostatic column stable & balanced.';

  if (delta > 60) {
    status = 'KICK / INFLUX WARNING';
    statusColor = 'text-rose-700';
    badgeStyle = 'bg-rose-50 border-rose-200 text-rose-700';
    alertText = 'Flow Out exceeds Flow In. Possible formation fluid influx detected!';
  } else if (delta < -60) {
    status = 'MUD LOSS DETECTED';
    statusColor = 'text-amber-800';
    badgeStyle = 'bg-amber-50 border-amber-200 text-amber-800';
    alertText = 'Flow Out below Flow In. Mud filtration loss to porous/fractured zone.';
  }

  // Delta bar position (-100 to +100 L/min normalized to 0-100% center at 50%)
  const maxDeltaRange = 150;
  const clampedDelta = Math.max(-maxDeltaRange, Math.min(maxDeltaRange, delta));
  const deltaMarkerPct = 50 + (clampedDelta / maxDeltaRange) * 50;

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-black" />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            Hydraulic Balance & Kick/Loss Monitor
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#dbeafe] text-[#1e3a8a] border-2 border-black font-mono font-bold shadow-[2px_2px_0px_0px_#000]">
            eRTMAC Protocol
          </span>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
          delta > 60
            ? 'bg-[#ffe4e6] text-[#881337]'
            : delta < -60
            ? 'bg-[#fef3c7] text-[#78350f]'
            : 'bg-[#d1fae5] text-[#064e3b]'
        }`}>
          {status}
        </div>
      </div>

      {/* Main Hydraulic Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Dual Bar In vs Out Comparison */}
        <div className="space-y-4">
          {/* Flow In Meter */}
          <div>
            <div className="flex justify-between text-xs text-zinc-700 mb-1.5 font-bold font-mono">
              <span className="text-blue-900 uppercase">Flow In (Mud Pumps):</span>
              <span className="text-black font-black">{fIn.toFixed(0)} L/min</span>
            </div>
            <div className="h-4 bg-zinc-100 rounded-full p-0.5 relative overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div
                style={{ width: `${inPct}%` }}
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Flow Out Meter */}
          <div>
            <div className="flex justify-between text-xs text-zinc-700 mb-1.5 font-bold font-mono">
              <span className="text-indigo-900 uppercase">Flow Out (Paddle Sensor):</span>
              <span className="text-black font-black">{fOut.toFixed(0)} L/min</span>
            </div>
            <div className="h-4 bg-zinc-100 rounded-full p-0.5 relative overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div
                style={{ width: `${outPct}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  delta > 60
                    ? 'bg-rose-500'
                    : delta < -60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Flow Balance Differential Gauge */}
          <div className="pt-3 border-t-2 border-zinc-200">
            <div className="flex justify-between text-xs text-zinc-700 mb-1.5 font-bold font-mono">
              <span className="uppercase">Differential (Out - In):</span>
              <span className={`font-black ${statusColor}`}>
                {delta > 0 ? `+${delta.toFixed(0)}` : delta.toFixed(0)} L/min
              </span>
            </div>
            {/* Center-Zero Differential Track */}
            <div className="h-4 bg-zinc-100 rounded-full border-2 border-black relative overflow-hidden shadow-[2px_2px_0px_0px_#000]">
              {/* Center Line (0 Delta) */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black z-10" />

              {/* Loss Zone (Left) */}
              <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-[#fef3c7] border-r-2 border-black/40" />

              {/* Safe Zone (Middle) */}
              <div className="absolute left-1/4 top-0 bottom-0 w-2/4 bg-[#d1fae5]" />

              {/* Kick Zone (Right) */}
              <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-[#ffe4e6] border-l-2 border-black/40" />

              {/* Pointer Marker */}
              <div
                style={{ left: `${deltaMarkerPct}%` }}
                className={`absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full border-2 border-black transition-all duration-300 ${
                  Math.abs(delta) > 60 ? 'bg-rose-600' : 'bg-black'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] mt-1.5 uppercase font-mono font-black">
              <span className="text-amber-800">&larr; -150L Mud Loss</span>
              <span className="text-zinc-600">0 L Balanced</span>
              <span className="text-rose-800">+150L Kick &rarr;</span>
            </div>
          </div>
        </div>

        {/* Right: SPP, Pit Volume & Diagnosis */}
        <div className="flex flex-col justify-between space-y-3 bg-[#f8f8fb] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-500 block font-mono text-[10px] font-black uppercase">STANDPIPE (SPP)</span>
              <div className="text-xl font-black text-blue-900 mt-0.5 font-mono">
                {spp ? `${spp.toFixed(0)} bar` : '195 bar'}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">Nom: 190-205 bar</span>
            </div>

            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-500 block font-mono text-[10px] font-black uppercase">ACTIVE PIT TANK</span>
              <div className="text-xl font-black text-emerald-900 mt-0.5 font-mono">
                {pitVolume ? `${pitVolume.toFixed(1)} m³` : '42.5 m³'}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">Capacity: 60.0 m³</span>
            </div>
          </div>

          <div className="p-3 bg-[#dbeafe] border-2 border-black rounded-xl text-xs shadow-[2px_2px_0px_0px_#000]">
            <span className="text-blue-950 block font-black uppercase tracking-wider text-[11px] mb-1">Advisory Status</span>
            <p className="text-blue-900 text-xs font-semibold leading-relaxed">{alertText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

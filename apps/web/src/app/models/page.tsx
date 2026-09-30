'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function ModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  useEffect(() => {
    api.models
      .list()
      .then((res) => {
        setModels(res || []);
        if (res && res.length > 0) setSelectedModel(res[0]);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-zinc-500 mb-1">
            <Link href="/dashboard" className="text-blue-700 hover:underline">
              ← Command Center
            </Link>
            <span>/</span>
            <span>Operations</span>
            <span>/</span>
            <span className="text-black font-bold">Model Registry</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#ede9fe] text-[#5b21b6] border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase tracking-wider font-mono">
              AI GOVERNANCE &amp; MODEL REGISTRY
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#d1fae5] text-[#064e3b] border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase tracking-wider font-mono">
              v1.0 PRODUCTION
            </span>
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight mt-2">
            Drilling Intelligence Model Registry
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Registered risk engines, benchmark metrics, lead times, calibration datasets, and drift status.
          </p>
        </div>

        <div className="bg-[#f8f9fa] px-5 py-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] text-right">
          <span className="text-[10px] text-zinc-500 font-mono font-black uppercase block">Active Hazard Models</span>
          <span className="text-xl font-black text-[#064e3b] font-mono">
            {models.length} Ensembles Online
          </span>
        </div>
      </div>

      {/* Safety Mandate Banner */}
      <div className="bg-[#fffbeb] border-2 border-black rounded-2xl p-5 flex items-start space-x-3 text-xs text-black shadow-[4px_4px_0px_0px_#000]">
        <span className="text-xl">🛡️</span>
        <div className="leading-relaxed">
          <strong className="text-[#78350f] font-black uppercase font-mono">STRICT ADVISORY &amp; SAFETY MANDATE:</strong> All registered models
          function purely as real-time decision-support aids for qualified Oil India Limited drilling engineers.
          Models do NOT output electrical or hydraulic control signals to top drives, drawworks, iron roughnecks, or mud pumps.
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white border-2 border-black rounded-2xl text-zinc-600 text-xs font-mono font-bold shadow-[4px_4px_0px_0px_#000]">
          <div className="inline-block w-8 h-8 border-4 border-black border-t-[#2563eb] rounded-full animate-spin mb-3" />
          <p>Loading Model Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Models List on Left */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="text-xs font-black text-black uppercase tracking-wider font-mono pb-2.5 border-b-2 border-black">
              Registered Engines ({models.length})
            </div>

            <div className="space-y-3">
              {models.map((m) => {
                const isSelected = selectedModel?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`p-4 rounded-xl border-2 border-black cursor-pointer transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                      isSelected
                        ? 'bg-[#dbeafe] text-[#1e3a8a] ring-2 ring-blue-500'
                        : 'bg-[#f8f9fa] hover:bg-white text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-black bg-white text-black border border-black">
                        {m.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#064e3b] font-black bg-[#d1fae5] px-2.5 py-0.5 rounded-full border border-black">
                        v{m.version}
                      </span>
                    </div>

                    <h3 className="font-black text-black text-xs mt-1.5">{m.name}</h3>
                    <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1 leading-snug font-semibold">{m.description}</p>

                    <div className="flex items-center justify-between text-xs text-black font-mono mt-3 pt-2 border-t-2 border-black/10 font-bold">
                      <span>F1-Score: <strong className="text-[#064e3b] font-black">{(m.metrics.f1Score * 100).toFixed(1)}%</strong></span>
                      {m.metrics.meanLeadTimeMinutes > 0 && (
                        <span>Lead: <strong className="text-[#1e3a8a] font-black">{m.metrics.meanLeadTimeMinutes}m</strong></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Specification Card on Right */}
          <div className="lg:col-span-2 space-y-6">
            {selectedModel ? (
              <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-black px-3 py-1 rounded-full bg-[#ede9fe] text-[#5b21b6] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                          {selectedModel.category}
                        </span>
                        <span className="text-xs font-mono text-[#064e3b] font-black bg-[#d1fae5] px-3 py-1 rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                          {selectedModel.status}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-black mt-2">{selectedModel.name}</h2>
                      <p className="text-xs text-zinc-600 font-mono font-bold mt-0.5">
                        Model ID: {selectedModel.id} &bull; Architecture: {selectedModel.architecture}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black text-[#064e3b] font-mono">
                        {(selectedModel.metrics.f1Score * 100).toFixed(1)}%
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Validated F1 Score</span>
                    </div>
                  </div>

                  <p className="text-xs text-black bg-[#f8f9fa] p-4 rounded-xl border-2 border-black leading-relaxed font-semibold shadow-[2px_2px_0px_0px_#000]">
                    {selectedModel.description}
                  </p>
                </div>

                {/* Benchmark Performance Grid */}
                <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-black font-mono">
                    Evaluation Benchmarks &amp; Early Warning Capacity
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      <div className="text-[10px] text-zinc-500 uppercase font-mono font-black">Precision</div>
                      <div className="text-2xl font-black text-black font-mono mt-1">
                        {(selectedModel.metrics.precision * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-1 font-bold">Low false alerts</div>
                    </div>

                    <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      <div className="text-[10px] text-zinc-500 uppercase font-mono font-black">Recall</div>
                      <div className="text-2xl font-black text-[#064e3b] font-mono mt-1">
                        {(selectedModel.metrics.recall * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-1 font-bold">Near-zero missed</div>
                    </div>

                    <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      <div className="text-[10px] text-zinc-500 uppercase font-mono font-black">False Alarm Rate</div>
                      <div className="text-2xl font-black text-[#1e3a8a] font-mono mt-1">
                        {selectedModel.metrics.falseAlarmRatePercent.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-1 font-bold">Below 5% threshold</div>
                    </div>

                    <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      <div className="text-[10px] text-zinc-500 uppercase font-mono font-black">Lead Time to Event</div>
                      <div className="text-2xl font-black text-[#5b21b6] font-mono mt-1">
                        {selectedModel.metrics.meanLeadTimeMinutes
                          ? `${selectedModel.metrics.meanLeadTimeMinutes} min`
                          : 'Pre-Job'}
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-1 font-bold">Proactive window</div>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-600 font-mono pt-2">
                    Evaluation Corpus: <strong className="text-black font-black">{selectedModel.metrics.evaluationDatasetSize}</strong>
                  </div>
                </div>

                {/* Features & Drift Monitoring */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-black font-mono">
                      Input Features Used
                    </h3>
                    <ul className="space-y-1.5 text-xs text-black font-mono font-bold">
                      {selectedModel.featuresUsed.map((feat: string, i: number) => (
                        <li key={i} className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 border border-black"></span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-black font-mono">
                        Data Drift Monitoring
                      </h3>
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-[#d1fae5] text-[#064e3b] border border-black">
                        {selectedModel.driftStatus.state}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs font-mono font-bold">
                      <div className="flex justify-between text-zinc-600">
                        <span>Metric:</span>
                        <span className="text-black font-black">{selectedModel.driftStatus.driftMetric}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600">
                        <span>Current Score:</span>
                        <span className="text-[#064e3b] font-black">{selectedModel.driftStatus.score}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600">
                        <span>Drift Threshold:</span>
                        <span className="text-black font-black">{selectedModel.driftStatus.threshold}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600">
                        <span>Last Evaluated:</span>
                        <span className="text-black">{new Date(selectedModel.driftStatus.lastEvaluated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

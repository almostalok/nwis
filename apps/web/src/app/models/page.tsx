'use client';

import React, { useState, useEffect } from 'react';
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 uppercase tracking-wider font-mono">
              AI Governance & Model Registry
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider font-mono">
              v1.0 Production
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Drilling Intelligence Model Registry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered risk engines, benchmark metrics, lead times, calibration datasets, and drift status
          </p>
        </div>

        <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 text-right">
          <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Hazard Models</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            {models.length} Ensembles Online
          </span>
        </div>
      </div>

      {/* Safety Mandate Banner */}
      <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-200">
        <span className="text-base">🛡️</span>
        <div>
          <strong className="text-amber-100">STRICT ADVISORY & SAFETY MANDATE:</strong> All registered models
          function purely as real-time decision-support aids for qualified Oil India Limited drilling engineers.
          Models do NOT output electrical or hydraulic control signals to top drives, drawworks, iron roughnecks, or mud pumps.
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
          Loading Model Registry...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Models List on Left */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono pb-2 border-b border-slate-800">
              Registered Engines ({models.length})
            </div>

            <div className="space-y-2">
              {models.map((m) => {
                const isSelected = selectedModel?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-purple-500 shadow-md'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-900 text-purple-300 border border-purple-900">
                        {m.category}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        v{m.version}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-xs mt-1">{m.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{m.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/80">
                      <span>F1-Score: <strong className="text-emerald-400">{(m.metrics.f1Score * 100).toFixed(1)}%</strong></span>
                      {m.metrics.meanLeadTimeMinutes > 0 && (
                        <span>Lead: <strong className="text-blue-400">{m.metrics.meanLeadTimeMinutes}m</strong></span>
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
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          {selectedModel.category}
                        </span>
                        <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                          {selectedModel.status}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white mt-1.5">{selectedModel.name}</h2>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Model ID: {selectedModel.id} &bull; Architecture: {selectedModel.architecture}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-400 font-mono">
                        {(selectedModel.metrics.f1Score * 100).toFixed(1)}%
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Validated F1 Score</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800/80 leading-relaxed">
                    {selectedModel.description}
                  </p>
                </div>

                {/* Benchmark Performance Grid */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Evaluation Benchmarks & Early Warning Capacity
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Precision</div>
                      <div className="text-xl font-bold text-white font-mono mt-1">
                        {(selectedModel.metrics.precision * 100).toFixed(1)}%
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1">Low false alerts</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Recall</div>
                      <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                        {(selectedModel.metrics.recall * 100).toFixed(1)}%
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1">Near-zero missed events</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">False Alarm Rate</div>
                      <div className="text-xl font-bold text-blue-400 font-mono mt-1">
                        {selectedModel.metrics.falseAlarmRatePercent.toFixed(1)}%
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1">Below 5% threshold</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Lead Time to Event</div>
                      <div className="text-xl font-bold text-purple-400 font-mono mt-1">
                        {selectedModel.metrics.meanLeadTimeMinutes
                          ? `${selectedModel.metrics.meanLeadTimeMinutes} min`
                          : 'Pre-Job'}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1">Proactive window</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-mono pt-2">
                    Evaluation Corpus: <strong className="text-slate-200">{selectedModel.metrics.evaluationDatasetSize}</strong>
                  </div>
                </div>

                {/* Features & Drift Monitoring */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Input Features Used
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                      {selectedModel.featuresUsed.map((feat: string, i: number) => (
                        <li key={i} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                        Data Drift Monitoring
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {selectedModel.driftStatus.state}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Metric:</span>
                        <span className="text-slate-200">{selectedModel.driftStatus.driftMetric}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Current Score:</span>
                        <span className="text-emerald-400 font-bold">{selectedModel.driftStatus.score}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Drift Threshold:</span>
                        <span className="text-slate-200">{selectedModel.driftStatus.threshold}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Last Evaluated:</span>
                        <span className="text-slate-300">{new Date(selectedModel.driftStatus.lastEvaluated).toLocaleDateString()}</span>
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

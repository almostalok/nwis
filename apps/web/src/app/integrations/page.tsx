'use client';

import React from 'react';

export default function IntegrationsPage() {
  const adapters = [
    {
      name: 'OIL eRTMAC Connector',
      standard: 'SOAP / REST API & WITSML Feed',
      status: 'INTEGRATION_READY',
      purpose: 'Bidirectional ingestion of real-time drilling telemetry and historical operational logs from OIL eRTMAC servers.',
      specs: [
        'Supports standard WITSML 1.4.1.1 & WITSML 2.0 log objects',
        'TLS 1.3 encrypted secure network transport with Mutual Auth (mTLS)',
        'Buffering & fault-tolerant store-and-forward for field network disconnects',
        'Normalized canonical schema mapping directly into PostgreSQL/PostGIS',
      ],
      readiness: 'Adapter interface implemented. Synthetic adapter active in demo mode; switches to live eRTMAC endpoint via environment configuration.',
    },
    {
      name: 'WITSML 1.4.1.1 Real-Time Server',
      standard: 'Energistics WITSML Standard',
      status: 'INTEGRATION_READY',
      purpose: 'Direct ingestion from rig site EDR (Electronic Drilling Recorder) systems (NOV, Baker Hughes, Halliburton, SLB).',
      specs: [
        'Standard WMLS_GetFromStore, WMLS_AddToStore, WMLS_UpdateInStore interfaces',
        'Supports well, wellbore, trajectory, mudLog, and log curve queries',
        'Low-latency SSE multiplexer delivering updates to web command center',
        'Quality scoring and out-of-range sensor detection on raw streams',
      ],
      readiness: 'Schema parsing verified. Ready for rig-site WITSML client connection.',
    },
    {
      name: 'OIL Document Archive & EDMS Connector',
      standard: 'REST / SFTP / S3-Compatible',
      status: 'INTEGRATION_READY',
      purpose: 'Automated batch ingestion and continuous polling of Daily Drilling Reports (DDR) and Well Completion Reports (WCR).',
      specs: [
        'Automated OCR ingestion for scanned PDFs and tabular shift logs',
        'Domain NLP entity extraction (casing, mud, formation tops, incident tags)',
        'Deduplication engine cross-referencing existing operational events',
        'Automatic 64-dimensional semantic chunk embedding and vector indexing',
      ],
      readiness: 'Pipeline active. Ingests local repository; connects to Enterprise Document Management via S3/Blob interface.',
    },
    {
      name: 'Rig Control Air-Gap Boundary',
      standard: 'IEC 62443 Industrial Cybersecurity',
      status: 'ENFORCED',
      purpose: 'Enforces strictly unidirectional data flow from rig systems into NWIS.',
      specs: [
        'Zero write-back capability to rig PLC or equipment controllers',
        'No remote equipment commanding (WOB, RPM, mud weight, pump rate protected)',
        'All engineering recommendations require human review and manual rig actuation',
        'Complete audit logging of all user queries and system alerts',
      ],
      readiness: 'Cryptographically and architecturally guaranteed by design.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider font-mono">
              Enterprise Integration Architecture
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider font-mono">
              eRTMAC Compatible
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            OIL / eRTMAC Ecosystem Integrations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Technical interface specifications for seamless deployment into Oil India Limited IT/OT infrastructure
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-right">
          <span className="text-[10px] text-slate-500 font-mono uppercase block">Integration State</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">STANDBY READY</span>
        </div>
      </div>

      {/* Production Authorization Notice */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-5 text-xs text-amber-200 space-y-2">
        <div className="font-bold text-amber-100 uppercase tracking-wider flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>PRODUCTION INTEGRATION READINESS DECLARATION</span>
        </div>
        <p className="leading-relaxed">
          The NWIS codebase contains dedicated adapter abstractions (<code>ERTMACAdapter</code>,{' '}
          <code>WITSMLLiveAdapter</code>, <code>DocumentLakeAdapter</code>) engineered to OIL specifications.
          In accordance with cybersecurity protocols and hackathon guidelines, live production hookup to OIL
          production servers requires formal authorization, VPN credentials, and enterprise deployment approval.
          The current demonstration utilizes high-fidelity synthetic data modeled after Assam-Arakan basins.
        </p>
      </div>

      {/* Architecture Topology */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          System Integration Topology
        </h2>

        <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre className="leading-relaxed">
{`+-----------------------------------------------------------------------------------+
|                        OIL INDIA LIMITED RIG ENVIRONMENT                          |
|                                                                                   |
|  [Rig Sensors / EDR]  --->  [WITS0/WITSML 1.4.1.1]  --->  [OIL eRTMAC Server]     |
+-----------------------------------------------------------------------------------+
                                                              |
                                  +---------------------------+ (One-Way Telemetry Stream)
                                  |
                                  v
+-----------------------------------------------------------------------------------+
|                        NWIS INTELLIGENCE BOUNDARY (Air-Gapped)                    |
|                                                                                   |
|  [RealtimeDrillingAdapter]                                                        |
|         |                                                                         |
|         v                                                                         |
|  [FeatureEngine] (30s/60s/300s/900s) ---> [Deterministic Anomaly Detection]       |
|         |                                              |                          |
|         v                                              v                          |
|  [Stratigraphic Correlation]              [RiskFusionEngine (Bayesian Ensemble)]   |
|         |                                              |                          |
|         +-----------------------+----------------------+                          |
|                                 v                                                 |
|                   [Signature Precedent Engine] <---> [PostGIS + Vector Store]     |
|                                 |                                                 |
|                                 v                                                 |
|                [Alert Lifecycle State Machine & Audit]                            |
|                                 |                                                 |
|                                 v                                                 |
|              [SSE Streamer -> NWIS Command Center UI]                             |
+-----------------------------------------------------------------------------------+`}
          </pre>
        </div>
      </div>

      {/* Integration Adapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adapters.map((adapter) => (
          <div
            key={adapter.name}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{adapter.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono">{adapter.standard}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  adapter.status === 'ENFORCED'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {adapter.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{adapter.purpose}</p>

            <div className="space-y-1 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                Technical Specifications:
              </span>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                {adapter.specs.map((spec, i) => (
                  <li key={i}>{spec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] text-slate-300 font-mono mt-3">
              <span className="text-emerald-400 font-bold">Status:</span> {adapter.readiness}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

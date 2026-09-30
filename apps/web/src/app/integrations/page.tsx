'use client';

import React from 'react';
import Link from 'next/link';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-zinc-500 mb-1">
            <Link href="/dashboard" className="text-blue-700 hover:underline">
              ← Command Center
            </Link>
            <span>/</span>
            <span>Operations</span>
            <span>/</span>
            <span className="text-black font-bold">Integrations</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase tracking-wider font-mono">
              ENTERPRISE INTEGRATION ARCHITECTURE
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#d1fae5] text-[#064e3b] border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase tracking-wider font-mono">
              eRTMAC COMPATIBLE
            </span>
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight mt-2">
            OIL / eRTMAC Ecosystem Integrations
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Technical interface specifications for seamless deployment into Oil India Limited IT/OT infrastructure.
          </p>
        </div>

        <div className="bg-[#f8f9fa] px-5 py-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] text-right">
          <span className="text-[10px] text-zinc-500 font-mono uppercase font-black block">Integration State</span>
          <span className="text-sm font-black text-[#064e3b] font-mono">STANDBY READY</span>
        </div>
      </div>

      {/* Production Authorization Notice */}
      <div className="bg-[#fffbeb] border-2 border-black rounded-2xl p-5 text-xs text-black shadow-[4px_4px_0px_0px_#000] space-y-2">
        <div className="font-black text-[#78350f] uppercase tracking-wider flex items-center space-x-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse border border-black"></span>
          <span>Production Integration Readiness Declaration</span>
        </div>
        <p className="leading-relaxed font-semibold">
          The NWIS codebase contains dedicated adapter abstractions (<code>ERTMACAdapter</code>,{' '}
          <code>WITSMLLiveAdapter</code>, <code>DocumentLakeAdapter</code>) engineered to OIL specifications.
          In accordance with cybersecurity protocols and hackathon guidelines, live production hookup to OIL
          production servers requires formal authorization, VPN credentials, and enterprise deployment approval.
          The current demonstration utilizes high-fidelity synthetic data modeled after Assam-Arakan basins.
        </p>
      </div>

      {/* Architecture Topology */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-4">
        <h2 className="text-xs font-black text-black uppercase tracking-wider font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-black" />
          System Integration Topology
        </h2>

        <div className="bg-[#f8f9fa] p-5 rounded-xl border-2 border-black font-mono text-xs text-black overflow-x-auto shadow-[2px_2px_0px_0px_#000]">
          <pre className="leading-relaxed font-bold">
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
            className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-black text-base">{adapter.name}</h3>
                <span className="text-xs text-zinc-600 font-mono font-bold">{adapter.standard}</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] ${
                  adapter.status === 'ENFORCED'
                    ? 'bg-[#dbeafe] text-[#1e3a8a]'
                    : 'bg-[#d1fae5] text-[#064e3b]'
                }`}
              >
                {adapter.status}
              </span>
            </div>

            <p className="text-xs text-black leading-relaxed font-semibold">{adapter.purpose}</p>

            <div className="space-y-1.5 pt-3 border-t-2 border-black/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 font-mono block">
                Technical Specifications:
              </span>
              <ul className="text-xs text-zinc-800 space-y-1 list-disc list-inside font-medium">
                {adapter.specs.map((spec, i) => (
                  <li key={i}>{spec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#f8f9fa] p-3.5 rounded-xl border-2 border-black text-xs text-black font-mono mt-3 shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[#064e3b] font-black">Status:</span> {adapter.readiness}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

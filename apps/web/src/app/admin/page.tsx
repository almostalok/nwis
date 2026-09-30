'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';

export default function AdminPage() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'USERS' | 'AUDIT' | 'SOURCES' | 'JOBS' | 'CONFIG' | 'MODELS'>('USERS');

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [ingestionJobs, setIngestionJobs] = useState<any[]>([]);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [simStatus, setSimStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      setAuthLoading(true);
      const me = await api.auth.me();
      setCurrentUser(me);
      if (me.role === 'ADMIN' || me.role === 'MANAGER') {
        loadSectionData('USERS');
      }
    } catch (err: any) {
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadSectionData = async (section: string) => {
    setLoading(true);
    try {
      if (section === 'USERS') {
        const userList = await api.auth.users().catch(() => []);
        setUsers(userList);
      } else if (section === 'AUDIT') {
        const logs = await api.audit.list(30).catch(() => []);
        setAuditLogs(logs);
      } else if (section === 'SOURCES') {
        const jobs = await api.ingestion.getJobs().catch(() => []);
        setIngestionJobs(jobs);
      } else if (section === 'JOBS') {
        const [q, jobs] = await Promise.all([
          api.knowledge.getQueueStatus().catch(() => null),
          api.ingestion.getJobs().catch(() => []),
        ]);
        setQueueStatus(q);
        setIngestionJobs(jobs);
      } else if (section === 'CONFIG') {
        const sim = await api.realtime.getSimulatorStatus().catch(() => null);
        setSimStatus(sim);
      }
    } catch (err: any) {
      toast.error(`Failed to load ${section}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchSection = (section: any) => {
    setActiveSection(section);
    loadSectionData(section);
  };

  const handleResetSimulations = async () => {
    try {
      await api.realtime.resetSimulation();
      toast.success('All live simulations successfully reset.', 'Simulator State');
      loadSectionData('CONFIG');
    } catch (err: any) {
      toast.error(`Reset failed: ${err.message}`, 'Simulator Error');
    }
  };

  const handleReindexDocuments = async () => {
    try {
      toast.info('Triggered document re-indexing pipeline...', 'Knowledge Pipeline');
      const res = await api.knowledge.processAll();
      toast.success(`Processed ${res.processed} documents successfully.`, 'Knowledge Pipeline');
    } catch (err: any) {
      toast.error(`Re-indexing failed: ${err.message}`);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-[#2563eb]"></div>
          <span className="text-xs text-zinc-600 font-mono font-bold">Checking authorization credentials...</span>
        </div>
      </div>
    );
  }

  // Role Gate: Must be ADMIN or MANAGER
  if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER')) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#ffe4e6] flex items-center justify-center border-2 border-black text-rose-800 font-black text-3xl shadow-[3px_3px_0px_0px_#000]">
          🔒
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight text-black">Administrator Access Required</h2>
          <p className="text-xs text-zinc-600 leading-relaxed font-sans">
            The NWIS Administration Center is restricted to personnel with <code className="text-rose-800 bg-[#ffe4e6] px-2 py-0.5 rounded-full border border-black font-mono font-bold">ADMIN</code> or <code className="text-rose-800 bg-[#ffe4e6] px-2 py-0.5 rounded-full border border-black font-mono font-bold">MANAGER</code> privileges.
            {currentUser ? ` Your current verified role is ${currentUser.role}.` : ' You are currently not signed in.'}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5"
          >
            Sign In with Administrator Credentials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black tracking-tight text-black">System Administration</h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-[#ffe4e6] text-[#881337] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              Role: {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            Enterprise system governance, user directory, audit trails, and data pipeline management.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {(['USERS', 'AUDIT', 'SOURCES', 'JOBS', 'CONFIG', 'MODELS'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => handleSwitchSection(sec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                activeSection === sec
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-[#f8f9fa]'
              }`}
            >
              {sec === 'USERS' && 'Users & Roles'}
              {sec === 'AUDIT' && 'Audit Logs'}
              {sec === 'SOURCES' && 'Data Sources'}
              {sec === 'JOBS' && 'Queue & Jobs'}
              {sec === 'CONFIG' && 'System Config'}
              {sec === 'MODELS' && 'AI & Models'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="p-4 bg-[#dbeafe] border-2 border-black rounded-2xl text-xs text-[#1e3a8a] flex items-center space-x-2 font-bold shadow-[3px_3px_0px_0px_#000]">
          <div className="w-4 h-4 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing administrative records...</span>
        </div>
      )}

      {/* SECTION 1: USERS & ROLES */}
      {activeSection === 'USERS' && (
        <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
          <div className="p-5 border-b-2 border-black flex justify-between items-center bg-[#f8f9fa]">
            <div>
              <h2 className="text-sm font-black text-black">Authorized User Accounts</h2>
              <p className="text-xs text-zinc-600">Strict server-side role-based access control (RBAC)</p>
            </div>
            <span className="text-xs font-mono text-black font-bold bg-white px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {users.length} registered accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-black font-mono uppercase text-[11px] border-b-2 border-black font-black">
                <tr>
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 font-mono">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3.5 px-5 font-sans font-bold text-black">{u.name}</td>
                    <td className="py-3.5 px-5 text-zinc-700">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border border-black ${
                          u.role === 'ADMIN'
                            ? 'bg-[#ffe4e6] text-[#881337]'
                            : u.role === 'DRILLING_ENGINEER'
                            ? 'bg-[#d1fae5] text-[#064e3b]'
                            : u.role === 'GEOLOGIST'
                            ? 'bg-[#fef3c7] text-[#78350f]'
                            : u.role === 'MANAGER'
                            ? 'bg-[#dbeafe] text-[#1e3a8a]'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-zinc-700 font-sans">{u.department || 'OIL Operations'}</td>
                    <td className="py-3.5 px-5">
                      <span className="text-[#064e3b] font-black flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black" />
                        <span>ACTIVE</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: AUDIT LOGS */}
      {activeSection === 'AUDIT' && (
        <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
          <div className="p-5 border-b-2 border-black flex justify-between items-center bg-[#f8f9fa]">
            <div>
              <h2 className="text-sm font-black text-black">Immutable Operational & Security Audit Trail</h2>
              <p className="text-xs text-zinc-600">All alerts, simulations, and data mutations logged</p>
            </div>
            <span className="text-xs font-mono text-black font-bold bg-white px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {auditLogs.length} recent entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-black font-mono uppercase text-[11px] border-b-2 border-black font-black">
                <tr>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Action</th>
                  <th className="py-3 px-5">Actor</th>
                  <th className="py-3 px-5">Entity Type</th>
                  <th className="py-3 px-5">Entity ID</th>
                  <th className="py-3 px-5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 font-mono">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 font-sans">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="py-3.5 px-5 text-zinc-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#fef3c7] text-[#78350f] border border-black">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-black font-bold">{log.user?.email || log.userId || 'SYSTEM'}</td>
                      <td className="py-3.5 px-5 text-zinc-700">{log.entityType}</td>
                      <td className="py-3.5 px-5 text-zinc-700">{log.entityId}</td>
                      <td className="py-3.5 px-5 text-zinc-500">{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: DATA SOURCES */}
      {activeSection === 'SOURCES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-black">eRTMAC Adapter</h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-[#d1fae5] text-[#064e3b] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                READY
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-sans">
              OIL real-time eRTMAC monitoring system integration interface.
            </p>
            <div className="text-xs font-mono text-black bg-[#f8f9fa] p-3.5 rounded-xl border-2 border-black space-y-1.5 shadow-[2px_2px_0px_0px_#000]">
              <p><span className="text-zinc-500 font-bold">Type:</span> Synthetic Adapter</p>
              <p><span className="text-zinc-500 font-bold">Buffer:</span> 10,000 samples</p>
              <p><span className="text-zinc-500 font-bold">Status:</span> Active Feed</p>
            </div>
          </div>

          <div className="p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-black">WITSML Stream</h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-[#dbeafe] text-[#1e3a8a] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                STANDBY
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-sans">
              WITSML 1.4.1.1 / 2.0 real-time XML telemetry parser.
            </p>
            <div className="text-xs font-mono text-black bg-[#f8f9fa] p-3.5 rounded-xl border-2 border-black space-y-1.5 shadow-[2px_2px_0px_0px_#000]">
              <p><span className="text-zinc-500 font-bold">Protocol:</span> SOAP / WebSocket</p>
              <p><span className="text-zinc-500 font-bold">Curves:</span> ROP, Torque, Flow, SPP</p>
              <p><span className="text-zinc-500 font-bold">Status:</span> Ready for rig connection</p>
            </div>
          </div>

          <div className="p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-black">Batch CSV / Excel</h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-[#d1fae5] text-[#064e3b] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-sans">
              Bulk historical well logs and operational event ingestion.
            </p>
            <div className="text-xs font-mono text-black bg-[#f8f9fa] p-3.5 rounded-xl border-2 border-black space-y-1.5 shadow-[2px_2px_0px_0px_#000]">
              <p><span className="text-zinc-500 font-bold">Format:</span> CSV / XLSX / PDF</p>
              <p><span className="text-zinc-500 font-bold">Processed:</span> 20 Synthetic Wells</p>
              <p><span className="text-zinc-500 font-bold">Total Records:</span> 48,000+</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: QUEUE & JOBS */}
      {activeSection === 'JOBS' && (
        <div className="space-y-5">
          <div className="p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-black">BullMQ & Redis Document Processing Queue</h3>
              <p className="text-xs text-zinc-600 font-sans mt-0.5">
                Asynchronous background worker pipeline for PDF extraction, OCR, chunking, and embedding.
              </p>
            </div>
            <button
              onClick={handleReindexDocuments}
              className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5"
            >
              Trigger Full Re-indexing
            </button>
          </div>

          {queueStatus && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">
                <p className="text-[11px] text-zinc-500 font-mono font-bold uppercase">Redis Connection</p>
                <p className="text-sm font-black text-black mt-1 font-mono">
                  {queueStatus.connectedToRedis ? (
                    <span className="text-[#064e3b] bg-[#d1fae5] px-2 py-0.5 rounded-full border border-black">CONNECTED</span>
                  ) : (
                    <span className="text-[#78350f] bg-[#fef3c7] px-2 py-0.5 rounded-full border border-black">IN-PROCESS FALLBACK</span>
                  )}
                </p>
              </div>
              <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">
                <p className="text-[11px] text-zinc-500 font-mono font-bold uppercase">Queue Length</p>
                <p className="text-xl font-black text-[#064e3b] mt-1 font-mono">{queueStatus.inMemoryQueueLength}</p>
              </div>
              <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">
                <p className="text-[11px] text-zinc-500 font-mono font-bold uppercase">Worker Active</p>
                <p className="text-sm font-black text-black mt-1 font-mono">
                  {queueStatus.isWorkerActive ? (
                    <span className="text-[#064e3b] bg-[#d1fae5] px-2 py-0.5 rounded-full border border-black">ONLINE</span>
                  ) : (
                    <span className="text-[#881337] bg-[#ffe4e6] px-2 py-0.5 rounded-full border border-black">STOPPED</span>
                  )}
                </p>
              </div>
              <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000]">
                <p className="text-[11px] text-zinc-500 font-mono font-bold uppercase">Current Status</p>
                <p className="text-sm font-black text-black mt-1 font-mono">
                  {queueStatus.isCurrentlyProcessing ? (
                    <span className="text-[#78350f] bg-[#fef3c7] px-2 py-0.5 rounded-full border border-black">PROCESSING</span>
                  ) : (
                    <span className="text-zinc-600 bg-[#f8f9fa] px-2 py-0.5 rounded-full border border-black">IDLE</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: SYSTEM CONFIG & SIMULATOR */}
      {activeSection === 'CONFIG' && (
        <div className="space-y-4">
          <div className="p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-black">Simulation Engine Controls</h3>
                <p className="text-xs text-zinc-600 font-sans mt-0.5">
                  Control in-memory synthetic telemetry simulations and state coordination.
                </p>
              </div>
              <button
                onClick={handleResetSimulations}
                className="px-4 py-2 bg-[#ffe4e6] hover:bg-rose-200 text-[#881337] border-2 border-black rounded-xl text-xs font-black transition active:translate-x-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_0px_#000]"
              >
                Reset All Active Simulations
              </button>
            </div>

            <div className="bg-[#f8f9fa] p-4 rounded-xl border-2 border-black text-xs font-mono space-y-2 text-black shadow-[2px_2px_0px_0px_#000]">
              <p><span className="text-zinc-500 font-bold">Active Wells:</span> {simStatus?.activeWells?.length || 0}</p>
              <p><span className="text-zinc-500 font-bold">Default Well:</span> OIL-SYN-020</p>
              <p><span className="text-zinc-500 font-bold">Telemetry Interval:</span> 1000ms</p>
              <p><span className="text-zinc-500 font-bold">Zero Autonomous Rig Control:</span> <span className="text-[#064e3b] font-black bg-[#d1fae5] px-2 py-0.5 rounded-full border border-black">STRICTLY ENFORCED</span></p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: AI & MODELS */}
      {activeSection === 'MODELS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] space-y-3">
            <h3 className="text-sm font-black text-black">Precedent Engine Configuration</h3>
            <p className="text-xs text-zinc-600 font-sans">Multi-factor geological and operational distance scoring.</p>
            <div className="text-xs font-mono space-y-2.5 text-black bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 font-bold">Spatial Proximity Weight:</span>
                <span className="text-[#1e3a8a] font-black bg-[#dbeafe] px-2 py-0.5 rounded-full border border-black">0.25</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 font-bold">Formation Stratigraphy Weight:</span>
                <span className="text-[#78350f] font-black bg-[#fef3c7] px-2 py-0.5 rounded-full border border-black">0.30</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 font-bold">Depth Correlation Weight:</span>
                <span className="text-[#1e3a8a] font-black bg-[#dbeafe] px-2 py-0.5 rounded-full border border-black">0.25</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 font-bold">Telemetry Signature Weight:</span>
                <span className="text-[#064e3b] font-black bg-[#d1fae5] px-2 py-0.5 rounded-full border border-black">0.20</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] space-y-3">
            <h3 className="text-sm font-black text-black">Grounded RAG LLM Provider</h3>
            <p className="text-xs text-zinc-600 font-sans">Zero-hallucination domain synthesizer configuration.</p>
            <div className="text-xs font-mono space-y-2.5 text-black bg-[#f8f9fa] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 font-bold">Provider:</span>
                <span className="text-[#78350f] font-black bg-[#fef3c7] px-2 py-0.5 rounded-full border border-black">Local Grounded Deterministic</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 font-bold">Model:</span>
                <span className="text-black font-black">nwis-grounded-synthesizer-v1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 font-bold">Embedding Model:</span>
                <span className="text-black font-black">local-semantic-hashing-v1 (64-dim)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 font-bold">Strict Grounding Mandate:</span>
                <span className="text-[#064e3b] font-black bg-[#d1fae5] px-2 py-0.5 rounded-full border border-black">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

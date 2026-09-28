'use client';

import React, { useState } from 'react';
import { api, setAuthToken } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('engineer@nwis.oil.in');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      setAuthToken(res.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Senior Drilling Engineer', email: 'engineer@nwis.oil.in', desc: 'Can create wells, events, and review technical dossiers' },
    { role: 'System Administrator', email: 'admin@nwis.oil.in', desc: 'Full administrative access and user management' },
    { role: 'Chief Geologist', email: 'geologist@nwis.oil.in', desc: 'Geological formation correlation & lithology management' },
    { role: 'Asset Operations Manager', email: 'manager@nwis.oil.in', desc: 'Executive dashboard, audit review & operational KPIs' },
    { role: 'Data Platform Engineer', email: 'data@nwis.oil.in', desc: 'Dataset ingestion, pipeline execution & quality reports' },
    { role: 'Operations Viewer', email: 'viewer@nwis.oil.in', desc: 'Read-only access to maps and drilling records' },
  ];

  const selectDemoAccount = (accEmail: string) => {
    setEmail(accEmail);
    setPassword('password123');
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 font-black text-2xl text-white shadow-xl shadow-emerald-950 mb-3">
          OIL
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          NWIS Authentication & Role Access
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Nearby Wells Intelligence System &bull; Stage 01 Prototype Access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Login Form */}
        <div className="md:col-span-6 bg-petro-900 border border-petro-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-petro-950 border border-petro-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-petro-950 border border-petro-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-md shadow-emerald-950 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to NWIS'}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center mt-4">
            Default password for all seeded prototype accounts is <code className="text-emerald-400 font-mono">password123</code>
          </p>
        </div>

        {/* Quick Demo Role Picker */}
        <div className="md:col-span-6 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick-Select Seeded Demo Personas
          </h2>

          <div className="space-y-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => selectDemoAccount(acc.email)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  email === acc.email
                    ? 'bg-emerald-950/40 border-emerald-600 shadow-md'
                    : 'bg-petro-900/60 border-petro-800 hover:bg-petro-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{acc.role}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-medium">Select</span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">{acc.email}</div>
                <div className="text-[11px] text-slate-400 mt-1">{acc.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

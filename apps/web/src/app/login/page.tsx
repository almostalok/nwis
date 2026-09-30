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
    { role: 'Senior Drilling Engineer', email: 'engineer@nwis.oil.in', desc: 'Can create wells, events, and review technical dossiers', tag: 'ENGINEERING', tagBg: 'bg-[#d1fae5]', tagText: 'text-[#064e3b]' },
    { role: 'System Administrator', email: 'admin@nwis.oil.in', desc: 'Full administrative access and user management', tag: 'SECURITY', tagBg: 'bg-[#ffe4e6]', tagText: 'text-[#881337]' },
    { role: 'Chief Geologist', email: 'geologist@nwis.oil.in', desc: 'Geological formation correlation & lithology management', tag: 'GEOLOGY', tagBg: 'bg-[#fef3c7]', tagText: 'text-[#78350f]' },
    { role: 'Asset Operations Manager', email: 'manager@nwis.oil.in', desc: 'Executive dashboard, audit review & operational KPIs', tag: 'OPERATIONS', tagBg: 'bg-[#dbeafe]', tagText: 'text-[#1e3a8a]' },
    { role: 'Data Platform Engineer', email: 'data@nwis.oil.in', desc: 'Dataset ingestion, pipeline execution & quality reports', tag: 'DATA', tagBg: 'bg-[#ede9fe]', tagText: 'text-[#5b21b6]' },
    { role: 'Operations Viewer', email: 'viewer@nwis.oil.in', desc: 'Read-only access to maps and drilling records', tag: 'VIEWER', tagBg: 'bg-[#f8f9fa]', tagText: 'text-black' },
  ];

  const selectDemoAccount = (accEmail: string) => {
    setEmail(accEmail);
    setPassword('password123');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 font-sans">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#fef08a] font-black text-2xl text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] mb-3">
          OIL
        </div>
        <h1 className="text-2xl font-black tracking-tight text-black">
          NWIS Authentication &amp; Role Access
        </h1>
        <p className="text-xs text-zinc-600 mt-1 font-semibold">
          Nearby Wells Intelligence System &bull; Enterprise Rig Access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Login Form */}
        <div className="md:col-span-6 bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-black">Sign In</h2>
            <span className="text-xs font-mono font-bold text-black bg-[#f8f9fa] px-2.5 py-0.5 rounded-full border border-black">v2.4 LTS</span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#ffe4e6] border-2 border-black text-[#881337] text-xs rounded-xl font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase font-mono text-zinc-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase font-mono text-zinc-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#f8f9fa] border-2 border-black rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-zinc-800 text-white font-black py-3 rounded-xl text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to NWIS →'}
            </button>
          </form>

          <p className="text-xs text-zinc-600 text-center mt-5 font-semibold">
            Default password for all prototype accounts is <code className="text-black bg-[#fef08a] px-2 py-0.5 rounded border border-black font-mono font-black">password123</code>
          </p>
        </div>

        {/* Quick Demo Role Picker */}
        <div className="md:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider font-mono text-zinc-700">
              Quick-Select Demo Personas
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">Click to fill</span>
          </div>

          <div className="space-y-3">
            {demoAccounts.map((acc) => {
              const isSelected = email === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => selectDemoAccount(acc.email)}
                  className={`w-full text-left p-4 rounded-xl border-2 border-black transition-all text-xs shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                    isSelected
                      ? 'bg-[#dbeafe] text-[#1e3a8a] ring-2 ring-blue-500 font-bold'
                      : 'bg-white hover:bg-[#f8f9fa] text-black'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-black text-sm">{acc.role}</span>
                    <span
                      className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-black ${acc.tagBg} ${acc.tagText}`}
                    >
                      {acc.tag}
                    </span>
                  </div>
                  <div className="font-mono text-zinc-600 text-xs mt-1 font-bold">{acc.email}</div>
                  <div className="text-zinc-600 text-xs mt-1 leading-snug font-medium">{acc.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

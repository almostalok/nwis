'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import { api, setAuthToken } from '../lib/api';

export function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    api.auth
      .me()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, [pathname]);

  const handleQuickLogin = async (email: string) => {
    try {
      const res = await api.auth.login({ email, password: 'password123' });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      window.location.reload();
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/wells', label: 'Wells & Spatial' },
    { href: '/events', label: 'Precedent Events' },
    { href: '/data', label: 'Data Platform' },
  ];

  return (
    <header className="bg-petro-950 border-b border-petro-800 sticky top-0 z-50">
      {/* Synthetic Dataset Warning Banner */}
      <div className="bg-amber-950/80 border-b border-amber-800/60 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="font-semibold tracking-wide uppercase">
            OIL-Compatible Synthetic Development Mode:
          </span>
          <span className="text-amber-300/90">
            Fictional synthetic dataset (NWIS-DEMO-FIELD) designed for Oil India Limited (OIL).
          </span>
        </div>
        <span className="font-mono text-[11px] text-amber-400/80">Stage 01: Foundation Platform</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <a href="/dashboard" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-emerald-950">
                OIL
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block leading-none">
                  NWIS
                </span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                  Nearby Wells Intelligence
                </span>
              </div>
            </a>

            <nav className="hidden md:flex space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-petro-800 text-emerald-400 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-petro-900'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* User & Role Controls */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-white">{currentUser.name}</div>
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                    {currentUser.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 text-xs rounded bg-petro-800 hover:bg-petro-700 text-slate-300 border border-petro-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 hidden lg:inline">Quick Demo Role:</span>
                <button
                  onClick={() => handleQuickLogin('engineer@nwis.oil.in')}
                  className="px-2.5 py-1 text-xs rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium shadow-sm transition-colors"
                >
                  Drilling Engr
                </button>
                <a
                  href="/login"
                  className="px-3 py-1 text-xs rounded bg-petro-800 hover:bg-petro-700 text-slate-200 border border-petro-700 transition-colors"
                >
                  All Roles
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

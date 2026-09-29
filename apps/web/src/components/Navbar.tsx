'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api, setAuthToken } from '../lib/api';
import { GlobalSearchModal } from './GlobalSearchModal';

export function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState<'UP' | 'DEGRADED' | 'CHECKING'>('CHECKING');
  const [activeSimCount, setActiveSimCount] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    api.auth
      .me()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));

    // Health check polling
    const checkHealth = () => {
      api.health
        .check()
        .then((res: any) => {
          setSystemHealth(res.status === 'HEALTHY' ? 'UP' : 'DEGRADED');
        })
        .catch(() => setSystemHealth('DEGRADED'));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
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

  const navSections = [
    {
      title: 'Real-Time Command',
      links: [
        { href: '/dashboard', label: 'Command Center' },
        { href: '/alerts', label: 'Live Alerts' },
        { href: '/simulation', label: 'Rig Simulator' },
        { href: '/demo', label: 'SIH Pitch Demo', highlight: true },
      ],
    },
    {
      title: 'Precedents & Subsurface',
      links: [
        { href: '/wells', label: 'Wells Explorer' },
        { href: '/compare', label: 'Well Compare' },
        { href: '/search', label: 'Semantic Search' },
        { href: '/events', label: 'Events Catalog' },
        { href: '/documents', label: 'Documents' },
      ],
    },
    {
      title: 'Governance & Systems',
      links: [
        { href: '/reports', label: 'Reports' },
        { href: '/data-quality', label: 'Data Quality' },
        { href: '/models', label: 'Model Registry' },
        { href: '/integrations', label: 'eRTMAC Specs' },
        { href: '/about', label: 'Architecture' },
      ],
    },
  ];

  return (
    <>
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        {/* Synthetic Demonstration Mode & Safety Warning Banner */}
        <div className="bg-amber-950/80 border-b border-amber-800/60 px-4 py-1 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold tracking-wide uppercase text-[11px] bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/50">
              SYNTHETIC DEMONSTRATION DATA
            </span>
            <span className="text-amber-200/90 text-xs hidden sm:inline">
              Fictional Assam-Arakan basin field (NWIS-DEMO-FIELD). OIL / eRTMAC Integration Ready.
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-amber-300/80 font-mono hidden md:inline">
              DECISION-SUPPORT ADVISORY ONLY &bull; ZERO AUTONOMOUS RIG ACTUATION
            </span>
            <span className="font-mono text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Stage 04: Production Integrated
            </span>
          </div>
        </div>

        {/* Primary Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left Brand Identity */}
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="flex items-center space-x-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-base shadow-sm group-hover:bg-emerald-500 transition-colors">
                  OIL
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base font-bold tracking-tight text-white leading-none">
                      NWIS
                    </span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      v1.0
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold block leading-none mt-0.5">
                    Nearby Wells Intelligence
                  </span>
                </div>
              </a>

              {/* System Health Status Indicator */}
              <div className="hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    systemHealth === 'UP'
                      ? 'bg-emerald-400 animate-pulse'
                      : systemHealth === 'CHECKING'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                ></span>
                <span className="text-slate-400">System:</span>
                <span
                  className={`font-semibold ${
                    systemHealth === 'UP' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {systemHealth === 'UP' ? 'ONLINE' : 'DEGRADED'}
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-400">eRTMAC:</span>
                <span className="text-blue-400 font-semibold">READY</span>
              </div>
            </div>

            {/* Center Quick Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1">
              {[
                { href: '/dashboard', label: 'Command' },
                { href: '/alerts', label: 'Alerts' },
                { href: '/simulation', label: 'Simulator' },
                { href: '/demo', label: '1-Click Pitch', highlight: true },
                { href: '/wells', label: 'Wells' },
                { href: '/compare', label: 'Compare' },
                { href: '/search', label: 'Search' },
                { href: '/documents', label: 'Documents' },
                { href: '/reports', label: 'Reports' },
                { href: '/data-quality', label: 'Quality' },
                { href: '/models', label: 'Models' },
              ].map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/dashboard' && pathname?.startsWith(link.href));
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      link.highlight
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-sm hover:from-emerald-500 hover:to-teal-500'
                        : isActive
                        ? 'bg-slate-800 text-emerald-400 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            {/* Right Tools: Global Search + User Profile */}
            <div className="flex items-center space-x-2.5">
              {/* Quick Search Shortcut Trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center space-x-2 px-2.5 py-1 text-xs rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
                title="Search wells, events, documents (Ctrl+K)"
              >
                <svg
                  className="w-3.5 h-3.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="hidden sm:inline text-slate-400">Search</span>
                <kbd className="hidden sm:inline text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                  ⌘K
                </kbd>
              </button>

              {/* User Persona / Quick Demo Role */}
              {currentUser ? (
                <div className="flex items-center space-x-2.5">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-white">{currentUser.name}</div>
                    <div className="text-[10px] font-mono text-emerald-400 font-medium uppercase">
                      {currentUser.role}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-2.5 py-1 text-xs rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleQuickLogin('engineer@nwis.oil.in')}
                    className="px-2.5 py-1 text-xs rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold shadow-sm transition-colors"
                    title="Sign in as Lead Drilling Engineer"
                  >
                    Drilling Engr
                  </button>
                  <a
                    href="/login"
                    className="px-2 py-1 text-xs rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                  >
                    Roles
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Subnavigation Bar for Mobile / Tablet */}
          <div className="flex xl:hidden overflow-x-auto space-x-1 py-1.5 border-t border-slate-900 text-xs scrollbar-none">
            {[
              { href: '/dashboard', label: 'Command' },
              { href: '/alerts', label: 'Alerts' },
              { href: '/simulation', label: 'Simulator' },
              { href: '/demo', label: 'Pitch Demo', highlight: true },
              { href: '/wells', label: 'Wells' },
              { href: '/compare', label: 'Compare' },
              { href: '/search', label: 'Search' },
              { href: '/documents', label: 'Documents' },
              { href: '/reports', label: 'Reports' },
              { href: '/data-quality', label: 'Quality' },
              { href: '/models', label: 'Models' },
              { href: '/integrations', label: 'eRTMAC' },
              { href: '/about', label: 'Architecture' },
            ].map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/dashboard' && pathname?.startsWith(link.href));
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                    link.highlight
                      ? 'bg-emerald-600 text-white font-semibold'
                      : isActive
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

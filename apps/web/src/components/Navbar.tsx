'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { api, setAuthToken } from '../lib/api';
import { GlobalSearchModal } from './GlobalSearchModal';
import { useToast } from './Toast';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const pathname = usePathname();
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState<'UP' | 'DEGRADED' | 'CHECKING'>('CHECKING');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOperationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      toast.success(`Signed in as ${res.user.name} (${res.user.role})`);
      window.location.reload();
    } catch (err: any) {
      toast.error(`Login failed: ${err.message}`);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const primaryNavItems = [
    { href: '/dashboard', label: 'Command Center' },
    { href: '/wells', label: 'Wells' },
    { href: '/intelligence', label: 'Intelligence' },
    { href: '/alerts', label: 'Alerts' },
    { href: '/documents', label: 'Documents' },
    { href: '/reports', label: 'Reports' },
  ];

  const operationsItems = [
    { href: '/operations/simulation', alias: '/simulation', label: 'Simulation', desc: 'Realtime scenario testing & playback' },
    { href: '/operations/data-quality', alias: '/data-quality', label: 'Data Quality', desc: 'ISO 19157-1 sensor validation' },
    { href: '/operations/models', alias: '/models', label: 'Models', desc: 'ML & Bayesian algorithm registry' },
    { href: '/operations/integrations', alias: '/integrations', label: 'Integrations', desc: 'WITSML, eRTMAC & ETP connections' },
    { href: '/operations/system-health', label: 'System Health', desc: 'Services, SSE, worker & Redis telemetry' },
    { href: '/operations/admin', alias: '/admin', label: 'Admin', desc: 'Role-based access & system settings' },
  ];

  const isOperationsActive = operationsItems.some(
    (item) =>
      pathname?.startsWith(item.href) ||
      (item.alias && pathname?.startsWith(item.alias))
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b-2 border-black shadow-[0_3px_0px_0px_#000000]">
        {/* Top Safety & Positioning Message */}
        <div className="bg-[#fef3c7] border-b-2 border-black px-4 py-1.5 text-xs text-black font-mono flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-black animate-pulse" />
            <span className="font-extrabold tracking-wider uppercase text-[10px] bg-[#fbbf24] text-black px-2 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_0px_#000]">
              SYNTHETIC DEMO DATA
            </span>
            <span className="text-zinc-800 hidden md:inline text-[11px] font-medium">
              Assam-Arakan Basin &bull; Oil India Limited
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-zinc-700 hidden sm:inline font-sans">
              Decision-Support Advisory Only &bull; Zero Autonomous Rig Control
            </span>
            <span className="text-[#064e3b] font-bold bg-[#d1fae5] px-2.5 py-0.5 rounded-full border border-black shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1.5 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              TARGET: OIL-SYN-020
            </span>
          </div>
        </div>

        {/* Primary Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Brand */}
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-2.5 group">
                <div className="px-2.5 py-1 bg-black text-white font-mono font-black text-xs tracking-wider rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0px_0px_#000000] transition-all">
                  OIL
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base font-black tracking-tight text-black leading-none">
                      NWIS
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-[#f4f4f6] text-black rounded-md border border-black">
                      v1.4
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600 block leading-none mt-1 font-semibold">
                    Drilling Intelligence Command Center
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Primary Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center bg-[#f4f4f6] p-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000] space-x-1">
              {primaryNavItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/' || pathname === '/dashboard'
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                      isActive
                        ? 'bg-black text-white border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]'
                        : 'text-zinc-800 hover:text-black hover:bg-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Secondary "Operations" Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="btn-operations-menu"
                  onClick={() => setOperationsOpen(!operationsOpen)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
                    isOperationsActive
                      ? 'bg-blue-600 text-white border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]'
                      : 'text-zinc-800 hover:text-black hover:bg-white'
                  }`}
                  aria-expanded={operationsOpen}
                >
                  <span>Operations</span>
                  <span className="text-[10px]">&darr;</span>
                </button>

                {operationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] rounded-2xl p-2 z-50 animate-in fade-in duration-100">
                    <div className="px-3 py-1.5 text-[10px] font-black text-zinc-500 uppercase tracking-wider border-b-2 border-black mb-1 font-mono">
                      Platform Operations
                    </div>
                    {operationsItems.map((sub) => {
                      const isSubActive =
                        pathname?.startsWith(sub.href) ||
                        (sub.alias && pathname?.startsWith(sub.alias));

                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setOperationsOpen(false)}
                          className={`block px-3 py-2 rounded-xl text-xs transition-all ${
                            isSubActive
                              ? 'bg-black text-white font-bold'
                              : 'text-black hover:bg-[#f4f4f6] font-semibold'
                          }`}
                        >
                          <div className="font-bold">{sub.label}</div>
                          <div className={`text-[11px] font-normal leading-snug mt-0.5 ${isSubActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
                            {sub.desc}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* Right: Search + Login/User + Theme Toggle + Mobile Menu Toggle */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />

              <button
                id="btn-global-search"
                onClick={() => setSearchOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-white text-black font-bold rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                title="Search wells, events, documents (Ctrl+K)"
              >
                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline font-bold">Search</span>
                <kbd className="hidden sm:inline text-[10px] bg-[#f4f4f6] px-1.5 py-0.5 rounded text-black border border-black font-mono font-bold">
                  ⌘K
                </kbd>
              </button>

              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-black">{currentUser.name}</div>
                    <div className="text-[10px] text-blue-700 font-mono font-bold tracking-tight">
                      {currentUser.role}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs font-bold bg-white text-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleQuickLogin('engineer@nwis.oil.in')}
                  className="px-3.5 py-1.5 text-xs font-bold bg-black text-white rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Demo Login
                </button>
              )}

              {/* Mobile Hamburger Button */}
              <button
                id="btn-mobile-nav"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 bg-white text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000000]"
                aria-label="Toggle Mobile Navigation"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Drawer Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t-2 border-black space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {primaryNavItems.map((item) => {
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/' || pathname === '/dashboard'
                      : pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border-2 border-black ${
                        isActive
                          ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                          : 'bg-white text-black hover:bg-[#f4f4f6]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-zinc-200">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase px-1 block mb-1">
                  Operations & Settings
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {operationsItems.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 bg-[#f4f4f6] text-black border border-black rounded-lg text-xs font-semibold"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase px-1">
                  Theme Appearance
                </span>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

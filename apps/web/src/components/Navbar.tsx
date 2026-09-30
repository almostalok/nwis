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
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        {/* Top Safety & Status Utility Strip */}
        <div className="h-7 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-[10px]">
              DEMO DATASET
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="hidden sm:inline text-zinc-600 dark:text-zinc-400">
              Assam-Arakan Basin &bull; Oil India Limited
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-zinc-500 hidden md:inline">
              Advisory Support &bull; Zero Autonomous Rig Control
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              TARGET: OIL-SYN-020
            </div>
          </div>
        </div>

        {/* Primary Navbar Bar */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Brand / Title */}
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-2.5 group">
                <div className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-xs tracking-wider rounded transition-transform group-hover:scale-105">
                  OIL
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    NWIS
                  </span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded border border-zinc-200 dark:border-zinc-700">
                    v1.4
                  </span>
                  <span className="hidden lg:inline text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                    Command Center
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Primary Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1">
              {primaryNavItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/' || pathname === '/dashboard'
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900'
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
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                    isOperationsActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                  aria-expanded={operationsOpen}
                >
                  <span>Operations</span>
                  <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {operationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-lg p-1.5 z-50 animate-in fade-in duration-100">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                      Platform Modules
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
                          className={`block px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                            isSubActive
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                          }`}
                        >
                          <div className="font-medium">{sub.label}</div>
                          <div className="text-[11px] text-zinc-500 leading-snug">
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
                className="flex items-center space-x-2 h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-xs"
                title="Search wells, events, documents (Ctrl+K)"
              >
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline font-normal">Search</span>
                <kbd className="hidden sm:inline text-[10px] bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-200 dark:border-zinc-700 font-mono font-medium">
                  ⌘K
                </kbd>
              </button>

              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{currentUser.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {currentUser.role}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="h-8 px-2.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleQuickLogin('engineer@nwis.oil.in')}
                  className="h-8 px-3 text-xs font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Demo Login
                </button>
              )}

              {/* Mobile Hamburger Button */}
              <button
                id="btn-mobile-nav"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-md"
                aria-label="Toggle Mobile Navigation"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Drawer Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
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
                      className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase px-1 block mb-1">
                  Operations & Settings
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {operationsItems.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 rounded"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
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

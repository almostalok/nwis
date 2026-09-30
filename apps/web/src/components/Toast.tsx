'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = { id, message, type, title };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const success = useCallback((msg: string, title?: string) => showToast(msg, 'success', title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast(msg, 'error', title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast(msg, 'warning', title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast(msg, 'info', title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-3"
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          const tag = isError ? 'ERROR' : isSuccess ? 'SUCCESS' : isWarning ? 'WARN' : 'INFO';
          const badgeClass = isError
            ? 'tech-badge-rose'
            : isSuccess
            ? 'tech-badge-emerald'
            : isWarning
            ? 'tech-badge-amber'
            : 'tech-badge-blue';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start space-x-3 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 font-sans"
              role="alert"
            >
              <span className={`tech-badge text-[9px] uppercase font-mono shrink-0 ${badgeClass}`}>
                {tag}
              </span>
              <div className="flex-1 text-xs">
                {toast.title && (
                  <p className="font-semibold text-xs mb-0.5 text-zinc-900 dark:text-zinc-100">
                    {toast.title}
                  </p>
                )}
                <p className="leading-relaxed text-zinc-600 dark:text-zinc-400 text-xs">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs ml-1 shrink-0 transition-colors"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

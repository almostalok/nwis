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
        className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2.5 max-w-md w-full pointer-events-none px-3"
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          const tag = isError ? 'ERROR' : isSuccess ? 'SUCCESS' : isWarning ? 'WARNING' : 'INFO';
          const tagBg = isError
            ? 'bg-[#fee2e2] text-[#991b1b] border-2 border-black'
            : isSuccess
            ? 'bg-[#d1fae5] text-[#065f46] border-2 border-black'
            : isWarning
            ? 'bg-[#fef3c7] text-[#92400e] border-2 border-black'
            : 'bg-[#dbeafe] text-[#1e3a8a] border-2 border-black';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start space-x-3.5 p-4 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000000] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 font-sans"
              role="alert"
            >
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold shrink-0 tracking-wider rounded-full shadow-[1px_1px_0px_0px_#000] ${tagBg}`}
              >
                {tag}
              </span>
              <div className="flex-1 text-xs">
                {toast.title && (
                  <p className="font-extrabold text-xs mb-0.5 text-black">
                    {toast.title}
                  </p>
                )}
                <p className="leading-relaxed whitespace-pre-wrap text-xs text-zinc-800 font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="w-6 h-6 rounded-full bg-white border-2 border-black shadow-[1px_1px_0px_0px_#000] hover:bg-zinc-100 flex items-center justify-center text-black font-bold text-xs ml-1 shrink-0 focus:outline-none transition-colors"
              >
                ✕
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

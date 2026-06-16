"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { theme } = useTheme();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast(msg, "success"), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, "error"), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, "warning"), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, "info"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-[380px] pointer-events-none px-4 sm:px-0">
        {/* Style injection for animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes toastSlideIn {
            from {
              transform: translateX(120%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-toast-slide-in {
            animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}} />
        
        {toasts.map((toast) => {
          let styles = "";
          let icon = null;

          if (theme === "light") {
            switch (toast.type) {
              case "success":
                styles = "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100/50";
                icon = (
                  <svg className="w-5 h-5 mr-3 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
                break;
              case "error":
                styles = "bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100/50";
                icon = (
                  <svg className="w-5 h-5 mr-3 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
                break;
              case "warning":
                styles = "bg-amber-50 border-amber-200 text-amber-800 shadow-amber-100/50";
                icon = (
                  <svg className="w-5 h-5 mr-3 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                );
                break;
              case "info":
                styles = "bg-sky-50 border-sky-200 text-sky-800 shadow-sky-100/50";
                icon = (
                  <svg className="w-5 h-5 mr-3 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
                break;
            }
          } else {
            // Dark Mode
            switch (toast.type) {
              case "success":
                styles = "bg-emerald-950/80 border-emerald-500/30 text-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.15)]";
                icon = (
                  <svg className="w-5 h-5 mr-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
                break;
              case "error":
                styles = "bg-rose-950/80 border-rose-500/30 text-rose-300 shadow-[0_4px_20px_rgba(244,63,94,0.15)]";
                icon = (
                  <svg className="w-5 h-5 mr-3 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
                break;
              case "warning":
                styles = "bg-amber-950/80 border-amber-500/30 text-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.15)]";
                icon = (
                  <svg className="w-5 h-5 mr-3 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                );
                break;
              case "info":
                styles = "bg-cyan-950/80 border-cyan-500/30 text-cyan-300 shadow-[0_4px_20px_rgba(6,182,212,0.15)]";
                icon = (
                  <svg className="w-5 h-5 mr-3 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
                break;
            }
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto transition-all duration-300 animate-toast-slide-in ${styles}`}
            >
              <div className="flex items-center font-medium text-sm leading-relaxed">
                {icon}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-current opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 transition-all p-0.5 rounded-full shrink-0 cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

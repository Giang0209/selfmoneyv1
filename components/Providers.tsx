"use client";

import React from "react";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ToastProvider } from "@/components/Toast";
import { PrivacyProvider } from "@/lib/PrivacyContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PrivacyProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </PrivacyProvider>
    </ThemeProvider>
  );
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type PrivacyContextType = {
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
  togglePrivacy: () => void;
  formatAmount: (amount: number | string, showCurrencySymbol?: boolean) => string;
};

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivate, setIsPrivateState] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const savedPrivacy = localStorage.getItem("privacy_mode");
    if (savedPrivacy) {
      setIsPrivateState(savedPrivacy === "true");
    }
    setMounted(true);
  }, []);

  const setIsPrivate = (val: boolean) => {
    setIsPrivateState(val);
    localStorage.setItem("privacy_mode", String(val));
  };

  const togglePrivacy = () => {
    setIsPrivate(!isPrivate);
  };

  const formatAmount = (amount: number | string, showCurrencySymbol = true) => {
    // Nếu chưa mounted trên client, trả về trống hoặc placeholder để khớp SSR
    if (!mounted) {
      return showCurrencySymbol ? "0 đ" : "0";
    }
    
    if (isPrivate) {
      return showCurrencySymbol ? "•••• đ" : "••••";
    }
    
    const num = Math.round(Number(amount));
    if (isNaN(num)) return amount.toString();
    
    const formatted = num.toLocaleString("vi-VN");
    return showCurrencySymbol ? `${formatted} đ` : formatted;
  };

  return (
    <PrivacyContext.Provider value={{ isPrivate, setIsPrivate, togglePrivacy, formatAmount }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error("usePrivacy must be used within a PrivacyProvider");
  }
  return context;
}

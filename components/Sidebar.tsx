"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore, useEffect } from "react";
import { SidebarStore } from "./SidebarStore";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const isCollapsed = useSyncExternalStore(
    SidebarStore.subscribe,
    SidebarStore.getSnapshot,
    SidebarStore.getSnapshot
  );

  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [isCollapsed]);

  const menu = [
    { href: "/dashboard", label: "Tổng quan" },
    { href: "/transactions", label: "Giao dịch" },
    { href: "/wallets", label: "Tài khoản" },
    { href: "/budgets", label: "Ngân sách" },
    { href: "/saving-goals", label: "Mục tiêu tiết kiệm" },
    { href: "/categories", label: "Danh mục" },
    { href: "/analytics", label: "Phân tích tài chính" },
    { href: "/profile", label: "Hồ sơ cá nhân" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/");
  };

  const getIconInfo = (href: string) => {
    switch (href) {
      case "/dashboard":
        return { color: "text-purple-300", glow: "drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]" };
      case "/transactions":
        return { color: "text-blue-300", glow: "drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]" };
      case "/wallets":
        return { color: "text-cyan-300", glow: "drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" };
      case "/budgets":
        return { color: "text-emerald-300", glow: "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" };
      case "/saving-goals":
        return { color: "text-violet-300", glow: "drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" };
      case "/categories":
        return { color: "text-orange-300", glow: "drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" };
      case "/analytics":
        return { color: "text-pink-300", glow: "drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]" };
      case "/profile":
        return { color: "text-indigo-300", glow: "drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]" };
      default:
        return { color: "text-slate-400", glow: "" };
    }
  };

  const getIcon = (href: string, isActive: boolean) => {
    const info = getIconInfo(href);
    const strokeColor = "currentColor";
    const iconClasses = `w-5 h-5 transition-all duration-300 group-hover:scale-110 ${isActive ? `${info.color} ${info.glow} opacity-100` : `${info.color} opacity-60 group-hover:opacity-100 group-hover:${info.glow}`}`;
    switch (href) {
      case "/dashboard":
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case "/transactions":
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case "/wallets":
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "/budgets":
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "/saving-goals":
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "/categories":
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "/analytics":
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case "/profile":
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside className={`fixed left-0 top-0 h-full border-r border-card-border bg-sidebar-bg backdrop-blur-3xl flex flex-col py-8 z-50 shadow-[10px_0_30px_rgba(0,0,0,0.3)] transition-all duration-300 ${isCollapsed ? "w-[5.5rem]" : "w-64"}`}>
      {/* Logo */}
      <div
        onClick={() => { SidebarStore.toggle(); router.push("/dashboard"); }}
        className={`px-7 mb-10 flex items-center gap-3 group/logo cursor-pointer block ${isCollapsed ? "justify-center px-0" : ""}`}
      >
        <div className="relative">
          {/* Glowing Accent behind logo icon */}
          <div className="absolute inset-0 bg-cyan-400 blur-md opacity-30 group-hover/logo:opacity-50 group-hover/logo:blur-lg animate-pulse transition-all duration-300" />
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(34,211,238,0.5)] italic text-lg select-none group-hover/logo:scale-105 transition-transform duration-300">
            S
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}>
          <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-cyan-200 to-white bg-clip-text text-transparent italic tracking-wide whitespace-nowrap">
            Self Money
          </h1>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 group-hover/logo:text-cyan-400/80 transition-colors whitespace-nowrap">
            PHÂN TÍCH TÀI CHÍNH
          </p>
        </div>
      </div>

      {/* Menu Links */}
      <nav className={`flex-1 space-y-1.5 text-sm font-medium ${isCollapsed ? "px-2" : "px-4"}`}>
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`group relative flex items-center cursor-pointer ${isCollapsed ? "justify-center py-3 rounded-2xl" : "gap-3.5 py-3 px-4 rounded-2xl"} transition-all duration-300 ${isActive
                ? "text-cyan-400 bg-gradient-to-r from-cyan-500/12 to-cyan-500/3 border border-cyan-500/20 shadow-[0_4px_20px_rgba(6,182,212,0.06)]"
                : "text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-200 hover:bg-card-bg/60 hover:border-card-border/80 border border-transparent"
                }`}
            >
              {/* Glowing Active Border Line Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
              )}

              {/* Icon Wrapper */}
              <div className="flex-shrink-0 relative z-10">{getIcon(item.href, isActive)}</div>

              <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                <span className="tracking-wide text-[13px] whitespace-nowrap block ml-3.5">{item.label}</span>
              </div>

              {/* Tooltip on collapse */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none">
                  {item.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Footer Section */}
      <div className={`pt-6 border-t border-card-border ${isCollapsed ? "px-2" : "px-4"}`}>
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full group flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-4"} py-3 rounded-2xl text-rose-400/90 text-sm font-semibold hover:text-white hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.08)] transition-all duration-200 relative`}
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "" : "group-hover:translate-x-0.5"} text-rose-400/80 group-hover:text-rose-400 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
          </svg>
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <span className="whitespace-nowrap ml-3 block">Đăng xuất</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "wallets" | "transactions">("dashboard");

  // Đảm bảo Landing Page luôn ở giao diện Tối (Dark Mode)
  useEffect(() => {
    // Ép giao diện tối trên Landing Page ngay lập tức
    document.body.classList.remove("light");

    // Sử dụng MutationObserver để chặn bất kỳ hành động nào cố gắng thêm class "light" vào body khi ở Landing Page
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains("light")) {
        document.body.classList.remove("light");
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });

    // Check token để hiển thị nút thích hợp
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }

    return () => {
      observer.disconnect();
      // Khôi phục lại giao diện sáng nếu người dùng đã cài đặt trước đó khi họ rời Landing Page
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light") {
        document.body.classList.add("light");
      }
    };
  }, []);

  // ----------------------------------------------------
  // DỮ LIỆU GIẢ LẬP (MOCK DATA) CHO BẢN DEMO TƯƠNG TÁC
  // ----------------------------------------------------
  const mockDashboard = {
    income: 45200000,
    expense: 18750000,
    balance: 26450000,
    categories: [
      { name: "💼 Lương tháng", amount: 45200000, percent: 100, color: "#10b981", type: "income" },
      { name: "🏠 Nhà cửa", amount: 6500000, percent: 55, color: "#f43f5e", type: "expense" },
      { name: "🍜 Ăn uống", amount: 3450000, percent: 35, color: "#fb923c", type: "expense" },
      { name: "☕ Cà phê", amount: 850000, percent: 10, color: "#a855f7", type: "expense" },
    ],
    chartData: [
      { label: "Tháng 1", inc: 40, exp: 20 },
      { label: "Tháng 2", inc: 65, exp: 35 },
      { label: "Tháng 3", inc: 55, exp: 40 },
      { label: "Tháng 4", inc: 75, exp: 30 },
      { label: "Tháng 5", inc: 90, exp: 45 },
      { label: "Tháng 6", inc: 98, exp: 50 },
    ]
  };

  const mockWallets = [
    { id: 1, name: "Tiền Mặt", type: "Tiền mặt", balance: 5400000, icon: "💵", color: "#eab308", created: "16/06/2026" },
    { id: 2, name: "Vietcombank", type: "Ngân hàng", balance: 18250000, icon: "💳", color: "#3b82f6", created: "15/06/2026" },
    { id: 3, name: "Tiết Kiệm Kì Hạn", type: "Sổ tích lũy", balance: 22800000, icon: "🐷", color: "#ec4899", created: "10/06/2026" },
    { id: 4, name: "Ví MoMo", type: "Ví điện tử", balance: 3500000, icon: "🌟", color: "#a855f7", created: "08/06/2026" },
  ];

  const mockTransactions = [
    { id: 1, cat: "🍜 Ăn uống", note: "Bữa trưa văn phòng", amount: 65000, isInc: false, wallet: "Tiền Mặt", icon: "🍜", color: "#fb923c", date: "16/06/2026" },
    { id: 2, cat: "💼 Lương tháng", note: "Công ty chuyển khoản", amount: 25000000, isInc: true, wallet: "Vietcombank", icon: "💼", color: "#10b981", date: "15/06/2026" },
    { id: 3, cat: "☕ Cà phê", note: "Gặp gỡ đối tác", amount: 120000, isInc: false, wallet: "Tiền Mặt", icon: "☕", color: "#a855f7", date: "15/06/2026" },
    { id: 4, cat: "🏠 Thuê nhà", note: "Thanh toán tiền nhà tháng 6", amount: 6500000, isInc: false, wallet: "Vietcombank", icon: "🏠", color: "#f43f5e", date: "10/06/2026" },
    { id: 5, cat: "🍿 Giải trí", note: "Đăng ký Netflix Family", amount: 260000, isInc: false, wallet: "Ví MoMo", icon: "🍿", color: "#ec4899", date: "08/06/2026" },
    { id: 6, cat: "🛍️ Mua sắm", note: "Mua quần áo mới hè", amount: 850000, isInc: false, wallet: "Ví MoMo", icon: "🛍️", color: "#3b82f6", date: "05/06/2026" },
  ];

  return (
    <div className="min-h-screen bg-[#060913] text-[#f8fafc] font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">
      
      {/* Khối màu nền phát sáng mờ ảo (Premium Decorative Ambient Glows) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[25%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none animate-pulse-glow" />

      {/* Sticky Header */}
      <header className="sticky top-0 w-full z-50 bg-[#060913]/70 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Group */}
          <div className="flex items-center gap-3 group/logo cursor-pointer select-none">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-md opacity-30 group-hover/logo:opacity-50 group-hover/logo:blur-lg animate-pulse transition-all duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(34,211,238,0.5)] italic text-lg select-none group-hover/logo:scale-105 transition-transform duration-300">
                S
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-cyan-200 to-white bg-clip-text text-transparent italic tracking-wide whitespace-nowrap">
                Self Money
              </h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 group-hover/logo:text-cyan-400/80 transition-colors whitespace-nowrap">
                PHÂN TÍCH TÀI CHÍNH
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-cyan-400 transition-colors duration-200">Tính năng</a>
            <a href="#demo" className="hover:text-cyan-400 transition-colors duration-200">Khám phá giao diện</a>
          </nav>

          {/* Call to Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="bg-slate-800/50 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-slate-800 hover:border-slate-700"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300"
            >
              <span className="relative z-10">Bắt đầu ngay</span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </header>

      {/* Centered Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-20 text-center flex flex-col items-center z-10">
        
        {/* Glowing sub-badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide animate-pulse mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          Giải Pháp Quản Lý Tài Chính Cá Nhân Thế Hệ Mới
        </div>

        {/* Centered Large Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl text-slate-100">
          Làm chủ tài chính cá nhân
          <span className="block mt-3 bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            Thông Minh Cùng SelfMoney
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mt-8">
          Tự động theo dõi thu chi, thiết lập mục tiêu tích lũy và trực quan hóa các dòng tiền của bạn với trải nghiệm giao diện đẳng cấp, khoa học và an toàn tuyệt đối.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Vào Bảng Điều Khiển
            </Link>
          ) : (
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Đăng ký miễn phí ngay
            </Link>
          )}
          <a
            href="#demo"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700/50 transition-all duration-300 hover:scale-[1.02]"
          >
            Khám phá giao diện live
          </a>
        </div>

        {/* Large Dashboard Mockup Teaser under Hero */}
        <div className="w-full max-w-5xl mt-20 relative group/mockup">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-3xl opacity-10 blur-3xl pointer-events-none transform translate-y-8 group-hover/mockup:opacity-15 transition-opacity duration-300" />
          
          <div className="relative border border-slate-800/80 rounded-2xl bg-slate-900/40 backdrop-blur-xl p-3.5 shadow-2xl overflow-hidden aspect-[16/10] hover:scale-[1.005] hover:border-slate-700/60 transition-all duration-500">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-3 px-3 border-b border-slate-800/60 mb-4">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[10px] sm:text-xs font-mono text-slate-500 bg-slate-950 px-6 py-1 rounded-full border border-slate-800/50">selfmoney.vn/dashboard</div>
              <div className="w-12" />
            </div>

            {/* Visual Dashboard Content Mockup */}
            <div className="grid grid-cols-4 gap-3 h-[calc(100%-2.5rem)] text-left">
              {/* Sidebar Mock */}
              <div className="col-span-1 border-r border-slate-800/50 pr-2 flex flex-col justify-between py-1 hidden sm:flex">
                <div className="space-y-2.5">
                  <div className="h-7 bg-cyan-500/10 rounded-xl flex items-center px-2 border border-cyan-500/20"><div className="w-3 h-3 rounded-full bg-cyan-400 mr-2" /><div className="w-12 h-2.5 bg-cyan-400/40 rounded" /></div>
                  <div className="h-7 rounded-xl flex items-center px-2"><div className="w-3 h-3 rounded bg-slate-750 mr-2" /><div className="w-16 h-2 bg-slate-700 rounded" /></div>
                  <div className="h-7 rounded-xl flex items-center px-2"><div className="w-3 h-3 rounded bg-slate-750 mr-2" /><div className="w-10 h-2 bg-slate-700 rounded" /></div>
                  <div className="h-7 rounded-xl flex items-center px-2"><div className="w-3 h-3 rounded bg-slate-750 mr-2" /><div className="w-14 h-2 bg-slate-700 rounded" /></div>
                  <div className="h-7 rounded-xl flex items-center px-2"><div className="w-3 h-3 rounded bg-slate-750 mr-2" /><div className="w-12 h-2 bg-slate-700 rounded" /></div>
                </div>
                <div className="h-7 bg-rose-500/10 rounded-xl flex items-center px-2 border border-rose-500/20"><div className="w-3 h-3 rounded-full bg-rose-400 mr-2" /><div className="w-10 h-2 bg-rose-400/40 rounded" /></div>
              </div>

              {/* Main Content Mock */}
              <div className="col-span-4 sm:col-span-3 space-y-3.5 flex flex-col justify-between py-1">
                <div className="flex justify-between items-center">
                  <div className="w-24 h-4.5 bg-slate-800 rounded-lg" />
                  <div className="w-16 h-6 bg-slate-800/80 rounded-full border border-slate-750" />
                </div>

                {/* 3 cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs">💵</span>
                      <span className="text-[8px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded font-bold uppercase">Thu</span>
                    </div>
                    <div className="w-10 h-2 bg-slate-700 rounded mb-1" />
                    <div className="w-14 h-3 bg-green-400/20 rounded" />
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs">💳</span>
                      <span className="text-[8px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-bold uppercase">Chi</span>
                    </div>
                    <div className="w-10 h-2 bg-slate-700 rounded mb-1" />
                    <div className="w-14 h-3 bg-rose-400/20 rounded" />
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs">💰</span>
                      <span className="text-[8px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-bold uppercase">Dư</span>
                    </div>
                    <div className="w-10 h-2 bg-slate-700 rounded mb-1" />
                    <div className="w-14 h-3 bg-cyan-400/20 rounded" />
                  </div>
                </div>

                {/* Chart and mini goals side by side mockup */}
                <div className="flex-1 grid grid-cols-3 gap-3 min-h-0">
                  <div className="col-span-2 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <div className="w-24 h-2 bg-slate-700 rounded mb-2" />
                    <div className="flex-1 flex items-end justify-between gap-1.5 px-3">
                      <div className="w-3 bg-gradient-to-t from-green-500 to-green-400 rounded-t h-[40%]" />
                      <div className="w-3 bg-gradient-to-t from-red-500 to-red-400 rounded-t h-[20%]" />
                      <div className="w-3 bg-gradient-to-t from-green-500 to-green-400 rounded-t h-[65%]" />
                      <div className="w-3 bg-gradient-to-t from-red-500 to-red-400 rounded-t h-[35%]" />
                      <div className="w-3 bg-gradient-to-t from-green-500 to-green-400 rounded-t h-[50%]" />
                      <div className="w-3 bg-gradient-to-t from-red-500 to-red-400 rounded-t h-[40%]" />
                      <div className="w-3 bg-gradient-to-t from-green-500 to-green-400 rounded-t h-[80%]" />
                      <div className="w-3 bg-gradient-to-t from-red-500 to-red-400 rounded-t h-[30%]" />
                    </div>
                  </div>
                  <div className="col-span-1 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between space-y-1.5">
                    <div className="w-12 h-2 bg-slate-700 rounded" />
                    <div className="space-y-1">
                      <div className="h-4 bg-slate-900 rounded flex items-center px-1"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1" /><div className="w-6 h-1 bg-slate-700 rounded" /></div>
                      <div className="h-4 bg-slate-900 rounded flex items-center px-1"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1" /><div className="w-7 h-1 bg-slate-700 rounded" /></div>
                      <div className="h-4 bg-slate-900 rounded flex items-center px-1"><div className="w-1.5 h-1.5 rounded-full bg-pink-400 mr-1" /><div className="w-5 h-1 bg-slate-700 rounded" /></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Hero Quick Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 mt-16 border-t border-slate-800/80 w-full max-w-4xl relative">
          <div className="text-center">
            <p className="text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text">10K+</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Người tin dùng</p>
          </div>
          <div className="text-center border-y sm:border-y-0 sm:border-x border-slate-800/60 py-4 sm:py-0">
            <p className="text-4xl font-black text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">99.9%</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Độ chính xác số liệu</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">4.9★</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Đánh giá ứng dụng</p>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-28 border-t border-slate-900/60 z-10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">TIỆN ÍCH ĐỘC QUYỀN</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 mt-4 mb-6 leading-tight">
            Mọi công cụ cần có để làm chủ tài chính
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
            Không còn những bảng tính Excel phức tạp hay sổ ghi chép thủ công dễ thất lạc. SelfMoney cung cấp hệ thống khoa học nhất giúp bạn nắm bắt dòng tiền tức thì.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Col-span-2 - Tài khoản đa năng */}
          <div className="group relative rounded-3xl border border-slate-850 bg-slate-900/20 p-8 hover:border-cyan-500/20 hover:bg-slate-900/30 transition-all duration-300 flex flex-col justify-between min-h-[320px] md:col-span-2 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-3">Tài khoản</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Phân chia nguồn tiền khoa học với nhiều tài khoản (Tiền mặt, Ngân hàng, Sổ tích lũy, Ví điện tử). Theo dõi chính xác số dư biến động của từng ví ở một màn hình duy nhất.
              </p>
            </div>

            {/* Mini preview */}
            <div className="mt-8 flex gap-3 overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="bg-slate-950/60 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2.5 whitespace-nowrap"><span className="text-yellow-400">💵</span><span>Tiền Mặt</span><span className="font-bold text-slate-300">+5.4M</span></div>
              <div className="bg-slate-950/60 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2.5 whitespace-nowrap"><span className="text-blue-400">💳</span><span>Vietcombank</span><span className="font-bold text-slate-300">+18.2M</span></div>
              <div className="bg-slate-950/60 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2.5 whitespace-nowrap"><span className="text-pink-400">🐷</span><span>Sổ Tiết Kiệm</span><span className="font-bold text-slate-300">+22.8M</span></div>
            </div>
          </div>

          {/* Card 2: Col-span-1 - Ghi nhận tức thì */}
          <div className="group relative rounded-3xl border border-slate-850 bg-slate-900/20 p-8 hover:border-indigo-500/20 hover:bg-slate-900/30 transition-all duration-300 flex flex-col justify-between min-h-[320px] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-3">Ghi Nhận Thu Chi</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Thêm mới giao dịch thu nhập hoặc chi tiêu siêu tốc trong 3 giây. Ghi nhận chi tiết theo từng danh mục cụ thể, ghi chú và ví thanh toán.
              </p>
            </div>

            {/* Quick add mock graphic */}
            <div className="mt-6 bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl text-[10px] space-y-2">
              <div className="flex justify-between font-bold border-b border-slate-900 pb-1.5"><span className="text-slate-400">Giao dịch mới</span><span className="text-cyan-400">Lưu ✓</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Số tiền:</span><span className="text-rose-400 font-bold font-mono">-65,000đ</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Danh mục:</span><span className="text-slate-300">🍜 Ăn uống</span></div>
            </div>
          </div>

          {/* Card 3: Col-span-1 - Ngân sách chi tiêu */}
          <div className="group relative rounded-3xl border border-slate-850 bg-slate-900/20 p-8 hover:border-purple-500/20 hover:bg-slate-900/30 transition-all duration-300 flex flex-col justify-between min-h-[320px] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-3">Ngân Sách</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Thiết lập hạn mức chi tiêu tối đa cho từng danh mục theo tháng. Nhận cảnh báo thông minh khi chi tiêu chạm ngưỡng giới hạn đã định.
              </p>
            </div>

            {/* Budget warning mock */}
            <div className="mt-6 bg-slate-950/60 border border-slate-800 p-3 rounded-2xl space-y-1.5">
              <div className="flex justify-between text-[9px]"><span className="text-slate-400 font-bold">Ngân sách Ăn uống</span><span className="text-rose-400 font-bold">Đã dùng 85%</span></div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full" />
              </div>
            </div>
          </div>

          {/* Card 4: Col-span-2 - Báo cáo phân tích chi tiết */}
          <div className="group relative rounded-3xl border border-slate-850 bg-slate-900/20 p-8 hover:border-pink-500/20 hover:bg-slate-900/30 transition-all duration-300 flex flex-col justify-between min-h-[320px] md:col-span-2 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/10 transition-colors" />
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-3">Phân Tích Báo Cáo</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Báo cáo trực quan bằng biểu đồ phân bổ thu chi chi tiết. Phân tích tỷ lệ dòng tiền theo tháng/năm giúp bạn có kế hoạch đầu tư và tối ưu hóa tài chính hợp lý.
              </p>
            </div>

            {/* Mini report chart mock */}
            <div className="mt-8 flex items-end justify-between gap-1.5 max-w-xs h-16 border-b border-slate-800 pb-1.5 px-2">
              <div className="w-4 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-t h-[40%]" />
              <div className="w-4 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-t h-[60%]" />
              <div className="w-4 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-t h-[30%]" />
              <div className="w-4 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-t h-[75%]" />
              <div className="w-4 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-t h-[50%]" />
              <div className="w-4 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-t h-[90%]" />
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Mockup Preview Tabs Section */}
      <section id="demo" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-slate-900/60 z-10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">TRỰC QUAN & CAO CẤP</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 mt-4 mb-6">
            Giao diện thực tế ứng dụng
          </h2>
          <p className="text-slate-400">
            Chọn các tab dưới đây để khám phá các khung giao diện được mô phỏng chi tiết, sắc nét tương ứng với hệ thống thật của SelfMoney.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 shadow-2xl">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-cyan-400 border border-slate-800 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📊 Trang chủ
            </button>
            <button
              onClick={() => setActiveTab("wallets")}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === "wallets"
                  ? "bg-slate-900 text-cyan-400 border border-slate-800 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              💳 Tài khoản
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === "transactions"
                  ? "bg-slate-900 text-cyan-400 border border-slate-800 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📝 Giao dịch
            </button>
          </div>
        </div>

        {/* Live Mockup Window */}
        <div className="relative max-w-5xl mx-auto border border-slate-800 rounded-3xl bg-slate-950/80 p-4 md:p-6 shadow-2xl shadow-cyan-500/5 transition-all duration-500">
          
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Simulated Browser Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F]" />
              </div>
              <span className="hidden md:inline text-xs text-slate-500 font-mono">
                Bản xem trước giao diện tĩnh giới thiệu phần mềm
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-850">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span className="text-[11px] text-slate-400 font-medium">Bảng demo giới thiệu</span>
            </div>
          </div>

          {/* Simulated content according to selected TAB */}
          <div className="transition-all duration-300">
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-fade-in">
                
                {/* Dashboard Stats */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Income */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                          💵
                        </div>
                        <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full font-bold uppercase">Thu nhập</span>
                      </div>
                      <p className="text-slate-400 text-xs font-medium">Tổng thu nhập</p>
                      <p className="text-xl sm:text-2xl font-black text-green-400 mt-1 tabular-nums truncate">+{mockDashboard.income.toLocaleString("vi-VN")}đ</p>
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-500/30 group-hover:bg-green-400 transition-colors" />
                    </div>

                    {/* Expense */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                          💳
                        </div>
                        <span className="text-[10px] text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full font-bold uppercase">Chi tiêu</span>
                      </div>
                      <p className="text-slate-400 text-xs font-medium">Tổng chi tiêu</p>
                      <p className="text-xl sm:text-2xl font-black text-rose-400 mt-1 tabular-nums truncate">-{mockDashboard.expense.toLocaleString("vi-VN")}đ</p>
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-rose-500/30 group-hover:bg-rose-400 transition-colors" />
                    </div>

                    {/* Balance */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                          💰
                        </div>
                        <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full font-bold uppercase">Số dư</span>
                      </div>
                      <p className="text-slate-400 text-xs font-medium">Số dư thực tế</p>
                      <p className="text-xl sm:text-2xl font-black text-cyan-400 mt-1 tabular-nums truncate">+{mockDashboard.balance.toLocaleString("vi-VN")}đ</p>
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500/30 group-hover:bg-cyan-400 transition-colors" />
                    </div>
                  </div>

                  {/* Chart Mock */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="text-base font-bold text-slate-100">Biểu Đồ Xu Hướng</h4>
                        <p className="text-xs text-slate-500">So sánh dòng tiền 6 tháng đầu năm</p>
                      </div>
                      <div className="flex gap-4 text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-green-400"><span className="w-2.5 h-2.5 rounded bg-green-400" />Thu</span>
                        <span className="flex items-center gap-1.5 text-red-400"><span className="w-2.5 h-2.5 rounded bg-red-400" />Chi</span>
                      </div>
                    </div>
                    
                    <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-800 px-2 relative">
                      {mockDashboard.chartData.map((m, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div className="flex items-end gap-1.5 h-full w-full justify-center">
                            <div
                              className="w-3 bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-300"
                              style={{ height: `${m.inc}%` }}
                            />
                            <div
                              className="w-3 bg-gradient-to-t from-red-500 to-red-400 rounded-t-md transition-all duration-300"
                              style={{ height: `${m.exp}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold mt-2">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category summary cards mock */}
                <div className="space-y-6">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-full flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-100 mb-4">Danh mục của tôi</h4>
                      <p className="text-xs text-slate-500 mb-6">Tỷ lệ cơ cấu chi tiêu chính</p>
                    </div>

                    <div className="space-y-5 flex-1 flex flex-col justify-around">
                      {mockDashboard.categories.map((item, index) => {
                        const isIncome = item.type === "income";
                        return (
                          <div key={index} className="group/cat">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center border text-xs"
                                  style={{
                                    backgroundColor: `${item.color}15`,
                                    borderColor: `${item.color}35`,
                                    color: item.color
                                  }}
                                >
                                  {item.name.split(" ")[0]}
                                </div>
                                <span className={`text-xs font-semibold ${isIncome ? "text-green-400" : "text-rose-400"}`}>
                                  {item.name.split(" ").slice(1).join(" ")}
                                </span>
                              </div>
                              <span className={`text-xs font-bold font-mono ${isIncome ? "text-green-400" : "text-rose-400"}`}>
                                {isIncome ? "+" : "-"}{item.amount.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                            <div className="w-full h-1 bg-slate-850 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "wallets" && (
              <div className="text-left space-y-6 animate-fade-in">
                
                {/* Total Asset header mock */}
                <div className="bg-gradient-to-r from-slate-900/60 to-slate-950/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">
                      💰
                    </div>
                    <span className="uppercase text-xs font-bold tracking-wider text-slate-400">
                      Tổng tài sản tích lũy
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-cyan-400 font-mono drop-shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    +49,950,000đ
                  </h1>
                </div>

                {/* Wallets Mock Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockWallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-52 group hover:border-slate-700/60 hover:shadow-lg transition-all duration-300"
                    >
                      {/* left accent strip */}
                      <div className="absolute left-0 top-0 h-full w-[2px] bg-cyan-500/30 group-hover:bg-cyan-400 transition-colors" style={{ backgroundColor: wallet.color }} />

                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center border text-lg"
                          style={{
                            color: wallet.color,
                            backgroundColor: `${wallet.color}15`,
                            borderColor: `${wallet.color}35`,
                          }}
                        >
                          {wallet.icon}
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800">
                          {wallet.created}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">{wallet.name}</h3>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-850 inline-block mt-1">
                          {wallet.type}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-850/80 flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Số dư:</span>
                        <span className="font-bold font-mono text-sm" style={{ color: wallet.color }}>
                          +{wallet.balance.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="text-left space-y-6 animate-fade-in">
                
                {/* Mock Search and Category filter buttons bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-850">
                  <div className="w-full sm:w-72 bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-xs text-slate-500 italic select-none">
                    🔍 Tìm kiếm giao dịch...
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto justify-end">
                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800 whitespace-nowrap">Tất cả</span>
                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-950 text-slate-500 border border-transparent whitespace-nowrap">💵 Thu nhập</span>
                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-950 text-slate-500 border border-transparent whitespace-nowrap">💳 Chi tiêu</span>
                  </div>
                </div>

                {/* Mock Transactions List */}
                <div className="space-y-3.5">
                  {mockTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="relative overflow-hidden bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:border-slate-700/60 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {/* Left color glow indicator strip */}
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 rounded-r-full ${t.isInc ? "bg-green-500" : "bg-rose-500"}`} />

                      {/* Icon */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center border text-lg shrink-0"
                          style={{
                            color: t.color,
                            backgroundColor: `${t.color}15`,
                            borderColor: `${t.color}35`,
                          }}
                        >
                          {t.icon}
                        </div>
                        <div className="min-w-0 pr-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-200 text-sm">{t.cat.split(" ").slice(1).join(" ")}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-950 text-slate-400 border border-slate-850">
                              {t.wallet}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate max-w-sm">{t.note}</p>
                        </div>
                      </div>

                      {/* Value and Date */}
                      <div className="text-right flex flex-col justify-between h-full min-h-[2.8rem] shrink-0">
                        <span className={`font-bold font-mono text-sm ${t.isInc ? "text-green-400" : "text-rose-400"}`}>
                          {t.isInc ? "+" : "-"}{t.amount.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-[9px] text-slate-500 mt-1 block">{t.date}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>
      </section>


      {/* Footer copyright */}
      <footer className="w-full py-8 border-t border-slate-900/80 text-center text-xs text-slate-600 z-10 relative">
        <p>© 2026 SelfMoney. Tất cả các quyền được bảo lưu. Sản phẩm mô phỏng giới thiệu phần mềm quản lý tài chính.</p>
      </footer>

    </div>
  );
}
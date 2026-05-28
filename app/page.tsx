"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative" style={{ backgroundColor: '#0B0F19' }}>
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      {/* Sticky Header */}
      <header className="sticky top-0 w-full z-50 bg-[#0B0F19]/75 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group/logo cursor-pointer select-none">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-cyan-400 blur-md opacity-30 group-hover/logo:opacity-50 group-hover/logo:blur-lg animate-pulse transition-all duration-300" />

              {/* Logo */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(34,211,238,0.5)] italic text-lg select-none group-hover/logo:scale-105 transition-transform duration-300">
                S
              </div>
            </div>

            {/* Brand Name */}
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-cyan-200 to-white bg-clip-text text-transparent italic tracking-wide whitespace-nowrap">
                Self Money
              </h1>

              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 group-hover/logo:text-cyan-400/80 transition-colors whitespace-nowrap">
                PHÂN TÍCH TÀI CHÍNH
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors duration-200">Tính năng</a>
            <a href="#mockup" className="hover:text-cyan-400 transition-colors duration-200">Khám phá giao diện</a>
            <a href="#security" className="hover:text-cyan-400 transition-colors duration-200">Bảo mật</a>

          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Đăng nhập
            </Link>

            <Link
              href="/register"
              className="relative group overflow-hidden px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300"
            >
              <span className="relative z-10">Bắt đầu ngay</span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 flex flex-col lg:flex-row items-center gap-16 z-10">
        <div className="flex-1 flex flex-col items-start gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Giải Pháp Quản Lý Tài Chính Thế Hệ Mới
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Làm chủ tài chính
            <br />
            Cá nhân thông minh cùng
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SelfMoney
            </span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
            Tự động theo dõi thu chi, lập ngân sách thông minh và tối ưu hóa các dòng tiền của bạn với trải nghiệm giao diện đẳng cấp, trực quan và bảo mật tuyệt đối.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            {isLoggedIn ? (
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white text-center shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Bắt đầu ngay
              </Link>
            ) : (
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white text-center shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Đăng ký miễn phí
              </Link>
            )}
            <a href="#mockup" className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center transition-all duration-300">Khám phá giao diện</a>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-800/80 w-full">
            <div>
              <p className="text-3xl font-black text-white bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">10K+</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">Người tin dùng</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">99.9%</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">Độ chính xác</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">4.9★</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">Đánh giá App</p>
            </div>
          </div>
        </div>

        {/* Hero Illustration (Visual mockup) */}
        <div className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-3xl opacity-20 blur-3xl pointer-events-none transform translate-y-4" />
          <div className="relative border border-slate-700/80 rounded-2xl bg-slate-900/60 backdrop-blur-xl p-3 shadow-2xl overflow-hidden aspect-[16/10]">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-3 px-3 border-b border-slate-800/60 mb-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-xs font-medium text-slate-500 bg-slate-950 px-6 py-0.5 rounded-full border border-slate-800/50">selfmoney.vn/dashboard</div>
              <div className="w-10" />
            </div>
            {/* Visual Dashboard Screen Content */}
            <div className="grid grid-cols-4 gap-3 h-[calc(100%-2rem)]">
              {/* Sidebar */}
              <div className="col-span-1 border-r border-slate-800/80 pr-2 flex flex-col justify-between py-1">
                <div className="space-y-2">
                  <div className="h-6 bg-cyan-500/10 rounded-lg flex items-center px-2"><div className="w-2.5 h-2.5 rounded-full bg-cyan-400 mr-2" /><div className="w-12 h-2 bg-cyan-400/40 rounded" /></div>
                  <div className="h-6 rounded-lg flex items-center px-2"><div className="w-2.5 h-2.5 rounded bg-slate-700 mr-2" /><div className="w-14 h-2 bg-slate-700 rounded" /></div>
                  <div className="h-6 rounded-lg flex items-center px-2"><div className="w-2.5 h-2.5 rounded bg-slate-700 mr-2" /><div className="w-10 h-2 bg-slate-700 rounded" /></div>
                  <div className="h-6 rounded-lg flex items-center px-2"><div className="w-2.5 h-2.5 rounded bg-slate-700 mr-2" /><div className="w-12 h-2 bg-slate-700 rounded" /></div>
                </div>
                <div className="h-6 bg-red-500/10 rounded-lg flex items-center px-2"><div className="w-2.5 h-2.5 rounded-full bg-red-400 mr-2" /><div className="w-10 h-2 bg-red-400/40 rounded" /></div>
              </div>
              {/* Main Contents */}
              <div className="col-span-3 space-y-3 flex flex-col justify-between py-1">
                <div className="flex justify-between items-center">
                  <div className="w-24 h-4 bg-slate-800 rounded" />
                  <div className="w-16 h-6 bg-slate-800 rounded-full border border-slate-700" />
                </div>
                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg relative overflow-hidden">
                    <div className="w-4 h-4 bg-green-500/10 rounded text-[9px] flex items-center justify-center">🟢</div>
                    <div className="w-8 h-1.5 bg-slate-600 rounded my-1.5" />
                    <div className="w-12 h-3 bg-green-400/20 rounded" />
                  </div>
                  <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg relative overflow-hidden">
                    <div className="w-4 h-4 bg-red-500/10 rounded text-[9px] flex items-center justify-center">🔴</div>
                    <div className="w-8 h-1.5 bg-slate-600 rounded my-1.5" />
                    <div className="w-12 h-3 bg-red-400/20 rounded" />
                  </div>
                  <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg relative overflow-hidden">
                    <div className="w-4 h-4 bg-cyan-500/10 rounded text-[9px] flex items-center justify-center">🔵</div>
                    <div className="w-8 h-1.5 bg-slate-600 rounded my-1.5" />
                    <div className="w-12 h-3 bg-cyan-400/20 rounded" />
                  </div>
                </div>
                {/* Chart Mock */}
                <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 flex flex-col justify-between">
                  <div className="w-20 h-2 bg-slate-700 rounded mb-2" />
                  <div className="flex-1 flex items-end justify-between gap-1 px-4">
                    <div className="w-3 bg-cyan-500/50 rounded-t h-[40%]" />
                    <div className="w-3 bg-indigo-500/60 rounded-t h-[65%]" />
                    <div className="w-3 bg-cyan-500/50 rounded-t h-[25%]" />
                    <div className="w-3 bg-indigo-500/60 rounded-t h-[80%]" />
                    <div className="w-3 bg-cyan-500/50 rounded-t h-[50%]" />
                    <div className="w-3 bg-indigo-500/60 rounded-t h-[95%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/60 z-10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase">TẬP TRUNG HIỆU QUẢ</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-6">
            Mọi tính năng cần có để làm chủ dòng tiền
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Không còn những bảng tính Excel phức tạp hay việc ghi chép sổ sách thủ công. SelfMoney đem lại cách quản lý tài chính thông minh nhất cho bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/30 p-8 hover:border-cyan-500/30 hover:bg-slate-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Tài khoản Đa Năng</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tạo nhiều tài khoản khác nhau (tiền mặt, thẻ ngân hàng, tiết kiệm) để dễ dàng kiểm soát chính xác nguồn tiền từ nhiều nơi.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/30 p-8 hover:border-indigo-500/30 hover:bg-slate-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Ghi Nhận Tức Thì</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Nhập giao dịch thu, chi siêu tốc theo từng danh mục cụ thể (ăn uống, mua sắm, lương...) kèm các ghi chú chi tiết.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/30 p-8 hover:border-purple-500/30 hover:bg-slate-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Ngân Sách Chi Tiêu</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Thiết lập hạn mức chi tiêu cho từng danh mục theo tháng. Hệ thống sẽ cảnh báo giúp bạn tránh chi tiêu quá đà.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/30 p-8 hover:border-pink-500/30 hover:bg-slate-900/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Báo Cáo Phân Tích</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Biểu đồ trực quan so sánh thu chi qua từng tháng, hiển thị tỷ lệ phân bổ các danh mục chi tiêu một cách khoa học nhất.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Mockup Teaser */}
      <section id="mockup" className="relative max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/60 z-10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase">TRỰC QUAN & THỜI THƯỢNG</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-6">
            Giao diện trực quan trên mọi nền tảng
          </h2>
          <p className="text-slate-400">
            Xem ngay hình ảnh mô phỏng bảng điều khiển SelfMoney thực tế với đầy đủ các chỉ số thống kê, biểu đồ thu chi và các giao dịch chi tiết.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto border border-slate-800 rounded-3xl bg-slate-950/80 p-4 md:p-6 shadow-2xl shadow-cyan-500/5">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Window Header Mockup */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F]" />
              </div>
              <span className="hidden md:inline text-xs text-slate-500 font-mono">Bản demo hệ thống quản lý tài chính cá nhân</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span className="text-[11px] text-slate-400 font-medium">Bảng điều khiển Live Demo</span>
            </div>
          </div>

          {/* Sub Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Mock Components */}
            <div className="lg:col-span-2 space-y-6">
              {/* Visual Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[20px] text-green-400">💵</span>
                    <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full font-bold">Thu nhập</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium">Tổng thu nhập</p>
                  <p className="text-xl font-bold text-green-400 mt-1">+45,200,000đ</p>
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-500/30" />
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[20px] text-red-400">💳</span>
                    <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full font-bold">Chi tiêu</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium">Tổng chi tiêu</p>
                  <p className="text-xl font-bold text-red-400 mt-1">-18,750,000đ</p>
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500/30" />
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[20px] text-cyan-400">💰</span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full font-bold">Số dư</span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium">Số dư thực tế</p>
                  <p className="text-xl font-bold text-cyan-400 mt-1">+26,450,000đ</p>
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500/30" />
                </div>
              </div>

              {/* Chart Mock */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-base font-bold text-white">Biểu Đồ Xu Hướng</h4>
                    <p className="text-xs text-slate-500">So sánh thu chi 6 tháng đầu năm</p>
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-green-400"><span className="w-2.5 h-2.5 rounded bg-green-400" />Thu</span>
                    <span className="flex items-center gap-1.5 text-red-400"><span className="w-2.5 h-2.5 rounded bg-red-400" />Chi</span>
                  </div>
                </div>
                <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-800/80 px-2">
                  {[
                    { label: "Tháng 1", inc: 45, exp: 20 },
                    { label: "Tháng 2", inc: 60, exp: 35 },
                    { label: "Tháng 3", inc: 55, exp: 40 },
                    { label: "Tháng 4", inc: 70, exp: 30 },
                    { label: "Tháng 5", inc: 85, exp: 45 },
                    { label: "Tháng 6", inc: 95, exp: 50 },
                  ].map((m, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div className="flex items-end gap-1.5 h-full w-full justify-center">
                        <div
                          className="w-3 bg-green-400/80 hover:bg-green-400 rounded-t transition-all duration-300"
                          style={{ height: `${m.inc}%` }}
                        />
                        <div
                          className="w-3 bg-red-400/80 hover:bg-red-400 rounded-t transition-all duration-300"
                          style={{ height: `${m.exp}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold mt-2">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Mock Components */}
            <div className="space-y-6">
              {/* Wallets Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-base font-bold text-white mb-4">Danh Sách Tài khoản</h4>
                <div className="space-y-3">
                  {[
                    { name: "💵 Tiền Mặt", type: "Tiền mặt", bal: "5,400,000", color: "text-yellow-400 bg-yellow-400/10" },
                    { name: "💳 Vietcombank", type: "Ngân hàng", bal: "18,250,000", color: "text-blue-400 bg-blue-400/10" },
                    { name: "🐷 Tiết Kiệm Kì Hạn", type: "Sổ tích lũy", bal: "22,800,000", color: "text-pink-400 bg-pink-400/10" },
                  ].map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-slate-800 text-slate-200">
                          {w.name.split(" ")[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{w.name.split(" ").slice(1).join(" ")}</p>
                          <p className="text-[10px] text-slate-500">{w.type}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-200">+{w.bal}đ</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent transaction list mockup */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-base font-bold text-white mb-4">Giao Dịch Gần Đây</h4>
                <div className="space-y-3">
                  {[
                    { cat: "🍜 Ăn uống", note: "Bữa trưa văn phòng", amount: "-65,000đ", isInc: false },
                    { cat: "💼 Lương tháng", note: "Công ty chuyển khoản", amount: "+25,000,000đ", isInc: true },
                    { cat: "☕ Cà phê", note: "Gặp gỡ đối tác", amount: "-120,000đ", isInc: false },
                  ].map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">{t.cat}</p>
                        <p className="text-[10px] text-slate-500">{t.note}</p>
                      </div>
                      <span className={`font-bold ${t.isInc ? "text-green-400" : "text-red-400"}`}>
                        {t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Info Section */}
      <section id="security" className="relative max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/60 z-10 scroll-mt-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="inline-flex px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              An Toàn Tuyệt Đối
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Bảo mật tối đa, an tâm tuyệt đối cho tài sản của bạn
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Chúng tôi hiểu rằng dữ liệu tài chính là thông tin cực kỳ nhạy cảm. Vì vậy, SelfMoney được xây dựng trên nền tảng công nghệ tiên tiến nhất với các tiêu chuẩn an ninh nghiêm ngặt nhất.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Mã Hóa Đầu Cuối (End-to-End Encryption)</h4>
                  <p className="text-slate-400 text-sm mt-1">Toàn bộ mật khẩu và token đều được mã hóa một chiều qua thuật toán bcrypt và mã hóa JWT bảo mật.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Không Lưu Trữ Thông Tin Ngân Hàng Nhạy Cảm</h4>
                  <p className="text-slate-400 text-sm mt-1">Chúng tôi chỉ lưu giữ số dư ví bạn nhập thủ công, không yêu cầu kết nối API tài khoản ngân hàng thật.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Sao Lưu Dữ Liệu Tự Động</h4>
                  <p className="text-slate-400 text-sm mt-1">Dữ liệu được sao lưu liên tục trên hạ tầng cơ sở dữ liệu Postgres mạnh mẽ, cam kết không mất mát dữ liệu.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <div className="relative w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-8 shadow-2xl shadow-indigo-500/10">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl animate-pulse pointer-events-none" />
              <div className="w-full h-full rounded-full bg-[#0B0F19] border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                <svg className="w-20 h-20 text-cyan-400 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-xl font-bold text-white">Chứng Nhận An Toàn</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">Mã hóa chuẩn ngân hàng SSL 256-bit đảm bảo an toàn tuyệt đối mọi thông tin truyền đi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
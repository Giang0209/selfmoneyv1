"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarStore } from "./SidebarStore";
import { usePrivacy } from "@/lib/PrivacyContext";

// Khai báo kiểu dữ liệu cho Profile của tài khoản người dùng hiển thị trên Header
type Profile = {
    name: string;
    avatar?: string | null;
};

export default function Header() {
    const { isPrivate, togglePrivacy } = usePrivacy();
    const [profile, setProfile] = useState<Profile | null>(null); // State lưu thông tin cá nhân
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State đóng mở dropdown menu
    const dropdownRef = useRef<HTMLDivElement>(null); // Ref tham chiếu đến thẻ dropdown để xử lý click ra ngoài
    const router = useRouter();

    // Đồng bộ trạng thái thu gọn/mở rộng của Sidebar từ store chung
    const isCollapsed = useSyncExternalStore(
        SidebarStore.subscribe,
        SidebarStore.getSnapshot,
        SidebarStore.getSnapshot
    );

    // Bắt sự kiện click chuột bên ngoài khu vực dropdown để tự động đóng dropdown menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Tải thông tin người dùng ngay khi Header được hiển thị
    useEffect(() => {
        fetchProfile();
    }, []);

    // Lấy thông tin cá nhân (tên, avatar) từ API profile cá nhân
    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch("/api/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                console.log("Không lấy được profile");
                return;
            }

            const data = await res.json();
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    // Hàm trả về câu chào phù hợp tùy theo mốc thời gian trong ngày (sáng, chiều, tối)
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour < 12)
            return "Chào buổi sáng"; // Chào buổi sáng

        if (hour < 18)
            return "Chào buổi chiều"; // Chào buổi chiều

        return "Chào buổi tối"; // Chào buổi tối
    };

    // Hàm xử lý khi người dùng thực hiện Đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("token"); // Xóa JWT Token trong bộ nhớ duyệt web
        router.push("/"); // Điều hướng về trang Landing Page
    };

    return (
        <header
            className="fixed top-0 left-0 h-20 bg-sidebar-bg backdrop-blur-3xl border-b border-card-border flex items-center justify-between px-8 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            style={{
                left: isCollapsed ? '5.5rem' : '16rem',
                width: isCollapsed ? 'calc(100% - 5.5rem)' : 'calc(100% - 16rem)',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {/* PHẦN TRÁI: Câu chào mừng theo thời gian thực */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-foreground flex items-center gap-1.5 tracking-wide">
                        <span>{getGreeting()},</span>
                        <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
                            {profile?.name || "Khách"}
                        </span>
                        <span className="animate-bounce inline-block">👋</span>
                    </h2>
                </div>

                <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5 uppercase">
                    Hệ thống theo dõi chi tiêu cá nhân
                </p>
            </div>

            {/* PHẦN PHẢI: Thẻ Avatar và Dropdown menu người dùng */}
            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                {/* NÚT CHẾ ĐỘ RIÊNG TƯ (PRIVACY TOGGLE) */}
                <button
                    onClick={togglePrivacy}
                    className="p-2 rounded-xl bg-card-bg/40 hover:bg-card-bg border border-card-border hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all duration-300 shadow-inner flex items-center justify-center cursor-pointer w-9 h-9"
                    title={isPrivate ? "Hiện số tiền" : "Ẩn số tiền"}
                >
                    {isPrivate ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>

                <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="relative group/avatar cursor-pointer flex items-center gap-3 bg-card-bg/40 hover:bg-card-bg px-4 py-2 rounded-2xl border border-card-border hover:border-cyan-500/30 shadow-inner transition-all duration-300"
                >
                    <img
                        src={profile?.avatar || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748b'><circle cx='12' cy='12' r='12' fill='%231e293b'/><circle cx='12' cy='8' r='4' fill='%2394a3b8'/><path d='M12 14c-4.42 0-8 2-8 5v1h16v-1c0-3-3.58-5-8-5z' fill='%2394a3b8'/></svg>"}
                        alt="avatar"
                        className="relative w-8.5 h-8.5 rounded-full object-cover border border-card-border"
                    />

                    <div className="text-left hidden sm:block">
                        <p className="text-xs text-foreground font-extrabold tracking-wide group-hover:text-cyan-400 transition-colors">
                            {profile?.name || "Khách"}
                        </p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                            Thành viên
                        </p>
                    </div>

                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* DROPDOWN MENU CHỨC NĂNG */}
                {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-3 w-56 bg-card-bg/95 backdrop-blur-xl border border-card-border rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up origin-top-right">
                        <div className="py-2">
                            {/* Liên kết đến trang Hồ sơ cá nhân */}
                            <Link
                                href="/profile"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-card-bg/80 hover:text-cyan-400 transition-colors group/item"
                            >
                                <svg className="w-5 h-5 text-indigo-300 group-hover/item:text-indigo-400 transition-colors drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <div>
                                    <p className="font-semibold">Tài khoản</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Hồ sơ cá nhân</p>
                                </div>
                            </Link>

                            <div className="h-[1px] w-full bg-card-border/50 my-1" />

                            {/* Nút Đăng xuất */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors group/item"
                            >
                                <svg className="w-5 h-5 text-rose-400/80 group-hover/item:text-rose-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="font-semibold">Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
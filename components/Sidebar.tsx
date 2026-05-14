"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const menu = [
        { href: "/dashboard", label: "Tổng quan" },
        { href: "/transactions", label: "Giao dịch" },
        { href: "/wallets", label: "Ví tiền" },
        { href: "/budgets", label: "Ngân sách" },
        { href: "/categories", label: "Danh mục" },
        { href: "/analytics", label: "Thống kê" },
        { href: "/profile", label: "Hồ sơ cá nhân" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.replace("/login");
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-700 bg-[#0F172A] flex flex-col py-6 z-50">

            {/* Logo */}
            <div className="px-6 mb-10">
                <h1 className="text-2xl font-black text-cyan-500 italic">
                    Self Money
                </h1>

                <p className="text-[10px] text-slate-400 uppercase">
                    Phân tích tài chính
                </p>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 space-y-2 text-sm">
                {menu.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`block py-2 px-3 rounded-lg transition ${pathname === item.href
                            ? "text-cyan-400 bg-cyan-500/10"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-4 pt-6 border-t border-slate-700">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="text-red-400 text-sm hover:text-red-500 transition"
                >
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
}
"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { usePrivacy } from "@/lib/PrivacyContext";


type Category = {
    id: number;
    name: string;
    type: "income" | "expense";
    icon?: string;
    color?: string;
    created_at?: string;
    total_amount?: string;
};

type FormState = {
    name: string;
    type: "income" | "expense";
    icon: string;
    color: string;
};

export default function CategoryPage() {
    const { isPrivate, formatAmount } = usePrivacy();
    const toast = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);


    const [tab, setTab] = useState<"expense" | "income">("expense");
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);


    const [form, setForm] = useState<FormState>({
        name: "",
        type: "expense",
        icon: "📁",
        color: "#06b6d4",
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setForm((prev) => ({ ...prev, type: tab }));
    }, [tab]);

    useEffect(() => {
        const query = search.trim().toLowerCase();
        if (query === "") return;

        // Tìm các kết quả khớp trong tab hiện tại
        const currentTabMatches = categories.filter(
            (c) => c.type === tab && c.name.toLowerCase().includes(query)
        );

        // Nếu tab hiện tại không có kết quả khớp nào
        if (currentTabMatches.length === 0) {
            // Tìm xem tab đối diện có kết quả khớp hay không
            const otherTab = tab === "expense" ? "income" : "expense";
            const otherTabMatches = categories.filter(
                (c) => c.type === otherTab && c.name.toLowerCase().includes(query)
            );

            // Nếu tab đối diện có kết quả khớp, tự động chuyển sang tab đó
            if (otherTabMatches.length > 0) {
                setTab(otherTab);
            }
        }
    }, [search, categories, tab]);

    // =========================
    // FETCH
    // =========================
    const fetchCategories = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const res = await fetch("/api/categories", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();
            setCategories(json || []);
        } catch (err) {
            console.error(err);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // OPEN CREATE (CARD)
    // =========================
    const openCreate = () => {

        setForm({
            name: "",
            type: tab,
            icon: "📁",
            color: "#06b6d4",
        });
        setOpen(true);
    };


    // =========================
    // SAVE (CREATE )
    // =========================
    const handleSave = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const res = await fetch(
                "/api/categories",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify(form),
                }
            );

            const json =
                await res.json();

            if (!res.ok) {

                toast.error(json.message || "Tạo danh mục thất bại");
                return;
            }

            toast.success("Tạo danh mục thành công!");
            setOpen(false);

            await fetchCategories();

        } catch (err: any) {

            console.error(err);
            toast.error(err.message || "Lỗi tạo danh mục");
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = async (id: number) => {
        const ok = confirm("Bạn có chắc chắn muốn xóa danh mục này?");
        if (!ok) return;

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();

            if (!res.ok) {
                toast.error(json.message || "Xóa danh mục thất bại");
                return;
            }

            setCategories((prev) => prev.filter((c) => c.id !== id));
            toast.success("Xóa danh mục thành công!");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Lỗi xóa danh mục");
        }
    };

    const filtered = categories.filter((c) => {
        const matchSearch =
            c.name.toLowerCase().includes(search.toLowerCase());

        // Nếu có từ khoá tìm kiếm, tìm trên toàn bộ danh mục (bỏ qua tab Chi tiêu / Thu nhập)
        if (search.trim() !== "") {
            return matchSearch;
        }

        return c.type === tab;
    });

    const expenseIcons = ["🍴", "🏠", "🚌", "🏥", "🛍️", "🎓", "🎭", "🏋️", "✈️", "🐾", "📱", "🧾"];
    const incomeIcons = ["💼", "📈", "🧧", "🏬", "🏦", "🔄"];

    const colors = ["#06b6d4", "#f97316", "#3b82f6", "#10b981", "#a855f7", "#eab308", "#ec4899", "#ef4444", "#6366f1", "#d946ef", "#f59e0b", "#84cc16", "#14b8a6", "#64748b"];

    const formatMoney = (v: number) => formatAmount(v);

    return (
        <div className="bg-background min-h-screen text-foreground relative overflow-hidden transition-colors duration-300">
            {/* Ambient visual background glowing spots */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />

            <Sidebar />
            <Header />

            <main className="ml-64 pt-24 p-8 relative z-10">

                {/* HEADER */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900/60 pb-6 relative">
                    <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent" />
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
                                Danh mục
                            </h1>
                            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-cyan-500/20 tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                Categories
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">
                            Quản lý danh mục thu chi thông minh của bạn
                        </p>
                    </div>
                </div>

                {/* SEARCH & FILTER */}
                <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* SEARCH */}
                    <div className="relative flex items-center flex-1 max-w-sm">
                        <span className="absolute left-4 text-slate-500 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm danh mục..."
                            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-2xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 transition-all duration-300 shadow-inner text-sm font-medium"
                        />
                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={openCreate}
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-5 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm danh mục mới
                    </button>
                </div>

                {/* TABS */}
                <div className="flex gap-8 border-b border-slate-800 mb-8">
                    <button
                        onClick={() => setTab("expense")}
                        className={`pb-3 font-bold transition-colors ${tab === "expense"
                            ? "text-cyan-400 border-b-2 border-cyan-400"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        💳 Chi tiêu
                    </button>

                    <button
                        onClick={() => setTab("income")}
                        className={`pb-3 font-bold transition-colors ${tab === "income"
                            ? "text-green-400 border-b-2 border-green-400"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        🏦 Thu nhập
                    </button>
                </div>

                {/* GRID */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                    </div>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        {filtered.map((item) => (
                            <div
                                key={item.id}
                                className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/5 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between min-h-[220px] shadow-[0_4px_25px_rgba(0,0,0,0.4)]"
                            >
                                {/* Background glow decoration matching category color */}
                                <div
                                    className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-10 pointer-events-none transition-all duration-500 group-hover:opacity-20"
                                    style={{
                                        background: `radial-gradient(circle, ${item.color || "#06b6d4"} 0%, transparent 70%)`
                                    }}
                                />

                                <div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className="flex items-center gap-3.5">
                                            {/* Icon with radial glow */}
                                            <div className="relative select-none flex-shrink-0">
                                                {/* Color glow backdrop */}
                                                <div
                                                    className="absolute inset-0 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-all duration-300 animate-pulse"
                                                    style={{ backgroundColor: item.color || "#06b6d4" }}
                                                />
                                                <div
                                                    className="relative w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105"
                                                    style={{
                                                        color: item.color || "#06b6d4",
                                                        backgroundColor: `${item.color || "#06b6d4"}15`,
                                                        borderColor: `${item.color || "#06b6d4"}35`,
                                                    }}
                                                >
                                                    <span className="text-2xl leading-none">{item.icon || "📁"}</span>
                                                </div>
                                            </div>

                                            {/* Header text container */}
                                            <div className="min-w-0">
                                                <h3 className="font-extrabold text-base text-slate-100 group-hover:text-white transition-colors duration-200 truncate">
                                                    {item.name}
                                                </h3>

                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-slate-950/80 border border-slate-800/80 shadow-inner transition-all duration-300 inline-block w-fit ${item.type === "income"
                                                            ? "text-green-400 group-hover:border-green-500/30"
                                                            : "text-rose-400 group-hover:border-rose-500/30"
                                                        }`}>
                                                        {item.type === "income" ? 'Thu nhập' : 'Chi tiêu'}
                                                    </span>
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                                        {item.created_at
                                                            ? new Date(item.created_at).toLocaleDateString("vi-VN")
                                                            : 'Danh mục'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions (trash button) on top-right */}
                                        <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200 relative z-20">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                                className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-slate-850 hover:border-rose-500/20 p-2 rounded-xl transition duration-200"
                                                title="Xóa danh mục"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Total transaction footer */}
                                <div className="mt-4 pt-3 border-t border-slate-800/40 relative z-10 flex flex-col justify-end">
                                    <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                                        Tổng giao dịch
                                    </div>

                                    <p
                                        className={`text-3xl font-black font-sans tabular-nums flex items-baseline gap-0.5 pb-2 pt-1 transition-all duration-300 ${item.type === "income"
                                            ? "text-green-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.15)] group-hover:text-green-300"
                                            : "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.15)] group-hover:text-rose-300"
                                            }`}
                                    >
                                        <span className="text-lg font-bold mr-0.5">{item.type === "income" ? "+" : "-"}</span>
                                        <span className="tracking-tight truncate">{formatAmount(Number(item.total_amount || 0), false)}</span>
                                        {!isPrivate && <span className="text-lg font-semibold opacity-75 ml-0.5 flex-shrink-0">đ</span>}
                                    </p>
                                </div>

                                <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:via-cyan-400 transition-all duration-300"
                                     style={{
                                         background: `linear-gradient(to right, transparent, ${item.color || "#06b6d4"}60, transparent)`
                                     }}
                                />
                            </div>
                        ))}

                        {/* ADD BUTTON */}
                        <button
                            onClick={openCreate}
                            className="bg-gradient-to-br from-slate-950/20 to-slate-900/20 border border-slate-800/80 border-dashed rounded-3xl p-6 min-h-[220px] h-full
                                flex flex-col items-center justify-center relative overflow-hidden
                                hover:border-cyan-500/50 hover:bg-slate-900/30 transition-all duration-300 group"
                        >
                            {/* Hover decoration glows */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all duration-300" />
                            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/15 transition-all duration-300" />

                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.05)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>

                            <p className="font-bold text-slate-200 group-hover:text-white transition-colors duration-250 text-sm">
                                Thêm danh mục
                            </p>

                            <p className="text-xs text-slate-500 mt-1 text-center max-w-[180px] leading-relaxed group-hover:text-slate-400 transition-colors duration-250">
                                Tạo danh mục mới cho thu nhập hoặc chi tiêu
                            </p>
                        </button>

                    </section>
                )}
            </main>

            {/* ================= STANDARDIZED PREMIUM MODAL ================= */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">

                    <div className="bg-[#0b1329]/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden relative transform transition-all">
                        {/* Radiant decorative top line */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

                        {/* HEADER */}
                        <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/20">
                            <div>
                                <h3 className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    Tạo danh mục mới
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                    Thêm danh mục để phân loại thu chi cá nhân
                                </p>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 flex items-center justify-center transition-all duration-200 text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-6 space-y-6">

                            {/* Tên danh mục */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                    Tên danh mục
                                </label>

                                <input
                                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-650 transition-all duration-300 shadow-inner"
                                    placeholder="VD: Ăn uống, Lương, Mua sắm..."
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />
                            </div>

                            {/* Loại danh mục */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                                    Loại danh mục
                                </label>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm({ ...form, type: "expense" })
                                        }
                                        className={`flex-1 py-3 rounded-xl transition font-bold border transition-all duration-300 hover:scale-[1.02] active:scale-95 ${form.type === "expense"
                                            ? "bg-red-500/20 border-red-500/80 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                                            }`}
                                    >
                                        💳 Chi tiêu
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm({ ...form, type: "income" })
                                        }
                                        className={`flex-1 py-3 rounded-xl transition font-bold border transition-all duration-300 hover:scale-[1.02] active:scale-95 ${form.type === "income"
                                            ? "bg-green-500/20 border-green-500/80 text-green-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                                            }`}
                                    >
                                        🏦 Thu nhập
                                    </button>
                                </div>
                            </div>

                            {/* Chọn icon */}
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                                    Chọn icon
                                </p>

                                <div className="grid grid-cols-6 gap-3">
                                    {(form.type === "expense"
                                        ? expenseIcons
                                        : incomeIcons
                                    ).map((ic) => (
                                        <button
                                            key={ic}
                                            type="button"
                                            onClick={() =>
                                                setForm({ ...form, icon: ic })
                                            }
                                            className={`h-12 rounded-xl border text-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95
                                                ${form.icon === ic
                                                    ? "border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                                                    : "border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900"
                                                }`}
                                        >
                                            {ic}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Màu sắc */}
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                                    Màu sắc danh mục
                                </p>

                                <div className="flex gap-3 flex-wrap">
                                    {colors.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() =>
                                                setForm({ ...form, color: c })
                                            }
                                            className={`w-9 h-9 rounded-full border-2 transition-all duration-300 hover:scale-110 relative
                                                ${form.color === c
                                                    ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                                    : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: c }}
                                        >
                                            {form.color === c && (
                                                <div className="absolute inset-0.5 rounded-full border border-slate-950" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* FOOTER */}
                        <div className="px-6 py-5 bg-slate-950/40 border-t border-slate-800/80 flex gap-3">

                            <button
                                onClick={() => setOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-800 text-slate-300 font-medium transition-all duration-200 active:scale-95"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20"
                            >
                                Lưu danh mục
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
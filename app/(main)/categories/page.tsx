"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";

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
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

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

                alert(json.message);
                return;
            }

            setOpen(false);

            await fetchCategories();

        } catch (err) {

            console.error(err);
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = async (id: number) => {
        const ok = confirm(t("categories.confirm_delete"));
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
                alert(json.message);
                return;
            }

            setCategories((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = categories.filter((c) => {
        const matchTab = c.type === tab;

        const matchSearch =
            c.name.toLowerCase().includes(search.toLowerCase());

        return matchTab && matchSearch;
    });

    const expenseIcons = ["🍴", "🏠", "🚌", "🏥", "🛍️", "🎓", "🎭", "🏋️", "✈️", "🐾", "📱", "🧾"];
    const incomeIcons = ["💼", "📈", "🧧", "🏬", "🏦", "🔄"];

    const colors = ["#06b6d4", "#f97316", "#3b82f6", "#10b981", "#a855f7", "#eab308", "#ec4899", "#ef4444", "#6366f1", "#d946ef", "#f59e0b", "#84cc16", "#14b8a6", "#64748b"];

    const formatMoney = (v: number) =>
        v.toLocaleString("vi-VN") + "đ";

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
                                {t('categories.title')}
                            </h1>
                            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-cyan-500/20 tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                Categories
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">
                            {t('categories.subtitle')}
                        </p>
                    </div>
                </div>

                {/* SEARCH & FILTER */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <input
                        type="text"
                        placeholder={t('categories.search_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-80 bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 outline-none transition text-slate-200"
                    />

                    {/* BUTTON */}
                    <button
                        onClick={openCreate}
                        className="bg-cyan-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-cyan-400 transition whitespace-nowrap"
                    >
                        + {t('categories.new_category')}
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
                        💳 {t('categories.tab_expense')}
                    </button>

                    <button
                        onClick={() => setTab("income")}
                        className={`pb-3 font-bold transition-colors ${tab === "income"
                            ? "text-green-400 border-b-2 border-green-400"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        🏦 {t('categories.tab_income')}
                    </button>
                </div>

                {/* GRID */}
                {loading ? (
                    <p className="text-slate-400">Loading...</p>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        {filtered.map((item) => (
                            <div
                                key={item.id}
                                className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/5 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between h-[260px] shadow-[0_4px_25px_rgba(0,0,0,0.4)]"
                            >
                                <div>
                                    <div className="flex gap-4 items-start mb-5">
                                        {/* Icon with radial glow */}
                                        <div className="relative select-none flex-shrink-0">
                                            {/* Color glow backdrop */}
                                            <div 
                                                className="absolute inset-0 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-all duration-300 animate-pulse"
                                                style={{ backgroundColor: item.color || "#06b6d4" }}
                                            />
                                            <div
                                                className="relative w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105"
                                                style={{
                                                    color: item.color || "#06b6d4",
                                                    backgroundColor: `${item.color || "#06b6d4"}15`,
                                                    borderColor: `${item.color || "#06b6d4"}35`,
                                                }}
                                            >
                                                <span className="text-3xl">{item.icon || "📁"}</span>
                                            </div>
                                        </div>

                                        {/* Right text container */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-extrabold text-lg text-slate-100 group-hover:text-white transition-colors duration-200 truncate">
                                                {item.name}
                                            </h3>

                                            <div className="mt-1.5">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 border border-slate-800/80 shadow-inner transition-all duration-300 inline-block w-fit ${
                                                    item.type === "income"
                                                        ? "text-green-400 group-hover:border-green-500/30"
                                                        : "text-rose-400 group-hover:border-rose-500/30"
                                                }`}>
                                                    {item.type === "income" ? t('categories.tab_income') : t('categories.tab_expense')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs uppercase text-slate-500 mb-1 font-semibold tracking-wider">
                                        {t('categories.total_transactions')}
                                    </p>

                                    <p
                                        className={`text-3xl font-sans tabular-nums flex items-baseline gap-0.5 transition-all duration-300 ${item.type === "income"
                                            ? "text-green-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.15)] group-hover:text-green-300"
                                            : "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.15)] group-hover:text-rose-300"
                                            }`}
                                    >
                                        <span className="text-xl font-semibold opacity-85 leading-none mr-0.5">{item.type === "income" ? "+" : "-"}</span>
                                        <span className="text-3xl font-black tracking-tight leading-none">{Number(item.total_amount || 0).toLocaleString("vi-VN")}</span>
                                        <span className="text-xl font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center h-8">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")
                                                : t('sidebar.categories')}
                                        </span>
                                        {/* Slide-in and fade-in Actions */}
                                        <div className="flex gap-2 opacity-0 translate-x-3 scale-95 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 transition-all duration-300 origin-right">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-slate-400 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-slate-800/80"
                                                title={t('categories.delete_tooltip')}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* ADD BUTTON */}
                        <button
                            onClick={openCreate}
                            className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 border border-slate-800 border-dashed rounded-3xl p-6 h-[260px]
                                flex flex-col items-center justify-center
                                hover:border-cyan-400/60 hover:bg-slate-800/40 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-3xl mb-4 group-hover:scale-110 transition-transform">
                                +
                            </div>

                            <p className="font-bold text-white text-lg">
                                {t('categories.add_category')}
                            </p>

                            <p className="text-xs text-slate-400 mt-1 text-center max-w-[200px]">
                                {t('categories.add_desc')}
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
                                    {t('categories.modal_title')}
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                    {t('categories.modal_sub')}
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
                                    {t('categories.name_label')}
                                </label>

                                <input
                                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-650 transition-all duration-300 shadow-inner"
                                    placeholder={t('categories.name_placeholder')}
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />
                            </div>

                            {/* Loại danh mục */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                                    {t('categories.type_label')}
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
                                        💳 {t('categories.tab_expense')}
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
                                        🏦 {t('categories.tab_income')}
                                    </button>
                                </div>
                            </div>

                            {/* Chọn icon */}
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                                    {t('categories.icon_label')}
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
                                    {t('categories.color_label')}
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
                                {t('categories.cancel')}
                            </button>

                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20"
                            >
                                {t('categories.save')}
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
        const ok = confirm("Bạn có chắc muốn xóa danh mục?");
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

    return (
        <div className="bg-[#0F172A] min-h-screen text-white">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-24 p-8">

                {/* HEADER */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold mb-2">Danh mục</h1>
                    <p className="text-slate-400">
                        Quản lý danh mục thu chi của bạn
                    </p>
                </div>

                {/* SEARCH */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-80 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
                    />

                    {/* BUTTON */}
                    <button
                        onClick={openCreate}
                        className="bg-cyan-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-cyan-400 transition whitespace-nowrap"
                    >
                        + Danh mục mới
                    </button>
                </div>



                {/* TABS */}
                <div className="flex gap-8 border-b border-slate-700 mb-8">
                    <button
                        onClick={() => setTab("expense")}
                        className={`pb-3 font-bold ${tab === "expense"
                            ? "text-cyan-400 border-b-2 border-cyan-400"
                            : "text-slate-400"
                            }`}
                    >
                        💳 Chi tiêu
                    </button>

                    <button
                        onClick={() => setTab("income")}
                        className={`pb-3 font-bold ${tab === "income"
                            ? "text-green-400 border-b-2 border-green-400"
                            : "text-slate-400"
                            }`}
                    >
                        🏦 Thu nhập
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
                                className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-6 backdrop-blur-xl hover:border-cyan-400/40 transition-all flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-4">

                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{
                                            backgroundColor: `${item.color || "#06b6d4"}20`,
                                            color: item.color || "#06b6d4",
                                        }}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                    </div>

                                    <span className="text-xs text-slate-400">
                                        {item.created_at
                                            ? new Date(item.created_at).toLocaleDateString("vi-VN")
                                            : ""}
                                    </span>

                                </div>

                                <h3 className="text-xl font-bold mb-1">
                                    {item.name}
                                </h3>

                                <p className="text-sm text-slate-400">
                                    {item.type === "income" ? "Thu nhập" : "Chi tiêu"}
                                </p>

                                {/* TOTAL */}
                                <div className="mt-4 mb-6">
                                    <p className="text-xs uppercase text-slate-500 mb-1">
                                        Tổng giao dịch
                                    </p>

                                    <p
                                        className={`text-2xl font-bold ${item.type === "income"
                                            ? "text-green-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {item.type === "income" ? "+" : "-"}
                                        {Number(item.total_amount || 0).toLocaleString()}đ
                                    </p>
                                </div>

                                <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-slate-700">


                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-2 py-1 hover:text-red-500 transition"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* =========================
                            ADD CARD (GIỐNG WALLET)
                        ========================= */}
                        {/* ADD BUTTON */}
                        <button
                            onClick={openCreate}
                            className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-cyan-400 hover:bg-slate-800/40 transition min-h-[200px]"
                        >
                            <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-3xl mb-3">
                                +
                            </div>

                            <p className="font-bold text-white">
                                Thêm danh mục
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                                Tạo danh mục mới
                            </p>
                        </button>

                    </section>
                )}
            </main>

            {/* ================= MODAL ================= */}
            {open && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">

                    <div className="bg-[#1E293B]/90 border border-slate-700 rounded-2xl w-full max-w-lg">

                        {/* ================= HEADER ================= */}
                        <div className="p-5 border-b border-slate-700 flex justify-between items-start">

                            <div>
                                <h3 className="text-xl font-bold text-cyan-400">
                                    Tạo danh mục
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                    Thêm danh mục mới cho thu nhập hoặc chi tiêu
                                </p>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="text-slate-400 hover:text-white transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* ================= BODY ================= */}
                        <div className="p-5 space-y-5">

                            {/* NAME */}
                            <div>
                                <label className="text-sm text-slate-300 mb-2 block">
                                    Tên danh mục
                                </label>

                                <input
                                    className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-cyan-400"
                                    placeholder="VD: Ăn uống, Lương, Thu nhập..."
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />
                            </div>

                            {/* TYPE */}
                            <div>
                                <label className="text-sm text-slate-300 mb-2 block">
                                    Loại danh mục
                                </label>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            setForm({ ...form, type: "expense" })
                                        }
                                        className={`flex-1 p-3 rounded-xl transition font-bold ${form.type === "expense"
                                            ? "bg-cyan-500 text-black"
                                            : "bg-slate-700"
                                            }`}
                                    >
                                        💳 Chi tiêu
                                    </button>

                                    <button

                                        onClick={() =>
                                            setForm({ ...form, type: "income" })
                                        }
                                        className={`flex-1 p-3 rounded-xl transition font-bold ${form.type === "income"
                                            ? "bg-green-500 text-black"
                                            : "bg-slate-700"
                                            } }`}
                                    >
                                        🏦 Thu nhập
                                    </button>
                                </div>
                            </div>

                            {/* ICON */}
                            <div>
                                <label className="text-sm text-slate-300 mb-2 block">
                                    Icon
                                </label>

                                <div className="grid grid-cols-6 gap-2">
                                    {(form.type === "expense"
                                        ? expenseIcons
                                        : incomeIcons
                                    ).map((ic) => (
                                        <button
                                            key={ic}
                                            onClick={() =>
                                                setForm({ ...form, icon: ic })
                                            }
                                            className={`p-3 rounded-lg border text-xl ${form.icon === ic
                                                ? "border-cyan-400 bg-cyan-500/10"
                                                : "border-slate-700"
                                                }`}
                                        >
                                            {ic}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* COLOR */}
                            <div>
                                <label className="text-sm text-slate-300 mb-2 block">
                                    Màu sắc
                                </label>

                                <div className="flex gap-2 flex-wrap">
                                    {colors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() =>
                                                setForm({ ...form, color: c })
                                            }
                                            className={`w-9 h-9 rounded-full border-2 transition ${form.color === c
                                                ? "border-white scale-110"
                                                : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* ================= FOOTER ================= */}
                        <div className="p-5 border-t border-slate-700 flex gap-3">

                            <button
                                onClick={() => setOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition"
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
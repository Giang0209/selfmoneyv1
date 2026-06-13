"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Budget = {
    id: number;
    category_id: number;
    amount: string;
    month: number;
    year: number;
    created_at: string;

    category_name: string;
    category_icon: string;
    category_color: string;
};

type Category = {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    type?: "income" | "expense";
};

type Transaction = {
    id: number;
    category_id: number;
    amount: string;
    transaction_date: string;
    category_type?: "income" | "expense";
};

type FormState = {
    category_id: string;
    limit: string;
    month: number;
    year: number;
};

export default function BudgetsPage() {

    // ================= REAL DATA =================
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [loadingCate, setLoadingCate] = useState(false);

    // ================= FILTER =================
    const now = new Date();

    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [category, setCategory] = useState("all");
    const [search, setSearch] = useState("");

    // ================= MODAL =================
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [form, setForm] = useState<FormState>({
        category_id: "",
        limit: "",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
    });

    // ================= SAVE =================
    const [saving, setSaving] = useState(false);

    // ================= SAVING GOALS & WALLETS FOR SURPLUS =================
    const [savingGoals, setSavingGoals] = useState<any[]>([]);
    const [wallets, setWallets] = useState<any[]>([]);

    // Surplus transfer modal state
    const [surplusModal, setSurplusModal] = useState(false);
    const [selectedSurplusBudget, setSelectedSurplusBudget] = useState<any | null>(null);
    const [surplusTargetGoalId, setSurplusTargetGoalId] = useState<number | "">("");
    const [surplusWalletId, setSurplusWalletId] = useState("");
    const [surplusAmount, setSurplusAmount] = useState("");
    const [transferringSurplus, setTransferringSurplus] = useState(false);

    // ================= FETCH ALL =================
    const fetchAll = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            setLoadingCate(true);
            const [cateRes, budgetRes, transRes, goalsRes, walletsRes] = await Promise.all([
                fetch("/api/categories", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch("/api/budgets", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch("/api/transactions", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch("/api/saving-goals", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch("/api/wallets", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            const [cateJson, budgetJson, transJson, goalsJson, walletsJson] = await Promise.all([
                cateRes.json(),
                budgetRes.json(),
                transRes.json(),
                goalsRes.json(),
                walletsRes.json(),
            ]);

            setCategories(cateJson || []);
            setBudgets(budgetJson || []);
            setTransactions(transJson || []);
            setSavingGoals(goalsJson || []);
            setWallets(walletsJson || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCate(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // ================= OPEN CREATE =================
    const openCreate = () => {

        setEditingId(null);

        setForm({
            category_id: "",
            limit: "",
            month,
            year,
        });

        setOpen(true);
    };

    // ================= EDIT =================
    const handleEdit = (item: any) => {

        setEditingId(item.id);

        setForm({
            category_id: String(item.category_id),
            limit: String(item.limit),
            month: item.month,
            year: item.year,
        });

        setOpen(true);
    };

    // ================= DELETE =================
    const handleDelete = async (id: number) => {

        const ok = confirm(
            "Bạn có chắc muốn xóa ngân sách?"
        );

        if (!ok) return;

        try {

            const token = localStorage.getItem("token");

            const res = await fetch(`/api/budgets/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();

            if (!res.ok) {

                alert(json.message || "Xóa thất bại");
                return;
            }

            setBudgets((prev) =>
                prev.filter((b) => b.id !== id)
            );

        } catch (err) {

            console.error(err);
            alert("Lỗi hệ thống");
        }
    };

    const closeModal = () => setOpen(false);

    // ================= MONTH RANGE =================
    const getMonthRange = (
        month: number,
        year: number
    ) => {

        const start = new Date(
            year,
            month - 1,
            1,
            0,
            0,
            0
        );

        const end = new Date(
            year,
            month,
            0,
            23,
            59,
            59
        );

        return { start, end };
    };

    // ================= SPENT =================
    const getSpent = (
        categoryId: number,
        month: number,
        year: number
    ) => {

        const { start, end } = getMonthRange(
            month,
            year
        );

        return transactions
            .filter((t) => {

                const date = new Date(
                    t.transaction_date
                );

                return (
                    t.category_id === categoryId &&
                    t.category_type === "expense" &&
                    date >= start &&
                    date <= end
                );
            })
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount),
                0
            );
    };

    // ================= MERGE DATA =================
    const budgetView = useMemo(() => {

        return budgets.map((b) => ({
            id: b.id,
            category_id: b.category_id,
            name: b.category_name,
            icon: b.category_icon,
            color: b.category_color,
            month: b.month,
            year: b.year,
            limit: Number(b.amount),
            spent: getSpent(
                b.category_id,
                b.month,
                b.year
            ),
            created_at: b.created_at,
        }));

    }, [budgets, transactions]);

    // ================= FILTER =================
    const filtered = useMemo(() => {

        return budgetView.filter((b) => {

            const matchDate =
                b.month === month &&
                b.year === year;

            const matchCategory =
                category === "all" ||
                b.category_id === Number(category);

            const matchSearch =
                b.name
                    .toLowerCase()
                    .includes(search.toLowerCase());

            return (
                matchDate &&
                matchCategory &&
                matchSearch
            );
        });

    }, [
        budgetView,
        month,
        year,
        category,
        search,
    ]);

    const formatMoney = (v: number) =>
        Math.round(v).toLocaleString("vi-VN") + " đ";

    const getPercent = (
        spent: number,
        limit: number
    ) =>
        limit === 0
            ? 0
            : Math.min(
                100,
                (spent / limit) * 100
            );

    // ================= SAVE =================
    const handleSave = async () => {

        try {

            const token =
                localStorage.getItem("token");

            if (
                !form.category_id ||
                !form.limit
            ) {

                alert(
                    "Vui lòng nhập đủ dữ liệu"
                );

                return;
            }

            setSaving(true);

            const isEdit =
                editingId !== null;

            const url = isEdit
                ? `/api/budgets/${editingId}`
                : "/api/budgets";

            const method = isEdit
                ? "PATCH"
                : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    category_id: Number(
                        form.category_id
                    ),
                    amount: Number(
                        form.limit
                    ),
                    month: form.month,
                    year: form.year,
                }),
            });

            const json = await res.json();

            if (!res.ok) {

                alert(
                    json.message ||
                    "Lưu thất bại"
                );

                return;
            }

            alert(
                isEdit
                    ? "Cập nhật ngân sách thành công"
                    : "Tạo ngân sách thành công"
            );

            setOpen(false);

            setEditingId(null);

            setForm({
                category_id: "",
                limit: "",
                month,
                year,
            });

            fetch("/api/budgets", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((r) => r.json())
                .then(setBudgets);

        } catch (err) {

            console.error(err);
            alert("Lỗi hệ thống");

        } finally {

            setSaving(false);
        }
    };

    const handleSurplusTransfer = async () => {
        if (!surplusTargetGoalId || !surplusAmount || !surplusWalletId) {
            alert("Vui lòng chọn mục tiêu, ví nguồn và nhập số tiền");
            return;
        }
        const token = localStorage.getItem("token");
        try {
            setTransferringSurplus(true);
            const res = await fetch(`/api/saving-goals/${surplusTargetGoalId}/contribute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    wallet_id: Number(surplusWalletId),
                    amount: Number(surplusAmount),
                    note: `Chuyển dư ngân sách danh mục ${selectedSurplusBudget?.name || ""}`,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Chuyển tiền thất bại");

            alert("Chuyển dư ngân sách vào mục tiêu tiết kiệm thành công!");
            setSurplusModal(false);
            setSurplusTargetGoalId("");
            setSurplusWalletId("");
            setSelectedSurplusBudget(null);
            await fetchAll();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setTransferringSurplus(false);
        }
    };

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
                                Ngân sách
                            </h1>
                            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-cyan-500/20 tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                Budgets
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">
                            Lập kế hoạch ngân sách thông minh và kiểm soát các khoản chi tiêu
                        </p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="bg-cyan-500 text-black px-5 py-2.5 rounded-2xl font-bold hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-200"
                    >
                        + Tạo ngân sách
                    </button>
                </div>

                {/* FILTER */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 mb-6 space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(
                                    e.target.value
                                )
                            }
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 outline-none transition text-slate-200"
                        >
                            <option value="all">
                                Tất cả danh mục
                            </option>

                            {categories
                                .filter(
                                    (c) =>
                                        c.type ===
                                        "expense"
                                )
                                .map((c) => (
                                    <option
                                        key={c.id}
                                        value={c.id}
                                    >
                                        {c.icon}{" "}
                                        {c.name}
                                    </option>
                                ))}
                        </select>

                        <select
                            value={month}
                            onChange={(e) =>
                                setMonth(
                                    Number(
                                        e.target.value
                                    )
                                )
                            }
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 outline-none transition text-slate-200"
                        >
                            {Array.from({
                                length: 12,
                            }).map((_, i) => (
                                <option
                                    key={i}
                                    value={i + 1}
                                >
                                    Tháng {i + 1}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            value={year}
                            onChange={(e) =>
                                setYear(
                                    Number(
                                        e.target.value
                                    )
                                )
                            }
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-center outline-none transition text-slate-200"
                        />
                    </div>

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Tìm kiếm..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 outline-none transition text-slate-200"
                    />
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {filtered.map((b) => {

                        const percent = getPercent(
                            b.spent,
                            b.limit
                        );

                        return (
                            <div
                                key={b.id}
                                className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/5 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between h-[260px] shadow-[0_4px_25px_rgba(0,0,0,0.4)]"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl border transition-all duration-300 group-hover:scale-110"
                                            style={{
                                                backgroundColor: `${b.color || "#06b6d4"}15`,
                                                color: b.color || "#06b6d4",
                                                borderColor: `${b.color || "#06b6d4"}30`,
                                            }}
                                        >
                                            {b.icon || "💸"}
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-lg text-slate-100 group-hover:text-cyan-400 transition-colors">
                                                {b.name}
                                            </h3>

                                            <p className="text-sm text-slate-400 mt-0.5">
                                                Tháng {b.month}/{b.year}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-base mb-2 mt-6 items-baseline">
                                        <span className="text-slate-400 font-sans tabular-nums">
                                            <span className="font-semibold text-slate-200 text-base">{Math.round(b.spent).toLocaleString("vi-VN")}</span>
                                            <span className="opacity-75 ml-0.5 mr-1.5">đ</span>
                                            <span className="text-base text-slate-600 font-normal mx-1">/</span>
                                            <span className="font-semibold text-slate-500 text-base">{Math.round(b.limit).toLocaleString("vi-VN")}</span>
                                            <span className="opacity-75 ml-0.5">đ</span>
                                        </span>

                                        <span className="font-bold font-sans tabular-nums text-base" style={{ color: b.color || "#06b6d4" }}>
                                            {percent.toFixed(1)}%
                                        </span>
                                    </div>

                                    <div className="relative h-3.5 w-full bg-slate-950/85 border border-slate-850 rounded-full p-[2px] overflow-hidden shadow-inner">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 relative"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: b.color || "#06b6d4",
                                                boxShadow: `0 0 10px ${b.color || "#06b6d4"}90`,
                                            }}
                                        >
                                            {/* Subtle reflection shine */}
                                            <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end items-center gap-2">
                                    {(b.year < now.getFullYear() || (b.year === now.getFullYear() && b.month < now.getMonth() + 1)) && (b.limit - b.spent > 0) && (
                                        <button
                                            onClick={() => {
                                                setSelectedSurplusBudget(b);
                                                setSurplusAmount(String(b.limit - b.spent));
                                                setSurplusWalletId(wallets[0]?.id || "");
                                                const linkedGoal = savingGoals.find((g) => g.category_id === b.category_id && g.status === "active");
                                                if (linkedGoal) {
                                                    setSurplusTargetGoalId(linkedGoal.id);
                                                } else {
                                                    setSurplusTargetGoalId("");
                                                }
                                                setSurplusModal(true);
                                            }}
                                            className="mr-auto text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition duration-200 active:scale-95"
                                            title="Chuyển ngân sách dư cuối tháng vào mục tiêu tiết kiệm"
                                        >
                                            Chuyển dư →
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleEdit(b)}
                                        className="text-slate-400 hover:text-cyan-400 transition p-1.5 rounded-lg hover:bg-slate-800/80"
                                        title="Sửa ngân sách"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => handleDelete(b.id)}
                                        className="text-slate-400 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-slate-800/80"
                                        title="Xóa ngân sách"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div
                                    className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent group-hover:via-cyan-400 transition-all duration-300"
                                    style={{
                                        background: `linear-gradient(to right, transparent, ${b.color || "#06b6d4"}80, transparent)`
                                    }}
                                />
                            </div>
                        );
                    })}

                    {/* ADD CARD TRIGGER */}
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
                            Tạo ngân sách
                        </p>

                        <p className="text-xs text-slate-400 mt-1 text-center max-w-[200px]">
                            Thiết lập giới hạn chi tiêu theo danh mục
                        </p>
                    </button>

                </div>
            </main>

            {/* ===== STANDARDIZED PREMIUM MODAL ===== */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">

                    <div className="bg-[#0b1329]/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden relative transform transition-all">
                        {/* Radiant decorative top line */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

                        {/* HEADER */}
                        <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/20">

                            <div>
                                <h3 className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    {editingId ? "Sửa ngân sách" : "Tạo ngân sách"}
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                    {editingId
                                        ? "Cập nhật ngân sách hiện tại"
                                        : "Thiết lập giới hạn chi tiêu theo danh mục"}
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 flex items-center justify-center transition-all duration-200 text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-6 space-y-6">

                            {/* CATEGORY */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                    Danh mục chi tiêu
                                </label>

                                <select
                                    disabled={editingId !== null}
                                    value={form.category_id}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            category_id: e.target.value,
                                        })
                                    }
                                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-650 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                                >
                                    <option value="" className="bg-slate-950 text-slate-400">
                                        Chọn danh mục
                                    </option>

                                    {categories
                                        .filter(
                                            (c) => c.type === "expense"
                                        )
                                        .map((c) => (
                                            <option
                                                key={c.id}
                                                value={c.id}
                                                className="bg-slate-950 text-slate-200"
                                            >
                                                {c.icon} {c.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* LIMIT */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                    Ngân sách giới hạn
                                </label>

                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl blur-sm" />
                                    <input
                                        type="number"
                                        value={form.limit}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                limit: e.target.value,
                                            })
                                        }
                                        className="relative w-full bg-slate-950/80 border border-slate-800/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-5 py-4 text-right text-3xl font-extrabold text-cyan-400 placeholder-cyan-500/30 transition-all duration-300 font-mono tracking-tight"
                                        placeholder="0"
                                    />

                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-500/60 uppercase tracking-wider">
                                        VND
                                    </span>
                                </div>
                            </div>

                            {/* MONTH + YEAR */}
                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                        Tháng
                                    </label>

                                    <select
                                        disabled={editingId !== null}
                                        value={form.month}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                month: Number(e.target.value),
                                            })
                                        }
                                        className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-650 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                                    >
                                        {Array.from({
                                            length: 12,
                                        }).map((_, i) => (
                                            <option
                                                key={i}
                                                value={i + 1}
                                                className="bg-slate-950 text-slate-200"
                                            >
                                                Tháng {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                        Năm
                                    </label>

                                    <input
                                        disabled={editingId !== null}
                                        type="number"
                                        value={form.year}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                year: Number(e.target.value),
                                            })
                                        }
                                        className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-center text-slate-200 placeholder-slate-650 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="px-6 py-5 bg-slate-950/40 border-t border-slate-800/80 flex gap-3">

                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-800 text-slate-300 font-medium transition-all duration-200 active:scale-95"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving
                                    ? "Đang lưu..."
                                    : editingId
                                        ? "Cập nhật ngân sách"
                                        : "Lưu ngân sách"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Surplus Transfer Modal ── */}
            {surplusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-[#0b1329]/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

                        <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-extrabold text-emerald-400">Chuyển dư vào mục tiêu</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Dư ngân sách {selectedSurplusBudget?.name || ""}: <span className="text-emerald-400 font-bold">{formatMoney(selectedSurplusBudget ? selectedSurplusBudget.limit - selectedSurplusBudget.spent : 0)}</span></p>
                            </div>
                            <button onClick={() => setSurplusModal(false)} className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Chọn mục tiêu tiết kiệm</label>
                                <select
                                    value={surplusTargetGoalId}
                                    onChange={(e) => setSurplusTargetGoalId(Number(e.target.value))}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 transition text-sm"
                                >
                                    <option value="">Chọn mục tiêu...</option>
                                    {savingGoals.filter((g) => g.status === "active").map((g) => (
                                        <option key={g.id} value={g.id} className="bg-slate-950">
                                            {g.icon} {g.name} — còn thiếu {formatMoney(Number(g.target_amount) - Number(g.saved_amount))}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Ví nguồn</label>
                                <select
                                    value={surplusWalletId}
                                    onChange={(e) => setSurplusWalletId(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 transition text-sm"
                                >
                                    <option value="">Chọn ví...</option>
                                    {wallets.map((w) => (
                                        <option key={w.id} value={w.id} className="bg-slate-950">
                                            {w.icon} {w.name} ({formatMoney(Number(w.balance))})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Số tiền chuyển (VND)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={surplusAmount}
                                        onChange={(e) => setSurplusAmount(e.target.value)}
                                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-5 py-4 text-right text-2xl font-extrabold text-emerald-400 outline-none transition font-mono"
                                    />
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500/60 uppercase">VND</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5 text-right">Tối đa: {formatMoney(selectedSurplusBudget ? selectedSurplusBudget.limit - selectedSurplusBudget.spent : 0)}</p>
                            </div>
                        </div>

                        <div className="px-6 py-5 bg-slate-950/40 border-t border-slate-800/80 flex gap-3">
                            <button onClick={() => setSurplusModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition text-sm">Bỏ qua</button>
                            <button onClick={handleSurplusTransfer} disabled={transferringSurplus} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold transition text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                                {transferringSurplus ? "Đang chuyển..." : "Chuyển tiền ✓"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
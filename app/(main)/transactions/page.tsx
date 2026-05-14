"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Transaction = {
    id: number;
    amount: string;
    note: string;
    transaction_date: string;

    category_name: string;
    category_type: "income" | "expense";
    category_icon: string;
    category_color: string;

    wallet_name: string;
};

type Category = {
    id: number;
    name: string;
    type: "income" | "expense";
    icon: string;
    color: string;
};

type Wallet = {
    id: number;
    name: string;
    balance: string;
};

export default function TransactionPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);

    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);

    // ===== NEW =====
    const [editingId, setEditingId] = useState<number | null>(null);

    const [form, setForm] = useState({
        amount: "",
        category_id: "",
        wallet_id: "",
        note: "",
    });

    const [filters, setFilters] = useState({
        search: "",
        category: "",
        wallet: "",
        from: "",
        to: "",
    });

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        await Promise.all([
            fetchTransactions(),
            fetchCategories(),
            fetchWallets(),
        ]);
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/transactions", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            setTransactions(json || []);
        } catch {
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            setCategories(json || []);
        } catch {
            setCategories([]);
        }
    };

    const fetchWallets = async () => {
        try {
            const res = await fetch("/api/wallets", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            setWallets(json || []);
        } catch {
            setWallets([]);
        }
    };

    // =========================
    // CREATE + UPDATE
    // =========================
    const handleSave = async () => {
        try {
            const isEdit = editingId !== null;

            const url = isEdit
                ? `/api/transactions/${editingId}`
                : "/api/transactions";

            const method = isEdit ? "PATCH" : "POST";

            await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: Number(form.amount),
                    category_id: Number(form.category_id),
                    wallet_id: Number(form.wallet_id),
                    note: form.note,
                    transaction_date: new Date().toISOString(),
                }),
            });

            setOpenModal(false);
            setEditingId(null);

            setForm({
                amount: "",
                category_id: "",
                wallet_id: "",
                note: "",
            });

            fetchTransactions();
        } catch (err) {
            console.error(err);
        }
    };

    // =========================
    // EDIT
    // =========================
    const handleEdit = (t: Transaction) => {
        setEditingId(t.id);

        // tìm category hiện tại
        const currentCategory = categories.find(
            (c) =>
                c.name === t.category_name &&
                c.type === t.category_type
        );

        // tìm wallet hiện tại
        const currentWallet = wallets.find(
            (w) => w.name === t.wallet_name
        );

        setForm({
            amount: String(t.amount),
            category_id: currentCategory
                ? String(currentCategory.id)
                : "",
            wallet_id: currentWallet
                ? String(currentWallet.id)
                : "",
            note: t.note || "",
        });

        setOpenModal(true);
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = async (id: number) => {
        const ok = confirm("Bạn có chắc muốn xóa giao dịch?");
        if (!ok) return;

        try {
            await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setTransactions((prev) =>
                prev.filter((t) => t.id !== id)
            );
        } catch (err) {
            console.error(err);
        }
    };

    // ===== SUMMARY =====
    const income = useMemo(
        () =>
            transactions
                .filter((t) => t.category_type === "income")
                .reduce((s, t) => s + Number(t.amount), 0),
        [transactions]
    );

    const expense = useMemo(
        () =>
            transactions
                .filter((t) => t.category_type === "expense")
                .reduce((s, t) => s + Number(t.amount), 0),
        [transactions]
    );

    const balance = useMemo(
        () =>
            wallets.reduce(
                (sum, wallet) => sum + Number(wallet.balance || 0),
                0
            ),
        [wallets]
    );

    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const keyword = filters.search.toLowerCase();

            const matchSearch =
                t.note?.toLowerCase().includes(keyword) ||
                t.category_name.toLowerCase().includes(keyword);

            const matchCategory =
                !filters.category || t.category_name === filters.category;

            const matchWallet =
                !filters.wallet || t.wallet_name === filters.wallet;

            const fromDate = filters.from
                ? new Date(filters.from + "T00:00:00")
                : null;

            const toDate = filters.to
                ? new Date(filters.to + "T23:59:59")
                : null;

            const date = new Date(t.transaction_date);

            const matchFrom = !fromDate || date >= fromDate;
            const matchTo = !toDate || date <= toDate;

            return (
                matchSearch &&
                matchCategory &&
                matchWallet &&
                matchFrom &&
                matchTo
            );
        });
    }, [transactions, filters]);

    const isEdit = editingId !== null;

    return (
        <div className="bg-[#0F172A] min-h-screen text-white">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-24 p-8">

                {/* HEADER */}
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Danh sách giao dịch</h1>
                        <p className="text-slate-400">Quản lý thu chi cá nhân</p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingId(null);
                            setOpenModal(true);
                        }}
                        className="bg-cyan-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-cyan-400"
                    >
                        + Giao dịch mới
                    </button>
                </div>

                {/* ===== OVERVIEW (MATCH DASHBOARD STYLE) ===== */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    {/* INCOME */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">

                        <div className="flex items-center justify-between mb-5">

                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 text-2xl">
                                💵
                            </div>

                            <span className="text-xs text-green-400 font-bold">
                                Thu nhập
                            </span>

                        </div>

                        <p className="text-slate-400 text-sm mb-1">
                            Tổng thu nhập
                        </p>

                        <h2 className="text-3xl font-bold text-green-400">
                            +{income.toLocaleString()}đ
                        </h2>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-green-500 to-transparent" />

                    </div>

                    {/* EXPENSE */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">

                        <div className="flex items-center justify-between mb-5">

                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 text-2xl">
                                💳
                            </div>

                            <span className="text-xs text-red-400 font-bold">
                                Chi tiêu
                            </span>

                        </div>

                        <p className="text-slate-400 text-sm mb-1">
                            Tổng chi tiêu
                        </p>

                        <h2 className="text-3xl font-bold text-red-400">
                            -{expense.toLocaleString()}đ
                        </h2>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />

                    </div>

                    {/* BALANCE */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">

                        <div className="flex items-center justify-between mb-5">

                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl">
                                💰
                            </div>

                            <span className="text-xs text-cyan-400 font-bold">
                                Số dư
                            </span>

                        </div>

                        <p className="text-slate-400 text-sm mb-1">
                            Số dư hiện tại
                        </p>

                        <h2 className={`text-3xl font-bold ${balance >= 0 ? "text-cyan-400" : "text-red-400"}`}>
                            {balance >= 0 ? "+" : "-"}
                            {Math.abs(balance).toLocaleString()}đ
                        </h2>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

                    </div>

                </section>

                {/* FILTER */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 mb-6">

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                        {/* SEARCH */}
                        <input
                            type="text"
                            placeholder="Tìm ghi chú / danh mục..."
                            value={filters.search}
                            onChange={(e) =>
                                setFilters({ ...filters, search: e.target.value })
                            }
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                        />

                        {/* CATEGORY */}
                        <select
                            value={filters.category}
                            onChange={(e) =>
                                setFilters({ ...filters, category: e.target.value })
                            }
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                    {c.icon} {c.name}
                                </option>
                            ))}
                        </select>

                        {/* WALLET */}
                        <select
                            value={filters.wallet}
                            onChange={(e) =>
                                setFilters({ ...filters, wallet: e.target.value })
                            }
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                        >
                            <option value="">Tất cả ví</option>
                            {wallets.map((w) => (
                                <option key={w.id} value={w.name}>
                                    {w.name}
                                </option>
                            ))}
                        </select>

                        {/* FROM */}
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) =>
                                setFilters({ ...filters, from: e.target.value })
                            }
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                        />

                        {/* TO */}
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) =>
                                setFilters({ ...filters, to: e.target.value })
                            }
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                        />
                    </div>
                </div>

                {/* LIST */}
                {loading ? (
                    <p className="text-slate-400">Loading...</p>
                ) : filteredTransactions.length === 0 ? (
                    <p className="text-slate-500">Chưa có giao dịch</p>
                ) : (
                    <div className="space-y-3">
                        {filteredTransactions.map((t) => (
                            <div
                                key={t.id}
                                className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center hover:bg-slate-800/50 transition"
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 border"
                                    style={{
                                        color: t.category_color,
                                        backgroundColor: `${t.category_color}20`,
                                        borderColor: `${t.category_color}40`,
                                    }}
                                >
                                    <span className="text-xl">{t.category_icon}</span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold">{t.category_name}</h3>
                                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded">
                                            {t.wallet_name}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-400">{t.note}</p>
                                </div>

                                <div className="text-right">
                                    <div className={`font-bold text-lg ${t.category_type === "income"
                                        ? "text-green-400"
                                        : "text-red-400"
                                        }`}>
                                        {t.category_type === "income" ? "+" : "-"}
                                        {Number(t.amount).toLocaleString()}đ
                                    </div>

                                    <div className="text-xs text-slate-500">
                                        {new Date(t.transaction_date).toLocaleDateString("vi-VN", {
                                            timeZone: "Asia/Ho_Chi_Minh",
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                    </div>

                                    {/* ACTION */}
                                    <div className="flex gap-2 justify-end mt-2 text-sm">
                                        <button onClick={() => handleEdit(t)}>✏️</button>
                                        <button onClick={() => handleDelete(t.id)}>🗑️</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ================= MODAL ================= */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">

                    <div className="w-full max-w-lg bg-slate-900/90 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">

                        {/* ================= HEADER ================= */}
                        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-cyan-400">
                                    {isEdit ? "Chỉnh sửa giao dịch" : "Thêm giao dịch"}
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Nhập thông tin giao dịch của bạn
                                </p>
                            </div>

                            <button
                                onClick={() => setOpenModal(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* ================= BODY ================= */}
                        <div className="p-6 space-y-6">

                            {/* AMOUNT */}
                            <div>
                                <label className="text-xs text-slate-400 uppercase">
                                    Số tiền giao dịch
                                </label>

                                <div className="relative mt-2">
                                    <input
                                        value={form.amount}
                                        onChange={(e) =>
                                            setForm({ ...form, amount: e.target.value })
                                        }
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-right text-2xl font-bold text-red-300 focus:border-cyan-500 outline-none"
                                        placeholder="0"
                                    />

                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                        VND
                                    </span>
                                </div>
                            </div>

                            {/* CATEGORY + WALLET */}
                            <div className="grid grid-cols-2 gap-4">

                                {/* CATEGORY */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase">
                                        Danh mục
                                    </label>

                                    <select
                                        value={form.category_id}
                                        disabled={isEdit}
                                        onChange={(e) =>
                                            setForm({ ...form, category_id: e.target.value })
                                        }
                                        className={`mt-2 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 
        ${isEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <option value="">Chọn danh mục</option>

                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.icon} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* WALLET */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase">
                                        Ví tiền
                                    </label>

                                    <select
                                        value={form.wallet_id}
                                        disabled={isEdit}
                                        onChange={(e) =>
                                            setForm({ ...form, wallet_id: e.target.value })
                                        }
                                        className={`mt-2 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3
        ${isEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <option value="">Chọn ví</option>

                                        {wallets.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            {/* NOTE */}
                            <div>
                                <label className="text-xs text-slate-400 uppercase">
                                    Ghi chú
                                </label>

                                <textarea
                                    value={form.note}
                                    onChange={(e) =>
                                        setForm({ ...form, note: e.target.value })
                                    }
                                    className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 min-h-[100px]"
                                    placeholder="Ví dụ: ăn trưa, mua sắm..."
                                />
                            </div>
                        </div>

                        {/* ================= FOOTER ================= */}
                        <div className="px-6 py-5 border-t border-slate-800 flex justify-end gap-3">

                            <button
                                onClick={() => setOpenModal(false)}
                                className="px-5 py-2 border border-slate-700 rounded-xl hover:bg-slate-800 transition"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-cyan-500 text-black rounded-xl font-bold hover:bg-cyan-400 transition"
                            >
                                {isEdit ? "Cập nhật" : "Lưu giao dịch"}
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
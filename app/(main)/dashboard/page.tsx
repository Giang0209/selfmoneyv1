"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Link from "next/link";

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

type Wallet = {
    id: number;
    name: string;
    balance: string;
    icon: string;
};

type CategorySummary = {
    name: string;
    amount: number;
    percent: number;
    color: string;
    icon: string;
    type: "income" | "expense";
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [topCategories, setTopCategories] = useState<CategorySummary[]>([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const [walletRes, transactionRes] = await Promise.all([
                fetch("/api/wallets", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                fetch("/api/transactions", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            const walletJson = await walletRes.json();
            const transactionJson = await transactionRes.json();

            const walletData = Array.isArray(walletJson)
                ? walletJson
                : walletJson.data || [];

            const transactionData = Array.isArray(transactionJson)
                ? transactionJson
                : transactionJson.data || [];

            setWallets(walletData);
            setTransactions(transactionData);

            // ===== CATEGORY SUMMARY =====
            // lấy cả income + expense giống transaction page

            const categoryMap: Record<
                string,
                {
                    name: string;
                    amount: number;
                    color: string;
                    icon: string;
                    type: "income" | "expense";
                }
            > = {};

            transactionData.forEach((t: Transaction) => {
                const key = `${t.category_name}-${t.category_type}`;

                if (!categoryMap[key]) {
                    categoryMap[key] = {
                        name: t.category_name,
                        amount: 0,
                        color: t.category_color,
                        icon: t.category_icon || "💸",
                        type: t.category_type, // 👈 giữ type thật
                    };
                }

                categoryMap[key].amount += Number(t.amount);
            });

            const totalCategoryAmount = Object.values(categoryMap).reduce(
                (sum, item) => sum + item.amount,
                0
            );

            const categoryList: CategorySummary[] = Object.values(categoryMap)
                .map((item) => ({
                    name: item.name,
                    amount: item.amount,
                    color: item.color,
                    icon: item.icon,
                    type: item.type, // 👈 giữ luôn
                    percent:
                        totalCategoryAmount > 0
                            ? Math.round((item.amount / totalCategoryAmount) * 100)
                            : 0,
                }))
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);

            setTopCategories(categoryList);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ===== TOTAL INCOME =====
    const totalIncome = useMemo(() => {
        return transactions
            .filter((t) => t.category_type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0);
    }, [transactions]);

    // ===== TOTAL EXPENSE =====
    const totalExpense = useMemo(() => {
        return transactions
            .filter((t) => t.category_type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);
    }, [transactions]);

    // ===== BALANCE FROM WALLETS =====
    const balance = useMemo(() => {
        return wallets.reduce(
            (sum, wallet) => sum + Number(wallet.balance || 0),
            0
        );
    }, [wallets]);

    // ===== RECENT TRANSACTION =====
    const recentTransactions = useMemo(() => {
        return [...transactions]
            .sort(
                (a, b) =>
                    new Date(b.transaction_date).getTime() -
                    new Date(a.transaction_date).getTime()
            )
            .slice(0, 6);
    }, [transactions]);

    // ===== MONTHLY CHART DATA =====
    const monthlyData = useMemo(() => {

        const months = Array.from({ length: 12 }, (_, i) => ({
            label: `T${i + 1}`,
            income: 0,
            expense: 0,
        }));

        transactions.forEach((t) => {
            const date = new Date(t.transaction_date);

            const year = date.getFullYear();
            if (year !== selectedYear) return;

            const monthIndex = date.getMonth();
            const amount = Number(t.amount);

            if (t.category_type === "income") {
                months[monthIndex].income += amount;
            } else {
                months[monthIndex].expense += amount;
            }
        });

        const maxValue = Math.max(
            ...months.flatMap((m) => [m.income, m.expense]),
            1
        );

        return months.map((m) => ({
            ...m,
            incomeHeight: (m.income / maxValue) * 100,
            expenseHeight: (m.expense / maxValue) * 100,
        }));

    }, [transactions, selectedYear]);

    return (
        <div className="bg-[#0F172A] min-h-screen text-white">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-24 p-8">

                {/* ===== TOP ===== */}
                <div className="mb-10 flex items-end justify-between">

                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Dashboard
                        </h1>

                        <p className="text-slate-400">
                            Tổng quan tài chính cá nhân của bạn
                        </p>
                    </div>

                </div>

                {/* ===== OVERVIEW ===== */}
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
                            +{totalIncome.toLocaleString()}đ
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
                            -{totalExpense.toLocaleString()}đ
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

                        <h2
                            className={`text-3xl font-bold ${balance >= 0 ? "text-cyan-400" : "text-red-400"
                                }`}
                        >
                            {balance >= 0 ? "+" : "-"}
                            {Math.abs(balance).toLocaleString()}đ
                        </h2>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

                    </div>

                </section>

                {/* ===== CHART + CATEGORY ===== */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">


                    {/* CHART */}
                    <div className="xl:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold mb-1">
                                    Biểu đồ thu chi
                                </h3>

                                <p className="text-slate-400 text-sm">
                                    Năm {selectedYear}
                                </p>
                            </div>

                            <input
                                type="number"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm w-24 text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                min={2000}
                                max={2100}
                            />
                        </div>

                        {/* REAL CHART */}
                        <div
                            className="
        h-72
        overflow-x-auto
        overflow-y-visible
        xl:overflow-visible
        pb-10
        [&::-webkit-scrollbar]:h-2
        [&::-webkit-scrollbar-track]:bg-slate-800/40
        [&::-webkit-scrollbar-thumb]:bg-slate-700
        [&::-webkit-scrollbar-thumb]:rounded-full
    "
                        >
                            <div
                                className="
            relative isolate
            h-full flex items-end justify-between gap-2
            min-w-[720px] xl:min-w-0
        "
                            >

                                {monthlyData.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col items-center justify-end h-full flex-1"
                                    >

                                        <div className="flex items-end gap-2 h-full">

                                            {/* INCOME */}
                                            <div className="relative group flex items-end h-full">

                                                {/* TOOLTIP */}
                                                <div
                                                    className="
                                absolute bottom-full left-1/2
                                -translate-x-1/2 mb-3
                                opacity-0 invisible
                                group-hover:opacity-100
                                group-hover:visible
                                transition-all duration-200
                                z-50
                                pointer-events-none
                            "
                                                >
                                                    <div className="bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">

                                                        <p className="text-[11px] text-slate-400">
                                                            {item.label}
                                                        </p>

                                                        <p className="text-sm font-bold text-green-400">
                                                            Thu nhập: +{item.income.toLocaleString()}đ
                                                        </p>

                                                    </div>
                                                </div>

                                                <div
                                                    className="
                                w-5 md:w-6 rounded-t-xl
                                bg-green-400/90
                                hover:bg-green-300
                                transition
                            "
                                                    style={{
                                                        height: `${item.incomeHeight}%`,
                                                        minHeight:
                                                            item.income > 0 ? "10px" : "0px",
                                                    }}
                                                />

                                            </div>

                                            {/* EXPENSE */}
                                            <div className="relative group flex items-end h-full">

                                                {/* TOOLTIP */}
                                                <div
                                                    className="
                                absolute bottom-full left-1/2
                                -translate-x-1/2 mb-3
                                opacity-0 invisible
                                group-hover:opacity-100
                                group-hover:visible
                                transition-all duration-200
                                z-50
                                pointer-events-none
                            "
                                                >
                                                    <div className="bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">

                                                        <p className="text-[11px] text-slate-400">
                                                            {item.label}
                                                        </p>

                                                        <p className="text-sm font-bold text-red-400">
                                                            Chi tiêu: -{item.expense.toLocaleString()}đ
                                                        </p>

                                                    </div>
                                                </div>

                                                <div
                                                    className="
                                w-5 md:w-6 rounded-t-xl
                                bg-red-400/90
                                hover:bg-red-300
                                transition
                            "
                                                    style={{
                                                        height: `${item.expenseHeight}%`,
                                                        minHeight:
                                                            item.expense > 0 ? "10px" : "0px",
                                                    }}
                                                />

                                            </div>

                                        </div>

                                        {/* MONTH */}
                                        <span className="text-xs text-slate-500 mt-3">
                                            {item.label}
                                        </span>

                                    </div>
                                ))}

                            </div>
                        </div>

                    </div>

                    {/* CATEGORY */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-6">

                            <h3 className="text-xl font-bold">
                                Danh mục của tôi
                            </h3>

                            <Link
                                href="/categories"
                                className="text-cyan-400 text-sm hover:underline"
                            >
                                Xem tất cả
                            </Link>

                        </div>

                        <div className="space-y-6">

                            {topCategories.map((item, index) => {

                                const isIncome = item.type === "income";

                                return (
                                    <div key={index}>

                                        <div className="flex items-center justify-between mb-2">

                                            <div className="flex items-center gap-2">

                                                <div
                                                    className="w-6 h-6 flex items-center justify-center text-sm"
                                                    style={{ color: item.color }}
                                                >
                                                    {item.icon}
                                                </div>

                                                <span
                                                    className={`text-sm font-medium ${isIncome ? "text-green-400" : "text-red-400"
                                                        }`}
                                                >
                                                    {item.name}
                                                </span>
                                            </div>

                                            <span
                                                className={`text-sm font-bold ${isIncome
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                                    }`}
                                            >
                                                {isIncome ? "+" : "-"}
                                                {item.amount.toLocaleString()}đ
                                            </span>

                                        </div>

                                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">

                                            <div
                                                className={`h-full rounded-full ${isIncome
                                                    ? "bg-green-400"
                                                    : "bg-red-400"
                                                    }`}
                                                style={{
                                                    width: `${item.percent}%`,
                                                }}
                                            />

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    </div>

                </section>

                {/* ===== WALLET + TRANSACTION ===== */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* RECENT TRANSACTION */}
                    <div className="xl:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">

                        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">

                            <h3 className="text-xl font-bold">
                                Giao dịch gần đây
                            </h3>

                            <Link
                                href="/transactions"
                                className="text-cyan-400 text-sm hover:underline"
                            >
                                Xem tất cả
                            </Link>

                        </div>

                        <div className="divide-y divide-slate-800">

                            {loading ? (
                                <div className="p-6 text-slate-400">
                                    Loading...
                                </div>
                            ) : (
                                recentTransactions.map((t) => (
                                    <div
                                        key={t.id}
                                        className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/40 transition"
                                    >

                                        <div className="flex items-center gap-4">

                                            <div
                                                className="w-12 h-12 rounded-xl border flex items-center justify-center text-xl"
                                                style={{
                                                    color: t.category_color,
                                                    backgroundColor: `${t.category_color}20`,
                                                    borderColor: `${t.category_color}40`,
                                                }}
                                            >
                                                {t.category_icon || "💸"}
                                            </div>

                                            <div>

                                                <h4 className="font-bold">
                                                    {t.category_name}
                                                </h4>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    {t.wallet_name}
                                                    {t.note
                                                        ? ` • ${t.note}`
                                                        : ""}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="text-right">

                                            <div
                                                className={`font-bold ${t.category_type === "income"
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                                    }`}
                                            >
                                                {t.category_type === "income"
                                                    ? "+"
                                                    : "-"}
                                                {Number(t.amount).toLocaleString()}đ
                                            </div>

                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(
                                                    t.transaction_date
                                                ).toLocaleDateString("vi-VN")}
                                            </p>

                                        </div>

                                    </div>
                                ))
                            )}

                        </div>

                    </div>

                    {/* WALLETS */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-6">

                            <h3 className="text-xl font-bold">
                                Ví của tôi
                            </h3>

                            <Link
                                href="/wallets"
                                className="text-cyan-400 text-sm hover:underline"
                            >
                                Xem tất cả
                            </Link>

                        </div>

                        <div className="space-y-4">

                            {wallets.map((wallet) => {

                                const walletBalance = Number(wallet.balance);
                                const isPositive = walletBalance >= 0;

                                return (
                                    <div
                                        key={wallet.id}
                                        className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-800/30 hover:border-cyan-500/30 transition"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPositive
                                                    ? "bg-green-500/10 text-green-400"
                                                    : "bg-red-500/10 text-red-400"
                                                    }`}
                                            >
                                                {wallet.icon}
                                            </div>

                                            <div>

                                                <p className="font-semibold">
                                                    {wallet.name}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    Wallet
                                                </p>

                                            </div>

                                        </div>

                                        <div
                                            className={`font-bold ${isPositive
                                                ? "text-green-400"
                                                : "text-red-400"
                                                }`}
                                        >
                                            {isPositive ? "+" : "-"}
                                            {Math.abs(walletBalance).toLocaleString()}đ
                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    </div>

                </section>

            </main>
        </div>
    );
}
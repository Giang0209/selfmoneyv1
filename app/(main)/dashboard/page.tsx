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

type SavingGoal = {
    id: number;
    name: string;
    icon: string;
    target_amount: number;
    saved_amount: number;
    deadline: string | null;
    status: "active" | "completed" | "cancelled";
    color: string;
};

export default function DashboardPage() {

    const [loading, setLoading] = useState(true);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
    const [topCategories, setTopCategories] = useState<CategorySummary[]>([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const [walletRes, transactionRes, savingGoalRes] = await Promise.all([
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

                fetch("/api/saving-goals", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            const walletJson = await walletRes.json();
            const transactionJson = await transactionRes.json();
            const savingGoalJson = await savingGoalRes.json();

            const walletData = Array.isArray(walletJson)
                ? walletJson
                : walletJson.data || [];

            const transactionData = Array.isArray(transactionJson)
                ? transactionJson
                : transactionJson.data || [];

            const savingGoalData = Array.isArray(savingGoalJson)
                ? savingGoalJson
                : savingGoalJson.data || [];

            setWallets(walletData);
            setTransactions(transactionData);
            setSavingGoals(savingGoalData);

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

    // ===== SAVING GOALS STATS =====
    const totalTarget = useMemo(() => {
        return savingGoals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);
    }, [savingGoals]);

    const totalSaved = useMemo(() => {
        return savingGoals.reduce((sum, g) => sum + Number(g.saved_amount || 0), 0);
    }, [savingGoals]);

    const goalProgress = useMemo(() => {
        return totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    }, [totalSaved, totalTarget]);

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
        <div className="bg-background min-h-screen text-foreground relative overflow-hidden transition-colors duration-300">
            {/* Ambient visual background glowing spots */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />

            <Sidebar />
            <Header />

            <main className="ml-64 pt-24 p-8 relative z-10">

                {/* ===== TOP ===== */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900/60 pb-6 relative">
                    <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent" />
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
                                Trang chủ
                            </h1>
                            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-cyan-500/20 tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                Live Overview
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">
                            Tổng quan tài chính cá nhân thông minh và trực quan của bạn
                        </p>
                    </div>
                </div>

                {/* ===== OVERVIEW ===== */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    {/* INCOME */}
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/5 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 group">

                        <div className="flex items-center justify-between mb-5">

                            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>

                            <span className="text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                                Thu nhập
                            </span>

                        </div>

                        <p className="text-slate-400 text-sm mb-1">
                            Tổng thu nhập
                        </p>

                        <h2 className="text-3xl font-sans tabular-nums text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.1)] flex items-baseline gap-0.5 tracking-wide">
                            <span className="text-xl font-semibold opacity-85 leading-none mr-0.5">+</span>
                            <span className="text-3xl font-black tracking-tight leading-none">{totalIncome.toLocaleString("vi-VN")}</span>
                            <span className="text-xl font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                        </h2>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-green-500/50 to-transparent group-hover:via-green-400 transition-all duration-300" />

                    </div>

                    {/* EXPENSE */}
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 group">

                        <div className="flex items-center justify-between mb-5">

                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 group-hover:bg-red-500/20 transition-all duration-300">
                                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                                </svg>
                            </div>

                            <span className="text-xs text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                                Chi tiêu
                            </span>

                        </div>

                        <p className="text-slate-400 text-sm mb-1">
                            Tổng chi tiêu
                        </p>

                        <h2 className="text-3xl font-sans tabular-nums text-rose-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.1)] flex items-baseline gap-0.5 tracking-wide">
                            <span className="text-xl font-semibold opacity-85 leading-none mr-0.5">-</span>
                            <span className="text-3xl font-black tracking-tight leading-none">{totalExpense.toLocaleString("vi-VN")}</span>
                            <span className="text-xl font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                        </h2>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent group-hover:via-red-400 transition-all duration-300" />

                    </div>

                    {/* BALANCE */}
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 group">

                        <div className="flex items-center justify-between mb-5">

                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                                Số dư
                            </span>

                        </div>

                        <p className="text-slate-400 text-sm mb-1">
                            Số dư hiện tại
                        </p>

                        <h2
                            className={`text-3xl font-sans tabular-nums flex items-baseline gap-0.5 tracking-wide ${balance >= 0
                                ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                                : "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.1)]"
                                }`}
                        >
                            <span className="text-xl font-semibold opacity-85 leading-none mr-0.5">{balance >= 0 ? "+" : "-"}</span>
                            <span className="text-3xl font-black tracking-tight leading-none">{Math.abs(balance).toLocaleString("vi-VN")}</span>
                            <span className="text-xl font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                        </h2>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent group-hover:via-cyan-400 transition-all duration-300" />

                    </div>

                </section>

                {/* ===== CHART + CATEGORY ===== */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

                    {/* CHART */}
                    <div className="xl:col-span-2 bg-gradient-to-br from-slate-950/60 via-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/60 rounded-3xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 relative overflow-hidden group/chart">
                        {/* Ambient glow */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent mb-1">
                                    Biểu đồ thu chi
                                </h3>
                                <p className="text-slate-500 text-sm">Năm {selectedYear}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Legend */}
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                                        Thu nhập
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.6)]" />
                                        Chi tiêu
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="bg-slate-950/80 border border-slate-700/80 hover:border-cyan-500/50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 px-3 py-1.5 rounded-xl text-sm w-24 text-cyan-300 font-semibold tabular-nums focus:outline-none transition-all duration-200"
                                    min={2000}
                                    max={2100}
                                />
                            </div>
                        </div>

                        {/* REAL CHART */}
                        <div className="h-72 overflow-x-auto overflow-y-visible xl:overflow-visible pb-10 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-800/40 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <div className="relative isolate h-full flex items-end justify-between gap-2 min-w-[720px] xl:min-w-0">
                                {/* Subtle horizontal grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-full h-px bg-slate-800/50" />
                                    ))}
                                </div>

                                {monthlyData.map((item, i) => (
                                    <div key={i} className="flex flex-col items-center justify-end h-full flex-1 group/month">
                                        <div className="flex items-end gap-1.5 h-full">

                                            {/* INCOME BAR */}
                                            <div className="relative group flex items-end h-full">
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                                    <div className="bg-slate-950 border border-emerald-500/30 rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">
                                                        <p className="text-[11px] text-slate-400 mb-0.5">{item.label}</p>
                                                        <p className="text-sm font-sans tabular-nums font-bold text-emerald-400 flex items-baseline gap-0.5">
                                                            <span className="text-xs opacity-85 mr-0.5">+</span>
                                                            <span className="tracking-tight">{item.income.toLocaleString("vi-VN")}</span>
                                                            <span className="text-xs opacity-75 ml-0.5">đ</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="w-4 md:w-5 rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 transition-all duration-200 shadow-[0_0_8px_rgba(52,211,153,0.3)] hover:shadow-[0_0_14px_rgba(52,211,153,0.6)]"
                                                    style={{ height: `${item.incomeHeight}%`, minHeight: item.income > 0 ? "10px" : "0px" }}
                                                />
                                            </div>

                                            {/* EXPENSE BAR */}
                                            <div className="relative group flex items-end h-full">
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                                    <div className="bg-slate-950 border border-rose-500/30 rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">
                                                        <p className="text-[11px] text-slate-400 mb-0.5">{item.label}</p>
                                                        <p className="text-sm font-sans tabular-nums font-bold text-rose-400 flex items-baseline gap-0.5">
                                                            <span className="text-xs opacity-85 mr-0.5">-</span>
                                                            <span className="tracking-tight">{item.expense.toLocaleString("vi-VN")}</span>
                                                            <span className="text-xs opacity-75 ml-0.5">đ</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="w-4 md:w-5 rounded-t-lg bg-gradient-to-t from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 transition-all duration-200 shadow-[0_0_8px_rgba(244,63,94,0.3)] hover:shadow-[0_0_14px_rgba(244,63,94,0.6)]"
                                                    style={{ height: `${item.expenseHeight}%`, minHeight: item.expense > 0 ? "10px" : "0px" }}
                                                />
                                            </div>
                                        </div>

                                        <span className="text-[11px] text-slate-600 group-hover/month:text-slate-400 transition-colors mt-3">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CATEGORY */}
                    <div className="bg-gradient-to-br from-slate-950/60 via-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/60 rounded-3xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                                Danh mục của tôi
                            </h3>
                            <Link href="/categories" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold uppercase tracking-wider transition-colors">
                                Xem tất cả
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {topCategories.map((item, index) => {
                                const isIncome = item.type === "income";
                                return (
                                    <div key={index} className="group/cat p-3 rounded-2xl hover:bg-slate-800/30 transition-all duration-200 border border-transparent hover:border-slate-700/50">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <div className="flex items-center gap-2.5">
                                                {/* Icon with glow */}
                                                <div className="relative select-none">
                                                    <div
                                                        className="absolute inset-0 rounded-xl blur-md opacity-20 group-hover/cat:opacity-40 transition-all duration-300"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <div
                                                        className="relative w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover/cat:scale-105 text-sm"
                                                        style={{
                                                            backgroundColor: `${item.color}18`,
                                                            borderColor: `${item.color}30`,
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-semibold ${isIncome ? "text-emerald-400" : "text-rose-400"}`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className={`text-sm font-sans tabular-nums flex items-baseline gap-0.5 ${isIncome ? "text-emerald-400" : "text-rose-400"}`}>
                                                <span className="text-xs font-semibold opacity-85 mr-0.5">{isIncome ? "+" : "-"}</span>
                                                <span className="font-black tracking-tight">{item.amount.toLocaleString("vi-VN")}</span>
                                                <span className="text-xs font-semibold opacity-75 ml-0.5">đ</span>
                                            </span>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isIncome
                                                    ? "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                                                    : "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.5)]"
                                                    }`}
                                                style={{ width: `${item.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </section>

                {/* ===== SAVING GOALS ===== */}
                <section className="mb-8">
                    <div className="bg-gradient-to-br from-slate-950/60 via-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/60 rounded-3xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 relative overflow-hidden group/goals">
                        {/* Glowing accent background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent mb-1">
                                    Mục tiêu tiết kiệm
                                </h3>
                                <p className="text-slate-500 text-xs font-medium">
                                    {savingGoals.length} mục tiêu tiết kiệm đang thực hiện
                                </p>
                            </div>

                            <Link
                                href="/saving-goals"
                                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold uppercase tracking-wider transition-colors"
                            >
                                Xem tất cả
                            </Link>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">Đang tải...</p>
                            </div>
                        ) : savingGoals.length === 0 ? (
                            <div className="text-center py-10 bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl">
                                <p className="text-slate-500 text-sm mb-3">Chưa có mục tiêu tiết kiệm nào</p>
                                <Link
                                    href="/saving-goals"
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all duration-200"
                                >
                                    + Tạo mục tiêu mới
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savingGoals.slice(0, 3).map((goal) => {
                                    const pct = goal.target_amount > 0 ? (goal.saved_amount / goal.target_amount) * 100 : 0;
                                    const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.saved_amount));

                                    return (
                                        <div
                                            key={goal.id}
                                            className="group/goal relative flex flex-col justify-between p-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 hover:bg-slate-900/50 hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden"
                                        >
                                            {/* Top row: Icon, Name and percentage badge */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 border"
                                                        style={{
                                                            color: goal.color || "#8b5cf6",
                                                            backgroundColor: `${goal.color || "#8b5cf6"}15`,
                                                            borderColor: `${goal.color || "#8b5cf6"}35`,
                                                        }}
                                                    >
                                                        {goal.icon || "🎯"}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-200 group-hover/goal:text-white transition-colors text-sm">
                                                            {goal.name}
                                                        </h4>
                                                        {goal.deadline && (
                                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                                Hạn: {new Date(goal.deadline).toLocaleDateString("vi-VN")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                    style={{
                                                        color: goal.color || "#8b5cf6",
                                                        backgroundColor: `${goal.color || "#8b5cf6"}15`,
                                                    }}
                                                >
                                                    {Math.round(pct)}%
                                                </span>
                                            </div>

                                            {/* Mid row: amounts */}
                                            <div className="space-y-1 mb-3">
                                                <div className="flex justify-between items-baseline text-xs">
                                                    <span className="text-slate-500">Đã tích lũy</span>
                                                    <span className="font-bold text-slate-300">
                                                        {Math.round(goal.saved_amount).toLocaleString("vi-VN")} đ
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-baseline text-xs">
                                                    <span className="text-slate-500">Mục tiêu</span>
                                                    <span className="font-semibold text-slate-400">
                                                        {Math.round(goal.target_amount).toLocaleString("vi-VN")} đ
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bottom row: Progress bar & remaining */}
                                            <div>
                                                <div className="w-full h-1.5 rounded-full bg-slate-850 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(pct, 100)}%`,
                                                            backgroundColor: goal.color || "#8b5cf6",
                                                            boxShadow: `0 0 6px ${goal.color || "#8b5cf6"}80`,
                                                        }}
                                                    />
                                                </div>
                                                {remaining > 0 && (
                                                    <p className="text-[10px] text-slate-500 mt-2 text-right">
                                                        Còn thiếu: <span className="font-semibold text-slate-400">{Math.round(remaining).toLocaleString("vi-VN")} đ</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Accent line */}
                                            <div
                                                className="absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 opacity-30 group-hover/goal:opacity-100"
                                                style={{
                                                    background: `linear-gradient(to right, transparent, ${goal.color || "#8b5cf6"}80, transparent)`,
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* ===== WALLET + TRANSACTION ===== */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* RECENT TRANSACTION */}
                    <div className="xl:col-span-2 bg-gradient-to-br from-slate-950/60 via-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/60 rounded-3xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">

                        <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/20">
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                                    Giao dịch gần đây
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Cập nhật mới nhất</p>
                            </div>
                            <Link
                                href="/transactions"
                                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold uppercase tracking-wider transition-colors"
                            >
                                Xem tất cả
                            </Link>
                        </div>

                        <div className="p-4 space-y-3">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm">Đang tải...</p>
                                </div>
                            ) : (
                                recentTransactions.map((t) => (
                                    <div
                                        key={t.id}
                                        className="relative group overflow-hidden bg-gradient-to-r from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 flex items-center transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
                                    >
                                        {/* Left colored glowing strip */}
                                        <div
                                            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full opacity-60 group-hover:opacity-100 transition-all duration-300 ${t.category_type === "income"
                                                    ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                                                    : "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                                                }`}
                                        />

                                        {/* Icon with radial glow */}
                                        <div className="relative mr-4 pl-1 select-none">
                                            <div
                                                className="absolute inset-0 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-all duration-300"
                                                style={{ backgroundColor: t.category_color }}
                                            />
                                            <div
                                                className="relative w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105"
                                                style={{
                                                    color: t.category_color,
                                                    backgroundColor: `${t.category_color}15`,
                                                    borderColor: `${t.category_color}35`,
                                                }}
                                            >
                                                <span className="text-2xl">{t.category_icon || "💸"}</span>
                                            </div>
                                        </div>

                                        {/* Text & info layout */}
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <h4 className="font-bold text-slate-100 tracking-tight group-hover:text-white transition-colors duration-200">
                                                    {t.category_name}
                                                </h4>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-slate-400 border border-slate-800/80 shadow-inner group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all duration-300">
                                                    {t.wallet_name}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 truncate max-w-md group-hover:text-slate-300 transition-colors duration-200">
                                                {t.note || <span className="text-slate-600 italic text-[10px]">Không có ghi chú</span>}
                                            </p>
                                        </div>

                                        {/* Value & Date */}
                                        <div className="text-right flex flex-col justify-between h-full min-h-[3.2rem]">
                                            <div className={`font-sans tabular-nums flex items-baseline gap-0.5 text-base transition-all duration-300 ${t.category_type === "income"
                                                    ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.15)] group-hover:text-emerald-300"
                                                    : "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.15)] group-hover:text-rose-300"
                                                }`}>
                                                <span className="text-xs font-semibold opacity-85 mr-0.5">{t.category_type === "income" ? "+" : "-"}</span>
                                                <span className="text-base font-black tracking-tight">{Number(t.amount).toLocaleString("vi-VN")}</span>
                                                <span className="text-xs font-semibold opacity-75 ml-0.5">đ</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 justify-end font-medium group-hover:text-slate-400 transition-colors duration-200">
                                                <svg className="w-3 h-3 text-slate-600 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{new Date(t.transaction_date).toLocaleDateString("vi-VN")}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>

                    {/* WALLETS */}
                    <div className="bg-gradient-to-br from-slate-950/60 via-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/60 rounded-3xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                                    Tài khoản của tôi
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">{wallets.length} tài khoản đang hoạt động</p>
                            </div>
                            <Link
                                href="/wallets"
                                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold uppercase tracking-wider transition-colors"
                            >
                                Xem tất cả
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {wallets.map((wallet) => {
                                const walletBalance = Number(wallet.balance);
                                const isPositive = walletBalance >= 0;

                                return (
                                    <div
                                        key={wallet.id}
                                        className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-slate-800/60 bg-slate-950/30 hover:bg-slate-900/50 hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden"
                                    >
                                        {/* Hover glow accent */}
                                        <div className={`absolute left-0 top-0 h-full w-0.5 rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-300 ${isPositive ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"
                                            }`} />

                                        <div className="flex items-center gap-3">
                                            {/* Icon with radial glow */}
                                            <div className="relative select-none">
                                                <div
                                                    className={`absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-all duration-300 ${isPositive ? "bg-emerald-400" : "bg-rose-400"
                                                        }`}
                                                />
                                                <div
                                                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 group-hover:scale-105 border ${isPositive
                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20"
                                                            : "bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20"
                                                        }`}
                                                >
                                                    {wallet.icon}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-200 group-hover:text-white transition-colors text-sm">
                                                    {wallet.name}
                                                </p>
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900/80 text-slate-500 border border-slate-800/80 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all duration-300 inline-block mt-0.5">
                                                    Tài khoản
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`font-sans tabular-nums flex items-baseline gap-0.5 ${isPositive ? "text-emerald-400" : "text-rose-400"
                                            }`}>
                                            <span className="text-xs font-semibold opacity-85 mr-0.5">{isPositive ? "+" : "-"}</span>
                                            <span className="text-base font-black tracking-tight">{Math.abs(walletBalance).toLocaleString("vi-VN")}</span>
                                            <span className="text-xs font-semibold opacity-75 ml-0.5">đ</span>
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
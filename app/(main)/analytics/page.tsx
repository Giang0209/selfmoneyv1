"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

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

type Budget = {
    id: number;
    amount: string;
    month: number;
    year: number;

    category_name?: string;
};

export default function AnalyticsPage() {

    const now = new Date();

    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);

    const [selectedMonth, setSelectedMonth] = useState(
        now.getMonth() + 1
    );

    const [selectedYear, setSelectedYear] = useState(
        now.getFullYear()
    );

    useEffect(() => {
        fetchData();
        setMounted(true);
    }, []);

    const fetchData = async () => {

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            const [transactionRes, walletRes, budgetRes] =
                await Promise.all([

                    fetch("/api/transactions", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),

                    fetch("/api/wallets", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),

                    fetch("/api/budgets", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

            const transactionJson =
                await transactionRes.json();

            const walletJson =
                await walletRes.json();

            const budgetJson =
                await budgetRes.json();

            setTransactions(
                Array.isArray(transactionJson)
                    ? transactionJson
                    : transactionJson.data || []
            );

            setWallets(
                Array.isArray(walletJson)
                    ? walletJson
                    : walletJson.data || []
            );

            setBudgets(
                Array.isArray(budgetJson)
                    ? budgetJson
                    : budgetJson.data || []
            );

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };

    // ===== CURRENT MONTH =====

    const currentMonthTransactions = useMemo(() => {

        return transactions.filter((t) => {

            const date = new Date(
                t.transaction_date
            );

            return (
                date.getMonth() + 1 ===
                selectedMonth &&
                date.getFullYear() ===
                selectedYear
            );
        });

    }, [
        transactions,
        selectedMonth,
        selectedYear,
    ]);

    // ===== PREVIOUS MONTH =====

    const previousMonthTransactions =
        useMemo(() => {

            let prevMonth =
                selectedMonth - 1;

            let prevYear =
                selectedYear;

            if (prevMonth === 0) {

                prevMonth = 12;
                prevYear--;
            }

            return transactions.filter((t) => {

                const date = new Date(
                    t.transaction_date
                );

                return (
                    date.getMonth() + 1 ===
                    prevMonth &&
                    date.getFullYear() ===
                    prevYear
                );
            });

        }, [
            transactions,
            selectedMonth,
            selectedYear,
        ]);

    // ===== TOTALS =====

    const totalIncome = useMemo(() => {

        return currentMonthTransactions
            .filter(
                (t) =>
                    t.category_type ===
                    "income"
            )
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount),
                0
            );

    }, [currentMonthTransactions]);

    const totalExpense = useMemo(() => {

        return currentMonthTransactions
            .filter(
                (t) =>
                    t.category_type ===
                    "expense"
            )
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount),
                0
            );

    }, [currentMonthTransactions]);

    const prevIncome = useMemo(() => {

        return previousMonthTransactions
            .filter(
                (t) =>
                    t.category_type ===
                    "income"
            )
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount),
                0
            );

    }, [previousMonthTransactions]);

    const prevExpense = useMemo(() => {

        return previousMonthTransactions
            .filter(
                (t) =>
                    t.category_type ===
                    "expense"
            )
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount),
                0
            );

    }, [previousMonthTransactions]);

    // ===== PERCENT =====

    const calcPercent = (
        current: number,
        previous: number
    ) => {

        if (previous === 0)
            return 100;

        return Math.round(
            ((current - previous) /
                previous) *
            100
        );
    };

    const incomePercent =
        calcPercent(
            totalIncome,
            prevIncome
        );

    const expensePercent =
        calcPercent(
            totalExpense,
            prevExpense
        );

    const totalBalance = useMemo(() => {
        return wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
    }, [wallets]);

    // ===== BUDGET =====

    const currentBudgets = useMemo(() => {

        return budgets.filter(
            (b) =>
                b.month ===
                selectedMonth &&
                b.year === selectedYear
        );

    }, [
        budgets,
        selectedMonth,
        selectedYear,
    ]);

    const totalBudget = useMemo(() => {

        return currentBudgets.reduce(
            (sum, b) =>
                sum + Number(b.amount),
            0
        );

    }, [currentBudgets]);

    const budgetPercent =
        totalBudget > 0
            ? Math.round(
                (totalExpense /
                    totalBudget) *
                100
            )
            : 0;

    // ===== TOP EXPENSE =====

    const topExpenseCategories =
        useMemo(() => {

            const map: Record<
                string,
                {
                    name: string;
                    amount: number;
                    icon: string;
                    color: string;
                }
            > = {};

            currentMonthTransactions
                .filter(
                    (t) =>
                        t.category_type ===
                        "expense"
                )
                .forEach((t) => {

                    if (
                        !map[
                        t.category_name
                        ]
                    ) {

                        map[
                            t.category_name
                        ] = {
                            name: t.category_name,
                            amount: 0,
                            icon:
                                t.category_icon ||
                                "💸",
                            color:
                                t.category_color ||
                                "#06b6d4",
                        };
                    }

                    map[
                        t.category_name
                    ].amount += Number(
                        t.amount
                    );
                });

            return Object.values(map)
                .sort(
                    (a, b) =>
                        b.amount -
                        a.amount
                )
                .slice(0, 5);

        }, [currentMonthTransactions]);

    // ===== MONTHLY DATA =====

    const monthlyData = useMemo(() => {

        const months = Array.from(
            { length: 12 },
            (_, i) => ({
                label: `T${i + 1}`,
                income: 0,
                expense: 0,
            })
        );

        transactions.forEach((t) => {

            const date = new Date(
                t.transaction_date
            );

            if (
                date.getFullYear() !==
                selectedYear
            )
                return;

            const month =
                date.getMonth();

            if (
                t.category_type ===
                "income"
            ) {

                months[
                    month
                ].income += Number(
                    t.amount
                );

            } else {

                months[
                    month
                ].expense += Number(
                    t.amount
                );
            }
        });

        return months;

    }, [
        transactions,
        selectedYear,
    ]);

    // ===== LINE CHART =====

    const lineChartData = useMemo(() => {

        let runningBalance = 0;

        return monthlyData
            .slice(0, selectedMonth)
            .map((m) => {

                runningBalance +=
                    m.income - m.expense;

                return {
                    month: m.label,
                    income: m.income,
                    expense: m.expense,
                    balance: runningBalance,
                };
            });

    }, [monthlyData, selectedMonth]);

    // ===== PIE DATA =====

    const pieData = useMemo(() => {

        const map: Record<
            string,
            {
                name: string;
                value: number;
                color: string;
            }
        > = {};

        currentMonthTransactions
            .filter(
                (t) =>
                    t.category_type ===
                    "expense"
            )
            .forEach((t) => {

                if (
                    !map[
                    t.category_name
                    ]
                ) {

                    map[
                        t.category_name
                    ] = {
                        name: t.category_name,
                        value: 0,
                        color:
                            t.category_color ||
                            "#06b6d4",
                    };
                }

                map[
                    t.category_name
                ].value += Number(
                    t.amount
                );
            });

        return Object.values(map);

    }, [currentMonthTransactions]);

    // ===== WARNINGS =====

    const warnings = useMemo(() => {

        const arr: {
            type:
            | "warning"
            | "good";

            title: string;
            desc: string;
        }[] = [];

        // Kiểm tra ngân sách cho từng danh mục
        let hasOverBudget = false;

        currentBudgets.forEach((b) => {
            const categoryName = b.category_name;
            if (!categoryName) return;

            // Tính tổng chi tiêu thực tế của danh mục này trong tháng hiện tại
            const spent = currentMonthTransactions
                .filter((t) => t.category_name === categoryName && t.category_type === "expense")
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const budgetAmount = Number(b.amount);
            if (budgetAmount <= 0) return;

            const percent = Math.round((spent / budgetAmount) * 100);

            if (percent >= 100) {
                hasOverBudget = true;
                arr.push({
                    type: "warning",
                    title: `Vượt hạn mức ${categoryName}`,
                    desc: `Danh mục "${categoryName}" đã chi tiêu vượt ${percent - 100}% hạn mức (Đã tiêu: ${spent.toLocaleString("vi-VN")}đ / Hạn mức: ${budgetAmount.toLocaleString("vi-VN")}đ).`,
                });
            } else if (percent >= 80) {
                hasOverBudget = true;
                arr.push({
                    type: "warning",
                    title: `Sắp vượt hạn mức ${categoryName}`,
                    desc: `Danh mục "${categoryName}" đã dùng ${percent}% hạn mức (Đã tiêu: ${spent.toLocaleString("vi-VN")}đ / Hạn mức: ${budgetAmount.toLocaleString("vi-VN")}đ).`,
                });
            }
        });

        if (!hasOverBudget) {
            arr.push({
                type: "good",
                title: "Chi tiêu ổn định",
                desc: "Tất cả các danh mục chi tiêu đều đang ở trong giới hạn ngân sách cho phép.",
            });
        }



        // Wallet low balance
        wallets.forEach((wallet) => {

            const balance =
                Number(wallet.balance || 0);

            if (balance <= 100000) {

                arr.push({
                    type: "warning",
                    title: `${wallet.icon} ${wallet.name} sắp hết tiền`,
                    desc: `Số dư chỉ còn ${balance.toLocaleString()}đ.`,
                });
            }
        });

        return arr;

    }, [
        budgetPercent,
        totalExpense,
        totalBudget,
        wallets,
        currentBudgets,
        currentMonthTransactions,
    ]);

    return (
        <div className="bg-background min-h-screen text-foreground relative overflow-hidden transition-colors duration-300">
            {/* Ambient visual background glowing spots */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />

            <Sidebar />
            <Header />

            <main className="ml-64 pt-24 p-8 relative z-10">

                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-10 border-b border-slate-900/60 pb-6 relative">
                    <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-violet-500 to-transparent" />
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
                                Phân tích tài chính
                            </h1>
                            <span className="bg-violet-500/10 text-violet-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-violet-500/20 tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                                Analytics Insights
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">
                            Thống kê chi tiết thu chi và ngân sách theo thời gian của bạn
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="w-full bg-slate-900/30 border border-slate-800/80 rounded-2xl px-4 py-2.5 text-sm text-cyan-300 font-bold hover:border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 cursor-pointer shadow-inner transition-all duration-200"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i} value={i + 1} className="bg-slate-950 text-slate-300">
                                    Tháng {i + 1}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full bg-slate-900/30 border border-slate-800/80 rounded-2xl px-4 py-2.5 text-sm text-cyan-300 font-bold hover:border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-center shadow-inner transition-all duration-200"
                        />
                    </div>
                </div>

                {/* 4 CARDS */}

                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                    {/* INCOME */}

                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/5 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between min-h-[200px]">

                        <div>
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
                                Tổng thu tháng này
                            </p>

                            <h2 className="text-3xl font-sans tabular-nums text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.1)] flex items-baseline gap-0.5 tracking-wide">
                                <span className="text-xl font-semibold opacity-85 leading-none mr-0.5">+</span>
                                <span className="text-3xl font-black tracking-tight leading-none">{totalIncome.toLocaleString("vi-VN")}</span>
                                <span className="text-xl font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                            </h2>
                        </div>

                        <p className="text-xs mt-4 text-slate-400">
                            {incomePercent >= 0 ? "+" : ""}{incomePercent}% so với tháng trước
                        </p>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-green-500/50 to-transparent group-hover:via-green-400 transition-all duration-300" />

                    </div>

                    {/* EXPENSE */}

                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between min-h-[200px]">

                        <div>
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
                                Tổng chi tháng này
                            </p>

                            <h2 className="text-3xl font-sans tabular-nums text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.1)] flex items-baseline gap-0.5 tracking-wide">
                                <span className="text-xl font-semibold opacity-85 leading-none mr-0.5">-</span>
                                <span className="text-3xl font-black tracking-tight leading-none">{totalExpense.toLocaleString("vi-VN")}</span>
                                <span className="text-xl font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                            </h2>
                        </div>

                        <p className="text-xs mt-4 text-slate-400">
                            {expensePercent >= 0 ? "+" : ""}{expensePercent}% so với tháng trước
                        </p>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent group-hover:via-red-400 transition-all duration-300" />

                    </div>

                    {/* BALANCE */}

                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between min-h-[200px]">

                        <div>
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

                            <p className="text-sm font-semibold text-slate-300">
                                Tổng số dư các tài khoản
                            </p>

                            <h2 className="text-3xl font-sans tabular-nums text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.1)] flex items-baseline gap-0.5 tracking-wide">
                                <span className="text-3xl font-black tracking-tight leading-none">{totalBalance.toLocaleString("vi-VN")}</span>
                                <span className="text-xl font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                            </h2>
                        </div>

                        <p className="text-xs mt-4 text-slate-400">
                            Tổng tài sản hiện tại
                        </p>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent group-hover:via-cyan-400 transition-all duration-300" />

                    </div>

                    {/* BUDGET */}

                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between min-h-[200px]">

                        <div>
                            <div className="flex items-center justify-between mb-5">

                                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300">
                                    <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>

                                <span className="text-xs text-violet-400 bg-violet-400/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                                    Ngân sách ({budgetPercent}%)
                                </span>

                            </div>

                            <p className="text-slate-400 text-sm mb-1">
                                Đã dùng / Giới hạn
                            </p>

                            <h2 className="text-2xl font-sans tabular-nums text-white flex items-baseline gap-0.5 tracking-wide">
                                <span className="text-2xl font-black tracking-tight leading-none">{totalExpense.toLocaleString("vi-VN")}</span>
                                <span className="text-base font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                                <span className="text-xs font-semibold text-slate-500 ml-1.5 opacity-60 leading-none">/</span>
                                <span className="text-sm font-medium text-slate-400 ml-1 leading-none">{totalBudget.toLocaleString("vi-VN")}</span>
                                <span className="text-xs font-semibold text-slate-400 opacity-75 ml-0.5 leading-none">đ</span>
                            </h2>
                        </div>

                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-4">
                            <div
                                className="h-full bg-violet-400 rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(
                                        budgetPercent,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent group-hover:via-violet-400 transition-all duration-300" />
                    </div>

                </section>

                {/* CHART + PIE */}

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

                    {/* LINE CHART */}

                    <div className="xl:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.4)] hover:shadow-cyan-500/5 group/chart">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

                            <div>

                                <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                                    Xu hướng tài chính
                                </h3>

                                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                                    Thu nhập • Chi tiêu • Số dư
                                </p>

                            </div>

                            <div className="flex gap-4 text-xs font-semibold bg-slate-950/50 p-2.5 rounded-xl border border-slate-850/80 shadow-inner w-fit">

                                <div className="flex items-center gap-2 px-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
                                    <span className="text-slate-300">
                                        Thu nhập
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 px-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />
                                    <span className="text-slate-300">
                                        Chi tiêu
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 px-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                                    <span className="text-slate-300">
                                        Số dư
                                    </span>
                                </div>

                            </div>

                        </div>

                        <div className="h-[320px]">
                            {mounted && (
                                <ResponsiveContainer width="100%" height="100%">

                                    <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>

                                        <XAxis
                                            dataKey="month"
                                            stroke="rgba(148, 163, 184, 0.4)"
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                            tickLine={false}
                                            axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
                                            padding={{
                                                left: 20,
                                                right: 20,
                                            }}
                                        />

                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                borderColor: 'rgba(51, 65, 85, 0.7)',
                                                borderRadius: '16px',
                                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                                                backdropFilter: 'blur(12px)',
                                                color: '#f1f5f9',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                padding: '12px 16px',
                                                border: '1px solid rgba(255, 255, 255, 0.08)'
                                            }}
                                            itemStyle={{
                                                padding: '2px 0'
                                            }}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="income"
                                            stroke="#4ade80"
                                            strokeWidth={3.5}
                                            dot={{ r: 4.5, strokeWidth: 1.5, stroke: '#0f172a', fill: '#4ade80' }}
                                            activeDot={{ r: 7.5, strokeWidth: 0, fill: '#4ade80' }}
                                            name="Thu nhập"
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="expense"
                                            stroke="#fb7185"
                                            strokeWidth={3.5}
                                            dot={{ r: 4.5, strokeWidth: 1.5, stroke: '#0f172a', fill: '#fb7185' }}
                                            activeDot={{ r: 7.5, strokeWidth: 0, fill: '#fb7185' }}
                                            name="Chi tiêu"
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="balance"
                                            stroke="#22d3ee"
                                            strokeWidth={3.5}
                                            dot={{ r: 4.5, strokeWidth: 1.5, stroke: '#0f172a', fill: '#22d3ee' }}
                                            activeDot={{ r: 7.5, strokeWidth: 0, fill: '#22d3ee' }}
                                            name="Số dư"
                                        />

                                    </LineChart>

                                </ResponsiveContainer>
                            )}
                        </div>

                    </div>

                    {/* PIE */}

                    <div className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 rounded-3xl p-6 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative overflow-hidden group/pie">
                        {/* Soft visual glow background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover/pie:bg-blue-500/20 transition-all duration-500" />

                        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent relative z-10">
                            Cơ cấu chi tiêu
                        </h3>

                        <div className="flex flex-col items-center relative z-10 h-full">

                            <div className="h-[280px] w-full flex justify-center items-center">
                                {mounted && (
                                    <ResponsiveContainer width="100%" height="100%">

                                        <PieChart>

                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={100}
                                                stroke="rgba(15,23,42,0.8)"
                                                strokeWidth={3}
                                            >

                                                {pieData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (

                                                        <Cell
                                                            key={
                                                                index
                                                            }
                                                            fill={
                                                                entry.color
                                                            }
                                                            className="hover:opacity-80 transition-opacity duration-300 outline-none"
                                                        />
                                                    )
                                                )}

                                            </Pie>

                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                    border: '1px solid rgba(51, 65, 85, 0.8)',
                                                    borderRadius: '12px',
                                                    backdropFilter: 'blur(8px)',
                                                    color: '#f8fafc',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                                                }}
                                                itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                                            />

                                        </PieChart>

                                    </ResponsiveContainer>
                                )}
                            </div>

                            <div className="w-full space-y-2.5 mt-6">

                                {pieData.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        const percent =
                                            totalExpense >
                                                0
                                                ? (
                                                    (item.value /
                                                        totalExpense) *
                                                    100
                                                ).toFixed(
                                                    1
                                                )
                                                : 0;

                                        return (

                                            <div
                                                key={
                                                    index
                                                }
                                                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900/50 transition-colors duration-200 cursor-default group/legend border border-transparent hover:border-slate-800/60"
                                            >

                                                <div className="flex items-center gap-3.5">

                                                    <div className="relative">
                                                        <div
                                                            className="absolute inset-0 rounded-full blur-sm opacity-40 group-hover/legend:opacity-70 transition-opacity duration-300"
                                                            style={{ backgroundColor: item.color }}
                                                        />
                                                        <div
                                                            className="relative w-3.5 h-3.5 rounded-full border border-slate-900 shadow-sm"
                                                            style={{
                                                                backgroundColor:
                                                                    item.color,
                                                            }}
                                                        />
                                                    </div>

                                                    <span className="text-sm font-medium text-slate-300 group-hover/legend:text-slate-100 transition-colors">
                                                        {
                                                            item.name
                                                        }
                                                    </span>

                                                </div>

                                                <span className="text-sm font-sans tabular-nums font-bold text-slate-200 group-hover/legend:text-white transition-colors tracking-wide">
                                                    {percent}%
                                                </span>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>

                    </div>

                </section>

                {/* BOTTOM */}

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* TOP CATEGORY */}

                    <div className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 rounded-3xl p-6 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.4)] hover:shadow-rose-500/5 group/topspending relative overflow-hidden">
                        {/* Soft visual glow background */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-3xl pointer-events-none group-hover/topspending:bg-rose-500/20 transition-all duration-500" />

                        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                            Chi tiêu hàng đầu
                        </h3>

                        <div className="space-y-4">

                            {topExpenseCategories.map(
                                (
                                    item,
                                    index
                                ) => (

                                    <div
                                        key={
                                            index
                                        }
                                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-900 bg-slate-950/30 hover:bg-slate-900/30 hover:border-slate-800/80 transition-all duration-300 group/row hover:translate-x-1.5"
                                    >

                                        <div className="flex items-center gap-3.5">

                                            <div className="relative select-none">
                                                {/* Color glow backdrop */}
                                                <div
                                                    className="absolute inset-0 rounded-xl blur-md opacity-20 group-hover/row:opacity-40 transition-all duration-300 animate-pulse"
                                                    style={{ backgroundColor: item.color || "#fb7185" }}
                                                />
                                                <div
                                                    className="relative w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover/row:scale-105"
                                                    style={{
                                                        color: item.color || "#fb7185",
                                                        backgroundColor: `${item.color || "#fb7185"}15`,
                                                        borderColor: `${item.color || "#fb7185"}35`,
                                                    }}
                                                >
                                                    <span className="text-xl">{item.icon || "💸"}</span>
                                                </div>
                                            </div>

                                            <span className="font-semibold text-slate-200 group-hover/row:text-white transition-colors">
                                                {
                                                    item.name
                                                }
                                            </span>

                                        </div>

                                        <span className="font-sans tabular-nums flex items-baseline gap-0.5 text-lg text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.15)] group-hover/row:text-rose-300 transition-colors">
                                            <span className="text-sm font-semibold opacity-85 mr-0.5">-</span>
                                            <span className="text-lg font-black tracking-tight">{item.amount.toLocaleString("vi-VN")}</span>
                                            <span className="text-sm font-semibold opacity-75 ml-0.5">đ</span>
                                        </span>

                                    </div>
                                )
                            )}

                        </div>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-rose-500/20 to-transparent group-hover/topspending:via-rose-500/50 transition-all duration-300" />
                    </div>

                    {/* WARNINGS */}

                    <div className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 rounded-3xl p-6 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.4)] hover:shadow-amber-500/5 group/warnings relative overflow-hidden">
                        {/* Soft visual glow background */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover/warnings:bg-amber-500/20 transition-all duration-500" />

                        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                            Phân tích & Cảnh báo
                        </h3>

                        <div className="space-y-4">

                            {warnings.map(
                                (
                                    w,
                                    index
                                ) => (

                                    <div
                                        key={
                                            index
                                        }
                                        className={`p-4 rounded-2xl border flex gap-3.5 transition-all duration-300 group/warnrow hover:translate-x-1.5 ${w.type ===
                                            "warning"
                                            ? "bg-gradient-to-br from-red-950/20 via-slate-900/40 to-red-950/10 border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.08)]"
                                            : "bg-gradient-to-br from-emerald-950/20 via-slate-900/40 to-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                                            }`}
                                    >

                                        {w.type === "warning" ? (
                                            <div className="relative select-none flex-shrink-0 self-center">
                                                {/* Color glow backdrop */}
                                                <div className="absolute inset-0 rounded-xl bg-red-500 blur-md opacity-25 group-hover/warnrow:opacity-40 transition-all duration-300 animate-pulse" />
                                                <div className="relative w-10 h-10 rounded-xl flex items-center justify-center border border-red-500/35 bg-red-500/15 text-red-400 text-lg">
                                                    ⚠️
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative select-none flex-shrink-0 self-center">
                                                {/* Color glow backdrop */}
                                                <div className="absolute inset-0 rounded-xl bg-emerald-500 blur-md opacity-25 group-hover/warnrow:opacity-40 transition-all duration-300 animate-pulse" />
                                                <div className="relative w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-500/35 bg-emerald-500/15 text-emerald-400 text-lg">
                                                    ✅
                                                </div>
                                            </div>
                                        )}

                                        <div>

                                            <p className={`font-extrabold mb-1 transition-colors ${w.type === "warning"
                                                    ? "text-red-300 group-hover/warnrow:text-red-200"
                                                    : "text-emerald-300 group-hover/warnrow:text-emerald-200"
                                                }`}>
                                                {
                                                    w.title
                                                }
                                            </p>

                                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                {
                                                    w.desc
                                                }
                                            </p>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent group-hover/warnings:via-amber-500/50 transition-all duration-300" />
                    </div>

                </section>

            </main>

        </div>
    );
}
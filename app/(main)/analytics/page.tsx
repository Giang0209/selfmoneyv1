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

    // ===== BALANCE =====

    const totalBalance = useMemo(() => {

        return wallets.reduce(
            (sum, wallet) =>
                sum +
                Number(
                    wallet.balance || 0
                ),
            0
        );

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

        if (budgetPercent >= 100) {

            arr.push({
                type: "warning",
                title:
                    "Đã vượt ngân sách",
                desc: `Bạn đã vượt ${budgetPercent - 100
                    }% ngân sách tháng này.`,
            });

        } else if (
            budgetPercent >= 80
        ) {

            arr.push({
                type: "warning",
                title:
                    "Ngân sách sắp vượt mức",
                desc: `Bạn đã dùng ${budgetPercent}% ngân sách.`,
            });

        } else {

            arr.push({
                type: "good",
                title:
                    "Chi tiêu ổn định",
                desc:
                    "Bạn vẫn đang kiểm soát chi tiêu khá tốt.",
            });
        }

        if (totalBudget > 0) {

            const remaining =
                totalBudget - totalExpense;

            if (remaining > 0) {

                arr.push({
                    type: "good",
                    title:
                        "Ngân sách còn dư",
                    desc: `Bạn còn ${remaining.toLocaleString()}đ ngân sách trong tháng này.`,
                });

            } else {

                arr.push({
                    type: "warning",
                    title:
                        "Ngân sách đã hết",
                    desc:
                        "Bạn đã sử dụng toàn bộ ngân sách tháng này.",
                });
            }
        }

        // Wallet low balance
        wallets.forEach((wallet) => {

            const balance =
                Number(wallet.balance);

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
        totalIncome,
        totalExpense,
    ]);

    return (
        <div className="bg-[#0F172A] min-h-screen text-white">

            <Sidebar />
            <Header />

            <main className="ml-0 md:ml-64 pt-20 md:pt-24 p-4 md:p-8">

                {/* HEADER */}

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">

                    <div>

                        <h1 className="text-3xl font-bold mb-2">
                            Phân tích tài chính
                        </h1>

                        <p className="text-slate-400">
                            Thống kê thu chi và ngân sách theo thời gian
                        </p>

                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">

                        <select
                            value={
                                selectedMonth
                            }
                            onChange={(e) =>
                                setSelectedMonth(
                                    Number(
                                        e.target
                                            .value
                                    )
                                )
                            }
                            className="
                                w-full
                                bg-slate-950
                                border border-slate-800
                                rounded-xl
                                px-4 py-3
                            "
                        >
                            {Array.from({
                                length: 12,
                            }).map(
                                (_, i) => (
                                    <option
                                        key={i}
                                        value={
                                            i + 1
                                        }
                                    >
                                        Tháng{" "}
                                        {i + 1}
                                    </option>
                                )
                            )}
                        </select>

                        <input
                            type="number"
                            value={
                                selectedYear
                            }
                            onChange={(e) =>
                                setSelectedYear(
                                    Number(
                                        e.target
                                            .value
                                    )
                                )
                            }
                            className="
                                w-full
                                bg-slate-950
                                border border-slate-800
                                rounded-xl
                                px-4 py-3
                                text-center
                            "
                        />

                    </div>

                </div>

                {/* 4 CARDS */}

                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                    {/* INCOME */}

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-5">

                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 text-2xl">
                                💰
                            </div>

                            <span className="text-xs text-green-400 font-bold">
                                Thu nhập
                            </span>

                        </div>

                        <p className="text-slate-400 text-sm mb-1">
                            Tổng thu tháng này
                        </p>

                        <h2 className="text-3xl font-bold text-green-400">
                            +
                            {totalIncome.toLocaleString()}
                            đ
                        </h2>

                        <p className="text-xs mt-3 text-slate-400">

                            {incomePercent >= 0
                                ? "+"
                                : ""}

                            {incomePercent}%
                            so với tháng trước

                        </p>

                    </div>

                    {/* EXPENSE */}

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-5">

                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 text-2xl">
                                💳
                            </div>

                            <span className="text-xs text-red-400 font-bold">
                                Chi tiêu
                            </span>

                        </div>

                        <p className="text-slate-400 text-sm mb-1">
                            Tổng chi tháng này
                        </p>

                        <h2 className="text-3xl font-bold text-red-400">
                            -
                            {totalExpense.toLocaleString()}
                            đ
                        </h2>

                        <p className="text-xs mt-3 text-slate-400">

                            {expensePercent >= 0
                                ? "+"
                                : ""}

                            {expensePercent}%
                            so với tháng trước

                        </p>

                    </div>

                    {/* BALANCE */}

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-5">

                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl">
                                🏦
                            </div>

                            <span className="text-xs text-cyan-400 font-bold">
                                Số dư
                            </span>

                        </div>

                        <p className="text-slate-400 text-sm mb-1">
                            Tổng số dư các ví
                        </p>

                        <h2 className="text-3xl font-bold text-cyan-400">

                            {totalBalance.toLocaleString()}
                            đ

                        </h2>

                        <p className="text-xs mt-3 text-slate-400">
                            Tổng tài sản hiện tại
                        </p>

                    </div>

                    {/* BUDGET */}

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-4">

                            <span className="text-xs text-cyan-400 font-bold">
                                Ngân sách sử dụng
                            </span>

                            <span className="text-xs text-cyan-400 font-bold">

                                {budgetPercent}%

                            </span>

                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3">

                            {totalExpense.toLocaleString()}
                            đ

                        </h2>

                        <p className="text-sm text-slate-400 mb-4">

                            /{" "}
                            {totalBudget.toLocaleString()}
                            đ

                        </p>

                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">

                            <div
                                className="h-full bg-cyan-400 rounded-full"
                                style={{
                                    width: `${Math.min(
                                        budgetPercent,
                                        100
                                    )}%`,
                                }}
                            />

                        </div>

                    </div>

                </section>

                {/* CHART + PIE */}

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

                    {/* LINE CHART */}

                    <div className="xl:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <div className="flex items-center justify-between mb-8">

                            <div>

                                <h3 className="text-xl font-bold mb-1">
                                    Xu hướng tài chính
                                </h3>

                                <p className="text-slate-400 text-sm">
                                    Thu nhập - Chi tiêu - Số dư
                                </p>

                            </div>

                            <div className="flex gap-4 text-xs">

                                <div className="flex items-center gap-2">

                                    <div className="w-2 h-2 rounded-full bg-green-400" />

                                    <span className="text-slate-400">
                                        Thu nhập
                                    </span>

                                </div>

                                <div className="flex items-center gap-2">

                                    <div className="w-2 h-2 rounded-full bg-red-400" />

                                    <span className="text-slate-400">
                                        Chi tiêu
                                    </span>

                                </div>

                                <div className="flex items-center gap-2">

                                    <div className="w-2 h-2 rounded-full bg-cyan-400" />

                                    <span className="text-slate-400">
                                        Số dư
                                    </span>

                                </div>

                            </div>

                        </div>

                        <div className="h-[320px]">

                            <ResponsiveContainer width="100%" height="100%">

                                <LineChart data={lineChartData}>

                                    <XAxis
                                        dataKey="month"
                                        stroke="#94a3b8"
                                        padding={{
                                            left: 20,
                                            right: 20,
                                        }}
                                    />

                                    <Tooltip />

                                    <Line
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#4ade80"
                                        strokeWidth={3}
                                        name="Thu nhập"
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#f87171"
                                        strokeWidth={3}
                                        name="Chi tiêu"
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#22d3ee"
                                        strokeWidth={3}
                                        name="Số dư"
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                    {/* PIE */}

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <h3 className="text-xl font-bold mb-6">
                            Cơ cấu chi tiêu
                        </h3>

                        <div className="flex flex-col items-center">

                            <div className="h-[240px] w-full">

                                <ResponsiveContainer width="100%" height="100%">

                                    <PieChart>

                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={60}
                                            outerRadius={90}
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
                                                    />
                                                )
                                            )}

                                        </Pie>

                                        <Tooltip />

                                    </PieChart>

                                </ResponsiveContainer>

                            </div>

                            <div className="w-full space-y-3 mt-4">

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
                                                className="flex items-center justify-between"
                                            >

                                                <div className="flex items-center gap-3">

                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                item.color,
                                                        }}
                                                    />

                                                    <span className="text-sm">
                                                        {
                                                            item.name
                                                        }
                                                    </span>

                                                </div>

                                                <span className="text-sm font-bold text-slate-300">

                                                    {
                                                        percent
                                                    }
                                                    %

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

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <h3 className="text-xl font-bold mb-6">
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
                                        className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-800/30"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{
                                                    backgroundColor: `${item.color}20`,
                                                    color:
                                                        item.color,
                                                }}
                                            >
                                                {
                                                    item.icon
                                                }
                                            </div>

                                            <span className="font-medium">
                                                {
                                                    item.name
                                                }
                                            </span>

                                        </div>

                                        <span className="font-bold text-red-400">

                                            -{item.amount.toLocaleString()}
                                            đ

                                        </span>

                                    </div>
                                )
                            )}

                        </div>

                    </div>

                    {/* WARNINGS */}

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

                        <h3 className="text-xl font-bold mb-6">
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
                                        className={`p-4 rounded-2xl border flex gap-3 ${w.type ===
                                            "warning"
                                            ? "bg-red-500/10 border-red-500/20"
                                            : "bg-green-500/10 border-green-500/20"
                                            }`}
                                    >

                                        <div className="text-xl">

                                            {w.type ===
                                                "warning"
                                                ? "⚠️"
                                                : "✅"}

                                        </div>

                                        <div>

                                            <p className="font-bold mb-1">
                                                {
                                                    w.title
                                                }
                                            </p>

                                            <p className="text-sm text-slate-400">
                                                {
                                                    w.desc
                                                }
                                            </p>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}
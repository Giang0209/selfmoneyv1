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

    // ================= FETCH ALL =================
    useEffect(() => {

        const token = localStorage.getItem("token");

        const fetchAll = async () => {

            try {

                setLoadingCate(true);

                const [cateRes, budgetRes, transRes] = await Promise.all([
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
                ]);

                const [cateJson, budgetJson, transJson] = await Promise.all([
                    cateRes.json(),
                    budgetRes.json(),
                    transRes.json(),
                ]);

                setCategories(cateJson || []);
                setBudgets(budgetJson || []);
                setTransactions(transJson || []);

            } catch (err) {

                console.error(err);

            } finally {

                setLoadingCate(false);
            }
        };

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
        v.toLocaleString("vi-VN") + "đ";

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

    return (
        <div className="bg-[#0F172A] min-h-screen text-white">

            <Sidebar />
            <Header />

            <main className="ml-0 md:ml-64 pt-20 md:pt-24 p-4 md:p-8">

                {/* HEADER */}
                <div className="mb-6 flex justify-between items-center">

                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Danh sách ngân sách
                        </h1>

                        <p className="text-slate-400">
                            Quản lý ngân sách của bạn
                        </p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="bg-cyan-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-cyan-400"
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
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                        >
                            <option value="all">
                                Tất cả
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
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
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
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
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
                                className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-5"
                            >
                                <div className="flex items-center gap-3 mb-4">

                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{
                                            backgroundColor: `${b.color}20`,
                                            color: b.color,
                                        }}
                                    >
                                        <span className="material-symbols-outlined">
                                            {b.icon}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-bold">
                                            {b.name}
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Tháng {b.month}/{b.year}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between text-sm mb-2">

                                    <span className="text-slate-400">
                                        {formatMoney(
                                            b.spent
                                        )}{" "}
                                        /{" "}
                                        {formatMoney(
                                            b.limit
                                        )}
                                    </span>

                                    <span className="text-cyan-400 font-bold">
                                        {percent.toFixed(
                                            1
                                        )}
                                        %
                                    </span>
                                </div>

                                <div className="h-2 bg-slate-800 rounded-full">

                                    <div
                                        className="h-full bg-cyan-400"
                                        style={{
                                            width: `${percent}%`,
                                        }}
                                    />
                                </div>

                                {/* ACTIONS */}
                                <div className="mt-5 pt-4 border-t border-slate-700 flex justify-end gap-2">

                                    <button
                                        onClick={() =>
                                            handleEdit(
                                                b
                                            )
                                        }
                                        className="px-2 py-1 hover:text-cyan-400 transition"
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                b.id
                                            )
                                        }
                                        className="px-2 py-1 hover:text-red-500 transition"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* ===== MODAL ===== */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">

                    <div className="bg-[#1E293B]/90 border border-slate-700 rounded-2xl w-full max-w-lg">

                        {/* HEADER */}
                        <div className="p-5 border-b border-slate-700 flex justify-between items-start">

                            <div>
                                <h3 className="text-xl font-bold text-cyan-400">
                                    {editingId
                                        ? "Sửa ngân sách"
                                        : "Tạo ngân sách"}
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                    {editingId
                                        ? "Cập nhật ngân sách hiện tại"
                                        : "Thiết lập giới hạn chi tiêu theo danh mục"}
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-white transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-5 space-y-5">

                            {/* CATEGORY */}
                            <div>

                                <label className="text-sm text-slate-300 mb-2 block">
                                    Danh mục chi tiêu
                                </label>

                                <select
                                    disabled={editingId !== null}
                                    value={
                                        form.category_id
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            category_id:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className={`w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 ${editingId
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                        }`}
                                >
                                    <option value="">
                                        Chọn danh mục
                                    </option>

                                    {categories
                                        .filter(
                                            (c) =>
                                                c.type ===
                                                "expense"
                                        )
                                        .map((c) => (
                                            <option
                                                key={
                                                    c.id
                                                }
                                                value={
                                                    c.id
                                                }
                                            >
                                                {
                                                    c.icon
                                                }{" "}
                                                {
                                                    c.name
                                                }
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* LIMIT */}
                            <div>

                                <label className="text-sm text-slate-300 mb-2 block">
                                    Ngân sách giới hạn
                                </label>

                                <div className="relative mt-2">

                                    <input
                                        type="number"
                                        value={
                                            form.limit
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                limit:
                                                    e
                                                        .target
                                                        .value,
                                            })
                                        }
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-right text-2xl font-bold text-red-300 focus:border-cyan-500 outline-none"
                                        placeholder="0"
                                    />

                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                        VND
                                    </span>
                                </div>
                            </div>

                            {/* MONTH + YEAR */}
                            <div className="grid grid-cols-2 gap-4">

                                <div>

                                    <label className="text-sm text-slate-300 mb-2 block">
                                        Tháng
                                    </label>

                                    <select
                                        disabled={editingId !== null}
                                        value={
                                            form.month
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                month:
                                                    Number(
                                                        e
                                                            .target
                                                            .value
                                                    ),
                                            })
                                        }
                                        className={`w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 ${editingId
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                    >
                                        {Array.from({
                                            length: 12,
                                        }).map(
                                            (
                                                _,
                                                i
                                            ) => (
                                                <option
                                                    key={
                                                        i
                                                    }
                                                    value={
                                                        i +
                                                        1
                                                    }
                                                >
                                                    Tháng{" "}
                                                    {i +
                                                        1}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>

                                    <label className="text-sm text-slate-300 mb-2 block">
                                        Năm
                                    </label>

                                    <input
                                        disabled={editingId !== null}
                                        type="number"
                                        value={
                                            form.year
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                year:
                                                    Number(
                                                        e
                                                            .target
                                                            .value
                                                    ),
                                            })
                                        }
                                        className={`w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-center ${editingId
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="p-5 border-t border-slate-700 flex gap-3">

                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition disabled:opacity-50"
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
        </div>
    );
}
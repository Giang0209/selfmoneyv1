"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";


// Khai báo kiểu dữ liệu cho Giao dịch (Transaction)
type Transaction = {
    id: number;
    amount: string;
    note: string;
    transaction_date: string;

    category_name: string;
    category_type: "income" | "expense"; // Thu nhập hoặc Chi tiêu
    category_icon: string;
    category_color: string;

    wallet_name: string; // Tên ví thực hiện giao dịch
};

// Khai báo kiểu dữ liệu cho Danh mục (Category)
type Category = {
    id: number;
    name: string;
    type: "income" | "expense";
    icon: string;
    color: string;
};

// Khai báo kiểu dữ liệu cho Ví (Wallet)
type Wallet = {
    id: number;
    name: string;
    balance: string; // Số dư tài khoản/ví
};

export default function TransactionPage() {
    // --- KHAI BÁO CÁC STATE QUẢN LÝ DỮ LIỆU VÀ GIAO DIỆN ---
    const [transactions, setTransactions] = useState<Transaction[]>([]); // Danh sách tất cả giao dịch
    const [categories, setCategories] = useState<Category[]>([]);       // Danh sách danh mục thu/chi
    const [wallets, setWallets] = useState<Wallet[]>([]);               // Danh sách ví tiền của người dùng

    const [loading, setLoading] = useState(true);                       // Trạng thái tải dữ liệu
    const [openModal, setOpenModal] = useState(false);                  // Trạng thái đóng/mở form thêm/sửa

    // Quản lý ID giao dịch đang chỉnh sửa (null nếu là thêm mới)
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form chứa dữ liệu của giao dịch đang thêm/sửa
    const [form, setForm] = useState({
        amount: "",
        category_id: "",
        wallet_id: "",
        note: "",
    });

    // Các bộ lọc tìm kiếm và phân loại giao dịch
    const [filters, setFilters] = useState({
        search: "",       // Từ khóa tìm kiếm (theo ghi chú hoặc tên danh mục)
        category: "",     // Bộ lọc theo danh mục
        wallet: "",       // Bộ lọc theo ví
        from: "",         // Lọc từ ngày
        to: "",           // Lọc đến ngày
    });

    // Lấy JWT Token từ localStorage để xác thực API
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;


    // Tải toàn bộ dữ liệu cần thiết khi component được gắn (mounted)
    useEffect(() => {
        fetchAll();
    }, []);

    // Hàm gọi song song các API để tối ưu tốc độ tải trang
    const fetchAll = async () => {
        await Promise.all([
            fetchTransactions(),
            fetchCategories(),
            fetchWallets(),
        ]);
    };

    // Tải danh sách giao dịch từ API
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

    // Tải danh sách danh mục chi tiêu/thu nhập từ API
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

    // Tải danh sách ví của người dùng từ API
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

    // ==========================================
    // XỬ LÝ LƯU GIAO DỊCH (THÊM MỚI HOẶC CẬP NHẬT)
    // ==========================================
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

            // Đưa form về trạng thái trống sau khi lưu thành công
            setForm({
                amount: "",
                category_id: "",
                wallet_id: "",
                note: "",
            });

            // Tải lại danh sách giao dịch mới nhất
            fetchTransactions();
        } catch (err) {
            console.error(err);
        }
    };

    // ==========================================
    // CHUẨN BỊ DỮ LIỆU ĐỂ CHỈNH SỬA GIAO DỊCH
    // ==========================================
    const handleEdit = (t: Transaction) => {
        setEditingId(t.id);

        // Tìm category tương ứng dựa trên tên và loại
        const currentCategory = categories.find(
            (c) =>
                c.name === t.category_name &&
                c.type === t.category_type
        );

        // Tìm ví tương ứng thực hiện giao dịch
        const currentWallet = wallets.find(
            (w) => w.name === t.wallet_name
        );

        // Điền dữ liệu vào form để người dùng chỉnh sửa
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

    // ==========================================
    // XỬ LÝ XÓA GIAO DỊCH
    // ==========================================
    const handleDelete = async (id: number) => {
        const ok = confirm('Bạn có chắc muốn xóa giao dịch?');
        if (!ok) return;

        try {
            await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Cập nhật nhanh state tại frontend để không cần gọi lại API tải toàn bộ
            setTransactions((prev) =>
                prev.filter((t) => t.id !== id)
            );
        } catch (err) {
            console.error(err);
        }
    };

    // ===== PHẦN TÍNH TOÁN CÁC CHỈ SỐ TỔNG KẾT TÀI CHÍNH (DÙNG USEMEMO ĐỂ TỐI ƯU) =====
    
    // Tính tổng thu nhập trong tháng/tất cả
    const income = useMemo(
        () =>
            transactions
                .filter((t) => t.category_type === "income")
                .reduce((s, t) => s + Number(t.amount), 0),
        [transactions]
    );

    // Tính tổng chi tiêu
    const expense = useMemo(
        () =>
            transactions
                .filter((t) => t.category_type === "expense")
                .reduce((s, t) => s + Number(t.amount), 0),
        [transactions]
    );

    // Tính tổng số dư hiện có trên toàn bộ các ví
    const balance = useMemo(
        () =>
            wallets.reduce(
                (sum, wallet) => sum + Number(wallet.balance || 0),
                0
            ),
        [wallets]
    );

    // Lọc danh sách giao dịch dựa trên bộ lọc tìm kiếm
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const keyword = filters.search.toLowerCase();

            // Lọc theo ghi chú hoặc danh mục
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
                                Giao dịch
                            </h1>
                            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-cyan-500/20 tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                Transactions
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">
                            Xem, lọc và quản lý nhật ký thu chi cá nhân của bạn
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingId(null);
                            setOpenModal(true);
                        }}
                        className="bg-cyan-500 text-black px-5 py-2.5 rounded-2xl font-bold hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-200"
                    >
                        + Giao dịch mới
                    </button>
                </div>

                {/* ===== OVERVIEW (MATCH DASHBOARD STYLE) ===== */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    {/* INCOME */}
                    <div className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/5 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 group shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
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
                            <span className="text-3xl font-black tracking-tight leading-none">{income.toLocaleString("vi-VN")}</span>
                            <span className="text-xl font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                        </h2>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-green-500/50 to-transparent group-hover:via-green-400 transition-all duration-300" />
                    </div>

                    {/* EXPENSE */}
                    <div className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/5 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 group shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
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
                            <span className="text-3xl font-black tracking-tight leading-none">{expense.toLocaleString("vi-VN")}</span>
                            <span className="text-xl font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                        </h2>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent group-hover:via-red-400 transition-all duration-300" />
                    </div>

                    {/* BALANCE */}
                    <div className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/5 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 group shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
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
                            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 outline-none transition text-slate-200"
                        />

                        {/* CATEGORY */}
                        <select
                            value={filters.category}
                            onChange={(e) =>
                                setFilters({ ...filters, category: e.target.value })
                            }
                            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 outline-none transition text-slate-200"
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
                            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 outline-none transition text-slate-200"
                        >
                            <option value="">Tất cả tài khoản</option>
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
                            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 outline-none transition text-slate-200"
                        />

                        {/* TO */}
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) =>
                                setFilters({ ...filters, to: e.target.value })
                            }
                            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 outline-none transition text-slate-200"
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
                                    {/* Category color glow backdrop */}
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
                                        <span className="text-2xl">{t.category_icon}</span>
                                    </div>
                                </div>

                                {/* Text & info layout */}
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="font-bold text-slate-100 tracking-tight group-hover:text-white transition-colors duration-200">
                                            {t.category_name}
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-slate-400 border border-slate-800/80 shadow-inner group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all duration-300">
                                            {t.wallet_name}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-400 mt-1 truncate max-w-md group-hover:text-slate-300 transition-colors duration-200">
                                        {t.note || <span className="text-slate-600 italic text-xs">Không có ghi chú</span>}
                                    </p>
                                </div>

                                {/* Value & Actions */}
                                <div className="text-right flex flex-col justify-between h-full min-h-[4.5rem]">
                                    {/* Amount and localized currency symbol */}
                                    <div className={`font-sans tabular-nums flex items-baseline gap-0.5 justify-end text-lg transition-all duration-300 ${t.category_type === "income"
                                        ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.15)] group-hover:text-emerald-300"
                                        : "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.15)] group-hover:text-rose-300"
                                        }`}>
                                        <span className="text-sm font-semibold opacity-85 mr-0.5">{t.category_type === "income" ? "+" : "-"}</span>
                                        <span className="text-lg font-black tracking-tight">{Number(t.amount).toLocaleString("vi-VN")}</span>
                                        <span className="text-sm font-semibold opacity-75 ml-0.5">đ</span>
                                    </div>

                                    {/* Date with subtle calendar icon */}
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 justify-end font-medium group-hover:text-slate-400 transition-colors duration-200">
                                        <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>
                                            {new Date(t.transaction_date).toLocaleDateString("vi-VN", {
                                                timeZone: "Asia/Ho_Chi_Minh",
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    {/* Slide-in and fade-in Actions */}
                                    <div className="flex gap-2 justify-end mt-2 opacity-0 translate-x-3 scale-95 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 transition-all duration-300 origin-right">
                                        <button
                                            onClick={() => handleEdit(t)}
                                            className="text-slate-400 hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all p-1.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900 shadow-lg"
                                            title="Sửa giao dịch"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="text-slate-400 hover:text-rose-400 hover:scale-105 active:scale-95 transition-all p-1.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-rose-500/30 hover:bg-slate-900 shadow-lg"
                                            title="Xóa giao dịch"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ================= STANDARDIZED PREMIUM MODAL ================= */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">

                    <div className="bg-[#0b1329]/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden relative transform transition-all">
                        {/* Radiant decorative top line */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

                        {/* ================= HEADER ================= */}
                        <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/20">
                            <div>
                                <h2 className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    {isEdit ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Nhập thông tin giao dịch của bạn
                                </p>
                            </div>

                            <button
                                onClick={() => setOpenModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 flex items-center justify-center transition-all duration-200 text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* ================= BODY ================= */}
                        <div className="p-6 space-y-6">

                            {/* AMOUNT */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                    Số tiền giao dịch
                                </label>

                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl blur-sm" />
                                    <input
                                        value={form.amount}
                                        onChange={(e) =>
                                            setForm({ ...form, amount: e.target.value })
                                        }
                                        className="relative w-full bg-slate-950/80 border border-slate-800/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-5 py-4 text-right text-3xl font-extrabold text-cyan-400 placeholder-cyan-500/30 transition-all duration-300 font-mono tracking-tight"
                                        placeholder="0"
                                    />

                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-500/60 uppercase tracking-wider">
                                        VND
                                    </span>
                                </div>
                            </div>

                            {/* CATEGORY + WALLET */}
                            <div className="grid grid-cols-2 gap-4">

                                {/* CATEGORY */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Danh mục</label>

                                    <select
                                        value={form.category_id}
                                        disabled={isEdit}
                                        onChange={(e) =>
                                            setForm({ ...form, category_id: e.target.value })
                                        }
                                        className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-650 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                                    >
                                        <option value="" className="bg-slate-950 text-slate-400">Chọn danh mục</option>

                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                                                {c.icon} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* WALLET */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Tài khoản</label>

                                    <select
                                        value={form.wallet_id}
                                        disabled={isEdit}
                                        onChange={(e) =>
                                            setForm({ ...form, wallet_id: e.target.value })
                                        }
                                        className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-650 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                                    >
                                        <option value="" className="bg-slate-950 text-slate-400">Chọn tài khoản</option>

                                        {wallets.map((w) => (
                                            <option key={w.id} value={w.id} className="bg-slate-950 text-slate-200">
                                                {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            {/* NOTE */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                    Ghi chú
                                </label>

                                <textarea
                                    value={form.note}
                                    onChange={(e) =>
                                        setForm({ ...form, note: e.target.value })
                                    }
                                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 min-h-[100px] text-slate-200 placeholder-slate-600 transition-all duration-300 shadow-inner resize-none"
                                    placeholder="Ví dụ: ăn trưa, mua sắm..."
                                />
                            </div>
                        </div>

                        {/* ================= FOOTER ================= */}
                        <div className="px-6 py-5 bg-slate-950/40 border-t border-slate-800/80 flex gap-3">

                            <button
                                onClick={() => setOpenModal(false)}
                                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-800 text-slate-300 font-medium transition-all duration-200 active:scale-95"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20"
                            >
                                {isEdit ? 'Cập nhật' : 'Lưu giao dịch'}
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
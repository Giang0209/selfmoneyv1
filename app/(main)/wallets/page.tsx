"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { usePrivacy } from "@/lib/PrivacyContext";


type Wallet = {
    id: number;
    user_id: number;
    name: string;
    balance: string;
    icon: string;
    color?: string;
    created_at: string;
    deleted_at: string | null;
};

type WalletForm = {
    name: string;
    balance: string;
    icon: string;
    color: string;
};

export default function WalletsPage() {
    const { isPrivate, formatAmount } = usePrivacy();
    const toast = useToast();
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);


    const [open, setOpen] = useState(false);

    const [search, setSearch] = useState("");
    const filteredWallets = useMemo(() => {
        return wallets.filter((w) =>
            w.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [wallets, search]);

    // ===== MODE =====
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

    const [form, setForm] = useState<WalletForm>({
        name: "",
        balance: "",
        icon: "💼",
        color: "#06b6d4",
    });

    const walletIcons = ["🏦", "💵", "💳", "📱", "🪙"];

    const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
    const [depositCategoryId, setDepositCategoryId] = useState<string>("");
    const [depositNote, setDepositNote] = useState<string>("");

    useEffect(() => {
        fetchWallets();
        fetchIncomeCategories();
    }, []);

    const fetchIncomeCategories = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/categories", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const json = await res.json();
            const list = Array.isArray(json) ? json : (json.data || []);
            const filtered = list.filter((c: any) => c.type === "income");
            setIncomeCategories(filtered);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchWallets = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch("/api/wallets", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();

            if (Array.isArray(json)) {
                setWallets(json);
            } else {
                setWallets(json.data || []);
            }
        } catch (err) {
            console.error(err);
            setWallets([]);
        } finally {
            setLoading(false);
        }
    };

    const totalAssets = useMemo(() => {
        return wallets.reduce(
            (sum, wallet) => sum + Number(wallet.balance || 0),
            0
        );
    }, [wallets]);

    const formatMoney = (value: number) => formatAmount(value);

    const getWalletType = (icon: string) => {
        switch (icon) {
            case "🏦":
                return "Ngân hàng";
            case "💵":
                return "Tiền mặt";
            case "💳":
                return "Thẻ tín dụng";
            case "📱":
                return "Ví điện tử";
            case "🪙":
                return "Tiết kiệm";
            default:
                return "Cá nhân";
        }
    };

    // =========================
    // CREATE
    // =========================
    const handleCreateWallet = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!form.name || !form.balance) {
                toast.warning("Vui lòng nhập đầy đủ thông tin");
                return;
            }

            const res = await fetch("/api/wallets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    balance: Number(form.balance),
                    icon: form.icon,
                    color: form.color,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error("Tạo tài khoản thất bại");
                return;
            }

            toast.success("Tạo tài khoản thành công");

            setOpen(false);
            resetForm();

            fetchWallets();
        } catch (err) {
            console.error(err);
            toast.error("Lỗi tạo tài khoản");
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDeleteWallet = async (id: number) => {
        try {
            const token = localStorage.getItem("token");

            const ok = confirm("Bạn có chắc chắn muốn xóa ví này?");
            if (!ok) return;

            const res = await fetch(`/api/wallets/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error("Xoá thất bại");
                return;
            }

            setWallets((prev) => prev.filter((w) => w.id !== id));

            toast.success("Xoá tài khoản thành công");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi xoá tài khoản");
        }
    };

    // =========================
    // OPEN CREATE
    // =========================
    const openCreate = () => {
        setMode("create");
        setSelectedWallet(null);
        resetForm();
        setOpen(true);
    };

    // =========================
    // OPEN EDIT / DEPOSIT
    // =========================
    const openEdit = (wallet: Wallet) => {
        setMode("edit");
        setSelectedWallet(wallet);

        setForm({
            name: wallet.name,
            balance: "", // start empty for deposit amount input
            icon: wallet.icon,
            color: wallet.color || "#06b6d4",
        });

        // Set default category and note for deposit
        if (incomeCategories.length > 0) {
            setDepositCategoryId(String(incomeCategories[0].id));
        } else {
            setDepositCategoryId("");
        }
        setDepositNote(`Nạp tiền vào tài khoản ${wallet.name}`);

        setOpen(true);
    };

    const resetForm = () => {
        setForm({
            name: "",
            balance: "",
            icon: "💼",
            color: "#06b6d4",
        });
    };

    // =========================
    // UPDATE / DEPOSIT
    // =========================
    const handleUpdateWallet = async () => {
        try {
            if (!selectedWallet) return;

            const token = localStorage.getItem("token");

            const depositAmt = Number(form.balance);
            if (isNaN(depositAmt) || depositAmt <= 0) {
                toast.warning("Vui lòng nhập số tiền nạp hợp lệ");
                return;
            }

            if (!depositCategoryId) {
                toast.warning("Vui lòng chọn danh mục thu nhập");
                return;
            }

            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: depositAmt,
                    category_id: Number(depositCategoryId),
                    wallet_id: selectedWallet.id,
                    note: depositNote || `Nạp tiền vào tài khoản ${selectedWallet.name}`,
                    transaction_date: new Date().toISOString(),
                }),
            });

            if (!res.ok) {
                toast.error("Nạp tiền thất bại");
                return;
            }

            toast.success("Nạp tiền vào tài khoản thành công");

            setOpen(false);
            setMode("create");
            setSelectedWallet(null);

            fetchWallets();
        } catch (err) {
            console.error(err);
            toast.error("Lỗi nạp tiền vào tài khoản");
        }
    };


    // =========================
    // UI
    // =========================
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
                                Tài khoản
                            </h1>
                            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-cyan-500/20 tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                Tài khoản
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">
                            Quản lý tài khoản lưu trữ tiền của bạn
                        </p>
                    </div>
                </div>

                <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* SEARCH */}
                    <div className="relative flex items-center flex-1 max-w-sm">
                        <span className="absolute left-4 text-slate-500 pointer-events-none">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm tài khoản..."
                            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-2xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 transition-all duration-300 shadow-inner text-sm font-medium"
                        />
                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={openCreate}
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-5 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm tài khoản
                    </button>
                </div>

                {/* TOTAL ASSETS CARD */}
                <section className="mb-8">
                    <div className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-500" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/10 transition-all duration-500" />

                        <div className="flex items-center gap-3 text-slate-400 mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                💰
                            </div>
                            <span className="uppercase text-xs font-extrabold tracking-widest text-slate-400">
                                Tổng tài sản liên kết
                            </span>
                        </div>

                        <h1
                            className={`text-4xl font-sans tabular-nums flex items-baseline gap-0.5 select-all relative z-10 ${
                                totalAssets >= 0
                                    ? "text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.15)] font-black"
                                    : "text-rose-400 drop-shadow-[0_0_20px_rgba(251,113,133,0.15)] font-black"
                            }`}
                        >
                            <span className="text-2xl font-bold opacity-80 leading-none mr-1.5">{totalAssets >= 0 ? "+" : "-"}</span>
                            <span className="text-5xl font-black tracking-tight leading-none font-sans">{formatAmount(Math.abs(totalAssets), false)}</span>
                            {!isPrivate && <span className="text-3xl font-semibold opacity-70 ml-1.5 leading-none">đ</span>}
                        </h1>

                        <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent group-hover:via-cyan-400 transition-all duration-500" />
                    </div>
                </section>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                    </div>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        {filteredWallets.map((wallet) => (
                            <div
                                key={wallet.id}
                                className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-800/60 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#06b6d4]/5 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between min-h-[220px] shadow-[0_4px_25px_rgba(0,0,0,0.4)]"
                            >
                                {/* Background glow decoration matching wallet color */}
                                <div
                                    className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-10 pointer-events-none transition-all duration-500 group-hover:opacity-20"
                                    style={{
                                        background: `radial-gradient(circle, ${wallet.color || "#06b6d4"} 0%, transparent 70%)`
                                    }}
                                />

                                <div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className="flex items-center gap-3">
                                            {/* Icon Container */}
                                            <div
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105"
                                                style={{
                                                    color: wallet.color || "#06b6d4",
                                                    backgroundColor: `${wallet.color || "#06b6d4"}15`,
                                                    borderColor: `${wallet.color || "#06b6d4"}30`,
                                                }}
                                            >
                                                <span className="text-2xl leading-none">{wallet.icon || "💼"}</span>
                                            </div>

                                            <div>
                                                <h3 className="font-extrabold text-base text-slate-100 group-hover:text-white transition-colors duration-200 line-clamp-1">
                                                    {wallet.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-slate-950/80 text-slate-400 border border-slate-800/80 shadow-inner group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all duration-300 inline-block w-fit">
                                                        {getWalletType(wallet.icon)}
                                                    </span>
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                                        {new Date(wallet.created_at).toLocaleDateString("vi-VN")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions (always visible but light, highlights on hover) */}
                                        <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEdit(wallet);
                                                }}
                                                className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-slate-850 hover:border-emerald-500/20 p-2 rounded-xl transition duration-200"
                                                title="Nạp tiền"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteWallet(wallet.id);
                                                }}
                                                className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-slate-850 hover:border-rose-500/20 p-2 rounded-xl transition duration-200"
                                                title="Xóa ví"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Balance and type footer */}
                                <div className="mt-4 pt-3 border-t border-slate-800/40 relative z-10 flex flex-col justify-end">
                                    <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                                        Số dư khả dụng
                                    </div>
                                    <p
                                        className={`text-3xl font-black font-sans tabular-nums flex items-baseline gap-0.5 pb-2 pt-1 transition-all duration-300 ${
                                            Number(wallet.balance) >= 0
                                                ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.1)] group-hover:text-emerald-300"
                                                : "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.1)] group-hover:text-rose-300"
                                        }`}
                                    >
                                        <span className="text-lg font-bold mr-0.5">{Number(wallet.balance) >= 0 ? "+" : "-"}</span>
                                        <span className="tracking-tight truncate">{formatAmount(Math.abs(Number(wallet.balance)), false)}</span>
                                        {!isPrivate && <span className="text-lg font-semibold opacity-75 ml-0.5 flex-shrink-0">đ</span>}
                                    </p>
                                </div>

                                <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:via-cyan-400 transition-all duration-300"
                                     style={{
                                         background: `linear-gradient(to right, transparent, ${wallet.color || "#06b6d4"}60, transparent)`
                                     }}
                                />
                            </div>
                        ))}

                        <button
                            onClick={openCreate}
                            className="bg-gradient-to-br from-slate-950/20 to-slate-900/20 border border-slate-800/80 border-dashed rounded-3xl p-6 min-h-[220px] h-full
                                flex flex-col items-center justify-center relative overflow-hidden
                                hover:border-cyan-500/50 hover:bg-slate-900/30 transition-all duration-300 group"
                        >
                            {/* Hover decoration glows */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all duration-300" />
                            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/15 transition-all duration-300" />

                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.05)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>

                            <p className="font-bold text-slate-200 group-hover:text-white transition-colors duration-250 text-sm">
                                Thêm tài khoản
                            </p>

                            <p className="text-xs text-slate-500 mt-1 text-center max-w-[180px] leading-relaxed group-hover:text-slate-400 transition-colors duration-250">
                                Tạo tài khoản mới
                            </p>
                        </button>

                    </section>
                )}
            </main>

            {/* ===== STANDARDIZED PREMIUM MODAL ===== */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">

                    <div className="bg-[#0b1329]/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden relative transform transition-all">
                        {/* HEADER */}
                        <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/20">
                            <div>
                                <h3 className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    {mode === "create" ? "Thêm tài khoản" : "Nạp tiền vào tài khoản"}
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                    {mode === "create"
                                        ? "Tạo tài khoản mới"
                                        : `Nạp thêm tiền vào tài khoản ${selectedWallet?.name}`}
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

                            {mode === "create" ? (
                                <>
                                    {/* Tên ví */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                            Tên tài khoản
                                        </label>

                                        <input
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm({ ...form, name: e.target.value })
                                            }
                                            placeholder={'Tên tài khoản'}
                                            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-650 transition-all duration-300 shadow-inner"
                                        />
                                    </div>

                                    {/* Số dư */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                            Số dư
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl blur-sm" />
                                            <input
                                                type="number"
                                                value={form.balance}
                                                onChange={(e) =>
                                                    setForm({ ...form, balance: e.target.value })
                                                }
                                                placeholder="0"
                                                className="relative w-full bg-slate-950/80 border border-slate-800/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-5 py-4 text-right text-3xl font-extrabold text-cyan-400 placeholder-cyan-500/30 transition-all duration-300 font-mono tracking-tight"
                                            />
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-500/60 uppercase tracking-wider">
                                                VND
                                            </span>
                                        </div>
                                    </div>

                                    {/* Chọn icon */}
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                                            Chọn icon
                                        </p>

                                        <div className="grid grid-cols-5 gap-3">
                                            {walletIcons.map((icon) => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() =>
                                                        setForm({ ...form, icon })
                                                    }
                                                    className={`h-12 rounded-xl border text-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95
                                                        ${form.icon === icon
                                                            ? "border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                                                            : "border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900"
                                                        }`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Màu sắc ví */}
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                                            Chọn màu
                                        </p>

                                        <div className="flex gap-3 flex-wrap">
                                            {["#06b6d4", "#f97316", "#3b82f6", "#10b981", "#a855f7", "#eab308", "#ef4444"].map((c) => (
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
                                </>
                            ) : (
                                <>
                                    {/* Chỉ hiển Số dư hiện tại dưới dạng chỉ đọc và ô Nạp tiền */}
                                    <div className="bg-slate-900/60 rounded-xl p-4 flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Số dư hiện tại</span>
                                        <span className="font-extrabold text-cyan-400 text-lg">{formatMoney(Number(selectedWallet?.balance || 0))}</span>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                            Số tiền nạp thêm
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-xl blur-sm" />
                                            <input
                                                type="number"
                                                value={form.balance}
                                                onChange={(e) =>
                                                    setForm({ ...form, balance: e.target.value })
                                                }
                                                placeholder="0"
                                                className="relative w-full bg-slate-950/80 border border-slate-800/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-5 py-4 text-right text-3xl font-extrabold text-emerald-400 placeholder-emerald-500/30 transition-all duration-300 font-mono tracking-tight"
                                            />
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500/60 uppercase tracking-wider">
                                                VND
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                            Danh mục thu nhập
                                        </label>
                                        <select
                                            value={depositCategoryId}
                                            onChange={(e) => setDepositCategoryId(e.target.value)}
                                            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-650 transition-all duration-300 shadow-inner"
                                        >
                                            <option value="" className="bg-slate-950 text-slate-400">Chọn danh mục thu nhập</option>
                                            {incomeCategories.map((c) => (
                                                <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                                                    {c.icon} {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                            Ghi chú
                                        </label>
                                        <input
                                            value={depositNote}
                                            onChange={(e) => setDepositNote(e.target.value)}
                                            placeholder="Ghi chú nạp tiền"
                                            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-650 transition-all duration-300 shadow-inner"
                                        />
                                    </div>
                                </>
                            )}

                        </div>

                        {/* FOOTER */}
                        <div className="px-6 py-5 bg-slate-950/40 border-t border-slate-800/80 flex gap-3">

                            <button
                                onClick={() => setOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-800 text-slate-300 font-medium transition-all duration-200 active:scale-95"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={
                                    mode === "create"
                                        ? handleCreateWallet
                                        : handleUpdateWallet
                                }
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20"
                            >
                                {mode === "create"
                                    ? "Lưu"
                                    : "Xác nhận nạp"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
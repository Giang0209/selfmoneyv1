"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";


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

    useEffect(() => {
        fetchWallets();
    }, []);

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

    const formatMoney = (value: number) =>
        Math.round(value).toLocaleString("vi-VN") + " đ";

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
                alert("Vui lòng nhập đầy đủ thông tin");
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
                alert("Tạo tài khoản thất bại");
                return;
            }

            alert("Tạo tài khoản thành công");

            setOpen(false);
            resetForm();

            fetchWallets();
        } catch (err) {
            console.error(err);
            alert("Lỗi tạo tài khoản");
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
                alert("Xoá thất bại");
                return;
            }

            setWallets((prev) => prev.filter((w) => w.id !== id));

            alert("Xoá tài khoản thành công");
        } catch (err) {
            console.error(err);
            alert("Lỗi xoá tài khoản");
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
                alert("Vui lòng nhập số tiền nạp hợp lệ");
                return;
            }

            const newBalance = Number(selectedWallet.balance) + depositAmt;

            const res = await fetch(`/api/wallets/${selectedWallet.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    balance: newBalance,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert("Nạp tiền thất bại");
                return;
            }

            alert("Nạp tiền vào tài khoản thành công");

            setOpen(false);
            setMode("create");
            setSelectedWallet(null);

            fetchWallets();
        } catch (err) {
            console.error(err);
            alert("Lỗi nạp tiền vào tài khoản");
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

                <div className="mb-6 flex items-center justify-between gap-4">

                    {/* SEARCH (giữ style cũ nhưng nâng cấp giao diện) */}
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm tài khoản"
                        className="w-full md:w-80 bg-slate-950/70 border border-slate-800/80 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 transition-all duration-300 shadow-inner"
                    />

                    {/* BUTTON */}
                    <button
                        onClick={openCreate}
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/10 flex items-center gap-2"
                    >
                        <span className="text-lg leading-none font-black">+</span>
                        Thêm tài khoản
                    </button>

                </div>

                <section className="mb-8">
                    <div className="bg-gradient-to-br from-slate-950/60 via-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-300" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/10 transition-all duration-300" />

                        <div className="flex items-center gap-3 text-slate-400 mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                💰
                            </div>
                            <span className="uppercase text-xs font-bold tracking-wider text-slate-300">
                                Tổng tài sản
                            </span>
                        </div>

                        <h1
                            className={`text-4xl font-sans tabular-nums flex items-baseline gap-0.5 select-all relative z-10 ${totalAssets >= 0
                                ? "text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                                : "text-rose-400 drop-shadow-[0_0_20px_rgba(251,113,133,0.15)]"
                                }`}
                        >
                            <span className="text-2xl font-semibold opacity-85 leading-none mr-1">{totalAssets >= 0 ? "+" : "-"}</span>
                            <span className="text-4xl font-black tracking-tight leading-none">{Math.abs(totalAssets).toLocaleString("vi-VN")}</span>
                            <span className="text-3xl font-semibold opacity-75 ml-1 leading-none">đ</span>
                        </h1>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent group-hover:via-cyan-400 transition-all duration-300" />
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
                                className="bg-gradient-to-br from-slate-950/60 via-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-slate-800/60 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#06b6d4]/5 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between h-[260px] shadow-[0_4px_25px_rgba(0,0,0,0.4)]"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        {/* Icon with radial glow */}
                                        <div className="relative select-none">
                                            {/* Color glow backdrop */}
                                            <div
                                                className="absolute inset-0 rounded-2xl blur-md opacity-10 group-hover:opacity-30 transition-all duration-300 animate-pulse-glow"
                                                style={{ backgroundColor: wallet.color || "#06b6d4" }}
                                            />
                                            <div
                                                className="relative w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105"
                                                style={{
                                                    color: wallet.color || "#06b6d4",
                                                    backgroundColor: `${wallet.color || "#06b6d4"}15`,
                                                    borderColor: `${wallet.color || "#06b6d4"}35`,
                                                }}
                                            >
                                                <span className="text-2xl">{wallet.icon || "💼"}</span>
                                            </div>
                                        </div>

                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950/40 px-2 py-1 rounded-md border border-slate-900/60">
                                            {new Date(wallet.created_at).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-white transition-colors duration-200">
                                        {wallet.name}
                                    </h3>

                                    <div className="mt-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-slate-400 border border-slate-800/80 shadow-inner group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all duration-300 inline-block w-fit">
                                            {getWalletType(wallet.icon)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p
                                        className={`text-3xl font-sans tabular-nums flex items-baseline gap-0.5 transition-all duration-300 ${Number(wallet.balance) >= 0
                                            ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.1)] group-hover:text-emerald-300"
                                            : "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.1)] group-hover:text-rose-300"
                                            }`}
                                    >
                                        <span className="text-xl font-semibold opacity-85 leading-none mr-0.5">{Number(wallet.balance) >= 0 ? "+" : "-"}</span>
                                        <span className="text-4xl font-black tracking-tight leading-none">{Math.abs(Number(wallet.balance)).toLocaleString("vi-VN")}</span>
                                        <span className="text-xl font-semibold opacity-75 ml-0.5 leading-none">đ</span>
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center h-8">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold group-hover:text-slate-400 transition-colors">
                                            Tài khoản
                                        </span>
                                        {/* Slide-in and fade-in Actions with Custom Premium SVGs */}
                                        <div className="flex gap-2 opacity-0 translate-x-3 scale-95 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 transition-all duration-350 origin-right">
                                            <button
                                                onClick={() => openEdit(wallet)}
                                                className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition p-1.5 rounded-lg flex items-center justify-center"
                                                title={"Nạp tiền"}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => handleDeleteWallet(wallet.id)}
                                                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition p-1.5 rounded-lg flex items-center justify-center"
                                                title={"Xóa"}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={openCreate}
                            className="bg-gradient-to-br from-slate-950/20 to-slate-900/20 border border-slate-800/80 border-dashed rounded-3xl p-6 min-h-[260px] h-full
                                flex flex-col items-center justify-center relative overflow-hidden
                                hover:border-cyan-500/50 hover:bg-slate-900/30 transition-all duration-350 group"
                        >
                            {/* Hover decoration glows */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all duration-350" />
                            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/15 transition-all duration-350" />

                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-all duration-350 shadow-[0_0_15px_rgba(6,182,212,0.05)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>

                            <p className="font-bold text-slate-200 group-hover:text-white transition-colors duration-250 text-base">
                                Thêm tài khoản
                            </p>

                            <p className="text-xs text-slate-500 mt-1.5 text-center max-w-[200px] leading-relaxed group-hover:text-slate-400 transition-colors duration-250">
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
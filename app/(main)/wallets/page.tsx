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
        value.toLocaleString("vi-VN") + "đ";

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
                return "Ví cá nhân";
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
                alert(data.message || "Tạo ví thất bại");
                return;
            }

            alert("Tạo ví thành công");

            setOpen(false);
            resetForm();

            fetchWallets();
        } catch (err) {
            console.error(err);
            alert("Lỗi tạo ví");
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDeleteWallet = async (id: number) => {
        try {
            const token = localStorage.getItem("token");

            const ok = confirm("Bạn có chắc muốn xoá ví này?");
            if (!ok) return;

            const res = await fetch(`/api/wallets/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Xoá thất bại");
                return;
            }

            setWallets((prev) => prev.filter((w) => w.id !== id));

            alert("Xoá ví thành công");
        } catch (err) {
            console.error(err);
            alert("Lỗi xoá ví");
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
    // OPEN EDIT
    // =========================
    const openEdit = (wallet: Wallet) => {
        setMode("edit");
        setSelectedWallet(wallet);

        setForm({
            name: wallet.name,
            balance: String(wallet.balance),
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
    // UPDATE
    // =========================
    const handleUpdateWallet = async () => {
        try {
            if (!selectedWallet) return;

            const token = localStorage.getItem("token");

            const res = await fetch(`/api/wallets/${selectedWallet.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    balance: Number(form.balance),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Cập nhật thất bại");
                return;
            }

            alert("Cập nhật số dư thành công");

            setOpen(false);
            setMode("create");
            setSelectedWallet(null);

            fetchWallets();
        } catch (err) {
            console.error(err);
            alert("Lỗi cập nhật ví");
        }
    };


    // =========================
    // UI
    // =========================
    return (
        <div className="bg-[#0F172A] min-h-screen text-white">

            <Sidebar />
            <Header />

            <main className="ml-64 pt-24 p-8">

                <div className="mb-10">
                    <h1 className="text-3xl font-bold mb-2">
                        Ví của tôi
                    </h1>

                    <p className="text-slate-400">
                        Quản lý ví và số dư của bạn
                    </p>
                </div>

                <div className="mb-6 flex items-center justify-between gap-4">

                    {/* SEARCH (giữ style cũ) */}
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm ví..."
                        className="w-full md:w-80 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
                    />

                    {/* BUTTON */}
                    <button
                        onClick={openCreate}
                        className="bg-cyan-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-cyan-400"
                    >
                        + Ví mới
                    </button>

                </div>

                <section className="mb-8">
                    <div className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-8 backdrop-blur-xl">
                        <div className="flex items-center gap-3 text-slate-400 mb-3">
                            <span className="text-cyan-400 text-2xl">💰</span>
                            <span className="uppercase text-xs font-bold tracking-wider">
                                Tổng tài sản
                            </span>
                        </div>

                        <h1
                            className={`text-5xl font-bold ${totalAssets >= 0
                                ? "text-cyan-400"
                                : "text-red-400"
                                }`}
                        >
                            {totalAssets >= 0 ? "+" : "-"}
                            {formatMoney(Math.abs(totalAssets))}
                        </h1>
                    </div>
                </section>

                {loading ? (
                    <p className="text-slate-400">Loading...</p>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        {filteredWallets.map((wallet) => (
                            <div
                                key={wallet.id}
                                className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-6 backdrop-blur-xl hover:border-cyan-400/40 transition-all flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-6">

                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl border border-slate-700 bg-black/40">
                                        {wallet.icon}
                                    </div>

                                    <span className="text-xs text-slate-400">
                                        {new Date(wallet.created_at).toLocaleDateString("vi-VN")}
                                    </span>

                                </div>

                                <h3 className="text-xl font-bold mb-1">
                                    {wallet.name}
                                </h3>

                                <p className="text-sm text-slate-400 mb-6">
                                    {getWalletType(wallet.icon)}
                                </p>

                                <p
                                    className={`text-3xl font-bold ${Number(wallet.balance) >= 0
                                        ? "text-green-400"
                                        : "text-red-400"
                                        }`}
                                >
                                    {Number(wallet.balance) >= 0 ? "+" : "-"}
                                    {formatMoney(Math.abs(Number(wallet.balance)))}
                                </p>

                                <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end">

                                    <div className="flex gap-2 items-center">

                                        <button
                                            onClick={() => openEdit(wallet)}
                                            className="text-lg px-2 py-1 rounded border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 transition"
                                            title="Sửa ví"
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            onClick={() => handleDeleteWallet(wallet.id)}
                                            className="text-lg px-2 py-1 rounded border border-slate-600 hover:border-red-500 hover:text-red-500 transition"
                                            title="Xóa ví"
                                        >
                                            🗑️
                                        </button>

                                    </div>

                                </div>
                            </div>
                        ))}

                        <button
                            onClick={openCreate}
                            className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-6 min-h-[280px]
    flex flex-col items-center justify-center
    hover:border-cyan-400/60 hover:bg-[#1E293B]/90 transition-all"
                        >
                            <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-3xl mb-4">
                                +
                            </div>

                            <p className="font-bold text-white text-lg">
                                Thêm ví tiền
                            </p>

                            <p className="text-xs text-slate-400 mt-1 text-center">
                                Tạo ví để quản lý tiền của bạn
                            </p>
                        </button>

                    </section>
                )}
            </main>

            {/* ===== MODAL GIỮ NGUYÊN 100% UI ===== */}
            {open && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">

                    <div className="bg-[#1E293B]/90 border border-slate-700 rounded-2xl w-full max-w-lg">

                        {/* HEADER */}
                        <div className="p-5 border-b border-slate-700 flex justify-between items-start">

                            <div>
                                <h3 className="text-xl font-bold text-cyan-400">
                                    {mode === "create" ? "Tạo ví mới" : "Cập nhật ví"}
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                    {mode === "create"
                                        ? "Thêm ví để quản lý tài chính cá nhân"
                                        : "Chỉnh sửa thông tin ví hiện tại"}
                                </p>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="text-slate-400 hover:text-white transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-5 space-y-5">

                            <div>
                                <label className="text-sm text-slate-300 mb-2 block">
                                    Tên ví
                                </label>

                                <input
                                    value={form.name}
                                    disabled={mode === "edit"}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    placeholder="Ví MB Bank"
                                    className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-cyan-400"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-slate-300 mb-2 block">
                                    Số dư
                                </label>
                                <div className="relative mt-2">
                                    <input
                                        type="number"
                                        value={form.balance}
                                        onChange={(e) =>
                                            setForm({ ...form, balance: e.target.value })
                                        }
                                        placeholder="0"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-right text-2xl font-bold text-red-300 focus:border-cyan-500 outline-none"
                                    />
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                        VND
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-slate-300 mb-3">
                                    Chọn icon
                                </p>

                                <div className="grid grid-cols-5 gap-3">
                                    {walletIcons.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            disabled={mode === "edit"}
                                            onClick={() =>
                                                setForm({ ...form, icon })
                                            }
                                            className={`h-12 rounded-xl border text-xl ${form.icon === icon
                                                ? "border-cyan-400 bg-cyan-500/10"
                                                : "border-slate-700"
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* FOOTER */}
                        <div className="p-5 border-t border-slate-700 flex gap-3">

                            <button
                                onClick={() => setOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-slate-700"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={
                                    mode === "create"
                                        ? handleCreateWallet
                                        : handleUpdateWallet
                                }
                                className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-bold"
                            >
                                Lưu ví
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
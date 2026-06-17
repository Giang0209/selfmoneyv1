"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { usePrivacy } from "@/lib/PrivacyContext";

// ─── Real Types ───────────────────────────────────────────────────────────────
type SavingGoal = {
    id: number;
    name: string;
    icon: string;
    target_amount: number;
    saved_amount: number;
    deadline: string | null;
    status: "active" | "completed" | "cancelled";
    color: string;
    category_id: number | null;
    category_name?: string;
    category_icon?: string;
    category_color?: string;
};

type Contribution = {
    id: number;
    amount: number;
    note: string;
    contributed_at: string;
    wallet_name?: string;
};

type Category = {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    type?: "income" | "expense";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) => Math.round(v).toLocaleString("vi-VN") + " đ";

function daysLeft(deadline: string | null): number | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function CircleProgress({ percent, color, size = 80 }: { percent: number; color: string; size?: number }) {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (circ * Math.min(percent, 100)) / 100;
    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={8} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={8}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{
                    transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)",
                    filter: `drop-shadow(0 0 6px ${color}90)`,
                }}
            />
        </svg>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SavingGoalsPage() {
    const { isPrivate, formatAmount } = usePrivacy();
    const fmt = (v: number) => formatAmount(v);
    const toast = useToast();
    const [goals, setGoals] = useState<SavingGoal[]>([]);
    const [wallets, setWallets] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [surpluses, setSurpluses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [search, setSearch] = useState("");

    // Modal states
    const [createOpen, setCreateOpen] = useState(false);
    const [detailGoal, setDetailGoal] = useState<SavingGoal | null>(null);
    const [detailContributions, setDetailContributions] = useState<Contribution[]>([]);
    const [contributeGoal, setContributeGoal] = useState<SavingGoal | null>(null);
    const [surplusModal, setSurplusModal] = useState(false);
    const [selectedSurplusItem, setSelectedSurplusItem] = useState<any | null>(null);
    const [completedGoalAlert, setCompletedGoalAlert] = useState<SavingGoal | null>(null);

    // Create form
    const [form, setForm] = useState({ name: "", icon: "🎯", target: "", deadline: "", color: "#06b6d4", category_id: "" });

    // Contribute form
    const [contribAmount, setContribAmount] = useState("");
    const [contribNote, setContribNote] = useState("");
    const [contribWalletId, setContribWalletId] = useState("");

    // Surplus transfer form
    const [surplusTargetId, setSurplusTargetId] = useState<number | "">("");
    const [surplusAmount, setSurplusAmount] = useState("");
    const [surplusWalletId, setSurplusWalletId] = useState("");

    const fetchAllData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            setLoading(true);
            const now = new Date();
            let m = now.getMonth(); // Lấy tháng trước đã kết thúc (0-indexed tương ứng 1-indexed của tháng trước)
            let y = now.getFullYear();
            if (m === 0) {
                m = 12;
                y -= 1;
            }

            const [goalsRes, walletsRes, categoriesRes, surplusRes] = await Promise.all([
                fetch("/api/saving-goals", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("/api/wallets", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/saving-goals/budget-surplus?month=${m}&year=${y}`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            const [goalsJson, walletsJson, categoriesJson, surplusJson] = await Promise.all([
                goalsRes.json(),
                walletsRes.json(),
                categoriesRes.json(),
                surplusRes.json(),
            ]);

            setGoals(Array.isArray(goalsJson) ? goalsJson : []);
            setWallets(Array.isArray(walletsJson) ? walletsJson : []);
            setCategories(Array.isArray(categoriesJson) ? categoriesJson : []);
            setSurpluses(Array.isArray(surplusJson) ? surplusJson : []);
        } catch (err) {
            console.error("Error loading saving goals data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Filtered goals
    const filtered = useMemo(() => {
        return goals.filter((g) => {
            const matchStatus = filter === "all" || g.status === filter;
            const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [goals, filter, search]);

    // Stats
    const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
    const totalSaved = goals.reduce((s, g) => s + Number(g.saved_amount), 0);
    const activeCount = goals.filter((g) => g.status === "active").length;
    const completedCount = goals.filter((g) => g.status === "completed").length;

    // Handlers
    const handleCreate = async () => {
        if (!form.name || !form.target) { toast.warning("Vui lòng nhập đủ thông tin"); return; }
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("/api/saving-goals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    icon: form.icon,
                    target_amount: Number(form.target),
                    deadline: form.deadline || null,
                    color: form.color,
                    category_id: form.category_id ? Number(form.category_id) : null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Tạo mục tiêu thất bại");
            
            toast.success("Tạo mục tiêu thành công!");
            setForm({ name: "", icon: "🎯", target: "", deadline: "", color: "#06b6d4", category_id: "" });
            setCreateOpen(false);
            await fetchAllData();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleContribute = async () => {
        if (!contributeGoal || !contribAmount || !contribWalletId) {
            toast.warning("Vui lòng nhập số tiền và chọn ví nguồn");
            return;
        }
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/saving-goals/${contributeGoal.id}/contribute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    wallet_id: Number(contribWalletId),
                    amount: Number(contribAmount),
                    note: contribNote || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Nạp tiền thất bại");

            setContribAmount("");
            setContribNote("");
            setContribWalletId("");
            setContributeGoal(null);
            await fetchAllData();

            toast.success("Nạp tiền vào mục tiêu thành công!");
            if (data.goal && data.goal.status === "completed") {
                setCompletedGoalAlert(data.goal);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleSurplusTransfer = async () => {
        if (!surplusTargetId || !surplusAmount || !surplusWalletId) {
            toast.warning("Vui lòng chọn mục tiêu, ví nguồn và nhập số tiền");
            return;
        }
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/saving-goals/${surplusTargetId}/contribute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    wallet_id: Number(surplusWalletId),
                    amount: Number(surplusAmount),
                    note: `Chuyển dư ngân sách danh mục ${selectedSurplusItem?.category_name || ""}`,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Chuyển tiền thất bại");

            setSurplusModal(false);
            setSurplusTargetId("");
            setSurplusWalletId("");
            setSelectedSurplusItem(null);
            await fetchAllData();

            toast.success("Chuyển tiền dư vào mục tiêu thành công!");
            if (data.goal && data.goal.status === "completed") {
                setCompletedGoalAlert(data.goal);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Xóa mục tiêu này?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/saving-goals/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Xóa mục tiêu thất bại");
            
            toast.success("Xóa mục tiêu thành công!");
            await fetchAllData();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleOpenDetail = async (goal: SavingGoal) => {
        setDetailGoal(goal);
        setDetailContributions([]);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/saving-goals/${goal.id}/contributions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setDetailContributions(data);
            }
        } catch (err) {
            console.error("Error loading contributions:", err);
        }
    };

    const ICON_OPTIONS = ["🎯", "📱", "💻", "🏕️", "✈️", "🏠", "🚗", "💍", "🎓", "🛡️", "🎸", "📸", "⌚", "🎮", "💰"];
    const COLOR_OPTIONS = ["#06b6d4", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6", "#f97316"];

    return (

        <div className="bg-background min-h-screen text-foreground relative overflow-hidden transition-colors duration-300">
            {/* Ambient blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />

            <Sidebar />
            <Header />

            <main className="ml-64 pt-24 p-8 relative z-10">

                {/* ── Page Header ── */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900/60 pb-6 relative">
                    <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-violet-500 to-transparent" />
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
                                Mục tiêu tiết kiệm
                            </h1>
                            <span className="bg-violet-500/10 text-violet-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-violet-500/20 tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                                Goals
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">
                            Đặt mục tiêu tiết kiệm, nạp tiền hàng tháng và theo dõi tiến độ
                        </p>
                    </div>

                    <button
                        onClick={() => setCreateOpen(true)}
                        id="btn-create-goal"
                        className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-5 py-2.5 rounded-2xl font-bold hover:from-violet-400 hover:to-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-200"
                    >
                        + Thêm mục tiêu
                    </button>
                </div>

                {/* ── Surplus Banners ── */}
                {surpluses.map((item) => (
                    <div key={item.category_id} className="mb-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl flex-shrink-0">
                                {item.category_icon || "🎉"}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-400">Dư ngân sách danh mục {item.category_name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Hạn mức {fmt(Number(item.budget_amount))} - Đã tiêu {fmt(Number(item.total_spent))} = <span className="text-emerald-400 font-bold">{fmt(Number(item.surplus_amount))}</span> dư ra — Bạn có muốn tích luỹ?
                                </p>
                            </div>
                        </div>
                        <button
                            id={`btn-transfer-surplus-${item.category_id}`}
                            onClick={() => {
                                setSelectedSurplusItem(item);
                                setSurplusAmount(String(item.surplus_amount));
                                setSurplusWalletId(wallets[0]?.id || "");
                                if (item.goals && item.goals.length > 0) {
                                    setSurplusTargetId(item.goals[0].id);
                                } else {
                                    setSurplusTargetId("");
                                }
                                setSurplusModal(true);
                            }}
                            className="flex-shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        >
                            Chuyển ngay →
                        </button>
                    </div>
                ))}

                {/* ── Summary Stats ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Tổng mục tiêu", value: fmt(totalTarget), icon: "🎯", color: "text-violet-400" },
                        { label: "Đã tiết kiệm", value: fmt(totalSaved), icon: "💰", color: "text-emerald-400" },
                        { label: "Đang thực hiện", value: activeCount + " mục tiêu", icon: "⏳", color: "text-cyan-400" },
                        { label: "Hoàn thành", value: completedCount + " mục tiêu", icon: "✅", color: "text-amber-400" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                            <span className="text-xl sm:text-2xl flex-shrink-0">{stat.icon}</span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate" title={stat.label}>{stat.label}</p>
                                <p className={`text-xs sm:text-sm font-black mt-0.5 truncate ${stat.color}`} title={stat.value}>{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {(["all", "active", "completed"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${filter === f
                                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                                : "bg-slate-900/40 text-slate-400 border border-slate-800 hover:border-slate-700"
                                }`}
                        >
                            {f === "all" ? "Tất cả" : f === "active" ? "Đang thực hiện" : "Hoàn thành"}
                        </button>
                    ))}
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm mục tiêu..."
                        className="ml-auto w-48 bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2 outline-none text-slate-200 text-sm transition"
                    />
                </div>

                {/* ── Goals Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((goal) => {
                        const pct = Math.min(100, (goal.saved_amount / goal.target_amount) * 100);
                        const dl = daysLeft(goal.deadline);
                        const remaining = goal.target_amount - goal.saved_amount;

                        return (
                            <div
                                key={goal.id}
                                className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 backdrop-blur-xl border border-slate-850 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-2xl rounded-3xl p-6 relative overflow-hidden transition-all duration-300 group shadow-[0_4px_25px_rgba(0,0,0,0.4)]"
                            >
                                {/* Completed overlay shimmer */}
                                {goal.status === "completed" && (
                                    <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl pointer-events-none" />
                                )}

                                {/* Top row */}
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-13 h-13 w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-all duration-300 group-hover:scale-110"
                                            style={{ backgroundColor: `${goal.color}15`, borderColor: `${goal.color}30` }}
                                        >
                                            {goal.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-slate-100 group-hover:text-violet-300 transition-colors leading-tight">
                                                {goal.name}
                                            </h3>
                                            {goal.status === "completed" ? (
                                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                                    ✅ Hoàn thành
                                                </span>
                                            ) : dl !== null ? (
                                                <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${dl <= 30 ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : "text-slate-400 bg-slate-800/60 border-slate-700/40"}`}>
                                                    ⏱ Còn {dl} ngày
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-500 bg-slate-800/40 border border-slate-700/30 px-2 py-0.5 rounded-full">
                                                    Không hạn
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Circle progress */}
                                    <div className="relative flex-shrink-0">
                                        <CircleProgress percent={pct} color={goal.color} size={72} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-black" style={{ color: goal.color }}>{pct.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount row */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-xs text-slate-500 font-medium">Đã tiết kiệm</span>
                                        <span className="text-xs text-slate-500">Mục tiêu</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xl font-black" style={{ color: goal.color }}>
                                            {fmt(Number(goal.saved_amount))}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-400">
                                            {fmt(Number(goal.target_amount))}
                                        </span>
                                    </div>

                                    {/* Bar */}
                                    <div className="mt-3 relative h-2 w-full bg-slate-950/85 border border-slate-850 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700 relative"
                                            style={{ width: `${pct}%`, backgroundColor: goal.color, boxShadow: `0 0 8px ${goal.color}80` }}
                                        >
                                            <div className="absolute inset-x-0 top-0 h-full bg-white/15 rounded-full" />
                                        </div>
                                    </div>

                                    {goal.status === "active" && remaining > 0 && (
                                        <p className="text-[11px] text-slate-500 mt-1.5">
                                            Còn thiếu <span className="text-slate-300 font-semibold">{fmt(remaining)}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                                    {goal.status === "active" && (
                                        <button
                                            id={`btn-contribute-${goal.id}`}
                                            onClick={() => { setContributeGoal(goal); setContribAmount(""); setContribNote(""); setContribWalletId(wallets[0]?.id || ""); }}
                                            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 text-white hover:brightness-110"
                                            style={{ backgroundColor: goal.color, boxShadow: `0 0 12px ${goal.color}40` }}
                                        >
                                            + Nạp tiền
                                        </button>
                                    )}
                                    <button
                                        id={`btn-detail-${goal.id}`}
                                        onClick={() => handleOpenDetail(goal)}
                                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all duration-200 border border-slate-700/50"
                                    >
                                        Xem lịch sử
                                    </button>
                                    <button
                                        onClick={() => handleDelete(goal.id)}
                                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Bottom accent line */}
                                <div className="absolute bottom-0 left-0 h-0.5 w-full transition-all duration-300"
                                    style={{ background: `linear-gradient(to right, transparent, ${goal.color}80, transparent)` }}
                                />
                            </div>
                        );
                    })}

                    {/* Add card */}
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="bg-gradient-to-br from-slate-950/40 via-slate-900/40 to-slate-950/40 border border-slate-800 border-dashed rounded-3xl p-6 min-h-[280px] flex flex-col items-center justify-center hover:border-violet-400/60 hover:bg-slate-800/40 transition-all duration-300 group"
                    >
                        <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 text-3xl mb-4 group-hover:scale-110 transition-transform">
                            +
                        </div>
                        <p className="font-bold text-white text-lg">Thêm mục tiêu</p>
                        <p className="text-xs text-slate-400 mt-1 text-center max-w-[200px]">
                            Đặt ra mục tiêu mới để bắt đầu tiết kiệm
                        </p>
                    </button>
                </div>
            </main>

            {/* ══════════════════════ MODALS ══════════════════════ */}

            {/* ── Create Goal Modal ── */}
            {createOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-[#0b1329]/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden relative">
                        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

                        <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-extrabold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                    Tạo mục tiêu mới
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Đặt ra mục tiêu tiết kiệm của bạn</p>
                            </div>
                            <button onClick={() => setCreateOpen(false)} className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center justify-center text-sm transition">✕</button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Icon picker */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {ICON_OPTIONS.map((ic) => (
                                        <button
                                            key={ic}
                                            onClick={() => setForm({ ...form, icon: ic })}
                                            className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all border ${form.icon === ic ? "ring-2 ring-violet-500 bg-violet-500/20 border-violet-500 scale-110" : "bg-slate-950 border-slate-800/80 hover:bg-slate-900"}`}
                                        >
                                            {ic}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Tên mục tiêu</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="VD: Mua iPhone 16, Du lịch Nhật..."
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 py-3 outline-none text-slate-200 transition text-sm"
                                />
                            </div>

                            {/* Target */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Số tiền mục tiêu (VND)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.target}
                                        onChange={(e) => setForm({ ...form, target: e.target.value })}
                                        placeholder="0"
                                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-5 py-4 text-right text-2xl font-extrabold text-violet-400 outline-none transition font-mono"
                                    />
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-500/60 uppercase tracking-wider">VND</span>
                                </div>
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Hạn hoàn thành (tuỳ chọn)</label>
                                <input
                                    type="date"
                                    value={form.deadline}
                                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 py-3 outline-none text-slate-200 transition text-sm"
                                />
                            </div>

                            {/* Associated Category */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Liên kết danh mục ngân sách (tuỳ chọn)</label>
                                <select
                                    value={form.category_id}
                                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 transition text-sm"
                                >
                                    <option value="" className="bg-slate-950">Không liên kết</option>
                                    {categories.filter(c => c.type === 'expense' && c.name !== 'Tiết kiệm').map((c) => (
                                        <option key={c.id} value={c.id} className="bg-slate-950">
                                            {c.icon} {c.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-slate-500 mt-1.5">Liên kết để hệ thống tự động gợi ý chuyển tiền dư của danh mục này vào mục tiêu cuối tháng.</p>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Màu sắc</label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLOR_OPTIONS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setForm({ ...form, color: c })}
                                            className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "scale-125 ring-2 ring-white/50" : "hover:scale-110"}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-5 bg-slate-950/40 border-t border-slate-800/80 flex gap-3">
                            <button onClick={() => setCreateOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition text-sm">Hủy</button>
                            <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-bold transition text-sm shadow-lg shadow-violet-500/20">
                                Tạo mục tiêu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Contribute Modal ── */}
            {contributeGoal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-[#0b1329]/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500" />

                        <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{contributeGoal.icon}</span>
                                <div>
                                    <h3 className="text-lg font-extrabold text-emerald-400">Nạp tiền vào mục tiêu</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">{contributeGoal.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setContributeGoal(null)} className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center justify-center text-sm transition">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-input-bg border border-card-border rounded-xl p-3 flex justify-between text-sm">
                                <span className="text-slate-400">Đang tiết kiệm</span>
                                <span className="font-bold" style={{ color: contributeGoal.color }}>{fmt(contributeGoal.saved_amount)}</span>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Số tiền nạp (VND)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={contribAmount}
                                        onChange={(e) => setContribAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-5 py-4 text-right text-2xl font-extrabold text-emerald-400 outline-none transition font-mono"
                                    />
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500/60 uppercase">VND</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Ví nguồn</label>
                                <select
                                    value={contribWalletId}
                                    onChange={(e) => setContribWalletId(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 transition text-sm"
                                >
                                    <option value="">Chọn ví...</option>
                                    {wallets.map((w) => (
                                        <option key={w.id} value={w.id} className="bg-slate-950">
                                            {w.icon} {w.name} ({fmt(Number(w.balance))})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Ghi chú</label>
                                <input
                                    value={contribNote}
                                    onChange={(e) => setContribNote(e.target.value)}
                                    placeholder="VD: Thưởng tháng 6..."
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-400 rounded-xl px-4 py-3 outline-none text-slate-200 text-sm transition"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-5 bg-slate-950/40 border-t border-slate-800/80 flex gap-3">
                            <button onClick={() => setContributeGoal(null)} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition text-sm">Hủy</button>
                            <button onClick={handleContribute} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold transition text-sm shadow-lg shadow-emerald-500/20">
                                Xác nhận nạp
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Detail / History Modal ── */}
            {detailGoal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-[#0b1329]/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500" />

                        <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{detailGoal.icon}</span>
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-100">{detailGoal.name}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Lịch sử đóng góp</p>
                                </div>
                            </div>
                            <button onClick={() => setDetailGoal(null)} className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center justify-center text-sm transition">✕</button>
                        </div>

                        <div className="p-6">
                            {/* Progress summary */}
                            <div className="flex items-center gap-4 mb-6 bg-input-bg border border-card-border rounded-2xl p-4">
                                <div className="relative">
                                    <CircleProgress percent={Math.min(100, (detailGoal.saved_amount / detailGoal.target_amount) * 100)} color={detailGoal.color} size={80} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-black" style={{ color: detailGoal.color }}>
                                            {Math.min(100, Math.round((detailGoal.saved_amount / detailGoal.target_amount) * 100))}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Đã tích lũy</span>
                                        <span>Mục tiêu</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-black text-lg" style={{ color: detailGoal.color }}>{fmt(detailGoal.saved_amount)}</span>
                                        <span className="text-sm text-slate-400">{fmt(detailGoal.target_amount)}</span>
                                    </div>
                                    {detailGoal.deadline && (
                                        <p className="text-xs text-slate-500 mt-1">Hạn: {new Date(detailGoal.deadline).toLocaleDateString("vi-VN")}</p>
                                    )}
                                </div>
                            </div>

                            {/* Contributions list */}
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {detailContributions.length === 0 ? (
                                    <p className="text-center text-slate-500 text-sm py-8">Chưa có lần nạp nào</p>
                                ) : (
                                    detailContributions.map((c) => (
                                        <div key={c.id} className="flex items-center justify-between bg-input-bg rounded-xl px-4 py-3 border border-card-border">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-200">
                                                    {c.note || "Nạp tiền"}
                                                    {c.wallet_name ? ` (từ ví ${c.wallet_name})` : ""}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">{new Date(c.contributed_at).toLocaleDateString("vi-VN")}</p>
                                            </div>
                                            <span className="font-black text-emerald-400 text-sm">+{fmt(Number(c.amount))}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800/80">
                            <button onClick={() => setDetailGoal(null)} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition text-sm">Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Surplus Transfer Modal ── */}
            {surplusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-[#0b1329]/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

                        <div className="px-6 py-5 border-b border-slate-800/80 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-extrabold text-emerald-400">Chuyển dư vào mục tiêu</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Dư ngân sách {selectedSurplusItem?.category_name || ""}: <span className="text-emerald-400 font-bold">{fmt(Number(selectedSurplusItem?.surplus_amount || 0))}</span></p>
                            </div>
                            <button onClick={() => setSurplusModal(false)} className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center justify-center text-sm transition">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Chọn mục tiêu</label>
                                <select
                                    value={surplusTargetId}
                                    onChange={(e) => setSurplusTargetId(Number(e.target.value))}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 transition text-sm"
                                >
                                    <option value="">Chọn mục tiêu...</option>
                                    {goals.filter((g) => g.status === "active").map((g) => (
                                        <option key={g.id} value={g.id} className="bg-slate-950">
                                            {g.icon} {g.name} — còn thiếu {fmt(Number(g.target_amount) - Number(g.saved_amount))}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Ví nguồn</label>
                                <select
                                    value={surplusWalletId}
                                    onChange={(e) => setSurplusWalletId(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 transition text-sm"
                                >
                                    <option value="">Chọn ví...</option>
                                    {wallets.map((w) => (
                                        <option key={w.id} value={w.id} className="bg-slate-950">
                                            {w.icon} {w.name} ({fmt(Number(w.balance))})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Số tiền chuyển (VND)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={surplusAmount}
                                        onChange={(e) => setSurplusAmount(e.target.value)}
                                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-5 py-4 text-right text-2xl font-extrabold text-emerald-400 outline-none transition font-mono"
                                    />
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500/60 uppercase">VND</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5 text-right">Tối đa: {fmt(Number(selectedSurplusItem?.surplus_amount || 0))}</p>
                            </div>
                        </div>

                        <div className="px-6 py-5 bg-slate-950/40 border-t border-slate-800/80 flex gap-3">
                            <button onClick={() => setSurplusModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition text-sm">Bỏ qua</button>
                            <button onClick={handleSurplusTransfer} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold transition text-sm shadow-lg shadow-emerald-500/20">
                                Chuyển tiền ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Goal Completed Celebration Modal ── */}
            {completedGoalAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-[#0b1329]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(16,185,129,0.3)] overflow-hidden relative text-center p-8 animate-fade-in-up">
                        {/* Shimmer background */}
                        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

                        {/* Top decorative close button */}
                        <button 
                            onClick={() => setCompletedGoalAlert(null)} 
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center justify-center text-sm transition"
                        >
                            ✕
                        </button>

                        {/* Celebration Icon */}
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full blur-xl animate-pulse" style={{ backgroundColor: `${completedGoalAlert.color}40` }} />
                            <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-5xl border border-white/10 shadow-inner" style={{ backgroundColor: `${completedGoalAlert.color}20` }}>
                                {completedGoalAlert.icon || "🏆"}
                            </div>
                            <div className="absolute -bottom-1 -right-1 text-3xl animate-bounce">🎉</div>
                        </div>

                        {/* Header text */}
                        <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent mb-2">
                            Mục tiêu hoàn thành!
                        </h2>
                        
                        <p className="text-sm text-slate-300 leading-relaxed px-2">
                            Chúc mừng bạn đã tích lũy đủ số tiền cho mục tiêu <span className="font-extrabold text-slate-100">{completedGoalAlert.name}</span>!
                        </p>

                        {/* Target Display */}
                        <div className="my-6 bg-input-bg border border-card-border rounded-2xl p-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Số tiền đã tích lũy</p>
                            <p className="text-3xl font-black mt-1.5" style={{ color: completedGoalAlert.color }}>
                                {fmt(completedGoalAlert.target_amount)}
                            </p>
                        </div>

                        {/* Confetti Message */}
                        <p className="text-xs text-slate-500 mb-6 italic">
                            "Mỗi bước nhỏ đều dẫn tới thành công lớn. Hãy tiếp tục duy trì thói quen tiết kiệm tuyệt vời này nhé!"
                        </p>

                        {/* Button */}
                        <button
                            onClick={() => setCompletedGoalAlert(null)}
                            className="w-full py-3.5 rounded-2xl text-slate-950 font-black tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg"
                            style={{
                                background: `linear-gradient(135deg, ${completedGoalAlert.color}, #3b82f6)`,
                                boxShadow: `0 8px 25px -4px ${completedGoalAlert.color}60`
                            }}
                        >
                            Tuyệt vời!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

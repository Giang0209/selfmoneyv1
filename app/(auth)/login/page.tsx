"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export default function LoginPage() {

    const router = useRouter();
    const toast = useToast();

    const [phone, setPhone] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        if (loading) return;

        // Validate
        if (!phone || !password) {
            toast.warning(
                "Vui lòng nhập đầy đủ thông tin"
            );
            return;
        }

        try {

            setLoading(true);

            const res =
                await fetch(
                    "/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            phone,
                            password,
                        }),
                    }
                );

            const data =
                await res.json();

            if (!res.ok) {

                toast.error(
                    data.message ||
                    "Đăng nhập thất bại"
                );

                return;
            }

            console.log(
                "LOGIN RESPONSE:",
                data
            );

            // hỗ trợ cả 2 dạng:
            // data.token
            // data.user.token

            const token =
                data.token ||
                data.user?.token;

            if (!token) {

                toast.error(
                    "Không lấy được token"
                );

                return;
            }

            // lưu token
            localStorage.setItem(
                "token",
                token
            );

            toast.success(
                "Đăng nhập thành công"
            );

            router.push(
                "/dashboard"
            );

        } catch (error) {

            console.error(error);

            toast.error(
                "Có lỗi xảy ra khi đăng nhập"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

            {/* Background blur */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />

            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />

            <main className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">

                {/* LEFT SIDE */}
                <div className="hidden lg:flex flex-col space-y-8 items-end">

                    <h1 className="text-4xl font-bold text-right">
                        Chào mừng bạn quay lại 👋
                        <br />

                        <span className="text-cyan-400">
                            Tiếp tục hành trình quản lý tài chính của bạn
                        </span>
                    </h1>

                    <p className="text-gray-400 max-w-md text-right">
                        Trải nghiệm nền tảng quản lý tài sản tối ưu với bảo mật cao và giao diện hiện đại.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-6">

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">

                            <p className="text-cyan-400 font-bold text-sm">
                                ⚡ Nhanh & mượt
                            </p>

                            <p className="text-xs text-gray-400">
                                Truy cập dữ liệu ngay lập tức
                            </p>

                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">

                            <p className="text-green-400 font-bold text-sm">
                                🛡️ Bảo mật hàng đầu
                            </p>

                            <p className="text-xs text-gray-400">
                                Luôn an toàn, luôn riêng tư
                            </p>

                        </div>

                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="w-full max-w-[480px] mx-auto bg-[#1E293B]/70 backdrop-blur-xl border border-[#334155] rounded-2xl p-8 shadow-2xl">

                    {/* TITLE */}
                    <div className="mb-6">

                        <h2 className="text-xl font-semibold text-white text-center lg:text-left">
                            Đăng nhập vào hệ thống
                        </h2>

                        <p className="text-sm text-gray-400 text-center lg:text-left">
                            Chào mừng bạn quay trở lại
                        </p>

                    </div>

                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >

                        {/* PHONE */}
                        <div>

                            <label className="text-sm text-gray-300 mb-1 block">
                                Số điện thoại
                            </label>

                            <div className="relative">

                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    📞
                                </span>

                                <input
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value
                                        )
                                    }
                                    type="text"
                                    placeholder="090 123 4567"
                                    className="w-full bg-black/60 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-cyan-400"
                                />

                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>

                            <div className="flex justify-between mb-1">

                                <label className="text-sm text-gray-300">
                                    Mật khẩu
                                </label>

                            </div>

                            <div className="relative">

                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    🔒
                                </span>

                                <input
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="••••••••"
                                    className="w-full bg-black/60 border border-gray-700 rounded-lg py-3 pl-10 pr-12 text-white outline-none focus:ring-2 focus:ring-cyan-400"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {
                                        showPassword
                                            ? "👁️"
                                            : "🙈"
                                    }
                                </button>

                            </div>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition"
                        >

                            {
                                loading
                                    ? "Đang đăng nhập..."
                                    : "Đăng nhập"
                            }

                        </button>

                    </form>

                    {/* FOOTER */}
                    <p className="text-center text-sm text-gray-400 mt-6">

                        Chưa có tài khoản?{" "}

                        <span
                            onClick={() =>
                                router.push(
                                    "/register"
                                )
                            }
                            className="text-cyan-400 cursor-pointer"
                        >
                            Đăng ký ngay
                        </span>

                    </p>
                </div>

            </main>
        </div>
    );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export default function RegisterPage() {
    const toast = useToast();

    const phoneRegex = /^[0-9]{10}$/;

    const passwordRegex =
        /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;


    const router = useRouter();

    const [name, setName] =
        useState("");

    const [phone, setPhone] =
        useState("");


    const [password, setPassword] =
        useState("");

    const [confirm, setConfirm] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleRegister = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        if (loading) return;

        // Validate
        if (!name || !phone || !password || !confirm) {
            toast.warning("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        // Phone validate
        if (!phoneRegex.test(phone)) {
            toast.warning("Số điện thoại phải đúng 10 chữ số");
            return;
        }

        // Password match
        if (password !== confirm) {
            toast.warning("Mật khẩu không khớp");
            return;
        }

        // Password strength
        if (!passwordRegex.test(password)) {
            toast.warning(
                "Password ≥ 8 ký tự, có chữ hoa và ký tự đặc biệt"
            );
            return;
        }

        try {

            setLoading(true);

            const res =
                await fetch(
                    "/api/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            name,
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
                    "Đăng ký thất bại"
                );
                return;
            }

            // lưu token nếu BE trả về
            if (data.token) {
                localStorage.setItem(
                    "token",
                    data.token
                );
            }

            // hoặc nếu token nằm trong user
            if (data.user?.token) {
                localStorage.setItem(
                    "token",
                    data.user.token
                );
            }

            // lưu thông tin profile cache
            if (data.user) {
                localStorage.setItem(
                    "user_profile",
                    JSON.stringify({
                        name: data.user.name,
                        avatar: data.user.avatar,
                    })
                );
            }

            toast.success("Đăng ký thành công");

            router.push("/dashboard");

        } catch (error) {

            console.error(error);

            toast.error(
                "Có lỗi xảy ra khi đăng ký"
            );

        } finally {

            setLoading(false);
        }
    };

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="bg-[#0F172A] text-white min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background blur */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />

            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[100px]" />

            <main className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">

                {/* LEFT SIDE */}
                <div className="hidden lg:flex flex-col space-y-8 items-end">

                    <h1 className="text-4xl font-bold text-right">
                        Bắt đầu hành trình tài chính của bạn 🚀
                        <br />

                        <span className="text-cyan-400">
                            Tạo tài khoản để kiểm soát và phát triển tài sản mỗi ngày
                        </span>
                    </h1>

                    <p className="text-gray-400 max-w-md text-right">
                        Trải nghiệm nền tảng quản lý tài chính thông minh,
                        an toàn và trực quan
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-6">

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-cyan-400 font-bold text-sm">
                                🚀 Khởi động trong tích tắc
                            </p>

                            <p className="text-xs text-gray-400">
                                Tạo tài khoản và bắt đầu ngay lập tức
                            </p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-green-400 font-bold text-sm">
                                🔐 An toàn tuyệt đối
                            </p>

                            <p className="text-xs text-gray-400">
                                Quyền riêng tư luôn được đặt lên hàng đầu
                            </p>
                        </div>

                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="w-full max-w-[480px] mx-auto bg-[#1E293B]/70 backdrop-blur-xl border border-[#334155] rounded-2xl p-8 shadow-2xl">

                    {/* TITLE */}
                    <div className="mb-6">

                        <h2 className="text-xl font-semibold text-white">
                            Tạo tài khoản mới
                        </h2>

                        <p className="text-sm text-gray-400">
                            Bắt đầu hành trình quản lý tài chính của bạn
                        </p>

                    </div>

                    <form
                        onSubmit={handleRegister}
                        className="space-y-5"
                    >

                        {/* Họ tên */}
                        <div>

                            <label className="text-sm text-gray-300 mb-1 block">
                                Họ và Tên
                            </label>

                            <div className="relative">

                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    👤
                                </span>

                                <input
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    className="w-full bg-black/60 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-cyan-400"
                                />

                            </div>
                        </div>

                        {/* Phone */}
                        <div>

                            <label className="text-sm text-gray-300 mb-1 block">
                                Số điện thoại
                            </label>

                            <div className="relative">

                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    📞
                                </span>

                                <input
                                    type="text"
                                    placeholder="0123 456 789"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value
                                        )
                                    }
                                    className="w-full bg-black/60 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-cyan-400"
                                />

                            </div>
                        </div>


                        {/* Password */}
                        <div>

                            <label className="text-sm text-gray-300 mb-1 block">
                                Mật khẩu
                            </label>

                            <div className="relative">

                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    🔒
                                </span>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
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

                        {/* Confirm */}
                        <div>

                            <label className="text-sm text-gray-300 mb-1 block">
                                Xác nhận mật khẩu
                            </label>

                            <div className="relative">

                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    🔒
                                </span>

                                <input
                                    type={
                                        showConfirm
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="••••••••"
                                    value={confirm}
                                    onChange={(e) =>
                                        setConfirm(
                                            e.target.value
                                        )
                                    }
                                    className="w-full bg-black/60 border border-gray-700 rounded-lg py-3 pl-10 pr-12 text-white outline-none focus:ring-2 focus:ring-cyan-400"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirm(
                                            !showConfirm
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {
                                        showConfirm
                                            ? "👁️"
                                            : "🙈"
                                    }
                                </button>

                            </div>

                            <p className="text-xs text-gray-400 mt-2 space-y-1">
                                Mật khẩu phải có:
                                <br />
                                • Ít nhất 8 ký tự
                                <br />
                                • Ít nhất 1 chữ hoa (A-Z)
                                <br />
                                • Ít nhất 1 ký tự đặc biệt (!@#$...)
                            </p>
                        </div>



                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition"
                        >

                            {
                                loading
                                    ? "Đang đăng ký..."
                                    : "Đăng ký ngay"
                            }

                        </button>

                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-400 mt-6">

                        Đã có tài khoản?{" "}

                        <span
                            onClick={() =>
                                router.push("/login")
                            }
                            className="text-cyan-400 cursor-pointer"
                        >
                            Đăng nhập
                        </span>

                    </p>

                </div>

            </main>
        </div>
    );
}
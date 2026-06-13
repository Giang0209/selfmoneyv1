"use client";

import { useEffect, useRef, useState } from "react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useTheme } from "@/lib/ThemeContext";

type Profile = {
    name: string;
    username: string;
    phone: string;
    avatar?: string;
    gender?: string;
    dob?: string;
};

export default function ProfilePage() {
    const { theme, setTheme } = useTheme();


    const fileInputRef =
        useRef<HTMLInputElement | null>(null);

    const [profile, setProfile] =
        useState<Profile | null>(null);

    const [name, setName] =
        useState("");

    const [avatar, setAvatar] =
        useState("");

    const [gender, setGender] =
        useState("male");

    const [birthday, setBirthday] =
        useState("");

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showCurrent, setShowCurrent] =
        useState(false);

    const [showNew, setShowNew] =
        useState(false);

    const [showConfirm, setShowConfirm] =
        useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) return;

            const res =
                await fetch("/api/profile", {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                });

            if (!res.ok) {
                alert("Không lấy được profile");
                return;
            }

            const data =
                await res.json();

            console.log(data);

            setProfile(data);

            setName(
                data?.name || ""
            );

            setAvatar(
                data?.avatar || ""
            );

            setGender(
                data?.gender || "male"
            );

            setBirthday(data?.dob ? data.dob.slice(0, 10) : "");

        } catch (error) {

            console.error(
                "Lỗi lấy profile:",
                error
            );
        }
    };

    const handleAvatarUpload =
        async (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {

            const file =
                e.target.files?.[0];

            if (!file) return;

            try {

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    file
                );

                const res =
                    await fetch(
                        "/api/upload/avatar",
                        {
                            method:
                                "POST",

                            body:
                                formData,
                        }
                    );

                const data =
                    await res.json();

                if (!res.ok) {

                    alert(
                        data.message
                    );

                    return;
                }

                setAvatar(
                    data.url
                );

            } catch (error) {

                console.error(
                    error
                );

                alert(
                    "Upload avatar thất bại"
                );
            }
        };

    const handleUpdateProfile =
        async (e: any) => {

            e.preventDefault();

            try {

                const token =
                    localStorage.getItem("token");

                const res =
                    await fetch("/api/profile", {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            name,
                            avatar,
                            gender,
                            dob: birthday,
                        }),
                    });

                const data =
                    await res.json();

                if (!res.ok) {
                    alert(data.message);
                    return;
                }

                alert(
                    "Cập nhật thông tin thành công"
                );

                fetchProfile();

            } catch (error) {

                console.error(error);

                alert(
                    "Lỗi cập nhật profile"
                );
            }
        };

    const handleChangePassword =
        async (e: any) => {

            e.preventDefault();

            if (
                newPassword !==
                confirmPassword
            ) {
                alert(
                    "Mật khẩu xác nhận không khớp"
                );
                return;
            }

            try {

                const token =
                    localStorage.getItem("token");

                const res =
                    await fetch(
                        "/api/profile/password",
                        {
                            method: "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`,
                            },

                            body: JSON.stringify({
                                old_password:
                                    currentPassword,

                                new_password:
                                    newPassword,
                            }),
                        }
                    );

                const data =
                    await res.json();

                if (!res.ok) {
                    alert(data.message);
                    return;
                }

                alert(
                    "Đổi mật khẩu thành công"
                );

                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");

            } catch (error) {

                console.error(error);

                alert(
                    "Lỗi đổi mật khẩu"
                );
            }
        };

    return (
        <div className="bg-background min-h-screen text-foreground relative overflow-hidden transition-colors duration-300">
            {/* Ambient visual background glowing spots */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />

            <Sidebar />
            <Header />

            <main className="ml-64 pt-24 p-8 relative z-10">

                {/* HEADER */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-card-border pb-6 relative">
                    <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent" />
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-3xl font-black bg-gradient-to-r from-text-primary via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
                                Hồ sơ cá nhân
                            </h1>
                            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-cyan-500/20 tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                Profile
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">
                            Quản lý thông tin tài khoản và bảo mật hệ thống
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

                    {/* PROFILE */}
                    <section className="bg-gradient-to-br from-card-bg/80 via-card-bg to-card-bg/80 backdrop-blur-xl border border-card-border rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl border border-cyan-500/20">
                                👤
                            </div>

                            <div>
                                <h2 className="text-xl font-black bg-gradient-to-r from-text-primary to-slate-300 bg-clip-text text-transparent">
                                    Thông tin cá nhân
                                </h2>

                                <p className="text-xs text-slate-500 mt-0.5">
                                    Cập nhật các thông tin cơ bản của bạn
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleUpdateProfile}
                            className="space-y-6"
                        >

                            {/* AVATAR */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 blur-md opacity-25" />
                                    <img
                                        src={
                                            avatar ||
                                            "https://i.pravatar.cc/150"
                                        }
                                        alt="avatar"
                                        className="relative w-28 h-28 rounded-full object-cover border-4 border-card-border shadow-2xl"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-400 text-slate-950 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 duration-200"
                                    >
                                        📷
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleAvatarUpload
                                        }
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* NAME */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                    Họ và tên
                                </label>

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        👤
                                    </span>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                        className="w-full bg-input-bg border border-input-border focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl py-3 pl-12 pr-4 text-foreground transition-all duration-300 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* USERNAME */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                    Tên đăng nhập
                                </label>

                                <div className="relative opacity-65">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        👤
                                    </span>

                                    <input
                                        type="text"
                                        disabled
                                        value={
                                            profile?.username ||
                                            ""
                                        }
                                        className="w-full bg-input-bg border border-card-border rounded-xl py-3 pl-12 pr-4 text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* PHONE */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                    Số điện thoại
                                </label>

                                <div className="relative opacity-65">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        📞
                                    </span>

                                    <input
                                        type="text"
                                        disabled
                                        value={
                                            profile?.phone ||
                                            ""
                                        }
                                        className="w-full bg-input-bg border border-card-border rounded-xl py-3 pl-12 pr-4 text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* BIRTHDAY */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                    Ngày sinh
                                </label>

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        🎂
                                    </span>

                                    <input
                                        type="date"
                                        value={birthday}
                                        onChange={(e) =>
                                            setBirthday(
                                                e.target.value
                                            )
                                        }
                                        className="w-full bg-input-bg border border-input-border focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl py-3 pl-12 pr-4 text-foreground transition-all duration-300 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* GENDER */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                                    Giới tính
                                </label>

                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGender("male")
                                        }
                                        className={`py-3 rounded-xl border font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 ${gender === "male"
                                            ? "border-cyan-500/80 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                            : "border-card-border bg-input-bg text-slate-400 hover:bg-card-bg"
                                            }`}
                                    >
                                        👨 Nam
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGender("female")
                                        }
                                        className={`py-3 rounded-xl border font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 ${gender === "female"
                                            ? "border-pink-500/80 bg-pink-500/10 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.1)]"
                                            : "border-card-border bg-input-bg text-slate-400 hover:bg-card-bg"
                                            }`}
                                    >
                                        👩 Nữ
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGender("other")
                                        }
                                        className={`py-3 rounded-xl border font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 ${gender === "other"
                                            ? "border-purple-500/80 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                                            : "border-card-border bg-input-bg text-slate-400 hover:bg-card-bg"
                                            }`}
                                    >
                                        🌈 Khác
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20 cursor-pointer"
                            >
                                Lưu thông tin cá nhân
                            </button>

                        </form>
                    </section>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-8">

                        {/* PASSWORD */}
                        <section className="bg-gradient-to-br from-card-bg/80 via-card-bg to-card-bg/80 backdrop-blur-xl border border-card-border rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-300">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 text-2xl border border-orange-500/20">
                                    🔒
                                </div>

                                <div>
                                    <h2 className="text-xl font-black bg-gradient-to-r from-text-primary to-slate-300 bg-clip-text text-transparent">
                                        Đổi mật khẩu
                                    </h2>

                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Giữ tài khoản của bạn được bảo mật tuyệt đối
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleChangePassword}
                                className="space-y-6"
                            >

                                {/* CURRENT PASSWORD */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                        Mật khẩu hiện tại
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            🔒
                                        </span>

                                        <input
                                            type={
                                                showCurrent
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            value={currentPassword}
                                            onChange={(e) =>
                                                setCurrentPassword(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-input-bg border border-input-border focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl py-3 pl-12 pr-12 text-foreground transition-all duration-300 shadow-inner"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCurrent(
                                                    !showCurrent
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground"
                                        >
                                            {
                                                showCurrent
                                                    ? "👁️"
                                                    : "🙈"
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* NEW PASSWORD */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                        Mật khẩu mới
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            🔒
                                        </span>

                                        <input
                                            type={
                                                showNew
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-input-bg border border-input-border focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl py-3 pl-12 pr-12 text-foreground transition-all duration-300 shadow-inner"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNew(
                                                    !showNew
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground"
                                        >
                                            {
                                                showNew
                                                    ? "👁️"
                                                    : "🙈"
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* CONFIRM PASSWORD */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                                        Xác nhận mật khẩu
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            🔒
                                        </span>

                                        <input
                                            type={
                                                showConfirm
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-input-bg border border-input-border focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 outline-none rounded-xl py-3 pl-12 pr-12 text-foreground transition-all duration-300 shadow-inner"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirm(
                                                    !showConfirm
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground"
                                        >
                                            {
                                                showConfirm
                                                    ? "👁️"
                                                    : "🙈"
                                            }
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 rounded-xl border border-cyan-500/80 hover:bg-cyan-500/10 text-cyan-400 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                                >
                                    Cập nhật mật khẩu
                                </button>

                            </form>
                        </section>

                        {/* SYSTEM SETTINGS */}
                        <section className="bg-gradient-to-br from-card-bg/80 via-card-bg to-card-bg/80 backdrop-blur-xl border border-card-border rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-300">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl border border-cyan-500/20">
                                    ⚙️
                                </div>

                                <div>
                                    <h2 className="text-xl font-black bg-gradient-to-r from-text-primary to-slate-300 bg-clip-text text-transparent">
                                        Cấu hình hệ thống
                                    </h2>

                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Tùy chỉnh giao diện hiển thị và ngôn ngữ hệ thống
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* THEME SELECTOR */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                                        Giao diện
                                    </label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setTheme("light")}
                                            className={`py-3 rounded-xl border font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${theme === "light"
                                                ? "border-cyan-500 bg-cyan-500/10 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                                : "border-card-border bg-input-bg text-slate-400 hover:bg-card-bg"
                                                }`}
                                        >
                                            ☀️ Sáng
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setTheme("dark")}
                                            className={`py-3 rounded-xl border font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${theme === "dark"
                                                ? "border-violet-500 bg-violet-500/10 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                                                : "border-card-border bg-input-bg text-slate-400 hover:bg-card-bg"
                                                }`}
                                        >
                                            🌙 Tối
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                </div>
            </main>
        </div>
    );
}
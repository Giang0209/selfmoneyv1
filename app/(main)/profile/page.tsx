"use client";

import { useEffect, useRef, useState } from "react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

type Profile = {
    name: string;
    username: string;
    phone: string;
    avatar?: string;
    gender?: string;
    dob?: string;
};

export default function ProfilePage() {

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
                console.log(
                    "Không lấy được profile"
                );
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
        (e: React.ChangeEvent<HTMLInputElement>) => {

            const file =
                e.target.files?.[0];

            if (!file) return;

            const imageUrl =
                URL.createObjectURL(file);

            setAvatar(imageUrl);
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
        <div className="bg-[#0F172A] min-h-screen text-white">

            <Sidebar />

            <Header />

            <main className="ml-64 pt-24 p-8">

                <div className="mb-10">
                    <h1 className="text-3xl font-bold mb-2">
                        Hồ sơ cá nhân
                    </h1>

                    <p className="text-slate-400">
                        Quản lý thông tin tài khoản và bảo mật
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* PROFILE */}
                    <section className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-8 backdrop-blur-xl">

                        <div className="flex items-center gap-4 mb-8">

                            <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl">
                                👤
                            </div>

                            <div>
                                <h2 className="text-xl font-bold">
                                    Thông tin cá nhân
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Quản lý thông tin tài khoản
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleUpdateProfile}
                            className="space-y-6"
                        >

                            {/* AVATAR */}
                            <div className="flex justify-center">

                                <div className="relative">

                                    <img
                                        src={
                                            avatar ||
                                            "https://i.pravatar.cc/150"
                                        }
                                        alt="avatar"
                                        className="w-28 h-28 rounded-full object-cover border-4 border-cyan-500/20"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-400 text-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
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
                                <label className="text-sm text-slate-300 mb-2 block">
                                    Họ và tên
                                </label>

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
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
                                        className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-cyan-400"
                                    />
                                </div>
                            </div>

                            {/* USERNAME */}
                            <div>
                                <label className="text-sm text-slate-300 mb-2 block">
                                    Tên đăng nhập
                                </label>

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                                        👤
                                    </span>

                                    <input
                                        type="text"
                                        disabled
                                        value={
                                            profile?.username ||
                                            ""
                                        }
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-500"
                                    />
                                </div>
                            </div>

                            {/* PHONE */}
                            <div>
                                <label className="text-sm text-slate-300 mb-2 block">
                                    Số điện thoại
                                </label>

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                                        📞
                                    </span>

                                    <input
                                        type="text"
                                        disabled
                                        value={
                                            profile?.phone ||
                                            ""
                                        }
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-500"
                                    />
                                </div>
                            </div>

                            {/* BIRTHDAY */}
                            <div>
                                <label className="text-sm text-slate-300 mb-2 block">
                                    Ngày sinh
                                </label>

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
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
                                        className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-cyan-400"
                                    />
                                </div>
                            </div>

                            {/* GENDER */}
                            <div>

                                <label className="text-sm text-slate-300 mb-2 block">
                                    Giới tính
                                </label>

                                <div className="grid grid-cols-3 gap-3">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGender("male")
                                        }
                                        className={`py-3 rounded-xl border transition ${gender === "male"
                                            ? "border-cyan-400 bg-cyan-500/10 text-cyan-400"
                                            : "border-slate-700 text-slate-400"
                                            }`}
                                    >
                                        👨 Nam
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGender("female")
                                        }
                                        className={`py-3 rounded-xl border transition ${gender === "female"
                                            ? "border-pink-400 bg-pink-500/10 text-pink-400"
                                            : "border-slate-700 text-slate-400"
                                            }`}
                                    >
                                        👩 Nữ
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGender("other")
                                        }
                                        className={`py-3 rounded-xl border transition ${gender === "other"
                                            ? "border-purple-400 bg-purple-500/10 text-purple-400"
                                            : "border-slate-700 text-slate-400"
                                            }`}
                                    >
                                        🌈 Khác
                                    </button>

                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition"
                            >
                                Lưu thông tin cá nhân
                            </button>

                        </form>
                    </section>

                    {/* PASSWORD */}
                    <section className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-8 backdrop-blur-xl">

                        <div className="flex items-center gap-4 mb-8">

                            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 text-2xl">
                                🔒
                            </div>

                            <div>
                                <h2 className="text-xl font-bold">
                                    Đổi mật khẩu
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Bảo mật tài khoản của bạn
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleChangePassword}
                            className="space-y-6"
                        >

                            {/* CURRENT PASSWORD */}
                            <div>

                                <label className="text-sm text-gray-300 mb-1 block">
                                    Mật khẩu hiện tại
                                </label>

                                <div className="relative">

                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
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
                                        className="w-full bg-black/60 border border-gray-700 rounded-lg py-3 pl-10 pr-12 text-white outline-none focus:ring-2 focus:ring-cyan-400"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrent(
                                                !showCurrent
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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

                                <label className="text-sm text-gray-300 mb-1 block">
                                    Mật khẩu mới
                                </label>

                                <div className="relative">

                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
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
                                        className="w-full bg-black/60 border border-gray-700 rounded-lg py-3 pl-10 pr-12 text-white outline-none focus:ring-2 focus:ring-cyan-400"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNew(
                                                !showNew
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
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
                            </div>

                            <button
                                type="submit"
                                className="w-full border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-semibold py-3 rounded-xl transition"
                            >
                                Cập nhật mật khẩu
                            </button>

                        </form>

                    </section>

                </div>
            </main>
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";

type Profile = {
    name: string;
    avatar?: string | null;
};

export default function Header() {

    const [profile, setProfile] =
        useState<Profile | null>(null);

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

        } catch (error) {

            console.error(
                "Lỗi lấy profile:",
                error
            );
        }
    };

    const getGreeting = () => {

        const hour =
            new Date().getHours();

        if (hour < 12)
            return "Chào buổi sáng";

        if (hour < 18)
            return "Chào buổi chiều";

        return "Chào buổi tối";
    };

    return (
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-20 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-6 z-40">

            {/* LEFT */}
            <div className="flex-1">

                <h2 className="text-lg font-bold text-white">
                    {getGreeting()},
                    {" "}
                    {profile?.name || "User"} 👋
                </h2>

                <p className="text-xs text-slate-400">
                    Tổng quan tài chính hôm nay của bạn
                </p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">

                <div className="flex items-center gap-3">

                    <img
                        src={
                            profile?.avatar ||
                            "https://i.pravatar.cc/100"
                        }
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />

                    <div className="text-right">

                        <p className="text-sm text-white font-bold">
                            {profile?.name || "User"}
                        </p>

                    </div>
                </div>
            </div>
        </header>
    );
}
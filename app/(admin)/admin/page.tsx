"use client";

import { useState } from "react";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            window.location.href = "/admin/leads";
        } else {
            setError("密码错误");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-10 w-full max-w-md animate-fade-in-up"
            >
                <h1 className="text-2xl font-semibold text-gray-900 text-center">
                    沃凯玛后台
                </h1>
                <p className="text-sm text-gray-500 text-center mt-2">
                    请输入管理密码
                </p>

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="管理密码"
                    className="mt-8 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200"
                    required
                />

                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-2xl bg-orange-600 py-4 text-white font-semibold hover:bg-orange-700 transition-all duration-200 disabled:opacity-50"
                >
                    {loading ? "登录中..." : "登录"}
                </button>
            </form>
        </div>
    );
}
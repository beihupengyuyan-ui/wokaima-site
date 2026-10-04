"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FollowUpForm({
                                         leadId,
                                         currentStatus,
                                         currentSubStatus,
                                     }: {
    leadId: number;
    currentStatus: string;
    currentSubStatus: string | null;
}) {
    const router = useRouter();
    const [status, setStatus] = useState(currentStatus);
    const [subStatus, setSubStatus] = useState(currentSubStatus || "");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const subStatusOptions =
        status === "processing"
            ? ["已联系", "已报价", "已寄样", "待回访"]
            : status === "done"
                ? ["已签约", "已放弃"]
                : [];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const res = await fetch(`/api/admin/leads/${leadId}/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, subStatus, note }),
        });

        if (res.ok) {
            setNote("");
            router.refresh();
        }
        setLoading(false);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8"
        >
            <h2 className="font-semibold text-lg text-gray-900 mb-5">更新状态</h2>

            <div className="space-y-4">
                {/* 主状态 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        主状态
                    </label>
                    <div className="flex gap-2">
                        {[
                            { value: "pending", label: "待处理" },
                            { value: "processing", label: "处理中" },
                            { value: "done", label: "已完成" },
                        ].map((s) => (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => {
                                    setStatus(s.value);
                                    setSubStatus("");
                                }}
                                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                                    status === s.value
                                        ? "bg-orange-600 text-white"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 子状态 */}
                {subStatusOptions.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            子状态
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {subStatusOptions.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSubStatus(s)}
                                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                                        subStatus === s
                                            ? "bg-orange-100 text-orange-600 font-medium"
                                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 备注 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        跟进备注
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="例如：客户说下周再谈、已发送报价单等"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200 resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-orange-600 py-3.5 text-white font-semibold hover:bg-orange-700 transition-all disabled:opacity-50"
                >
                    {loading ? "保存中..." : "保存更新"}
                </button>
            </div>
        </form>
    );
}
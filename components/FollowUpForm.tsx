"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckIcon from "@/components/CheckIcon";

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
                                aria-pressed={status === s.value}
                                onClick={() => {
                                    setStatus(s.value);
                                    setSubStatus("");
                                }}
                                className={`rounded-xl border px-5 py-2 text-sm font-medium transition-colors duration-150 ${
                                    status === s.value
                                        ? "border-orange-600 bg-orange-600 text-white shadow-sm shadow-orange-600/25 hover:border-orange-700 hover:bg-orange-700"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
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
                                    aria-pressed={subStatus === s}
                                    onClick={() => setSubStatus(subStatus === s ? "" : s)}
                                    className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                                        subStatus === s
                                            ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/25 hover:border-orange-600 hover:bg-orange-600"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                    }`}
                                >
                                    <CheckIcon on={subStatus === s} />
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
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition duration-150 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-orange-600 py-3.5 text-white font-semibold transition-colors duration-150 hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "保存中..." : "保存更新"}
                </button>
            </div>
        </form>
    );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CheckIcon from "@/components/CheckIcon";
import {
    HANDLE_RESULTS,
    RECOVERED_RESULT,
    cancelNoteOf,
    cancelReasonOf,
    cancelSourceOf,
    isHandled,
} from "@/lib/lead-status";
import { bjText } from "@/lib/lead-utils";

/** 一张「客户取消订单」卡片要的字段（列表查询给什么就够显示什么） */
export type CancelLead = {
    id: number;
    name: string;
    phone: string;
    company: string | null;
    region: string | null;
    product: string | null;
    note: string | null;
    ref: string | null;
    sub_status: string | null;
    cancel_source: string | null;
    cancel_reason: string | null;
    /** 选「其他原因」时客户补的自由文本（选填） */
    cancel_note: string | null;
    cancel_at: string | null;
    updated_at: string | null;
    created_at: string;
    handle_status: string | null;
    handle_result: string | null;
    handled_at: string | null;
};

/** 取消时间：老数据没有 cancel_at 就用 updated_at / created_at 顶上 */
function cancelTimeOf(lead: CancelLead) {
    return lead.cancel_at || lead.updated_at || lead.created_at;
}

/** 距今多少小时：判断「取消超过 24 小时还没人跟」靠它 */
function hoursSince(utc: string) {
    const ms = Date.parse(utc.replace(" ", "T") + "Z");
    if (Number.isNaN(ms)) return 0;
    return (Date.now() - ms) / 3600000;
}

function agoText(hours: number) {
    if (hours < 1) return "刚刚";
    if (hours < 24) return `${Math.floor(hours)} 小时前`;
    return `${Math.floor(hours / 24)} 天前`;
}

const SOURCE_STYLE: Record<string, string> = {
    官网: "bg-amber-100 text-amber-700",
    小程序: "bg-emerald-100 text-emerald-700",
};

/** 已处理卡片的处理结果：这几档不需要再跟，绿色底 */
const RESULT_NOTE: Record<string, string> = {
    已回访挽回: "（订单已回到「待处理」）",
    客户确认取消: "（客户确认不做了）",
    已退款: "（已退款）",
    联系不上: "（暂时联系不上）",
    后台标记放弃: "（后台自己标的放弃）",
};

export default function CancelCard({
    lead,
    showDetailLink = true,
}: {
    lead: CancelLead;
    /** 详情页自己就嵌着这张卡，再给一个「查看详情」就绕回原点了 */
    showDetailLink?: boolean;
}) {
    const router = useRouter();
    const handled = isHandled(lead);
    const source = cancelSourceOf(lead);
    const reason = cancelReasonOf(lead);
    // 「其他原因」后面客户自己补的那句话：分布统计只认白名单，真实原因往往在这一句里
    const reasonNote = cancelNoteOf(lead);

    const hours = hoursSince(cancelTimeOf(lead));
    // 未处理 + 已经过去一整天 = 标红催一下，否则这类单会安静地烂在列表里
    const overdue = !handled && hours >= 24;

    const [open, setOpen] = useState(!handled);
    const [result, setResult] = useState<string>(handled ? lead.handle_result || "" : "");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit() {
        if (!result) {
            setError("请先选择处理结果");
            return;
        }
        setError("");
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/leads/${lead.id}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ result, note }),
            });
            const data = (await res.json()) as { ok?: boolean; message?: string };

            if (!res.ok || !data.ok) {
                setError(data.message || "保存失败，请重试");
                return;
            }

            setNote("");
            setOpen(false);
            // 列表按处理状态分页签，处理完要重新取数（已处理的单会挪到「已处理」）
            router.refresh();
        } catch {
            setError("网络不太好，请重试");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className={`rounded-3xl bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border-l-4 ${
                handled ? "border-gray-200" : overdue ? "border-red-500" : "border-orange-400"
            }`}
        >
            {/* 顶部：客户 + 待处理 / 已处理 */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg">
                        ⛔
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                            {handled ? (
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                    已处理
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    待处理
                                </span>
                            )}
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    SOURCE_STYLE[source] || "bg-gray-100 text-gray-500"
                                }`}
                            >
                                {source}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                                原因：{reason}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            取消时间：{bjText(cancelTimeOf(lead))}（{agoText(hours)}）
                            {lead.handled_at ? ` · 处理于 ${bjText(lead.handled_at)}` : ""}
                        </p>
                    </div>
                </div>

                {showDetailLink && (
                    <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-sm text-orange-600 hover:text-orange-700"
                    >
                        查看详情 →
                    </Link>
                )}
            </div>

            {/* 信息区 */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="text-gray-400">
                    电话 <span className="font-semibold text-gray-900">{lead.phone}</span>
                </span>
                {lead.company && <span className="text-gray-500">公司 {lead.company}</span>}
                {lead.product && <span className="text-gray-500">意向 {lead.product}</span>}
                {lead.region && <span className="text-gray-500">地址 {lead.region}</span>}
            </div>

            {reasonNote && (
                <div className="mt-3 rounded-2xl border-l-2 border-orange-300 bg-orange-50/70 px-4 py-3 text-sm text-orange-900">
                    <span className="text-orange-500/80">客户补充的原因：</span>
                    {reasonNote}
                </div>
            )}

            {lead.note && (
                <div className="mt-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    {lead.note}
                </div>
            )}

            {overdue && (
                <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    这张单取消超过 24 小时还没人跟过，建议今天先回访一次，再决定要不要挽回。
                </p>
            )}




            {/* 已处理：显示结果 + 可以改 */}
            {handled && !open && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-green-50/70 px-4 py-3 text-sm text-green-700">
                    <span>
                        处理结果：{lead.handle_result || "已处理"}
                        {RESULT_NOTE[lead.handle_result || ""] || ""}
                    </span>
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="text-xs text-green-700 underline hover:text-green-800"
                    >
                        修改处理结果
                    </button>
                </div>
            )}

            {/* 处理表单：未处理时默认展开，「处理结果」+ 备注一次提交 */}
            {open && (
                <div className="mt-4 space-y-4 rounded-2xl bg-gray-50 p-4">
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-700">处理结果</p>
                        <div className="flex flex-wrap gap-2">
                            {HANDLE_RESULTS.map((option) => {
                                const active = result === option;
                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => setResult(option)}
                                        className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                                            active
                                                ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/25 hover:border-orange-600 hover:bg-orange-600"
                                                : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                        }`}
                                    >
                                        <CheckIcon on={active} />
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                        {result === RECOVERED_RESULT && (
                            <p className="mt-2 text-xs text-gray-500">
                                选「已回访挽回」会把订单主状态改回「待处理」，它重新出现在待处理列表里。
                            </p>
                        )}
                    </div>

                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="跟进备注（选填）：比如「打了两次没人接，已发短信」"
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition duration-150 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100/50"
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "保存中…" : handled ? "保存处理结果" : "标记已处理"}
                        </button>
                        {handled && (
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                收起
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

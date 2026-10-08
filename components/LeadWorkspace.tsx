"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import CheckIcon from "@/components/CheckIcon";
import { isCancelled } from "@/lib/lead-status";

type Lead = {
    id: number;
    name: string;
    phone: string;
    company: string | null;
    region: string | null;
    product: string | null;
    trade_in: number;
    note: string | null;
    ref: string | null;
    status: string;
    sub_status: string | null;
    created_at: string;
};

const STATUS_OPTIONS = [
    { value: "pending", label: "待处理" },
    { value: "processing", label: "处理中" },
    { value: "done", label: "已完成" },
];

const SUB_STATUS_MAP: Record<string, string[]> = {
    pending: [],
    processing: ["已联系", "已报价", "已寄样", "待回访"],
    done: ["已签约", "已放弃"],
};

const TAG_OPTIONS = [
    "已发报价单",
    "已寄样品",
    "需要上门测量",
    "已确认尺寸",
    "需要以旧换新",
    "需要安装",
    "已加微信",
];

export default function LeadWorkspace({
                                          lead,
                                          initialFollowUps,
                                          initialTags,
                                      }: {
    lead: Lead;
    initialFollowUps: { time: string; text: string }[];
    initialTags: string[];
}) {
    const router = useRouter();
    const cancelled = isCancelled(lead);

    const [status, setStatus] = useState(lead.status);
    const [subStatus, setSubStatus] = useState(lead.sub_status || "");
    const [tags, setTags] = useState<string[]>(initialTags);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    function toggleTag(tag: string) {
        setTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    }

    async function handleSave() {
        setLoading(true);

        const res = await fetch(`/api/admin/leads/${lead.id}/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, subStatus, tags, note }),
        });

        if (res.ok) {
            setNote("");
            router.refresh();
        } else {
            alert("保存失败");
        }
        setLoading(false);
    }

    return (
        <div className="mt-8 space-y-6 animate-fade-in-up">
            {/* 已取消提示：小程序取消只改 sub_status，主状态可能仍是「待处理」 */}
            {cancelled && (
                <div className="rounded-3xl bg-red-50 border border-red-100 p-6 text-sm text-red-600">
                    <p className="font-semibold mb-1">该线索已取消（子状态：已放弃）</p>
                    <p className="leading-relaxed">
                        {!initialTags.includes("用户取消")
                            ? "该线索已标记为放弃，请勿再按待处理跟进。"
                            : lead.ref === "miniprogram"
                              ? "用户已在小程序取消该订单，请勿再按待处理跟进。"
                              : "用户已在官网「我的申请」自助取消，请勿再按待处理跟进。"}
                        如需恢复，请在下方「主状态」改回待处理、并清空子状态后保存。
                    </p>
                </div>
            )}

            {/* 客户信息卡 */}
            <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8">
                {/* 顶部：姓名 + 时间 */}
                <div className="flex items-start justify-between pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl">
                            👤
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-semibold text-gray-900">{lead.name}</h1>
                                <StatusBadge status={lead.status} subStatus={lead.sub_status} />
                            </div>
                            {lead.ref === "channel" && (
                                <span className="inline-block mt-1 text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-600 font-medium">
            渠道推荐
          </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">提交时间</p>
                        <p className="mt-1 text-sm text-gray-600">
                            {new Date(lead.created_at).toLocaleString("zh-CN")}
                        </p>
                    </div>
                </div>

                {/* 信息区 */}
                <div className="mt-6 grid md:grid-cols-2 gap-x-8 gap-y-5">
                    {/* 电话 */}
                    <div>
                        <p className="text-xs text-gray-400 mb-2">联系电话</p>
                        <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-3 text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                        >
        <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-sm">
          📞
        </span>
                            {lead.phone}
                        </a>
                    </div>

                    {/* 公司 */}
                    <div>
                        <p className="text-xs text-gray-400 mb-2">公司 / 餐厅</p>
                        <div className="flex items-center gap-3 text-base text-gray-900">
        <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm">
          🏢
        </span>
                            {lead.company || "未填写"}
                        </div>
                    </div>

                    {/* 地址 */}
                    <div className="md:col-span-2">
                        <p className="text-xs text-gray-400 mb-2">安装地址</p>
                        <div className="flex items-start gap-3 text-base text-gray-900">
        <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm flex-shrink-0">
          📍
        </span>
                            <span className="mt-1">{lead.region || "未填写"}</span>
                        </div>
                    </div>

                    {/* 意向产品 */}
                    {lead.product && (
                        <div className="md:col-span-2">
                            <p className="text-xs text-gray-400 mb-2">意向产品</p>
                            <div className="flex items-start gap-3 text-base text-gray-900">
          <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm flex-shrink-0">
            📦
          </span>
                                <span className="mt-1">{lead.product}</span>
                            </div>
                        </div>
                    )}

                    {/* 以旧换新 */}
                    {lead.trade_in === 1 && (
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 bg-orange-50 rounded-2xl px-4 py-3">
                                <span className="text-lg">🔄</span>
                                <span className="text-sm text-orange-600 font-medium">
            需要以旧换新
          </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 客户备注 */}
                {lead.note && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-2">客户备注</p>
                        <div className="bg-gray-50 rounded-2xl px-5 py-4 text-sm text-gray-700 leading-relaxed">
                            {lead.note}
                        </div>
                    </div>
                )}
            </div>

            {/* 工作台 */}
            <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 space-y-8">
                <h2 className="font-semibold text-lg text-gray-900">处理工作台</h2>

                {/* 主状态 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        主状态
                    </label>
                    <div className="flex gap-2">
                        {STATUS_OPTIONS.map((s) => (
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
                {SUB_STATUS_MAP[status]?.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            当前阶段
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {SUB_STATUS_MAP[status].map((s) => (
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

                {/* 业务要素 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        业务要素（可多选）
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {TAG_OPTIONS.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                aria-pressed={tags.includes(tag)}
                                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                                    tags.includes(tag)
                                        ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/25 hover:border-orange-600 hover:bg-orange-600"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                }`}
                            >
                                <CheckIcon on={tags.includes(tag)} />
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 跟进备注 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        本次跟进备注
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="例如：客户说下周再谈、已发送报价单、需要上门测量等"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition duration-150 resize-none"
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full rounded-2xl bg-orange-600 py-4 text-white font-semibold transition-colors duration-150 hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "保存中..." : "保存更新"}
                </button>
            </div>

            {/* 跟进历史 */}
            {initialFollowUps.length > 0 && (
                <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8">
                    <h2 className="font-semibold text-lg text-gray-900 mb-5">跟进历史</h2>
                    <div className="space-y-4">
                        {initialFollowUps
                            .slice()
                            .reverse()
                            .map((fu, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400">{fu.time}</p>
                                        <p className="mt-1 text-sm text-gray-700">{fu.text}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
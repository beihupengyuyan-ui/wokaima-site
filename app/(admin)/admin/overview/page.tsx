/**
 * /admin/overview —— 后台概览工作台（登录后的落地页）。
 *
 * 只回答一个问题：**今天该先动哪几件？** 所以顺序是：
 *   ① 客户取消待处理（带红点，客户已经明确说不做了，半天内不跟就再也跟不回来）；
 *   ② 新线索待处理；
 *   ③ 本周取消 / 挽回 / 原因 Top3（决定要不要调报价和话术）。
 * 详细的列表都在各自模块里，这里只放数量与入口。
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { cancelStats, leadCounts, listPendingLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

/** 相对时间：和 LeadCard 里那套一致（服务端算一次就够，页面是 force-dynamic） */
function timeAgo(value: string) {
    const past = Date.parse(value.replace(" ", "T") + "Z");
    if (Number.isNaN(past)) return "";
    const diff = Math.floor((Date.now() - past) / 1000);
    if (diff < 60) return "刚刚";
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    return `${Math.floor(diff / 86400)} 天前`;
}

export default async function OverviewPage() {
    const cookieStore = await cookies();
    if (cookieStore.get("admin_auth")?.value !== "1") redirect("/admin");

    const counts = leadCounts();
    const cancels = cancelStats();
    const latest = listPendingLeads().slice(0, 5);

    const cards = [
        {
            label: "待处理线索",
            value: counts.pending,
            href: "/admin/leads/pending",
            tone: "text-orange-600",
            hint: "还没联系的申请",
        },
        {
            label: "处理中",
            value: counts.processing,
            href: "/admin/leads/processing",
            tone: "text-blue-600",
            hint: "已联系，等客户回话",
        },
        {
            label: "已完成",
            value: counts.done,
            href: "/admin/leads/done",
            tone: "text-green-600",
            hint: "成交 / 结束",
        },
        {
            label: "客户取消待处理",
            value: cancels.pending,
            href: "/admin/cancellations",
            tone: cancels.pending > 0 ? "text-red-600" : "text-gray-400",
            hint: "取消后还没人跟过",
        },
    ];

    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">概览</h1>
                <p className="mt-2 text-sm text-gray-500">
                    先看红点那格：客户已经明确说不做了，越早回访越有可能拉回来。
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, index) => (
                    <Reveal key={card.label} delay={index * 40}>
                        <Link
                            href={card.href}
                            className="block rounded-3xl bg-white p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_28px_rgba(0,0,0,0.07)]"
                        >
                            <p className="flex items-center gap-2 text-sm text-gray-500">
                                {card.label}
                                {card.label === "客户取消待处理" && card.value > 0 && (
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                )}
                            </p>
                            <p className={`mt-2 text-3xl font-semibold ${card.tone}`}>
                                {card.value}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">{card.hint}</p>
                        </Link>
                    </Reveal>
                ))}
            </div>


            {/* 取消速览：本周多少单撤了、挽回了几单、原因集中在哪 */}
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">客户取消 · 近 7 天</h2>
                    <Link
                        href="/admin/cancellations"
                        className="text-sm text-orange-600 hover:text-orange-700"
                    >
                        去处理取消单 →
                    </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-10 gap-y-3 text-sm">
                    <span className="text-gray-500">
                        取消{" "}
                        <span className="text-xl font-semibold text-gray-900">
                            {cancels.week}
                        </span>{" "}
                        张
                    </span>
                    <span className="text-gray-500">
                        累计待处理{" "}
                        <span className="text-xl font-semibold text-red-600">
                            {cancels.pending}
                        </span>{" "}
                        张
                    </span>
                    <span className="text-gray-500">
                        已挽回{" "}
                        <span className="text-xl font-semibold text-green-600">
                            {cancels.recovered}
                        </span>{" "}
                        张
                    </span>
                </div>

                {cancels.reasons.length > 0 && (
                    <p className="mt-4 text-sm leading-relaxed text-gray-500">
                        原因 Top 3：
                        {cancels.reasons
                            .slice(0, 3)
                            .map((r) => `${r.label}（${r.count}）`)
                            .join(" · ")}
                    </p>
                )}
            </div>

            {/* 最近待处理的 5 条线索：登录后直接从这儿点进去处理 */}
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">最新待处理线索</h2>
                    <Link
                        href="/admin/leads/pending"
                        className="text-sm text-orange-600 hover:text-orange-700"
                    >
                        全部线索 →
                    </Link>
                </div>

                {latest.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-400">暂时没有待处理的线索。</p>
                ) : (
                    <div className="mt-2 divide-y divide-gray-50">
                        {latest.map((lead) => (
                            <Link
                                key={lead.id}
                                href={`/admin/leads/${lead.id}`}
                                className="flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:bg-gray-50/80"
                            >
                                <span className="flex flex-wrap items-center gap-3">
                                    <span className="font-medium text-gray-900">{lead.name}</span>
                                    <span className="text-sm text-gray-400">{lead.phone}</span>
                                    {lead.product && (
                                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                                            {lead.product}
                                        </span>
                                    )}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {timeAgo(lead.created_at)}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

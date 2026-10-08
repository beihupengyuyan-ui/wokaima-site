/**
 * /admin/cancellations —— 客户取消订单：待处理 / 已处理 / 全部 + 取消原因分布。
 *
 * 数据两条线：
 *   ① 取消原因：官网与小程序在客户点「取消」时选填，落 cancel_reason（选「其他原因」时客户补的原话
 *      另存 cancel_note，卡片上单独一行显示；原因分布统计只按 cancel_reason 的白名单值分组）；
 *   ② 处理闭环：后台在这页选处理结果，落 handle_status / handle_result / handled_at。
 * 老数据（本次改造前取消的）这三类列是 NULL，按「未处理 + 未填写原因」显示，不做猜测性回填。
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import CancelCard from "@/components/CancelCard";
import Reveal from "@/components/Reveal";
import { cancelStats, listCancelledLeads, type CancelView } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function CancellationsPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string }>;
}) {
    const cookieStore = await cookies();
    if (cookieStore.get("admin_auth")?.value !== "1") redirect("/admin");

    const { view } = await searchParams;
    const current: CancelView = view === "handled" || view === "all" ? view : "pending";

    const stats = cancelStats();
    const list = listCancelledLeads(current);

    const views: { key: CancelView; label: string; count: number }[] = [
        { key: "pending", label: "待处理", count: stats.pending },
        { key: "handled", label: "已处理", count: stats.handled },
        { key: "all", label: "全部", count: stats.total },
    ];

    const maxReason = stats.reasons.reduce((max, r) => Math.max(max, r.count), 0);

    return (
        <>
            {/* 统计卡：待处理是唯一需要「今天动手」的数字，其余是背景量 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "待处理", value: stats.pending, tone: "text-red-600" },
                    { label: "近 7 天取消", value: stats.week, tone: "text-gray-900" },
                    { label: "已处理", value: stats.handled, tone: "text-green-600" },
                    { label: "已回访挽回", value: stats.recovered, tone: "text-blue-600" },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="rounded-3xl bg-white p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]"
                    >
                        <p className="text-sm text-gray-500">{card.label}</p>
                        <p className={`mt-2 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* 取消原因分布（纯 CSS 条形，不引图表库） */}
            {stats.reasons.length > 0 && (
                <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                    <h2 className="text-lg font-semibold text-gray-900">取消原因分布</h2>
                    <p className="mt-1 text-sm text-gray-400">
                        客户取消时选填的原因，共 {stats.total} 张单。占比高的一档，值得回头看看对应环节。
                    </p>
                    <div className="mt-5 space-y-3">
                        {stats.reasons.map((reason) => (
                            <div key={reason.label} className="flex items-center gap-4">
                                <span className="w-24 flex-shrink-0 text-sm text-gray-600">
                                    {reason.label}
                                </span>
                                <span className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                                    <span
                                        className="block h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                                        style={{
                                            width: `${maxReason ? Math.max(4, Math.round((reason.count / maxReason) * 100)) : 0}%`,
                                        }}
                                    />
                                </span>
                                <span className="w-16 flex-shrink-0 text-right text-sm font-medium text-gray-900">
                                    {reason.count} 张
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* 视图切换 */}
            <div className="mt-8 flex gap-1 rounded-2xl bg-white p-1.5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] w-fit">
                {views.map((item) => (
                    <Link
                        key={item.key}
                        href={
                            item.key === "pending"
                                ? "/admin/cancellations"
                                : `/admin/cancellations?view=${item.key}`
                        }
                        className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors duration-150 ${
                            current === item.key
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                        {item.label}
                        <span className="ml-2 opacity-70">{item.count}</span>
                    </Link>
                ))}
            </div>

            {/* 列表 */}
            <div className="mt-6 space-y-4">
                {list.length === 0 ? (
                    <div className="rounded-3xl bg-white p-16 text-center shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                        <p className="text-4xl">🎉</p>
                        <p className="mt-4 text-lg font-semibold text-gray-900">
                            {current === "pending" ? "没有待处理的取消单" : "这里还没有记录"}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            {current === "pending"
                                ? "客户自助取消的申请会出现在这里，处理完就移到「已处理」。"
                                : "换个页签看看，或者等新的取消申请进来。"}
                        </p>
                    </div>
                ) : (
                    list.map((lead, index) => (
                        <Reveal key={lead.id} delay={Math.min(index * 40, 240)}>
                            <CancelCard lead={lead} />
                        </Reveal>
                    ))
                )}
            </div>
        </>
    );
}

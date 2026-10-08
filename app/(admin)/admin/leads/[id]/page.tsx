import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import db from "@/lib/db";
import Link from "next/link";
import CancelCard from "@/components/CancelCard";
import LeadWorkspace from "@/components/LeadWorkspace";
import Reveal from "@/components/Reveal";
import { hasCancelRecord, isCancelled } from "@/lib/lead-status";

export const dynamic = "force-dynamic";

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
    follow_ups: string | null;
    tags: string | null;
    created_at: string;
    updated_at: string | null;
    /** 「客户取消订单」模块：来源 / 原因 / 取消时间 + 后台处理闭环 */
    cancel_source: string | null;
    cancel_reason: string | null;
    /** 选「其他原因」时客户补的自由文本（选填） */
    cancel_note: string | null;
    cancel_at: string | null;
    handle_status: string | null;
    handle_result: string | null;
    handled_at: string | null;
};

export default async function LeadDetailPage({
                                                 params,
                                             }: {
    params: Promise<{ id: string }>;
}) {
    const cookieStore = await cookies();
    const auth = cookieStore.get("admin_auth");

    if (auth?.value !== "1") {
        redirect("/admin");
    }

    const { id } = await params;
    const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as
        | Lead
        | undefined;

    if (!lead) notFound();

    const followUps: { time: string; text: string }[] = lead.follow_ups
        ? JSON.parse(lead.follow_ups)
        : [];

    const tags: string[] = lead.tags ? JSON.parse(lead.tags) : [];

    // 返回对应的页签：已取消的线索回「客户取消订单」模块，其余按主状态归类
    const backHref = isCancelled(lead)
        ? "/admin/cancellations"
        : lead.status === "processing" || lead.status === "contacted"
            ? "/admin/leads/processing"
            : lead.status === "pending" || lead.status === "new"
                ? "/admin/leads/pending"
                : "/admin/leads/done";

    return (
        <div className="max-w-4xl">
            <Link href={backHref} className="text-sm text-gray-500 hover:text-orange-600">
                ← 返回列表
            </Link>

            <Reveal>
                <LeadWorkspace lead={lead} initialFollowUps={followUps} initialTags={tags} />
            </Reveal>

            {/* 有过取消记录的单（含被回访挽回、已经回到待处理的）：在详情页就能看到
                「从哪撤的、为什么撤、处理了没」并把结果落库，不必再回列表页 ——
                客服往往是先点开详情看跟进记录，才想起要回访。 */}
            {hasCancelRecord(lead) && (
                <div className="mt-8">
                    <h2 className="mb-3 text-lg font-semibold text-gray-900">取消记录与处理</h2>
                    <Reveal>
                        <CancelCard lead={lead} showDetailLink={false} />
                    </Reveal>
                </div>
            )}
        </div>
    );
}
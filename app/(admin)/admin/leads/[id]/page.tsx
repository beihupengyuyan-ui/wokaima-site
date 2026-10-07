import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import db from "@/lib/db";
import Link from "next/link";
import LeadWorkspace from "@/components/LeadWorkspace";
import Reveal from "@/components/Reveal";
import { isCancelled } from "@/lib/lead-status";

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

    // 返回对应的页签：已取消的线索回「已取消」列表，其余按主状态归类
    const backHref = isCancelled(lead)
        ? "/admin/leads/cancelled"
        : lead.status === "processing" || lead.status === "contacted"
            ? "/admin/leads/processing"
            : lead.status === "pending" || lead.status === "new"
                ? "/admin/leads/pending"
                : "/admin/leads/done";

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Link
                    href={backHref}
                    className="text-sm text-gray-500 hover:text-orange-600"
                >
                    ← 返回列表
                </Link>

                <Reveal>
                    <LeadWorkspace
                        lead={lead}
                        initialFollowUps={followUps}
                        initialTags={tags}
                    />
                </Reveal>
            </div>
        </div>
    );
}
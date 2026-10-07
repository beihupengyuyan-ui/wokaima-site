import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LeadCard from "@/components/LeadCard";
import LeadsTabs from "@/components/LeadsTabs";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { leadCounts, listPendingLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
    const cookieStore = await cookies();
    const auth = cookieStore.get("admin_auth");

    if (auth?.value !== "1") {
        redirect("/admin");
    }

    // 已取消（sub_status=已放弃）的订单不在这里显示，统一收进 /admin/leads/cancelled
    const leads = listPendingLeads();
    const counts = leadCounts();

    return (
        <>
            <LeadsTabs counts={counts} />

            {leads.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center shadow-[0_2px_20px_rgba(0,0,0,0.04)] mt-6">
                    <p className="text-gray-400">暂无待处理线索</p>
                </div>
            ) : (
                <div className="space-y-4 mt-6">
                    {leads.map((lead, i) => (
                        <Reveal key={lead.id} delay={0.05 + i * 0.05}>
                            <Link href={`/admin/leads/${lead.id}`} className="block">
                                <LeadCard
                                    lead={lead}
                                    nextStatus="processing"
                                    nextLabel="查看详情 →"
                                    accentColor="border-l-4 border-orange-500"
                                />
                            </Link>
                        </Reveal>
                    ))}
                </div>
            )}
        </>
    );
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import LeadCard from "@/components/LeadCard";
import LeadsTabs from "@/components/LeadsTabs";
import Link from "next/link";
import Reveal from "@/components/Reveal";

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
    created_at: string;
};

export default async function DonePage() {
    const cookieStore = await cookies();
    const auth = cookieStore.get("admin_auth");

    if (auth?.value !== "1") {
        redirect("/admin");
    }

    const leads = db
        .prepare(
            "SELECT * FROM leads WHERE status NOT IN ('pending', 'new', 'processing', 'contacted') ORDER BY created_at DESC"
        )
        .all() as Lead[];

    return (
        <>
            <LeadsTabs counts={{ done: leads.length }} />

            {leads.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center shadow-[0_2px_20px_rgba(0,0,0,0.04)] mt-6">
                    <p className="text-gray-400">暂无已完成的线索</p>
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
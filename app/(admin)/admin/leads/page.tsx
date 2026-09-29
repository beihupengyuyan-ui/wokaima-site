import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";
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

function timeAgo(dateStr: string): string {
    const now = new Date();
    const past = new Date(dateStr.replace(" ", "T") + "Z");
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diff < 60) return "刚刚";
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} 天前`;
    return past.toLocaleDateString("zh-CN");
}

export default async function LeadsPage() {
    const cookieStore = await cookies();
    const auth = cookieStore.get("admin_auth");

    if (auth?.value !== "1") {
        redirect("/admin");
    }

    const leads = db
        .prepare("SELECT * FROM leads ORDER BY created_at DESC")
        .all() as Lead[];

    const newCount = leads.filter((l) => l.status === "new").length;

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <Reveal>
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                                客户线索
                            </h1>
                            <p className="text-sm text-gray-500 mt-2">
                                共 {leads.length} 条 ·{" "}
                                <span className="text-orange-600 font-semibold">
                  {newCount} 条新线索
                </span>
                            </p>
                        </div>
                        <a
                            href="/api/admin/logout"
                            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                        >
                            退出登录
                        </a>
                    </div>
                </Reveal>

                {leads.length === 0 ? (
                    <Reveal>
                        <div className="bg-white rounded-3xl p-20 text-center shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                            <p className="text-gray-400">暂无客户线索</p>
                        </div>
                    </Reveal>
                ) : (
                    <div className="space-y-4">
                        {leads.map((lead, i) => (
                            <Reveal key={lead.id} delay={0.05 + i * 0.05}>
                                <div
                                    className={`bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-6 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 ${
                                        lead.status === "new" ? "border-l-4 border-orange-500" : ""
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-xl text-gray-900">
                                                    {lead.name}
                                                </h3>
                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                                                        lead.status === "new"
                                                            ? "bg-orange-100 text-orange-600"
                                                            : lead.status === "contacted"
                                                                ? "bg-blue-100 text-blue-600"
                                                                : lead.status === "converted"
                                                                    ? "bg-green-100 text-green-600"
                                                                    : "bg-gray-100 text-gray-500"
                                                    }`}
                                                >
                          {lead.status === "new"
                              ? "新线索"
                              : lead.status === "contacted"
                                  ? "已联系"
                                  : lead.status === "converted"
                                      ? "已签约"
                                      : "已放弃"}
                        </span>
                                                {lead.ref === "channel" && (
                                                    <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-600 font-medium">
                            渠道推荐
                          </span>
                                                )}
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                                <a
                                                    href={`tel:${lead.phone}`}
                                                    className="text-gray-900 font-medium hover:text-orange-600 transition-colors"
                                                >
                                                    📞 {lead.phone}
                                                </a>
                                                {lead.company && (
                                                    <span className="text-gray-500">🏢 {lead.company}</span>
                                                )}
                                                {lead.region && (
                                                    <span className="text-gray-500">📍 {lead.region}</span>
                                                )}
                                            </div>

                                            {lead.product && (
                                                <div className="mt-3 text-sm text-gray-600">
                                                    <span className="text-gray-400">意向产品：</span>
                                                    <span className="font-medium">{lead.product}</span>
                                                </div>
                                            )}

                                            {lead.trade_in === 1 && (
                                                <div className="mt-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-600">
                            🔄 需要以旧换新
                          </span>
                                                </div>
                                            )}

                                            {lead.note && (
                                                <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-2xl px-4 py-3">
                                                    {lead.note}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-3">
                                            <p className="text-xs text-gray-400 whitespace-nowrap">
                                                {timeAgo(lead.created_at)}
                                            </p>

                                            <div className="flex gap-2">
                                                {lead.status === "new" && (
                                                    <a
                                                        href={`/api/admin/leads/${lead.id}?status=contacted`}
                                                        className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    >
                                                        标记已联系
                                                    </a>
                                                )}
                                                {lead.status === "contacted" && (
                                                    <a
                                                        href={`/api/admin/leads/${lead.id}?status=converted`}
                                                        className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                    >
                                                        标记已签约
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
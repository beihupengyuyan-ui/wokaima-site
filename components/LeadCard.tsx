import StatusBadge from "@/components/StatusBadge";
import { isCancelled, isFromMiniProgram } from "@/lib/lead-status";

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

export default function LeadCard({
                                     lead,
                                     nextStatus,
                                     nextLabel,
                                     accentColor,
                                 }: {
    lead: Lead;
    nextStatus: string | null;
    nextLabel: string | null;
    accentColor: string;
}) {
    const cancelled = isCancelled(lead);
    const fromMini = isFromMiniProgram(lead);

    return (
        <div
            className={`bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-6 transition-all duration-500 ease-out animate-fade-in-up border-l-4 ${
                cancelled
                    ? "border-red-400 bg-gray-50/70 hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)]"
                    : "hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1"
            } ${
                cancelled
                    ? ""
                    : lead.status === "pending" || lead.status === "new"
                        ? "border-orange-500"
                        : lead.status === "processing" || lead.status === "contacted"
                            ? "border-blue-500"
                            : "border-green-500"
            }`}
        >
            {/* 顶部：姓名 + 时间 */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">
                        👤
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg text-gray-900">{lead.name}</h3>
                            <StatusBadge status={lead.status} subStatus={lead.sub_status} />
                            {lead.ref === "channel" && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">
      渠道
    </span>
                            )}
                            {fromMini && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">
      小程序
    </span>
                            )}
                        </div>
                    </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
          {timeAgo(lead.created_at)}
        </span>
            </div>

            {/* 信息区 */}
            <div className="mt-4 space-y-3">
                {/* 已取消提示：避免已取消的订单看起来像全新的待处理线索 */}
                {cancelled && (
                    <div className="flex items-start gap-2 text-sm rounded-2xl bg-red-50 px-4 py-3 text-red-600">
                        <span className="flex-shrink-0">⛔</span>
                        <span>
                            {fromMini
                                ? "用户已在小程序取消该订单，无需再跟进"
                                : "该线索已标记为放弃，无需再跟进"}
                            ；如需恢复，进入详情页把主状态改回「待处理」并清空子状态后保存。
                        </span>
                    </div>
                )}

                {/* 电话 + 公司（同一行） */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">电话</span>
                        <span className="font-semibold text-gray-900">{lead.phone}</span>
                    </div>
                    {lead.company && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">公司</span>
                            <span className="text-gray-700">{lead.company}</span>
                        </div>
                    )}
                </div>

                {/* 地址 */}
                {lead.region && (
                    <div className="flex items-start gap-2 text-sm">
                        <span className="text-gray-400 flex-shrink-0">地址</span>
                        <span className="text-gray-700">{lead.region}</span>
                    </div>
                )}

                {/* 意向产品 */}
                {lead.product && (
                    <div className="flex items-start gap-2 text-sm">
                        <span className="text-gray-400 flex-shrink-0">意向</span>
                        <span className="text-gray-700 font-medium">{lead.product}</span>
                    </div>
                )}

                {/* 标签 */}
                {(lead.trade_in === 1 || lead.note) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {lead.trade_in === 1 && (
                            <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-medium">
                🔄 以旧换新
              </span>
                        )}
                    </div>
                )}

                {/* 备注 */}
                {lead.note && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-2xl px-4 py-3">
                        {lead.note}
                    </div>
                )}
            </div>

            {/* 底部：查看详情 */}
            {nextLabel && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <span className="text-sm text-orange-600 font-medium">
            {nextLabel}
          </span>
                </div>
            )}
        </div>
    );
}
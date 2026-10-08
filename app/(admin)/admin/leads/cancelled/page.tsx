import { redirect } from "next/navigation";

/**
 * 老地址：/admin/leads/cancelled（原「已取消」页签）。
 *
 * 「已取消」已经升级成独立模块 /admin/cancellations（待处理 / 已处理 + 原因统计 + 处理闭环），
 * 这里只做跳转：老板的收藏夹、聊天记录里的旧链接照样能打开，不会 404。
 */
export default function CancelledLegacyPage() {
    redirect("/admin/cancellations");
}


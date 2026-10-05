/**
 * POST /api/mini/orders/[orderNo]/cancel —— 用户取消订单
 * 只允许 status=pending 时取消；取消 = sub_status 置「已放弃」+ tags 追加「用户取消」
 * （保持 status 不变，admin 三个列表页不会丢数据，详情页能看到「已放弃」）
 */
import db from "@/lib/db";
import { LeadRow, bearerOpenid, fail, nowUtc, ok, rowToOrder, safeParse, STATUS_ALIAS } from "@/lib/mini";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ orderNo: string }> }) {
    const openid = bearerOpenid(request);
    if (!openid) return fail(401, "登录已失效，请重新进入小程序");

    const { orderNo } = await context.params;
    const row = db
        .prepare("SELECT * FROM leads WHERE order_no = ? AND openid = ?")
        .get(orderNo, openid) as LeadRow | undefined;

    if (!row) return fail(4004, "订单不存在");

    const status = STATUS_ALIAS[row.status || ""] || row.status || "pending";
    if (status !== "pending") {
        return fail(4001, "订单已受理，请联系客服 138 8078 8802 取消");
    }

    const tags = safeParse<string[]>(row.tags, []);
    if (!tags.includes("用户取消")) tags.push("用户取消");

    db.prepare("UPDATE leads SET sub_status = ?, tags = ?, updated_at = ? WHERE id = ?").run(
        "已放弃",
        JSON.stringify(tags),
        nowUtc(),
        row.id
    );

    const updated = db.prepare("SELECT * FROM leads WHERE id = ?").get(row.id) as LeadRow;
    return ok({ order: rowToOrder(updated) });
}

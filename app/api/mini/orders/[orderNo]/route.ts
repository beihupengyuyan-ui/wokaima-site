/**
 * GET /api/mini/orders/[orderNo] —— 订单详情（只能查自己的订单）
 */
import db from "@/lib/db";
import { LeadRow, bearerOpenid, fail, ok, rowToOrder } from "@/lib/mini";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ orderNo: string }> }) {
    const openid = bearerOpenid(request);
    if (!openid) return fail(401, "登录已失效，请重新进入小程序");

    const { orderNo } = await context.params;
    const row = db
        .prepare("SELECT * FROM leads WHERE order_no = ? AND openid = ?")
        .get(orderNo, openid) as LeadRow | undefined;

    if (!row) return fail(4004, "订单不存在");

    return ok({ order: rowToOrder(row) });
}

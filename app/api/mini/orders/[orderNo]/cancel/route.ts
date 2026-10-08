/**
 * POST /api/mini/orders/[orderNo]/cancel —— 用户取消订单
 * 只允许 status=pending 时取消；取消 = sub_status 置「已放弃」+ tags 追加「用户取消」
 * （保持 status 不变，admin 三个线索列表不会丢数据，详情页能看到「已放弃」）
 *
 * 另外补几列给后台「客户取消订单」模块（/admin/cancellations）：
 *   cancel_source='小程序' / cancel_reason（请求体里的选填 reason）/ cancel_note（选填 reasonNote）/
 *   cancel_at，并写一条 follow_ups，让客服在详情页能看到「谁、什么时候、从哪个口子、为什么撤的」。
 * reasonNote 目前小程序端用不上（ActionSheet 输不了自由文本），先按官网同一口径接着：
 * 等小程序真加了输入框，直接传这个字段就行，服务端不用再动。（官网取消走 app/api/site/orders/cancel）
 * handle_status 不写 = 未处理 → 后台会用红点提醒有人跟一声（官网取消走 app/api/site/orders/cancel 同一套）。
 */
import db from "@/lib/db";
import { LeadRow, bearerOpenid, fail, nowUtc, ok, rowToOrder, safeParse, STATUS_ALIAS } from "@/lib/mini";
import { CANCELLED_SUB_STATUS, USER_CANCEL_TAG, normalizeCancelNote, normalizeCancelReason } from "@/lib/lead-status";
import { bjText } from "@/lib/lead-utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ orderNo: string }> }) {
    const openid = bearerOpenid(request);
    if (!openid) return fail(401, "登录已失效，请重新进入小程序");

    // 请求体可选（{ reason?, reasonNote? }）：小程序老版本不带 body，取不到就当没填原因
    let reason: unknown;
    let reasonNote: unknown;
    try {
        const body = await request.json();
        reason = body?.reason;
        reasonNote = body?.reasonNote;
    } catch {
        reason = undefined;
        reasonNote = undefined;
    }

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
    if (!tags.includes(USER_CANCEL_TAG)) tags.push(USER_CANCEL_TAG);

    // 取消原因：白名单之外一律按「没填」处理（后台原因分布统计只认这几个值）
    const cancelReason = normalizeCancelReason(reason);
    // 「其他原因」后面那句话另存一列（与官网同一口径）
    const cancelNote = normalizeCancelNote(reasonNote);
    const now = nowUtc();

    const followUps = safeParse<{ time: string; text: string }[]>(row.follow_ups, []);
    followUps.push({
        time: bjText(now),
        text: `[用户取消] 客户在小程序取消订单（订单号 ${orderNo}）${
            cancelReason ? `，原因：${cancelReason}` : ""
        }${cancelNote ? `（客户补充：${cancelNote}）` : ""}`,
    });

    db.prepare(
        `UPDATE leads SET
            sub_status = ?, tags = ?, follow_ups = ?,
            cancel_source = '小程序', cancel_reason = ?, cancel_note = ?, cancel_at = ?, updated_at = ?
         WHERE id = ?`
    ).run(
        CANCELLED_SUB_STATUS,
        JSON.stringify(tags),
        JSON.stringify(followUps),
        cancelReason,
        cancelNote,
        now,
        now,
        row.id
    );

    const updated = db.prepare("SELECT * FROM leads WHERE id = ?").get(row.id) as LeadRow;
    return ok({ order: rowToOrder(updated) });
}

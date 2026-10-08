/**
 * POST /api/admin/leads/[id]/cancel —— 后台处理一张「客户取消订单」
 *
 * 入参 JSON：{ result: 处理结果, note?: 备注 }
 *   result ∈ HANDLE_RESULTS（已回访挽回 / 客户确认取消 / 已退款 / 联系不上 / 后台标记放弃）
 *
 * 做的事情：
 *   1. 写处理闭环：handle_status='handled' + handle_result + handled_at；
 *   2. 追加标签「取消已处理」与一条 follow_ups 记录（谁、什么时候、怎么处理的）；
 *   3. 只有「已回访挽回」才复活订单：status 改回 pending、sub_status 清空，
 *      于是它重新出现在「待处理」列表里 —— 取消原因与取消时间保留，历史不丢；
 *   4. 老数据没有 cancel_at 的，顺手用当前时间补上（列表按取消时间排序才有意义）。
 *
 * 可以重复调用：换一个处理结果再提交 = 修正上一次的处理意见（跟进记录里两条都留着）。
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import {
    CANCEL_HANDLED_TAG,
    HANDLE_RESULTS,
    RECOVERED_RESULT,
    type HandleResult,
} from "@/lib/lead-status";
import { bjText, nowUtc, safeParse } from "@/lib/lead-utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    if (cookieStore.get("admin_auth")?.value !== "1") {
        return NextResponse.json({ ok: false, message: "登录已失效，请重新登录" }, { status: 401 });
    }

    const { id } = await context.params;

    let body: { result?: unknown; note?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, message: "请求格式不对" }, { status: 400 });
    }

    const result = String(body.result ?? "").trim();
    if (!(HANDLE_RESULTS as string[]).includes(result)) {
        return NextResponse.json(
            { ok: false, message: "请选择处理结果（已回访挽回 / 客户确认取消 / 已退款 / 联系不上）" },
            { status: 400 }
        );
    }

    const row = db
        .prepare("SELECT status, sub_status, tags, follow_ups, cancel_at FROM leads WHERE id = ?")
        .get(id) as
        | {
              status: string | null;
              sub_status: string | null;
              tags: string | null;
              follow_ups: string | null;
              cancel_at: string | null;
          }
        | undefined;

    if (!row) {
        return NextResponse.json({ ok: false, message: "找不到这张单" }, { status: 404 });
    }

    const now = nowUtc();
    const note = String(body.note ?? "").trim();
    const recovered = result === RECOVERED_RESULT;

    const tags = safeParse<string[]>(row.tags, []);
    if (!tags.includes(CANCEL_HANDLED_TAG)) tags.push(CANCEL_HANDLED_TAG);

    const followUps = safeParse<{ time: string; text: string }[]>(row.follow_ups, []);
    followUps.push({
        time: bjText(now),
        text: `[取消处理 · ${result}]${note ? ` ${note}` : " 后台已处理这笔取消"}${
            recovered ? "（订单已复活，回到「待处理」）" : ""
        }`,
    });

    db.prepare(
        `UPDATE leads SET
            status = ?, sub_status = ?, tags = ?, follow_ups = ?,
            handle_status = 'handled', handle_result = ?, handled_at = ?,
            cancel_at = COALESCE(cancel_at, ?), updated_at = ?
         WHERE id = ?`
    ).run(
        recovered ? "pending" : row.status,
        recovered ? null : row.sub_status,
        JSON.stringify(tags),
        JSON.stringify(followUps),
        result as HandleResult,
        now,
        now,
        now,
        id
    );

    return NextResponse.json({ ok: true, recovered });
}

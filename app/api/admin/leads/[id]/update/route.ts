import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { CANCELLED_SUB_STATUS } from "@/lib/lead-status";
import { nowUtc } from "@/lib/lead-utils";

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const auth = cookieStore.get("admin_auth");

    if (auth?.value !== "1") {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const { id } = await context.params;
    const { status, subStatus, tags, note } = await request.json();

    // 读取当前 follow_ups 与取消状态
    const row = db
        .prepare("SELECT follow_ups, sub_status FROM leads WHERE id = ?")
        .get(id) as { follow_ups: string | null; sub_status: string | null } | undefined;

    const followUps: { time: string; text: string }[] = row?.follow_ups
        ? JSON.parse(row.follow_ups)
        : [];

    // 如果有备注，追加到历史
    if (note && note.trim()) {
        const statusLabel =
            status === "pending"
                ? "待处理"
                : status === "processing"
                    ? "处理中"
                    : "已完成";
        const label = subStatus ? `${statusLabel} · ${subStatus}` : statusLabel;

        followUps.push({
            time: new Date().toLocaleString("zh-CN"),
            text: `[${label}] ${note.trim()}`,
        });
    }

    db.prepare(
        "UPDATE leads SET status = ?, sub_status = ?, tags = ?, follow_ups = ? WHERE id = ?"
    ).run(
        status,
        subStatus || null,
        JSON.stringify(tags || []),
        JSON.stringify(followUps),
        id
    );

    // 后台工程师自己把单标成「已放弃」= 后台发起的取消：补上取消来源 / 时间，
    // 并直接记为「已处理 · 后台标记放弃」——它不是客户取消，不需要再有人去跟进。
    // 只在本行「本来没取消」时写：避免把客户已取消、还没人处理的单悄悄置成已处理。
    const wasCancelled = (row?.sub_status || "") === CANCELLED_SUB_STATUS;
    const nowCancelled = (subStatus || "") === CANCELLED_SUB_STATUS;
    if (nowCancelled && !wasCancelled) {
        const now = nowUtc();
        db.prepare(
            `UPDATE leads SET
                cancel_source = COALESCE(cancel_source, '后台'),
                cancel_at = COALESCE(cancel_at, ?),
                handle_status = 'handled',
                handle_result = COALESCE(handle_result, '后台标记放弃'),
                handled_at = COALESCE(handled_at, ?),
                updated_at = ?
             WHERE id = ?`
        ).run(now, now, now, id);
    }

    return NextResponse.json({ ok: true });
}
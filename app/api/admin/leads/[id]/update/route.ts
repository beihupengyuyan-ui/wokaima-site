import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

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

    // 读取当前 follow_ups
    const row = db
        .prepare("SELECT follow_ups FROM leads WHERE id = ?")
        .get(id) as { follow_ups: string | null } | undefined;

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

    return NextResponse.json({ ok: true });
}
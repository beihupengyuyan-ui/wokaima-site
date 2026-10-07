/**
 * POST /api/site/orders/cancel —— 官网「我的申请」自助取消
 *
 * 入参 JSON：{ id, phone, keyword }（id 来自查询结果；phone / keyword 再核验一次，
 * 避免拿到别人的 id 直接取消）。
 * 出参统一 200：
 *   { ok: true, order }                                  ← 已取消，返回更新后的申请
 *   { ok: false, reason, message }                        ← not_found / already_cancelled / not_pending
 * 业务失败也走 200，前端只看 ok 与 message（与小程序接口同一套习惯）。
 */
import { NextResponse } from "next/server";
import { cancelSiteOrder } from "@/lib/site-orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    let body: { id?: unknown; phone?: unknown; keyword?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { ok: false, reason: "not_found", message: "请求格式不对，请刷新页面后重试" },
            { status: 400 }
        );
    }

    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json(
            { ok: false, reason: "not_found", message: "申请不存在，请重新查询后再取消" },
            { status: 400 }
        );
    }

    const result = cancelSiteOrder({
        id,
        phone: String(body.phone ?? ""),
        keyword: String(body.keyword ?? ""),
    });

    return NextResponse.json(result);
}

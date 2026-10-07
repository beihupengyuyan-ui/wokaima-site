/**
 * POST /api/site/orders/lookup —— 官网「我的申请」查询
 *
 * 入参 JSON：{ phone, keyword }（keyword = 提交申请时填的姓名或公司名）
 * 出参：200 { ok: true, orders: SiteOrder[] }；参数不合法 400 { ok: false, message }
 *
 * 注意：查不到时返回的是空数组（不是错误）—— 官网访客可能压根没提交过，
 * 页面要能给出「没查到，检查一下手机号 / 姓名」这种正常提示。
 */
import { NextResponse } from "next/server";
import { lookupSiteOrders } from "@/lib/site-orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    let body: { phone?: unknown; keyword?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { ok: false, message: "请求格式不对，请刷新页面后重试" },
            { status: 400 }
        );
    }

    const phone = String(body.phone ?? "").trim();
    const keyword = String(body.keyword ?? "").trim();

    if (phone.replace(/[^\d]/g, "").length < 6) {
        return NextResponse.json(
            { ok: false, message: "请填写提交申请时留的手机号" },
            { status: 400 }
        );
    }
    if (keyword.length < 2) {
        return NextResponse.json(
            { ok: false, message: "请填写提交申请时的姓名或公司名" },
            { status: 400 }
        );
    }

    return NextResponse.json({ ok: true, orders: lookupSiteOrders({ phone, keyword }) });
}

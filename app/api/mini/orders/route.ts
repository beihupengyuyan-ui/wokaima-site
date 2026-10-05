/**
 * POST /api/mini/orders  —— 小程序提交订单（写入 leads 表，admin 后台立刻可见）
 * GET  /api/mini/orders  —— 我的订单列表（只返回当前 openid 的订单）
 *
 * 安全：金额与订单号由服务端按 data/products.ts 重算，绝不相信客户端金额；
 *      clientOrderNo 做幂等，重复提交只产生一条。
 */
import { NextResponse } from "next/server";
import db from "@/lib/db";
import {
    LeadRow,
    STATUS_TEXT,
    bearerOpenid,
    fail,
    genOrderNo,
    nowUtc,
    ok,
    rowToOrder,
    toMiniProducts,
} from "@/lib/mini";

export const dynamic = "force-dynamic";

type ContactInput = {
    name?: string;
    phone?: string;
    company?: string;
    region?: string;
    address?: string;
};

type OrderInput = {
    clientOrderNo?: string;
    productId?: string;
    qty?: number;
    contact?: ContactInput;
    tradeIn?: boolean;
    note?: string;
};

export async function POST(request: Request) {
    const openid = bearerOpenid(request);
    if (!openid) return fail(401, "登录已失效，请重新进入小程序");

    const body = (await request.json().catch(() => null)) as OrderInput | null;
    if (!body) return fail(4001, "请求体不是合法 JSON");

    const clientOrderNo = (body.clientOrderNo || "").trim();
    const productId = (body.productId || "").trim();
    const qty = Math.max(1, Math.min(99, Number(body.qty) || 1));
    const contact = body.contact || {};
    const name = (contact.name || "").trim();
    const phone = (contact.phone || "").trim();

    if (!name) return fail(4001, "请填写姓名");
    if (!/^1\d{10}$/.test(phone)) return fail(4001, "请填写正确的 11 位手机号");

    // 幂等：同一次提交重试直接返回已有订单
    // 必须同时校验 openid，否则猜到别人的 clientOrderNo 就能读走别人的订单
    if (clientOrderNo) {
        const exist = db
            .prepare("SELECT * FROM leads WHERE client_order_no = ?")
            .get(clientOrderNo) as LeadRow | undefined;
        if (exist) {
            if (exist.openid === openid) return ok({ order: rowToOrder(exist) });
            return fail(4009, "订单号冲突，请重新提交");
        }
    }

    const product = toMiniProducts().find((p) => p.id === productId);
    if (!product) return fail(4004, "商品不存在或已下架");

    // 服务端重算金额
    const dailyTotal = product.dailyRent * qty;
    const monthlyTotal = product.monthlyRent * qty;

    const orderNo = genOrderNo();
    const ts = nowUtc();
    const tradeIn = !!body.tradeIn;
    const note = (body.note || "").trim();

    const region = (contact.region || "").trim();
    const address = (contact.address || "").trim();
    const regionFull = [region, address].filter(Boolean).join(" ");

    const items = [
        {
            productId: product.id,
            name: product.name,
            qty,
            unit: product.unit,
            dailyRent: product.dailyRent,
            monthlyRent: product.monthlyRent,
        },
    ];

    const tags = ["小程序下单"];
    if (tradeIn) tags.push("以旧换新");

    const info = db
        .prepare(
            `INSERT INTO leads
             (name, phone, company, region, product, trade_in, note, ref, status, created_at,
              sub_status, follow_ups, tags, source, openid, order_no, client_order_no,
              items_json, amount_daily, amount_monthly, lease_term, address, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
            name,
            phone,
            (contact.company || "").trim() || null,
            regionFull || null,
            `${product.category} ${qty} ${product.unit}`,
            tradeIn ? 1 : 0,
            note || null,
            "miniprogram",
            "pending",
            ts,
            null,
            "[]",
            JSON.stringify(tags),
            "miniprogram",
            openid,
            orderNo,
            clientOrderNo || null,
            JSON.stringify(items),
            dailyTotal,
            monthlyTotal,
            product.leaseTerm,
            address || null,
            ts
        );

    const row = db.prepare("SELECT * FROM leads WHERE id = ?").get(info.lastInsertRowid) as LeadRow;
    return ok({ order: rowToOrder(row) });
}

export async function GET(request: Request) {
    const openid = bearerOpenid(request);
    if (!openid) return fail(401, "登录已失效，请重新进入小程序");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";

    const rows = db
        .prepare("SELECT * FROM leads WHERE openid = ? AND order_no IS NOT NULL ORDER BY id DESC")
        .all(openid) as LeadRow[];

    const orders = rows.map(rowToOrder);
    const counts: Record<string, number> = { all: orders.length, pending: 0, processing: 0, done: 0, cancelled: 0 };
    orders.forEach((o) => {
        if (counts[o.status] !== undefined) counts[o.status] += 1;
    });

    const list = status === "all" ? orders : orders.filter((o) => o.status === status);
    return NextResponse.json({ code: 0, msg: "ok", data: { list, counts, statusText: STATUS_TEXT } });
}

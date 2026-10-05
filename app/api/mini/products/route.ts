/**
 * GET /api/mini/products?version=xxx
 * 小程序商品列表：数据源仍是 data/products.ts（单一数据源，改完部署即生效）
 * 带 version 且与最新一致时只回 { unchanged: true }，省流量
 */
import crypto from "crypto";
import { NextResponse } from "next/server";
import { ok, toMiniProducts } from "@/lib/mini";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const list = toMiniProducts();
    const version = crypto.createHash("sha1").update(JSON.stringify(list)).digest("hex").slice(0, 12);

    const { searchParams } = new URL(request.url);
    if (searchParams.get("version") === version) {
        return NextResponse.json({ code: 0, msg: "ok", data: { unchanged: true, version } });
    }

    return ok({ unchanged: false, version, list });
}

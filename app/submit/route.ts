import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: Request) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    db.prepare(`
    INSERT INTO leads (name, phone, company, region, product, trade_in, note, ref)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        data.name as string,
        data.phone as string,
        (data.company as string) || null,
        (data.region as string) || null,
        `蒸柜 ${data.steamerQty || 0} 台；整灶 ${data.stoveQty || 0} 眼；炉心 ${data.burnerQty || 0} 眼；工作台 ${data.worktableQty || 0} 台`,
        data.tradeIn === "yes" ? 1 : 0,
        (data.note as string) || null,
        null
    );

    return NextResponse.json({ ok: true });
}
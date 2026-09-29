import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const auth = cookieStore.get("admin_auth");

    if (auth?.value !== "1") {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (status && ["new", "contacted", "converted", "lost"].includes(status)) {
        db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
    }

    return NextResponse.redirect(new URL("/admin/leads", request.url));
}
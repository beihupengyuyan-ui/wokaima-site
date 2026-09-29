import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { password } = await request.json();

    if (password === process.env.ADMIN_PASSWORD) {
        const response = NextResponse.json({ ok: true });
        response.cookies.set("admin_auth", "1", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 2, // 2 小时
            path: "/",
        });
        return response;
    }

    return NextResponse.json({ ok: false, error: "密码错误" }, { status: 401 });
}
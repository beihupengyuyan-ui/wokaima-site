import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.set("admin_auth", "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
    });
    return response;
}
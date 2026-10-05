/**
 * POST /api/mini/auth/login
 * 请求：{ code }（wx.login 拿到的 code）
 * 响应：{ code: 0, data: { token, openid, expiresIn } }
 * AppSecret 只存在服务端环境变量，绝不下发到小程序
 */
import { NextResponse } from "next/server";
import { fail, ok, signToken, tokenSecretReady } from "@/lib/mini";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as { code?: string } | null;
    const code = (body?.code || "").trim();
    if (!code) return fail(4001, "缺少 code");

    // 先自检令牌密钥：生产环境漏配就别浪费一次微信调用，直接给出可操作的提示
    if (!tokenSecretReady()) {
        return fail(5000, "服务端未配置 MINI_TOKEN_SECRET，请查看 MINI-SYNC.md 第 1 节");
    }

    const appid = process.env.WX_APPID;
    const secret = process.env.WX_SECRET;
    if (!appid || !secret) {
        return fail(5000, "服务端未配置 WX_APPID / WX_SECRET");
    }

    const url =
        "https://api.weixin.qq.com/sns/jscode2session" +
        `?appid=${appid}&secret=${secret}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;

    try {
        const res = await fetch(url, { cache: "no-store" });
        const data = (await res.json()) as { openid?: string; errcode?: number; errmsg?: string };
        if (!data.openid) {
            return fail(401, data.errmsg || `微信登录失败（${data.errcode ?? "unknown"}）`);
        }
        return ok({ token: signToken(data.openid), openid: data.openid, expiresIn: 7 * 24 * 3600 });
    } catch {
        return fail(5000, "无法连接微信服务器，请稍后重试");
    }
}

export async function GET() {
    return NextResponse.json({ code: 4001, msg: "请用 POST 调用" });
}

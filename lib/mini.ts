/**
 * 小程序专用公共逻辑（只被 app/api/mini/** 使用，不影响官网与 admin 现有逻辑）
 * - 商品：把 data/products.ts 转成小程序结构（specs 转数组、slug→id、补 unit/emoji/monthText）
 * - 登录：HMAC-SHA256 自签无状态令牌，服务端不存 session
 * - 订单：leads 行 ↔ 小程序订单结构互转（复用 leads 表，admin 后台零改造）
 */
import crypto from "crypto";
import { NextResponse } from "next/server";
import { products as sourceProducts } from "@/data/products";

const DEV_TOKEN_SECRET = "wokaima-mini-dev-secret";
const TOKEN_TTL = 7 * 24 * 3600; // 7 天

let warnedSecret = false;
function warnSecretOnce(msg: string) {
    if (warnedSecret) return;
    warnedSecret = true;
    console.error(`[mini] ${msg}`);
}

/**
 * 令牌密钥（延迟读取，不放模块顶层 —— 避免 build 阶段炸掉整个官网）。
 * - 配了 MINI_TOKEN_SECRET 就用它；
 * - 开发环境回落到固定开发密钥，方便本机联调；
 * - 生产环境漏配则抛错：绝不能静默使用仓库里的默认密钥，
 *   否则任何拿到源码的人都能伪造令牌，读到客户的手机号 / 地址。
 */
function tokenSecret(): string {
    const secret = (process.env.MINI_TOKEN_SECRET || "").trim();
    if (secret) return secret;
    if (process.env.NODE_ENV !== "production") return DEV_TOKEN_SECRET;
    throw new Error("MINI_TOKEN_SECRET_NOT_CONFIGURED");
}

/** 令牌密钥是否已配置（生产环境漏配时，登录接口会给出明确提示） */
export function tokenSecretReady(): boolean {
    return Boolean((process.env.MINI_TOKEN_SECRET || "").trim());
}

/** 与小程序 utils/orders.js 的 STATUS_TEXT 完全一致 */
export const STATUS_TEXT: Record<string, string> = {
    pending: "待确认",
    processing: "已受理",
    done: "已完成",
    cancelled: "已取消",
};

/** 老数据兼容：new/contacted/converted/lost → pending/processing/done */
export const STATUS_ALIAS: Record<string, string> = {
    new: "pending",
    contacted: "processing",
    converted: "done",
    lost: "done",
};

const UNIT_BY_CATEGORY: Record<string, string> = {
    蒸柜: "台",
    整灶: "眼",
    炉头: "眼",
    工作台: "台",
};

const EMOJI_BY_SLUG: Record<string, string> = {
    "smart-steamer-3door": "🍚",
    "energy-wok-range": "🔥",
    "stainless-work-table": "🧰",
};

/** 个别商品的月租文案后缀（与小程序 data/products.js 保持一字不差） */
const MONTH_TEXT_SUFFIX: Record<string, string> = {
    "stainless-work-table": "起",
};

/**
 * 商品列表 → 小程序结构。
 * 注意 images 仍然返回小程序包内路径（如 /images/products/steamer-d3.png），
 * 小程序包里有同名图片，直接可用，不需要图片域名白名单。
 */
export function toMiniProducts() {
    return sourceProducts.map((p) => ({
        id: p.slug,
        name: p.name,
        category: p.category,
        tagline: p.tagline,
        dailyRent: p.dailyRent,
        dailyRentUnit: p.dailyRentUnit,
        unit: UNIT_BY_CATEGORY[p.category] || "台",
        monthlyRent: p.monthlyRent,
        monthText: `¥${p.monthlyRent} ${p.priceUnit}${MONTH_TEXT_SUFFIX[p.slug] || ""}`,
        leaseTerm: p.leaseTerm,
        emoji: EMOJI_BY_SLUG[p.slug] || "🍳",
        specs: Object.entries(p.specs).map(([label, value]) => ({ label, value })),
        features: p.features,
        energySaving: p.energySaving,
        economy: p.economy,
        images: p.images,
    }));
}

export type MiniProduct = ReturnType<typeof toMiniProducts>[number];

/** 订单号：WK + 北京时间 yyyyMMddHHmmss + 3 位随机（与小程序 genOrderNo 口径一致） */
export function genOrderNo(date = new Date()) {
    const bj = new Date(date.getTime() + 8 * 3600 * 1000);
    const p = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const rand = Math.floor(Math.random() * 900) + 100;
    return (
        "WK" +
        bj.getUTCFullYear() +
        p(bj.getUTCMonth() + 1) +
        p(bj.getUTCDate()) +
        p(bj.getUTCHours()) +
        p(bj.getUTCMinutes()) +
        p(bj.getUTCSeconds()) +
        rand
    );
}

/** 当前 UTC 时间，格式 YYYY-MM-DD HH:mm:ss（与 leads.created_at 一致） */
export function nowUtc() {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
}

/** UTC 字符串 → 毫秒时间戳（小程序端直接用这个展示） */
export function utcToMs(value: string | null | undefined) {
    if (!value) return Date.now();
    const d = new Date(value.replace(" ", "T") + "Z");
    return Number.isNaN(d.getTime()) ? Date.now() : d.getTime();
}

export function safeParse<T>(value: unknown, fallback: T): T {
    if (typeof value !== "string" || !value.trim()) return fallback;
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

/** 签发令牌：base64url(openid.exp) + "." + HMAC-SHA256 签名 */
export function signToken(openid: string, ttl = TOKEN_TTL) {
    const payload = `${openid}.${Math.floor(Date.now() / 1000) + ttl}`;
    const sig = crypto.createHmac("sha256", tokenSecret()).update(payload).digest("base64url");
    return `${Buffer.from(payload, "utf8").toString("base64url")}.${sig}`;
}

/** 校验令牌，返回 openid；无效或过期返回 null */
export function verifyToken(token: string | null | undefined): string | null {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    let secret: string;
    try {
        secret = tokenSecret();
    } catch {
        // 生产环境漏配密钥：不抛 500，退化成「未登录」，小程序会自动去登录，
        // 登录接口会返回明确提示（见 app/api/mini/auth/login/route.ts）
        warnSecretOnce("MINI_TOKEN_SECRET 未配置：小程序订单接口将全部返回 401");
        return null;
    }

    const payload = Buffer.from(parts[0], "base64url").toString("utf8");
    const expect = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    const a = Buffer.from(expect);
    const b = Buffer.from(parts[1]);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const [openid, exp] = payload.split(".");
    if (!openid || Number(exp) * 1000 < Date.now()) return null;
    return openid;
}

/** 从 Authorization: Bearer xxx 里取出 openid */
export function bearerOpenid(request: Request): string | null {
    const header = request.headers.get("authorization") || "";
    if (!header.toLowerCase().startsWith("bearer ")) return null;
    return verifyToken(header.slice(7).trim());
}

export function ok(data: unknown) {
    return NextResponse.json({ code: 0, msg: "ok", data });
}

/** 业务错误统一 HTTP 200 + code，小程序端只看 code */
export function fail(code: number, msg: string) {
    return NextResponse.json({ code, msg });
}

/** leads 行（含小程序扩展列） */
export type LeadRow = {
    id: number;
    name: string;
    phone: string;
    company: string | null;
    region: string | null;
    product: string | null;
    trade_in: number | null;
    note: string | null;
    ref: string | null;
    status: string | null;
    created_at: string | null;
    sub_status?: string | null;
    follow_ups?: string | null;
    tags?: string | null;
    source?: string | null;
    openid?: string | null;
    order_no?: string | null;
    client_order_no?: string | null;
    items_json?: string | null;
    amount_daily?: number | null;
    amount_monthly?: number | null;
    lease_term?: string | null;
    address?: string | null;
    updated_at?: string | null;
};

export type MiniOrderItem = {
    productId: string;
    name: string;
    qty: number;
    unit: string;
    dailyRent?: number;
    monthlyRent?: number;
};

/**
 * leads 行 → 小程序订单结构（字段名与小程序 utils/orders.js 的 createOrder 完全对齐）
 * region 列存"省市区 + 详细地址"完整串（与官网表单口径一致，admin 零改造），
 * 这里按后缀裁出省市区单独返回，避免小程序端地址重复展示。
 */
export function rowToOrder(row: LeadRow) {
    const miniProducts = toMiniProducts();
    const items = safeParse<MiniOrderItem[]>(row.items_json, []);
    const first = items[0];
    const productId = first?.productId || "";
    const product = miniProducts.find((p) => p.id === productId) || null;
    const qty = Number(first?.qty) > 0 ? Number(first?.qty) : 1;

    const cancelled = row.sub_status === "已放弃";
    const baseStatus = STATUS_ALIAS[row.status || ""] || row.status || "pending";
    const status = cancelled ? "cancelled" : baseStatus;

    const full = row.region || "";
    const address = row.address || "";
    const region = address && full.endsWith(address) ? full.slice(0, full.length - address.length).trim() : full;

    return {
        id: row.order_no || `WK${row.id}`,
        /** 客户端幂等键，小程序端用它把本地临时单与服务器订单对齐 */
        clientOrderNo: row.client_order_no || "",
        productId,
        productName: product ? product.name : row.product || "",
        productImage: product && product.images.length > 0 ? product.images[0] : "",
        productEmoji: product ? product.emoji : "🍳",
        category: product ? product.category : "",
        unit: product ? product.unit : first?.unit || "台",
        dailyRent: product ? product.dailyRent : Number(first?.dailyRent) || 0,
        dailyRentUnit: product ? product.dailyRentUnit : "",
        monthlyRent: product ? product.monthlyRent : Number(first?.monthlyRent) || 0,
        monthText: product ? product.monthText : "",
        leaseTerm: product ? product.leaseTerm : row.lease_term || "",
        qty,
        dailyTotal: row.amount_daily ?? (product ? product.dailyRent * qty : 0),
        monthlyTotal: row.amount_monthly ?? (product ? product.monthlyRent * qty : 0),
        contact: {
            name: row.name || "",
            phone: row.phone || "",
            company: row.company || "",
            region,
            address,
        },
        tradeIn: row.trade_in === 1,
        note: row.note || "",
        status,
        statusText: STATUS_TEXT[status] || status,
        /** admin 端细粒度进度（已联系 / 已报价 / 已寄样 / 待回访 / 已签约 / 已放弃） */
        subStatus: row.sub_status || "",
        followUps: safeParse<{ time: string; text: string }[]>(row.follow_ups, []),
        createdAt: utcToMs(row.created_at),
        updatedAt: utcToMs(row.updated_at || row.created_at),
    };
}

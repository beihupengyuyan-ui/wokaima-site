/**
 * 官网「我的申请」：查询 + 自助取消（服务端专用，只被 app/api/site/** 使用）
 *
 * 身份核验：官网没有登录体系，短信验证码也没接，所以让访客用提交表单时的两项必填信息自证
 * ——「手机号 + 姓名或公司名」。注意这是软校验，不是安全边界（能同时知道对方手机号与姓名的人
 * 仍可取消），但它挡住了「随便填个手机号就能读到别人姓名 / 地址」这类大面积泄露：
 * 查询与取消走同一套核验，且按行校验，不匹配的行一个字段都不会返回。
 *
 * 取消的写入口径与小程序完全一致（app/api/mini/orders/[orderNo]/cancel/route.ts）：
 *   sub_status = 已放弃、tags 追加「用户取消」、主状态 status 不动
 * 所以 admin 的四个页签（待处理 / 处理中 / 已完成 / 已取消）零改造就能接住官网取消的单。
 * 额外多写一条 follow_ups 记录，客服在详情页能看到「谁、什么时候、从哪个口子撤的」。
 */
import db from "@/lib/db";
import { CANCELLED_SUB_STATUS, USER_CANCEL_TAG } from "@/lib/lead-status";
import { statusOf, statusText } from "@/lib/order-status";
import { bjText, nowUtc, safeParse } from "@/lib/lead-utils";
import { CONTACT_PHONE_DISPLAY } from "@/lib/site-contact";
import type { LeadRow, MiniOrderItem } from "@/lib/mini";

/** 申请已受理（不可自助取消）时的统一话术，与小程序端提示同一个号 */
const CONTACT_SERVICE_MSG = `申请已受理，请联系客服 ${CONTACT_PHONE_DISPLAY} 取消`;

/** 一条「我的申请」：官网线索与小程序订单共用（同一手机号可能两边都下过单） */
export type SiteOrder = {
    id: number;
    /** 申请编号：由 leads.id 派生，仅用于客户与客服对号（小程序订单号是 WK+14 位时间戳，不会撞） */
    no: string;
    status: "pending" | "processing" | "done" | "cancelled";
    statusText: string;
    /** 只有「待确认」能自助取消；已受理 / 已完成 请打客服电话 */
    canCancel: boolean;
    channel: "官网" | "小程序";
    createdAtText: string;
    /** 需求明细：小程序单按 items_json 拼，官网单把 product 那串中文拆开 */
    needs: string[];
    amountDaily: number;
    amountMonthly: number;
    leaseTerm: string;
    tradeIn: boolean;
    name: string;
    company: string;
    region: string;
    address: string;
    note: string;
};

/** 申请编号：WK + 6 位补零的 leads.id */
export function siteOrderNo(id: number) {
    return `WK${String(id).padStart(6, "0")}`;
}

/** 只留数字：手机号可能存成「138 8078 8802 / 138-8078-8802」 */
function digits(value: string | null | undefined) {
    return (value || "").replace(/[^\d]/g, "");
}

/** 去掉空白并小写：姓名 / 公司名比对用（客户可能多打空格） */
function norm(value: string | null | undefined) {
    return (value || "").replace(/\s+/g, "").toLowerCase();
}

/** 手机号是否一致：完全一致，或后 11 位一致（兼容 +86 / 带区号前缀） */
export function phonesMatch(a: string | null | undefined, b: string | null | undefined) {
    const x = digits(a);
    const y = digits(b);
    if (!x || !y) return false;
    if (x === y) return true;
    return x.length >= 11 && y.length >= 11 && x.slice(-11) === y.slice(-11);
}

/** 姓名或公司名是否与这一行匹配（逐行校验：不匹配的行连字段都不会返回） */
export function keywordMatches(
    row: { name?: string | null; company?: string | null },
    keyword: string
) {
    const key = norm(keyword);
    if (key.length < 2) return false;
    return norm(row.name) === key || norm(row.company) === key;
}

/** leads 行 → 官网展示结构 */
function toSiteOrder(row: LeadRow): SiteOrder {
    const status = statusOf(row);

    const items = safeParse<MiniOrderItem[]>(row.items_json, []);
    const needs =
        items.length > 0
            ? items.map((it) => `${it.name} ×${it.qty}${it.unit ? ` ${it.unit}` : ""}`)
            : (row.product || "")
                  .split("；")
                  .map((s) => s.trim())
                  // 官网表单把四项数量拼成一串（蒸柜 1 台；整灶 0 眼；…），滤掉没下单的那几项
                  .filter((s) => s && !/\s0\s/.test(s));

    return {
        id: row.id,
        no: siteOrderNo(row.id),
        status,
        statusText: statusText(row),
        canCancel: status === "pending",
        channel: row.ref === "miniprogram" || row.source === "miniprogram" ? "小程序" : "官网",
        createdAtText: bjText(row.created_at),
        needs,
        amountDaily: Number(row.amount_daily) || 0,
        amountMonthly: Number(row.amount_monthly) || 0,
        leaseTerm: row.lease_term || "",
        tradeIn: row.trade_in === 1,
        name: row.name || "",
        company: row.company || "",
        region: row.region || "",
        address: row.address || "",
        note: row.note || "",
    };
}

/**
 * 查询：手机号 + 姓名 / 公司名 都对得上才返回。
 * 手机号按「去空格/横杠/+86 后的后 11 位」比对（客户可能带 +86 提交），leads 量级很小，全表扫可接受。
 */
export function lookupSiteOrders(input: { phone: string; keyword: string }): SiteOrder[] {
    const phone = digits(input.phone);
    if (phone.length < 6 || norm(input.keyword).length < 2) return [];

    const needle = `%${phone.length >= 11 ? phone.slice(-11) : phone}`;
    const rows = db
        .prepare(
            `SELECT * FROM leads
             WHERE REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone, ''), ' ', ''), '-', ''), '+', ''), '　', '') LIKE ?
             ORDER BY created_at DESC
             LIMIT 50`
        )
        .all(needle) as LeadRow[];

    return rows.filter((row) => keywordMatches(row, input.keyword)).map(toSiteOrder);
}

export type CancelSiteOrderResult =
    | { ok: true; order: SiteOrder }
    | { ok: false; reason: "not_found" | "already_cancelled" | "not_pending"; message: string };

/** 取消：核验通过且仍是「待确认」才允许，写入与小程序取消完全同口径 */
export function cancelSiteOrder(input: {
    id: number;
    phone: string;
    keyword: string;
}): CancelSiteOrderResult {
    const row = db.prepare("SELECT * FROM leads WHERE id = ?").get(input.id) as
        | LeadRow
        | undefined;

    // 对不上统一回「没找到」：不区分手机号错还是姓名错，免得被当成探测接口
    if (!row || !phonesMatch(row.phone, input.phone) || !keywordMatches(row, input.keyword)) {
        return {
            ok: false,
            reason: "not_found",
            message: "没找到这笔申请，请重新查询后再取消",
        };
    }

    const status = statusOf(row);
    if (status === "cancelled") {
        return { ok: false, reason: "already_cancelled", message: "这笔申请已经取消过了" };
    }
    if (status !== "pending") {
        return { ok: false, reason: "not_pending", message: CONTACT_SERVICE_MSG };
    }

    const tags = safeParse<string[]>(row.tags, []);
    if (!tags.includes(USER_CANCEL_TAG)) tags.push(USER_CANCEL_TAG);

    const followUps = safeParse<{ time: string; text: string }[]>(row.follow_ups, []);
    followUps.push({
        time: bjText(nowUtc()),
        text: `[用户取消] 客户在官网「我的申请」自助取消（申请编号 ${siteOrderNo(row.id)}）`,
    });

    db.prepare(
        "UPDATE leads SET sub_status = ?, tags = ?, follow_ups = ?, updated_at = ? WHERE id = ?"
    ).run(
        CANCELLED_SUB_STATUS,
        JSON.stringify(tags),
        JSON.stringify(followUps),
        nowUtc(),
        row.id
    );

    const updated = db.prepare("SELECT * FROM leads WHERE id = ?").get(row.id) as LeadRow;
    return { ok: true, order: toSiteOrder(updated) };
}

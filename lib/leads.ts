/**
 * 后台线索列表查询（服务端专用，只被 app/(admin)/** 的 Server Component 引用）
 *
 * 三条线索页签互斥、不重不漏（取消的一律从这里移走，只出现在「客户取消订单」模块）：
 *   待处理 = status ∈ (pending,new)          且未取消
 *   处理中 = status ∈ (processing,contacted) 且未取消
 *   已完成 = 其余 status                      且未取消
 *
 * 「客户取消订单」模块（/admin/cancellations）：
 *   取消单 = sub_status = 已放弃（不论主状态），再按 handle_status 分「待处理 / 已处理」，
 *   并给出原因分布统计（cancelStats）。
 */
import db from "@/lib/db";
import {
    CANCEL_REASON_UNKNOWN,
    CANCELLED_SQL,
    NOT_CANCELLED_SQL,
    RECOVERED_RESULT,
} from "@/lib/lead-status";

/** LeadCard / StatusBadge 用到的字段（列表查询不需要 items_json 等小程序明细列） */
export type LeadListItem = {
    id: number;
    name: string;
    phone: string;
    company: string | null;
    region: string | null;
    product: string | null;
    trade_in: number;
    note: string | null;
    ref: string | null;
    status: string;
    sub_status: string | null;
    created_at: string;
};

/** 「客户取消订单」列表卡片要的字段（取消来源 / 原因 + 后台处理情况） */
export type CancelledLeadItem = LeadListItem & {
    cancel_source: string | null;
    cancel_reason: string | null;
    /** 选「其他原因」时客户补的自由文本（选填）：卡片上显示原话 */
    cancel_note: string | null;
    cancel_at: string | null;
    updated_at: string | null;
    handle_status: string | null;
    handle_result: string | null;
    handled_at: string | null;
};

const FIELDS =
    "id, name, phone, company, region, product, trade_in, note, ref, status, sub_status, created_at";

const CANCEL_FIELDS = `${FIELDS}, cancel_source, cancel_reason, cancel_note, cancel_at, updated_at, handle_status, handle_result, handled_at`;

export function listPendingLeads(): LeadListItem[] {
    return db
        .prepare(
            `SELECT ${FIELDS} FROM leads
             WHERE status IN ('pending', 'new') AND ${NOT_CANCELLED_SQL}
             ORDER BY created_at DESC`
        )
        .all() as LeadListItem[];
}

export function listProcessingLeads(): LeadListItem[] {
    return db
        .prepare(
            `SELECT ${FIELDS} FROM leads
             WHERE status IN ('processing', 'contacted') AND ${NOT_CANCELLED_SQL}
             ORDER BY created_at DESC`
        )
        .all() as LeadListItem[];
}

export function listDoneLeads(): LeadListItem[] {
    return db
        .prepare(
            `SELECT ${FIELDS} FROM leads
             WHERE status NOT IN ('pending', 'new', 'processing', 'contacted') AND ${NOT_CANCELLED_SQL}
             ORDER BY created_at DESC`
        )
        .all() as LeadListItem[];
}

/**
 * 取消单列表视图：
 *   pending = 还没人跟的（handle_status 为空或不是 handled，老数据算未处理）
 *   handled = 已处理
 *   all     = 全部
 */
export type CancelView = "pending" | "handled" | "all";

const CANCEL_PENDING_SQL = "(handle_status IS NULL OR handle_status <> 'handled')";
const CANCEL_HANDLED_SQL = "handle_status = 'handled'";

/** 取消单按「取消时间」倒序（老数据没有 cancel_at 就退回 updated_at / created_at） */
const CANCEL_ORDER_SQL = "ORDER BY COALESCE(cancel_at, updated_at, created_at) DESC";

export function listCancelledLeads(view: CancelView = "pending"): CancelledLeadItem[] {
    const filter =
        view === "handled" ? CANCEL_HANDLED_SQL : view === "all" ? "1 = 1" : CANCEL_PENDING_SQL;

    return db
        .prepare(
            `SELECT ${CANCEL_FIELDS} FROM leads
             WHERE ${CANCELLED_SQL} AND ${filter}
             ${CANCEL_ORDER_SQL}`
        )
        .all() as CancelledLeadItem[];
}

export type CancelStats = {
    /** 未处理（红点数字用这个） */
    pending: number;
    handled: number;
    total: number;
    /** 近 7 天取消的笔数 */
    week: number;
    /** 已回访挽回的笔数 */
    recovered: number;
    /** 取消原因分布（含「未填写原因」一档），按笔数倒序 */
    reasons: { label: string; count: number }[];
};

/** 「客户取消订单」模块的统计：待处理 / 已处理 / 近 7 天 / 挽回 + 原因分布 */
export function cancelStats(): CancelStats {
    const row = db
        .prepare(
            `SELECT
                 SUM(CASE WHEN ${CANCEL_PENDING_SQL} THEN 1 ELSE 0 END) AS pending,
                 SUM(CASE WHEN ${CANCEL_HANDLED_SQL} THEN 1 ELSE 0 END) AS handled,
                 COUNT(*) AS total,
                 SUM(CASE WHEN COALESCE(cancel_at, updated_at, created_at) >= datetime('now', '-7 days')
                          THEN 1 ELSE 0 END) AS week,
                 SUM(CASE WHEN handle_result = ? THEN 1 ELSE 0 END) AS recovered
             FROM leads WHERE ${CANCELLED_SQL}`
        )
        .get(RECOVERED_RESULT) as {
        pending: number | null;
        handled: number | null;
        total: number | null;
        week: number | null;
        recovered: number | null;
    };

    const reasons = db
        .prepare(
            `SELECT COALESCE(NULLIF(TRIM(cancel_reason), ''), ?) AS label, COUNT(*) AS count
             FROM leads WHERE ${CANCELLED_SQL}
             GROUP BY label
             ORDER BY count DESC, label ASC`
        )
        .all(CANCEL_REASON_UNKNOWN) as { label: string; count: number }[];

    return {
        pending: row.pending || 0,
        handled: row.handled || 0,
        total: row.total || 0,
        week: row.week || 0,
        recovered: row.recovered || 0,
        reasons,
    };
}

export type LeadCounts = {
    pending: number;
    processing: number;
    done: number;
    cancelled: number;
};

function count(sql: string): number {
    return (db.prepare(sql).get() as { c: number }).c;
}

/** 三个页签 + 取消总数（取消那一档给导航红点用，不再是一个页签） */
export function leadCounts(): LeadCounts {
    return {
        pending: count(
            `SELECT COUNT(*) c FROM leads WHERE status IN ('pending', 'new') AND ${NOT_CANCELLED_SQL}`
        ),
        processing: count(
            `SELECT COUNT(*) c FROM leads WHERE status IN ('processing', 'contacted') AND ${NOT_CANCELLED_SQL}`
        ),
        done: count(
            `SELECT COUNT(*) c FROM leads
             WHERE status NOT IN ('pending', 'new', 'processing', 'contacted') AND ${NOT_CANCELLED_SQL}`
        ),
        cancelled: count(`SELECT COUNT(*) c FROM leads WHERE ${CANCELLED_SQL}`),
    };
}

/**
 * 后台线索列表查询（服务端专用，只被 app/(admin)/** 的 Server Component 引用）
 *
 * 四个 Tab 互斥、不重不漏：
 *   待处理 = status ∈ (pending,new)          且未取消
 *   处理中 = status ∈ (processing,contacted) 且未取消
 *   已完成 = 其余 status                      且未取消
 *   已取消 = sub_status = 已放弃（不论主状态）
 */
import db from "@/lib/db";
import { CANCELLED_SQL, NOT_CANCELLED_SQL } from "@/lib/lead-status";

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

const FIELDS =
    "id, name, phone, company, region, product, trade_in, note, ref, status, sub_status, created_at";

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

export function listCancelledLeads(): LeadListItem[] {
    return db
        .prepare(
            `SELECT ${FIELDS} FROM leads
             WHERE ${CANCELLED_SQL}
             ORDER BY created_at DESC`
        )
        .all() as LeadListItem[];
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

/** 四个 Tab 的数量（与列表查询口径完全一致） */
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

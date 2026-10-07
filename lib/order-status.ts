/**
 * 订单 / 申请状态口径（纯常量 + 纯函数，不碰数据库、不引 node 内置模块）
 *
 * 单独成文件的原因：官网「我的申请」是客户端组件，而 lib/mini.ts 引了 node:crypto 与商品数据，
 * 客户端组件一旦 import 就会把整包拖进浏览器包（crypto 直接构建失败）。
 * 小程序侧调用点无需改动 —— lib/mini.ts 仍然导出这两个常量（从本文件再导出）。
 *
 * 与小程序 utils/orders.js 的 STATUS_TEXT 完全一致：待确认 / 已受理 / 已完成 / 已取消
 */
import { CANCELLED_SUB_STATUS } from "@/lib/lead-status";

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

export type OrderStatus = "pending" | "processing" | "done" | "cancelled";

/**
 * leads 行 → 规范状态值。
 * 已取消优先：用户取消（小程序 / 官网）只改 sub_status 为「已放弃」，主状态 status 保持 pending，
 * 所以这里必须先看 sub_status，否则已取消的单会被当成待确认。
 */
export function statusOf(lead: {
    status?: string | null;
    sub_status?: string | null;
}): OrderStatus {
    if ((lead.sub_status || "") === CANCELLED_SUB_STATUS) return "cancelled";

    const base = STATUS_ALIAS[lead.status || ""] || lead.status || "pending";
    if (base === "pending" || base === "processing" || base === "done" || base === "cancelled") {
        return base;
    }
    return "pending";
}

/** 状态 → 中文文案 */
export function statusText(lead: {
    status?: string | null;
    sub_status?: string | null;
}): string {
    const status = statusOf(lead);
    return STATUS_TEXT[status] || status;
}

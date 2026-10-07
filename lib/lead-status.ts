/**
 * 后台列表共用的「订单状态」口径（纯常量/纯函数，不依赖数据库，可被客户端组件引用）
 *
 * 背景：用户在小程序取消订单时，服务端只把 sub_status 置为「已放弃」并追加标签「用户取消」，
 * 主状态 status 保持 pending（见 app/api/mini/orders/[orderNo]/cancel/route.ts）。
 * 所以后台不能只看 status，必须同时看 sub_status，否则已取消的订单会被当成全新的待处理线索。
 */

/** 已取消 / 已放弃统一落在 sub_status 上的取值 */
export const CANCELLED_SUB_STATUS = "已放弃";

/** 小程序用户取消订单时追加的标签 */
export const USER_CANCEL_TAG = "用户取消";

/** 小程序下单线索的 ref 标记（见 app/api/mini/orders/route.ts） */
export const MINIPROGRAM_REF = "miniprogram";

/** 该线索是否已取消（小程序用户取消 / 后台标记放弃） */
export function isCancelled(lead: { sub_status?: string | null }): boolean {
    return (lead.sub_status || "") === CANCELLED_SUB_STATUS;
}

/** 是否来自小程序下单（含用户自己取消掉的单） */
export function isFromMiniProgram(lead: { ref?: string | null }): boolean {
    return (lead.ref || "") === MINIPROGRAM_REF;
}

/**
 * SQL 片段：排除已取消的线索。
 * sub_status 可能是 NULL（官网线索走老字段），必须一并放行，否则官网线索会全部消失。
 */
export const NOT_CANCELLED_SQL = `(sub_status IS NULL OR sub_status <> '${CANCELLED_SUB_STATUS}')`;

/** SQL 片段：只取已取消的线索 */
export const CANCELLED_SQL = `sub_status = '${CANCELLED_SUB_STATUS}'`;

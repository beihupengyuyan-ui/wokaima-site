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

/** 该线索是否已取消（小程序 / 官网用户取消、后台标记放弃）——「当前状态」口径 */
export function isCancelled(lead: { sub_status?: string | null }): boolean {
    return (lead.sub_status || "") === CANCELLED_SUB_STATUS;
}

/**
 * 是否有取消记录（曾经取消过）。
 * 与 isCancelled 的区别：客户取消后被后台「回访挽回」的单会清掉 sub_status、回到「待处理」，
 * 但它仍然是一张取消单 —— 取消原因、处理结果、备注都该在详情页留着，所以用这个判据。
 */
export function hasCancelRecord(lead: {
    sub_status?: string | null;
    cancel_at?: string | null;
}): boolean {
    return isCancelled(lead) || !!(lead.cancel_at || "").trim();
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

/**
 * SQL 片段：只取「取消单」——正在取消（sub_status=已放弃）**或取消过后台处理过**（有 cancel_at）的线索。
 *
 * 为什么要带上 cancel_at：客户取消后被「回访挽回」的单，sub_status 被清空、回到 status=pending
 * 重新进「待处理」，但它同时还得留在「客户取消订单 · 已处理」里留档（原因、处理结果、跟进记录）。
 * 它当然也不该再出现在待处理的取消列表里 —— 那由 handle_status='handled' 这个过滤器负责。
 *
 * 注意：NOT_CANCELLED_SQL 不看 cancel_at（只看当前是否已放弃），所以被挽回的单能正常回到线索三页签。
 */
export const CANCELLED_SQL = `(sub_status = '${CANCELLED_SUB_STATUS}' OR cancel_at IS NOT NULL)`;

/* ------------------------------------------------------------------ *
 * 「客户取消订单」模块（/admin/cancellations）口径
 *
 * 取消 = sub_status『已放弃』。但同样是「已取消」，后台要做的事完全不同：
 *   ① 客户自己撤的（官网 / 小程序）→ 要有人跟一声、能挽回、能统计原因；
 *   ② 后台工程师自己标的放弃     → 只是归档，不需要再处理。
 * 于是多两条线索：cancel_source（谁撤的）+ handle_status / handle_result（后台处理闭环）。
 * 老数据这些列是 NULL，一律按「来源未知 / 未填写原因 / 未处理」展示，不猜。
 * 被「回访挽回」的单会清掉 sub_status 回到「待处理」，但取消记录照旧保留
 * （判据用 hasCancelRecord / CANCELLED_SQL，它们都算「取消过」）。
 * ------------------------------------------------------------------ */

/** 取消来源 */
export type CancelSource = "官网" | "小程序" | "后台";
export const CANCEL_SOURCES: CancelSource[] = ["官网", "小程序", "后台"];

/**
 * 取消原因（客户在取消时选填，后台用它做原因分布统计）
 *
 * ⚠️ 这份白名单必须与小程序端 `utils/order-status.js` 的 `CANCEL_REASONS` **逐字一致**：
 * 值域不一致时，客户选的那一档会被后台当成「未填写原因」，分布统计直接失真。
 * 加一档 = 三处同改：这里 → 小程序 `utils/order-status.js` → 小程序 `scripts/check.js` 的 D6 断言。
 */
export type CancelReason =
    | "价格原因"
    | "已选别家"
    | "暂时不做"
    | "不想要了"
    | "信息填错"
    | "重复提交"
    | "其他原因";
export const CANCEL_REASONS: CancelReason[] = [
    "价格原因",
    "已选别家",
    "暂时不做",
    "不想要了",
    "信息填错",
    "重复提交",
    "其他原因",
];
/** 需要客户再补一句自由文本的那一档：官网会就地展开一个输入框，落 cancel_note */
export const CANCEL_REASON_OTHER: CancelReason = "其他原因";
/** 补充说明的字数上限（前端 maxLength 与后端截断共用，避免出现「后半句被悄悄砍掉」） */
export const CANCEL_NOTE_MAX_LENGTH = 100;
/** 客户没选原因时的展示文案（也是原因分布里的一档） */
export const CANCEL_REASON_UNKNOWN = "未填写原因";

/** 后台处理状态：NULL 视为未处理（老数据 / 刚取消的单） */
export type HandleStatus = "pending" | "handled";

/** 后台处理结果；「已回访挽回」会自动把订单复活成「待处理」 */
export type HandleResult =
    | "已回访挽回"
    | "客户确认取消"
    | "已退款"
    | "联系不上"
    | "后台标记放弃";
export const HANDLE_RESULTS: HandleResult[] = [
    "已回访挽回",
    "客户确认取消",
    "已退款",
    "联系不上",
    "后台标记放弃",
];

/** 处理结果里唯一会「复活订单」的那个 */
export const RECOVERED_RESULT: HandleResult = "已回访挽回";

/** 后台处理完取消单时追加的标签（与「用户取消」并列，便于追溯） */
export const CANCEL_HANDLED_TAG = "取消已处理";

/** 是否已被后台处理过（NULL / 其他值都算未处理） */
export function isHandled(lead: { handle_status?: string | null }): boolean {
    return (lead.handle_status || "") === "handled";
}

/** 是否被后台「打回」复活（处理结果 = 已回访挽回） */
export function isRecovered(lead: { handle_result?: string | null }): boolean {
    return (lead.handle_result || "") === RECOVERED_RESULT;
}

/**
 * 取取消来源：库里没记录时按渠道推断，推不出来就显示「未知来源」。
 * 老数据（本次改造前取消的单）只有 ref/source 可看，用来区分「小程序撤的」和「说不清」。
 */
export function cancelSourceOf(lead: {
    cancel_source?: string | null;
    ref?: string | null;
    source?: string | null;
}): string {
    if (lead.cancel_source) return lead.cancel_source;
    return isFromMiniProgram(lead) || (lead.source || "") === "miniprogram"
        ? "小程序"
        : "未知来源";
}

/** 取取消原因：空 → 统一文案 */
export function cancelReasonOf(lead: { cancel_reason?: string | null }): string {
    return (lead.cancel_reason || "").trim() || CANCEL_REASON_UNKNOWN;
}

/** 客户自助取消的原因是否合法（官网 / 小程序传上来的值要过这一关，防止脏数据进库） */
export function normalizeCancelReason(value: unknown): CancelReason | null {
    const v = String(value ?? "").trim();
    return (CANCEL_REASONS as string[]).includes(v) ? (v as CancelReason) : null;
}

/**
 * 「其他原因」时客户补的那句话能不能用：折掉换行（卡片上单行显示不会把版式撑开）、去首尾空白、
 * 超长截断。空串一律当没填（NULL 入库），不在库里留一堆 ""。
 */
export function normalizeCancelNote(value: unknown): string | null {
    const v = String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, CANCEL_NOTE_MAX_LENGTH);
    return v || null;
}

/** 取取消时的补充说明：空 → 空字符串（要不要显示由展示端决定） */
export function cancelNoteOf(lead: { cancel_note?: string | null }): string {
    return (lead.cancel_note || "").trim();
}

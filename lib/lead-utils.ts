/**
 * leads 通用小工具（时间 / JSON）：小程序接口与官网自助查询共用
 * （原先长在 lib/mini.ts 里，官网「我的申请」也要用，就抽出来；lib/mini.ts 仍然再导出，调用点不变）
 */

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

/**
 * 库里的 UTC 时间串 → 北京时间文案 YYYY-MM-DD HH:mm（给官网客户看）。
 * 不依赖服务器时区，所以显式 +8 小时后按 UTC 取值；解析不了就原样返回。
 */
export function bjText(value: string | null | undefined) {
    if (!value) return "";
    const ms = Date.parse(value.replace(" ", "T") + "Z");
    if (Number.isNaN(ms)) return value;

    const d = new Date(ms + 8 * 3600 * 1000);
    const p = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return (
        `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ` +
        `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/lib/site-contact";
// 只取类型：lib/site-orders.ts 引了 better-sqlite3，只能服务端跑；
// import type 会在编译期被抹掉，不会进浏览器包。
import type { SiteOrder } from "@/lib/site-orders";

/**
 * 「我的申请」：凭「手机号 + 姓名 / 公司名」查询租赁申请，并自助取消「待确认」的申请。
 *
 * 为什么放在官网而不是只留小程序：官网表单是主要的转化入口，客户临时反悔时手上未必有小程序，
 * 一个不落地的取消入口只会把意向客户的声音变成骚扰——不如让他自己撤，后台照样留痕。
 *
 * 口径与小程序一致：取消 = sub_status 置「已放弃」+ 标签「用户取消」（见 lib/site-orders.ts），
 * 后台「已取消」页签会接住；已受理 / 已完成的申请不允许自助取消，引导打客服电话。
 */
const STORAGE_KEY = "wokaima.apply.contact";

const STATUS_STYLE: Record<SiteOrder["status"], string> = {
    pending: "bg-orange-100 text-orange-600",
    processing: "bg-blue-100 text-blue-600",
    done: "bg-green-100 text-green-600",
    cancelled: "bg-gray-200 text-gray-500",
};

type Notice = { type: "ok" | "err"; text: string } | null;

export default function OrderLookup() {
    const [phone, setPhone] = useState("");
    const [keyword, setKeyword] = useState("");
    const [orders, setOrders] = useState<SiteOrder[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [formError, setFormError] = useState("");
    const [notice, setNotice] = useState<Notice>(null);

    // 回填上次查询用的手机号 / 姓名，省得客户每次重敲。
    // 见 /apply/ApplyForm.tsx 同款注释：首帧状态与预渲染输出一致，水合后一帧内完成，不会不匹配。
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            const parsed = JSON.parse(saved) as { phone?: string; keyword?: string };
            if (parsed.phone) setPhone(parsed.phone);
            if (parsed.keyword) setKeyword(parsed.keyword);
        } catch {
            // 隐私模式下 localStorage 读写会抛错，忽略即可（不影响查询）
        }
    }, []);
    /* eslint-enable react-hooks/set-state-in-effect */

    function remember(phone: string, keyword: string) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ phone, keyword }));
        } catch {
            // 同上：存不上就算了，只是下次要重新填
        }
    }

    async function handleLookup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setNotice(null);

        const cleanPhone = phone.trim();
        const cleanKeyword = keyword.trim();

        if (cleanPhone.replace(/[^\d]/g, "").length < 6) {
            setFormError("请填写提交申请时留的手机号");
            return;
        }
        if (cleanKeyword.length < 2) {
            setFormError("请填写提交申请时的姓名或公司名");
            return;
        }

        setFormError("");
        setLoading(true);

        try {
            const res = await fetch("/api/site/orders/lookup", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ phone: cleanPhone, keyword: cleanKeyword }),
            });
            const data = (await res.json()) as {
                ok: boolean;
                message?: string;
                orders?: SiteOrder[];
            };

            if (!res.ok || !data.ok) {
                setFormError(data.message || "查询失败，请稍后重试");
                setOrders(null);
                return;
            }

            setOrders(data.orders || []);
            remember(cleanPhone, cleanKeyword);
        } catch {
            setFormError("网络不太好，请稍后重试");
            setOrders(null);
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(order: SiteOrder) {
        const yes = window.confirm(
            `确认取消申请 ${order.no} 吗？\n\n取消后我们不会再联系你；如果只是暂时不着急，也可以先留着，等客服联系时再说。`
        );
        if (!yes) return;

        setNotice(null);
        setCancellingId(order.id);

        try {
            const res = await fetch("/api/site/orders/cancel", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: order.id, phone: phone.trim(), keyword: keyword.trim() }),
            });
            const data = (await res.json()) as {
                ok: boolean;
                message?: string;
                order?: SiteOrder;
            };

            if (!res.ok || !data.ok || !data.order) {
                setNotice({ type: "err", text: data.message || "取消失败，请稍后重试" });
                return;
            }

            const updated = data.order;
            setOrders((prev) =>
                prev ? prev.map((o) => (o.id === updated.id ? updated : o)) : prev
            );
            setNotice({ type: "ok", text: `申请 ${updated.no} 已取消` });
        } catch {
            setNotice({ type: "err", text: "网络不太好，请稍后重试" });
        } finally {
            setCancellingId(null);
        }
    }

    const inputClass =
        "w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/60";

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#faf7f4] px-6 py-20 md:py-28">
            {/* 背景光斑：与 /apply 同一套视觉，提交完跳过来不觉得换了个站 */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
                <div className="absolute bottom-0 -right-24 h-96 w-96 rounded-full bg-amber-100/60 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-3xl animate-fade-in-up">
                <Link
                    href="/apply"
                    className="text-sm text-gray-500 transition-colors hover:text-orange-600"
                >
                    ← 返回申请表
                </Link>

                <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                    我的申请
                </h1>
                <p className="mt-5 text-base leading-relaxed text-gray-500 md:text-lg">
                    填写提交申请时的手机号，以及姓名或公司名，就能查看进度、撤回申请。
                    <br className="hidden md:block" />
                    「待确认」的可以自己取消；已受理的请打{" "}
                    <a href={`tel:${CONTACT_PHONE}`} className="font-semibold text-orange-600">
                        {CONTACT_PHONE_DISPLAY}
                    </a>{" "}
                    让客服处理。
                </p>

                {/* 查询表单 */}
                <form
                    onSubmit={handleLookup}
                    className="mt-10 rounded-3xl bg-white/80 p-6 shadow-xl shadow-orange-100/50 backdrop-blur md:p-8"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-gray-700">手机号</span>
                            <input
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="提交申请时留的手机号"
                                className={inputClass}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-gray-700">
                                姓名或公司名
                            </span>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="与提交申请时填的一致"
                                className={inputClass}
                            />
                        </label>
                    </div>

                    {formError && <p className="mt-4 text-sm text-red-500">{formError}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-600/25 transition-all hover:shadow-xl hover:shadow-orange-600/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "查询中…" : "查询我的申请"}
                    </button>

                    <p className="mt-4 text-center text-xs leading-relaxed text-gray-400">
                        查不到？姓名 / 公司名要和提交时一字不差，也可以直接打上面的电话让客服帮你翻记录。
                    </p>
                </form>

                {notice && (
                    <p
                        className={`mt-8 rounded-2xl px-5 py-4 text-sm font-medium ${
                            notice.type === "ok"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-600"
                        }`}
                    >
                        {notice.text}
                    </p>
                )}

                {orders && orders.length === 0 && (
                    <div className="mt-8 rounded-3xl border border-gray-100 bg-white/80 p-8 text-center">
                        <p className="text-lg font-semibold text-gray-900">
                            没查到这个手机号的申请
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-gray-500">
                            核对一下手机号是不是提交时留的那个，姓名 / 公司名有没有多打或漏打空格；
                            <br className="hidden md:block" />
                            也可能之前已经取消过了。实在找不到就打 {CONTACT_PHONE_DISPLAY}，客服帮你翻记录。
                        </p>
                    </div>
                )}

                {orders && orders.length > 0 && (
                    <div className="mt-8 space-y-5">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-lg shadow-orange-100/40 md:p-7"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm text-gray-400">
                                            {order.no}
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[order.status]}`}
                                        >
                                            {order.statusText}
                                        </span>
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                                            {order.channel}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        提交于 {order.createdAtText}
                                    </span>
                                </div>

                                <dl className="mt-5 space-y-2 text-sm leading-relaxed text-gray-600">
                                    <div>
                                        <span className="text-gray-400">需求：</span>
                                        {order.needs.length > 0 ? order.needs.join("、") : "—"}
                                    </div>
                                    {order.tradeIn && (
                                        <div>
                                            <span className="text-gray-400">以旧换新：</span>需要
                                        </div>
                                    )}
                                    {order.amountMonthly > 0 && (
                                        <div>
                                            <span className="text-gray-400">月租：</span>¥
                                            {order.amountMonthly}
                                            {order.amountDaily > 0 && (
                                                <span className="text-gray-400">
                                                    （约 ¥{order.amountDaily} / 天）
                                                </span>
                                            )}
                                            {order.leaseTerm && (
                                                <span className="text-gray-400">
                                                    {" "}
                                                    · {order.leaseTerm}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-400">联系人：</span>
                                        {order.name}
                                        {order.company ? ` · ${order.company}` : ""}
                                    </div>
                                    <div>
                                        <span className="text-gray-400">地址：</span>
                                        {order.region}
                                        {order.address}
                                    </div>
                                    {order.note && (
                                        <div>
                                            <span className="text-gray-400">备注：</span>
                                            {order.note}
                                        </div>
                                    )}
                                </dl>

                                {order.canCancel ? (
                                    <button
                                        type="button"
                                        onClick={() => handleCancel(order)}
                                        disabled={cancellingId === order.id}
                                        className="mt-6 rounded-full border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {cancellingId === order.id ? "取消中…" : "取消这笔申请"}
                                    </button>
                                ) : (
                                    <p className="mt-6 text-xs leading-relaxed text-gray-400">
                                        {order.status === "cancelled"
                                            ? "这笔申请已取消，我们不会再联系你；要重新办理可以再提交一次申请。"
                                            : `这笔申请已在处理中，不能自助取消；需要变更请打 ${CONTACT_PHONE_DISPLAY}。`}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

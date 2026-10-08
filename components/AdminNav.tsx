"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 后台一级导航（概览 / 客户线索 / 客户取消订单）。
 *
 * 为什么要把「客户取消订单」提成一级入口：它原先只是线索页第四个页签，
 * 结果是「客户撤销了申请」这件事没有责任人 —— 没人翻到那个页签就不会有人回访、挽回、统计原因。
 * 提出来之后带一个未处理红点，谁进来都能一眼看到有几张单没人跟。
 */
export default function AdminNav({ cancelPending }: { cancelPending: number }) {
    const pathname = usePathname();

    const items = [
        {
            key: "overview",
            label: "概览",
            href: "/admin/overview",
            active: pathname === "/admin/overview",
            badge: 0,
        },
        {
            key: "leads",
            label: "客户线索",
            href: "/admin/leads/pending",
            active: pathname.startsWith("/admin/leads/"),
            badge: 0,
        },
        {
            key: "cancellations",
            label: "客户取消订单",
            href: "/admin/cancellations",
            active: pathname.startsWith("/admin/cancellations"),
            badge: cancelPending,
        },
    ];

    return (
        <div className="flex gap-1 rounded-2xl bg-white p-1.5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] w-fit">
            {items.map((item) => (
                <Link
                    key={item.key}
                    href={item.href}
                    className={`relative rounded-xl px-5 py-2 text-sm font-medium transition-colors duration-150 ${
                        item.active
                            ? "bg-orange-600 text-white shadow-sm shadow-orange-600/25"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                    <span className="flex items-center gap-2">
                        {item.label}
                        {item.badge > 0 && (
                            <span
                                className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold ${
                                    item.active ? "bg-white/25 text-white" : "bg-red-500 text-white"
                                }`}
                            >
                                {item.badge}
                            </span>
                        )}
                    </span>
                </Link>
            ))}
        </div>
    );
}

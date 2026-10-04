"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LeadsTabs({
                                      counts,
                                  }: {
    counts: { pending?: number; processing?: number; done?: number };
}) {
    const pathname = usePathname();

    const tabs = [
        {
            key: "pending",
            label: "待处理",
            href: "/admin/leads/pending",
            count: counts.pending,
            activeColor: "bg-orange-600 shadow-orange-600/20",
        },
        {
            key: "processing",
            label: "处理中",
            href: "/admin/leads/processing",
            count: counts.processing,
            activeColor: "bg-blue-600 shadow-blue-600/20",
        },
        {
            key: "done",
            label: "已完成",
            href: "/admin/leads/done",
            count: counts.done,
            activeColor: "bg-green-600 shadow-green-600/20",
        },
    ];

    return (
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] w-fit">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        className={`relative px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-out ${
                            isActive
                                ? `${tab.activeColor} text-white shadow-lg scale-[1.02]`
                                : "text-gray-600 hover:bg-gray-50 hover:scale-[1.02]"
                        }`}
                    >
            <span className="flex items-center gap-2">
              {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                            isActive ? "bg-white/20" : "bg-gray-100 text-gray-500"
                        }`}
                    >
                  {tab.count}
                </span>
                )}
            </span>
                    </Link>
                );
            })}
        </div>
    );
}
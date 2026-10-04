"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminEscapeBack() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;

            // 正在输入（如详情页的备注框）时先失焦，避免内容没保存就被弹走
            const active = document.activeElement as HTMLElement | null;
            if (
                active &&
                (active.isContentEditable ||
                    /^(input|textarea|select)$/i.test(active.tagName))
            ) {
                active.blur();
                return;
            }

            // 在详情页按 Esc，回到对应的列表 tab
            if (pathname.match(/^\/admin\/leads\/\d+$/)) {
                router.push("/admin/leads/pending");
                return;
            }

            // 在列表 tab 页按 Esc，回到“待处理”
            if (
                pathname === "/admin/leads/processing" ||
                pathname === "/admin/leads/done"
            ) {
                router.push("/admin/leads/pending");
                return;
            }

            // 其他后台页面按 Esc，回到后台首页
            if (pathname !== "/admin" && pathname !== "/admin/leads/pending") {
                router.push("/admin");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router, pathname]);

    return null;
}
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 全站「按 Esc 快速返回」。
 * 由 app/(site)/layout.tsx 统一挂载，所有前台页面自动生效，页面内无需再重复引入。
 *
 * 三条防误触规则：
 * 1. 焦点在输入框 / 文本域 / 下拉框里时，第一次 Esc 只做失焦，避免填表填一半被弹走；
 * 2. 页面里存在弹层（role="dialog" + aria-modal，例如图片大图预览）时让位给弹层自己处理；
 * 3. 浏览器没有可返回的历史（如从搜索引擎直接打开的新标签页）时，回到首页；
 */
export default function EscapeBack({ fallback = "/" }: { fallback?: string }) {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape" || e.defaultPrevented) return;

            // 有弹层打开时不抢 Esc
            if (
                document.querySelector(
                    '[role="dialog"][aria-modal="true"], [data-esc-layer]'
                )
            ) {
                return;
            }

            // 正在输入时先失焦，再按一次才返回
            const active = document.activeElement as HTMLElement | null;
            if (
                active &&
                (active.isContentEditable ||
                    /^(input|textarea|select)$/i.test(active.tagName))
            ) {
                active.blur();
                return;
            }

            if (window.history.length > 1) {
                router.back();
            } else {
                router.push(fallback);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router, fallback]);

    return null;
}
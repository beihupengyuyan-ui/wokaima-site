"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 滚动浮现容器：渐进增强版。
 *
 * 关键约定：**默认可见（服务端渲染结果就是可见的），只有确认元素位于视口下方时才隐藏它。**
 * 旧实现把内容在服务端就渲染成 opacity-0 translate-y-12，显示与否全押在
 * IntersectionObserver 是否回调上：一旦它没回调（超高区块够不到 threshold、
 * 负 rootMargin 把触发线推进可视区之内、局域网上客户端 JS 没跑起来等），
 * 整块内容就永久停在 opacity-0 —— 深色区块上就是一片纯黑。
 *
 * 现在的规则：
 * - threshold: 0 —— 元素只要有 1px 进入视口即触发，超高区块同样必然触发；
 *   不再用负 rootMargin 收缩视口底边。
 * - 首屏内 / 已被滚过的元素保持可见，不播动画，避免入场闪烁与首屏延迟。
 * - scroll / resize 兜底：观察器万一不回调，用 getBoundingClientRect 再判一次。
 * - 没有 JS、不支持 IntersectionObserver、用户要求减少动效时：全部直接可见。
 */
export default function Reveal({
                                   children,
                                   delay = 0,
                                   className = "",
                               }: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") return;
        if (
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        // 元素顶边越过视口底边 = 已在视口内或被滚过去了 → 必须保持可见
        const entered = () => {
            const vh = window.innerHeight || document.documentElement.clientHeight;
            return el.getBoundingClientRect().top < vh;
        };

        if (entered()) return;

        setHidden(true);

        let done = false;
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) show();
            },
            { threshold: 0 }
        );

        function show() {
            if (done) return;
            done = true;
            io.disconnect();
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onScroll);
            setHidden(false);
        }

        function onScroll() {
            if (entered()) show();
        }

        io.observe(el);
        // capture 阶段能同时接住内层滚动容器发出的 scroll 事件
        window.addEventListener("scroll", onScroll, { passive: true, capture: true });
        window.addEventListener("resize", onScroll);

        return () => {
            done = true;
            io.disconnect();
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-[opacity,transform] duration-500 ease-out ${
                hidden
                    ? "opacity-0 translate-y-12"
                    : "opacity-100 translate-y-0"
            } ${className}`}
            style={{ transitionDelay: `${delay}s` }}
        >
            {children}
        </div>
    );
}
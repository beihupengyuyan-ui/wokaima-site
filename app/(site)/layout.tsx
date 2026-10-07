import Link from "next/link";
import EscapeBack from "@/components/EscapeBack";
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/lib/site-contact";

/**
 * 全站统一电话在 lib/site-contact.ts —— 「我的申请」里「请联系客服 xxx」的文案也要用同一个号，
 * 放一处免得改一半。
 * 顶部价格条移除后，页脚是唯一的电话落点。
 */

/**
 * 顶部导航只放「开店刚需」的四个决策入口，按客户的提问顺序排列：
 * 多少钱（价目）→ 怎么租、怎么退、坏了谁修（租期与保障）→ 旧设备怎么办（换新）→ 要不要合作（渠道）。
 * 「清凉厨房」是设备卖点页，不是租赁决策链路里的一环，从顶部移除；
 * 它仍然留在页脚「了解沃凯玛」分组与首页设备区入口（页面本身不删，直链与收录都还在）。
 *
 * 宽度提示：md（iPad 竖屏 768px）下「LOGO + 四项 + 按钮」刚好占满整行，
 * 所以 md 用 gap-6，lg 以上才回到 gap-9；LOGO 与按钮加 shrink-0，导航项加 whitespace-nowrap，
 * 保证再窄也不会把某一项挤成两行。
 */
const navLinks = [
    { href: "/products", label: "租金价目" },
    { href: "/features/rent-to-own", label: "租期与保障" },
    { href: "/trade-in", label: "以旧换新" },
    { href: "/partners", label: "渠道合作" },
];

export default function SiteLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* 全站 Esc 快速返回：此处统一挂载，所有前台页面自动生效 */}
            <EscapeBack />

            {/* 固定头部：主导航 */}
            <header className="fixed top-0 inset-x-0 z-50">
                <nav className="border-b border-orange-100/70 bg-white/85 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
                        <Link href="/" className="flex shrink-0 items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 text-lg font-bold text-white shadow-lg shadow-orange-600/25 md:h-11 md:w-11">
                                沃
                            </span>
                            <span className="leading-none">
                                <span className="block text-lg font-bold text-gray-900 md:text-xl">
                                    沃凯玛
                                </span>
                                <span className="mt-1 block text-[11px] font-semibold tracking-[0.1em] text-orange-600 md:text-xs">
                                    厨具出租 · 轻松开店
                                </span>
                            </span>
                        </Link>

                        <div className="hidden items-center gap-6 text-base text-gray-600 md:flex lg:gap-9">
                            {navLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="relative whitespace-nowrap after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-orange-600 after:transition-all after:duration-300 hover:text-orange-600 hover:after:w-full"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>

                        <Link
                            href="/apply"
                            className="shrink-0 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition-all hover:shadow-xl hover:shadow-orange-600/35 active:scale-[0.97] md:px-7 md:py-3 md:text-base"
                        >
                            免费出方案
                        </Link>
                    </div>
                </nav>
            </header>

            {/* 页头只有导航：手机 h-16（4rem）/ 桌面 h-20（5rem），主内容精确让位 */}
            <main className="pt-16 md:pt-20">{children}</main>

            {/* 页脚 */}
            <footer className="relative mt-32 overflow-hidden bg-gray-950 text-gray-400">
                <div className="geo-blur-soft -top-40 left-1/4 h-[600px] w-[600px] opacity-40" />
                <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 md:grid-cols-4 md:px-8 md:py-28">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 text-lg font-bold text-white">
                                沃
                            </span>
                            <span className="text-xl font-bold text-white">沃凯玛 WOKAIMA</span>
                        </div>
                        <p className="mt-6 text-sm leading-relaxed text-gray-400">
                            商用厨具制造与出租。
                            <br />
                            让每一家小店，都能轻装上阵。
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-5 font-semibold text-white">租赁方案</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/products" className="transition-colors hover:text-orange-400">
                                    租金价目
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/features/rent-to-own"
                                    className="transition-colors hover:text-orange-400"
                                >
                                    租期与保障
                                </Link>
                            </li>
                            <li>
                                <Link href="/trade-in" className="transition-colors hover:text-orange-400">
                                    以旧换新
                                </Link>
                            </li>
                            <li>
                                <Link href="/apply" className="transition-colors hover:text-orange-400">
                                    免费出方案
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/apply/lookup"
                                    className="transition-colors hover:text-orange-400"
                                >
                                    查询 / 取消申请
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-5 font-semibold text-white">了解沃凯玛</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    href="/features/clean-kitchen"
                                    className="transition-colors hover:text-orange-400"
                                >
                                    清凉厨房
                                </Link>
                            </li>
                            <li>
                                <Link href="/honors" className="transition-colors hover:text-orange-400">
                                    企业荣誉
                                </Link>
                            </li>
                            <li>
                                <Link href="/partners" className="transition-colors hover:text-orange-400">
                                    渠道合作
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-5 font-semibold text-white">联系我们</h3>
                        <p className="text-sm leading-relaxed">广汉沃凯玛厨房设备制造有限公司</p>
                        <p className="mt-3 text-sm leading-relaxed">
                            四川省德阳市广汉市深圳路西三段 2 号
                        </p>
                        <a
                            href={`tel:${CONTACT_PHONE}`}
                            className="mt-4 block text-2xl font-bold text-white transition-colors hover:text-orange-400"
                        >
                            {CONTACT_PHONE_DISPLAY}
                        </a>
                    </div>
                </div>

                <div className="relative border-t border-white/10 py-7 text-center text-xs text-gray-500">
                    © 沃凯玛 WOKAIMA 版权所有 · 厨具出租 · 轻松开店
                </div>
            </footer>
        </>
    );
}

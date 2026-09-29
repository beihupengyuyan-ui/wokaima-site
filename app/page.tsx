import Link from "next/link";
import { products } from "@/data/products";
import Reveal from "@/components/Reveal";
import ImageGallery from "@/components/ImageGallery";

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* 首屏：保持原样，不做 Reveal，页面加载时立即出现 */}
            <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-white px-4 py-24 text-center">
                <div className="geo-blur w-[700px] h-[700px] -top-64 -left-64" />
                <div className="geo-blur w-[600px] h-[600px] -bottom-56 -right-56" />
                <div className="geo-circle w-48 h-48 top-24 right-24 hidden md:block" />
                <div className="geo-circle w-32 h-32 bottom-32 left-24 hidden md:block" />
                <div className="geo-grid" />

                <div className="relative z-10 animate-fade-in-up">
                    <p className="text-sm text-orange-600 font-semibold tracking-wider mb-4">
                        沃凯玛 WOKAIMA · 商用厨具定制专家
                    </p>

                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                        清凉厨房，以旧换新
                    </h1>
                    <p className="mt-6 text-xl md:text-2xl text-gray-600">
                        商用蒸柜 / 炉头 / 整灶，<span className="text-orange-600 font-bold">每天 30 元</span>
                    </p>
                    <p className="mt-2 text-gray-500">三年租期 · 租满归你 · 综合节能 67%</p>

                    <div className="mt-12 max-w-3xl mx-auto grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                            <p className="text-3xl font-bold text-orange-600">67%</p>
                            <p className="text-sm text-gray-500 mt-1">综合节能</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                            <p className="text-3xl font-bold text-orange-600">¥3,360</p>
                            <p className="text-sm text-gray-500 mt-1">每月省</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                            <p className="text-3xl font-bold text-orange-600">6.5 个月</p>
                            <p className="text-sm text-gray-500 mt-1">回本周期</p>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4 justify-center">
                        <Link
                            href="/apply"
                            className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition-all duration-200"
                        >
                            免费试用 30 天
                        </Link>
                        <Link
                            href="/products"
                            className="border border-gray-300 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200"
                        >
                            查看产品
                        </Link>
                    </div>
                </div>

                {/* 底部渐隐，过渡到下一段 */}
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" />

            </section>

            {/* 三个核心卖点 */}
            <section className="max-w-5xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-6">
                <Reveal>
                    <Link
                        href="/features/clean-kitchen"
                        className="group block text-center bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                    >
                        <div className="text-5xl">❄️</div>
                        <h3 className="font-bold mt-4 text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                            清凉厨房
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            噪音低于 60 分贝，厨房降温 5℃，蒸汽不外泄。
                        </p>
                        <span className="inline-block mt-4 text-orange-600 group-hover:translate-x-1 transition-transform">
              了解详情 →
            </span>
                    </Link>
                </Reveal>

                <Reveal delay={0.1}>
                    <Link
                        href="/features/trade-in"
                        className="group block text-center bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                    >
                        <div className="text-5xl">🔄</div>
                        <h3 className="font-bold mt-4 text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                            以旧换新
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            旧设备回收，免 6 个月租期，免费拆旧装新。
                        </p>
                        <span className="inline-block mt-4 text-orange-600 group-hover:translate-x-1 transition-transform">
              了解详情 →
            </span>
                    </Link>
                </Reveal>

                <Reveal delay={0.2}>
                    <Link
                        href="/features/rent-to-own"
                        className="group block text-center bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                    >
                        <div className="text-5xl">💰</div>
                        <h3 className="font-bold mt-4 text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                            以租代售
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            月租 900 元，36 个月，租满归你，不占用现金流。
                        </p>
                        <span className="inline-block mt-4 text-orange-600 group-hover:translate-x-1 transition-transform">
              了解详情 →
            </span>
                    </Link>
                </Reveal>
            </section>

            {/* 产品 */}
            <section className="max-w-5xl mx-auto px-4 py-20">
                <Reveal>
                    <h2 className="text-3xl font-bold text-center text-gray-900">两大核心产品</h2>
                    <p className="text-center text-gray-500 mt-3">全部支持以租代售，租满三年归你</p>
                </Reveal>

                <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {products.map((p, i) => (
                        <Reveal key={p.slug} delay={0.1 + i * 0.08}>
                            <Link
                                href={`/products/${p.slug}`}
                                className="group block bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                            >
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {p.category}
                </span>
                                <h3 className="font-semibold text-lg text-gray-900 mt-4 group-hover:text-orange-600 transition-colors">
                                    {p.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">{p.tagline}</p>
                                <div className="mt-6 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-orange-600">¥{p.monthlyRent}</span>
                                    <span className="text-sm text-gray-500">{p.priceUnit}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">租期 {p.leaseTerm}，租满归你</p>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* 技术亮点 */}
            <section className="bg-[#fafafa] px-4 py-20">
                <div className="max-w-5xl mx-auto">
                    <Reveal>
                        <h2 className="text-3xl font-bold text-center text-gray-900">核心技术</h2>
                    </Reveal>
                    <div className="mt-12 grid md:grid-cols-2 gap-6">
                        <Reveal>
                            <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                                <h3 className="font-semibold text-lg text-gray-900">全预混低氮燃烧</h3>
                                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                                    封闭式预混技术，燃气与空气充分混合，低温均匀燃烧，NOx 排放低于 30mg/m³，远优于国标。
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.08}>
                            <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                                <h3 className="font-semibold text-lg text-gray-900">9 档变频控温</h3>
                                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                                    功率从 48kW 智能降至 12kW，达到 100℃ 后自动无缝切换，杜绝无效加热和蒸汽流失。
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.16}>
                            <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                                <h3 className="font-semibold text-lg text-gray-900">蒸汽循环回收</h3>
                                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                                    真空泵抽回使用后的蒸汽，二次加热后重新送入仓室，形成闭环，大幅减少热量散失。
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.24}>
                            <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                                <h3 className="font-semibold text-lg text-gray-900">尾气余热回收</h3>
                                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                                    高温尾气通过换热器，将 25℃ 自来水预热至 60℃，缩短蒸汽产生时间，降低燃气消耗。
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 合规背书 */}
            <section className="max-w-5xl mx-auto px-4 py-20 text-center">
                <Reveal>
                    <h2 className="text-3xl font-bold text-gray-900">符合新国标，通过 3C 认证</h2>
                    <p className="mt-3 text-gray-500">
                        自 2025 年 7 月 1 日起，国家强制实施 GB 35848，未达标设备将全面禁止使用。
                    </p>
                    <div className="mt-10 inline-flex items-center gap-3 bg-white rounded-full px-8 py-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                        <span className="text-3xl font-bold text-orange-600">3C</span>
                        <span className="text-sm text-gray-500">国家强制安全认证</span>
                    </div>
                </Reveal>
            </section>

            {/* 企业荣誉入口 */}
            <section className="max-w-5xl mx-auto px-4 py-16 text-center">
                <Reveal>
                    <h2 className="text-2xl font-bold text-gray-900">企业荣誉</h2>
                    <p className="mt-3 text-gray-500">
                        国家 3C 认证 · GB 35848 新国标 · 多项实用新型专利
                    </p>
                    <Link
                        href="/honors"
                        className="inline-block mt-6 text-orange-600 font-semibold hover:translate-x-1 transition-transform"
                    >
                        查看企业荣誉 →
                    </Link>
                </Reveal>
            </section>

            {/* 工程案例 */}
            <section className="bg-[#fafafa] px-4 py-20">
                <div className="max-w-6xl mx-auto">
                    <Reveal>
                        <h2 className="text-3xl font-bold text-center text-gray-900">服务客户</h2>
                        <p className="text-center text-gray-500 mt-3">
                            从星级酒店到连锁餐饮，从院校到企事业单位
                        </p>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="mt-12 max-w-5xl mx-auto">
                            <ImageGallery
                                images={["/images/cases/partners.png"]}
                                productName="沃凯玛工程案例"
                            />
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 品牌区 */}
            <section className="bg-white px-4 py-24">
                <Reveal>
                    <div className="max-w-5xl mx-auto text-center">
                        <img
                            src="/images/brand/ip-banner.png"
                            alt="沃凯玛品牌形象"
                            className="w-full max-w-3xl mx-auto"
                        />
                        <p className="mt-8 text-2xl font-bold text-gray-900">
                            沃凯玛 WOKAIMA
                        </p>
                        <p className="mt-2 text-gray-500">
                            商用厨具定制专家 · 让智慧商厨走进千家万户
                        </p>
                    </div>
                </Reveal>
            </section>

            {/* 底部 CTA */}
            <section className="bg-orange-600 text-white text-center py-16">
                <h2 className="text-2xl font-bold">免费试用 30 天，不满意无条件退货</h2>
                <p className="mt-2 text-orange-100">运费、安装费全部由我们承担</p>
                <Link
                    href="/apply"
                    className="inline-block mt-6 bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 active:scale-[0.97] transition-all duration-200"
                >
                    立即申请
                </Link>
            </section>
        </div>
    );
}
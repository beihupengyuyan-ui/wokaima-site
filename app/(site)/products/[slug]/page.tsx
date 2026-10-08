import { products, getProductBySlug } from "@/data/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import ImageGallery from "@/components/ImageGallery";

export function generateStaticParams() {
    return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetail({
                                                params,
                                            }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = getProductBySlug(slug);
    if (!product) notFound();

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
                <Link
                    href="/products"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 transition-colors animate-fade-in-up"
                >
                    ← 返回产品列表
                </Link>

                {/* 标题区 */}
                <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {product.category}
          </span>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900">
                        {product.name}
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">{product.tagline}</p>

                    {/* 日租价（出租主题核心价格） */}
                    {product.slug !== "energy-wok-range" && (
                        <div className="mt-6">
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-bold text-orange-600 md:text-6xl">
                                    {product.dailyRent}
                                </span>
                                <span className="text-lg text-gray-500">{product.dailyRentUnit}</span>
                            </div>
                            <p className="mt-3 text-gray-500">
                                约 ¥{product.monthlyRent}
                                {product.priceUnit} · 租期 {product.leaseTerm} · 租满归你
                            </p>
                        </div>
                    )}

                    {/* 双方案定价（炒灶） */}
                    {product.slug === "energy-wok-range" && (
                        <div className="mt-6 grid md:grid-cols-2 gap-4 max-w-2xl">
                            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border-2 border-orange-500">
                                <p className="text-xs text-orange-600 font-semibold">整灶定制</p>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-orange-600">¥7</span>
                                    <span className="text-sm text-gray-500">/ 眼 / 天</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">约 ¥210 / 眼 / 月</p>
                                <p className="mt-1 text-xs text-gray-400">根据现场尺寸定制安装</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                                <p className="text-xs text-gray-500 font-semibold">只换炉心</p>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">¥5</span>
                                    <span className="text-sm text-gray-500">/ 眼 / 天</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">约 ¥150 / 眼 / 月</p>
                                <p className="mt-1 text-xs text-gray-400">保留原灶，只换内部炉心</p>
                            </div>

                            <p className="md:col-span-2 mt-2 text-gray-500 text-sm">
                                租期 {product.leaseTerm} · 租满归你
                            </p>
                        </div>
                    )}
                </div>


                {/* 产品图：单图限制宽度，多图放宽容器 */}
                {product.images.length > 0 && (
                    <div
                        className={`mt-10 mx-auto ${
                            product.images.length === 1 ? "max-w-xl" : "max-w-4xl"
                        }`}
                    >
                        <ImageGallery images={product.images} productName={product.name} />
                    </div>
                )}

                {/* 技术规格 */}
                <div
                    className="mt-10 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                >
                    <h2 className="font-semibold text-lg text-gray-900 mb-5">技术规格</h2>
                    <dl className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        {Object.entries(product.specs).map(([k, v]) => (
                            <div key={k} className="flex justify-between border-b border-gray-100 pb-3">
                                <dt className="text-gray-500">{k}</dt>
                                <dd className="font-medium text-gray-900">{v}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                {/* 核心卖点 */}
                <div
                    className="mt-6 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                    style={{ animationDelay: "0.25s" }}
                >
                    <h2 className="font-semibold text-lg text-gray-900 mb-5">核心卖点</h2>
                    <ul className="space-y-3 text-sm">
                        {product.features.map((f) => (
                            <li key={f} className="flex items-start gap-3">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                <span className="text-gray-700">{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 节能测算：数据来自 products.ts 的 energySaving，只有蒸柜有，其余品类不渲染 */}
                {product.energySaving.length > 0 && (
                    <div
                        className="mt-6 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.28s" }}
                    >
                        <h2 className="font-semibold text-lg text-gray-900 mb-5">节能测算</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            {product.energySaving.map((item) => (
                                <div key={item.label} className="bg-orange-50 rounded-2xl p-4">
                                    <p className="text-xs text-gray-500">{item.label}</p>
                                    <p className="mt-2 font-semibold text-orange-600">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-5 text-xs text-gray-400 leading-relaxed">
                            测算口径：与普通蒸柜（5.2 方/小时）对比，按每天运行 8 小时、天然气 4 元/方计算。
                            实际用量随菜品结构和使用强度浮动。
                        </p>
                    </div>
                )}

                {/* 计价方式 */}
                {product.economy.length > 0 && (
                    <div
                        className="mt-6 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.3s" }}
                    >
                        <h2 className="font-semibold text-lg text-gray-900 mb-5">计价方式</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {product.economy.map((item) => (
                                <div key={item.label} className="bg-orange-50 rounded-2xl p-4">
                                    <p className="text-xs text-gray-500">{item.label}</p>
                                    <p className="mt-2 font-semibold text-orange-600">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 售后维保 */}
                <div
                    className="mt-6 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                    style={{ animationDelay: "0.35s" }}
                >
                    <h2 className="font-semibold text-lg text-gray-900 mb-5">售后维保</h2>
                    <div className="space-y-4 text-sm text-gray-600">
                        <div>
                            <p className="font-medium text-gray-900">0-2 年：全程免费</p>
                            <p className="mt-1">每 3 个月上门保养，费用全免，故障 2 小时响应、24 小时解决。</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">2 年以上：透明收费</p>
                            <p className="mt-1">蒸柜保养 300 元/台/次，炒炉保养 100 元/眼/次。</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                    <Link
                        href={`/apply?product=${product.slug}`}
                        className="inline-block rounded-2xl bg-orange-600 px-10 py-4 text-white font-semibold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition duration-150"
                    >
                        免费试用 30 天
                    </Link>
                    <p className="mt-3 text-xs text-gray-400">不满意无条件退货，运费安装全免</p>
                </div>
            </div>
        </div>
    );
}
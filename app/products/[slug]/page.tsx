import { products, getProductBySlug } from "@/data/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import EscapeBack from "@/components/EscapeBack";

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
            <EscapeBack />
            <div className="max-w-4xl mx-auto px-6 py-20">
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

                    <div className="mt-6 flex items-baseline gap-3">
                        <span className="text-5xl font-bold text-orange-600">¥{product.monthlyRent}</span>
                        <span className="text-lg text-gray-500">/ 月</span>
                    </div>
                    <p className="mt-2 text-gray-500">
                        租期 {product.leaseTerm} · 租满归你 · 不占用现金流
                    </p>
                </div>

                {/* 产品图 */}
                {product.images.length > 0 && (
                    <div
                        className="mt-10 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-10 flex items-center justify-center animate-fade-in-up"
                        style={{ animationDelay: "0.08s" }}
                    >
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="max-h-96 w-auto object-contain"
                        />
                    </div>
                )}

                {/* 技术规格 */}
                <div className="mt-10 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
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
                <div className="mt-6 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
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

                {/* 节能数据 */}
                {product.energySaving.length > 0 && (
                    <div className="mt-6 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        <h2 className="font-semibold text-lg text-gray-900 mb-5">节能效果</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {product.energySaving.map((item) => (
                                <div key={item.label} className="bg-orange-50 rounded-2xl p-4 text-center">
                                    <p className="text-xs text-gray-500">{item.label}</p>
                                    <p className="mt-2 text-lg font-bold text-orange-600">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 经济性对比 */}
                {product.economy.length > 0 && (
                    <div className="mt-6 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
                        <h2 className="font-semibold text-lg text-gray-900 mb-5">经济性对比</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {product.economy.map((item) => (
                                <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-xs text-gray-500">{item.label}</p>
                                    <p className="mt-2 font-semibold text-gray-900">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 售后维保 */}
                <div className="mt-6 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
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
                <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
                    <Link
                        href={`/apply?product=${product.slug}`}
                        className="inline-block rounded-2xl bg-orange-600 px-10 py-4 text-white font-semibold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition-all duration-200"
                    >
                        免费试用 30 天
                    </Link>
                    <p className="mt-3 text-xs text-gray-400">不满意无条件退货，运费安装全免</p>
                </div>
            </div>
        </div>
    );
}
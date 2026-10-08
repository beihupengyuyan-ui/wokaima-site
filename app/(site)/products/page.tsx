import Link from "next/link";
import { products } from "@/data/products";

export default function ProductsPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
                <div className="text-center mb-16 md:mb-20 animate-fade-in-up">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                        租金价目
                    </h1>
                    <p className="mt-5 text-lg text-gray-500">
                        按台按天计价：蒸柜 30 元/天起，炒灶 7 元/眼/天起，工作台 1 元/天起；整店配齐按设备清单合计。
                    </p>
                </div>

                {/* 3 个产品，三列等宽，与首页价目表保持一致 */}
                <div className="grid gap-8 md:grid-cols-3">
                    {products.map((p, i) => (
                        <Link
                            key={p.slug}
                            href={`/products/${p.slug}`}
                            className="group bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden transition duration-200 hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] hover:-translate-y-1 animate-fade-in-up"
                            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                        >
                            {/* 产品图区域：固定大尺寸，撑满卡片宽度 */}
                            <div className="relative h-60 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center overflow-hidden">
                                {p.images.length > 0 ? (
                                    <img
                                        src={p.images[0]}
                                        alt={p.name}
                                        className="max-h-full max-w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <span className="text-sm text-gray-400">暂无图片</span>
                                )}
                            </div>

                            {/* 产品信息 */}
                            <div className="p-8">
                                <div className="flex items-start justify-between">
                                    <h2 className="font-semibold text-xl text-gray-900 group-hover:text-orange-600 transition-colors">
                                        {p.name}
                                    </h2>
                                    <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {p.category}
                  </span>
                                </div>

                                <div className="mt-6 flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-orange-600">
                                        {p.dailyRent}
                                    </span>
                                    <span className="text-sm text-gray-500">{p.dailyRentUnit}</span>
                                </div>

                                <p className="mt-2 text-sm text-gray-500">
                                    约 ¥{p.monthlyRent}
                                    {p.priceUnit} · 租期 {p.leaseTerm} · 租满归你
                                </p>

                                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm text-gray-500">查看详情</span>
                                    <span className="text-orange-600 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
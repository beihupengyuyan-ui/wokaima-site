import Link from "next/link";
import { products } from "@/data/products";
import EscapeBack from "@/components/EscapeBack";

export default function ProductsPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <EscapeBack />
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-14 animate-fade-in-up">
                    <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
                        产品
                    </h1>
                    <p className="mt-3 text-base text-gray-500">
                        商用蒸柜 / 炉头 / 整灶，全部支持以租代售。
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {products.map((p, i) => (
                        <Link
                            key={p.slug}
                            href={`/products/${p.slug}`}
                            className="group bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] hover:-translate-y-1 animate-fade-in-up"
                            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                        >
                            {/* 产品图区域：固定大尺寸，撑满卡片宽度 */}
                            <div className="relative h-72 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center overflow-hidden">
                                {p.images.length > 0 ? (
                                    <img
                                        src={p.images[0]}
                                        alt={p.name}
                                        className="max-h-full max-w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <span className="text-sm text-gray-300">暂无图片</span>
                                )}
                            </div>

                            {/* 产品信息 */}
                            <div className="p-8">
                                <div className="flex items-start justify-between">
                                    <h2 className="font-semibold text-xl text-gray-900 group-hover:text-orange-600 transition-colors">
                                        {p.name}
                                    </h2>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {p.category}
                  </span>
                                </div>

                                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-orange-600">
                    ¥{p.monthlyRent}
                  </span>
                                    <span className="text-sm text-gray-500">/ 月</span>
                                </div>

                                <p className="mt-2 text-sm text-gray-500">
                                    租期 {p.leaseTerm} · 租满归你
                                </p>

                                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm text-gray-400">查看详情</span>
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
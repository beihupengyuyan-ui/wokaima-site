import Link from "next/link";

export default function HonorsPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-7xl mx-auto px-6 py-24 md:py-36">
                <div className="text-center mb-14 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
                        企业荣誉
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                        国家 3C 认证 · GB 35848 新国标 · 多项实用新型专利
                    </p>
                </div>

                {/* 图片撑满容器，不加内边距 */}
                <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <img
                        src="/images/honors/honors-wall.png"
                        alt="沃凯玛企业荣誉墙"
                        className="w-full rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
                    />
                </div>

                <div className="mt-16 text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <Link
                        href="/apply"
                        className="inline-block rounded-2xl bg-orange-600 px-12 py-5 text-white font-semibold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition-all duration-200"
                    >
                        免费试用 30 天
                    </Link>
                </div>
            </div>
        </div>
    );
}
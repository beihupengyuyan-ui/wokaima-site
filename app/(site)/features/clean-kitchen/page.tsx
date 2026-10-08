import Link from "next/link";

export default function CleanKitchenPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-3xl mx-auto px-6 py-24 md:py-36">
                <div className="text-center mb-14 animate-fade-in-up">
                    <div className="text-6xl">❄️</div>
                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900">
                        清凉厨房
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                        低噪音、低辐射热、蒸汽密闭，让后厨不再闷热。
                    </p>
                </div>

                <div className="space-y-8">
                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.05s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            超低噪音：低于 60 分贝
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            传统商用厨房的噪音普遍在 90 分贝以上，长期暴露会对听力造成不可逆损伤。
                            沃凯玛通过全预混燃烧和优化风机结构，将整机运行噪音降到 60 分贝以下，
                            相当于正常交谈的音量，让后厨沟通不再靠喊，减少员工听觉疲劳。
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            蒸汽密闭不外泄，降温约 5℃
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            采用专业密闭结构设计，蒸汽全程零外泄，从根源上解决后厨潮湿闷热、
                            墙面发霉等顽疾。蒸汽循环回收系统将多余蒸汽二次加热后重新送入仓室，
                            大幅降低厨房空气湿度和环境温度。经实测，厨房环境温度可降低约 5℃，
                            告别夏日烹饪的燥热难耐。
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.15s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            超低氮洁净燃烧，NOx &lt; 30mg/m³
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            采用全预混低氮燃烧技术，封闭式预混腔让燃气与空气充分混合，
                            实现低温均匀燃烧，无局部超高温区，有效抑制 NOx 生成。
                            排放指标低于 30mg/m³，远优于国标要求，燃烧过程无刺鼻烟气，
                            从源头减少有害气体，守护每一位员工的呼吸健康。
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <Link
                        href="/apply"
                        className="inline-block rounded-2xl bg-orange-600 px-10 py-4 text-white font-semibold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition duration-150"
                    >
                        免费试用 30 天
                    </Link>
                </div>
            </div>
        </div>
    );
}
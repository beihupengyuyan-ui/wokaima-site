import Link from "next/link";
import EscapeBack from "@/components/EscapeBack";

export default function RentToOwnPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <EscapeBack />
            <div className="max-w-3xl mx-auto px-6 py-20">
                <div className="text-center mb-14 animate-fade-in-up">
                    <div className="text-6xl">💰</div>
                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900">
                        以租代售
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                        月租 900 元，36 个月，租满归你。
                    </p>
                </div>

                <div className="space-y-6">
                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.05s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            零首付升级，不占用现金流
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            传统买断一台节能蒸柜需要一次性支付几万元，
                            以租代售无需大额一次性资金投入，有效降低门店的启动资金压力，
                            避免现金流被固定资产占用，保障门店日常运营的资金流动性。
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            以省代投：每月省下的燃气费覆盖月供
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            沃凯玛智能蒸柜标准工况每小时耗气仅 1.7 方，相比传统蒸柜节能 70%。
                            按每天运行 8 小时、天然气 4 元/方计算，每日直接节约成本 112 元，
                            每月累计节约 3360 元。每月节省的燃气费用完全覆盖设备月供，
                            真正做到“以省代投”，甚至实现“负成本”升级。
                        </p>
                        <div className="mt-5 grid grid-cols-3 gap-4">
                            <div className="bg-orange-50 rounded-2xl p-4 text-center">
                                <p className="text-xs text-gray-500">每日省</p>
                                <p className="mt-1 text-lg font-bold text-orange-600">¥112</p>
                            </div>
                            <div className="bg-orange-50 rounded-2xl p-4 text-center">
                                <p className="text-xs text-gray-500">每月省</p>
                                <p className="mt-1 text-lg font-bold text-orange-600">¥3,360</p>
                            </div>
                            <div className="bg-orange-50 rounded-2xl p-4 text-center">
                                <p className="text-xs text-gray-500">回本周期</p>
                                <p className="mt-1 text-lg font-bold text-orange-600">6.5 个月</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.15s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            免费试用，不满意无理由退款
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            我们提供 30 天免费试用。如果在试用期内对设备效果不满意，
                            可以无理由退款，运费和安装费全部由我们承担。
                            你没有任何风险，只需要决定是否继续。
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            租满三年，设备归你
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            三年租期结束后，设备所有权自动转移给你。
                            你不需要再支付任何费用，设备就是你的资产。
                            这比“一直租下去”更划算，也比“一次性买断”更轻松。
                            5 年全生命周期累计可节省 20 万元以上运营成本。
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
                    <Link
                        href="/apply"
                        className="inline-block rounded-2xl bg-orange-600 px-10 py-4 text-white font-semibold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition-all duration-200"
                    >
                        立即申请
                    </Link>
                </div>
            </div>
        </div>
    );
}
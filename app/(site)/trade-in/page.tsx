import Link from "next/link";
import EscapeBack from "@/components/EscapeBack";
export default function TradeInPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <EscapeBack />
            <div className="max-w-3xl mx-auto px-6 py-20">
                <div className="text-center mb-14 animate-fade-in-up">
                    <div className="text-6xl">🔄</div>
                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900">
                        以旧换新
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                        旧设备交给我们，免除 6 个月租期。
                    </p>
                </div>

                <div className="space-y-6">
                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.05s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            回收旧设备，免 6 个月租金
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            如果你有旧的商用蒸柜或厨灶，交给我们回收，
                            即可在三年租期中免除 6 个月的租金，相当于直接省下 5400 元。
                            旧设备由我们免费拆走，不需要你额外支付任何费用。
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            流程简单，三天完成
                        </h2>
                        <div className="mt-4 space-y-4 text-sm text-gray-600">
                            <div className="flex gap-4">
                                <span className="font-bold text-orange-600">01</span>
                                <p>提交旧设备信息（品牌、型号、使用年限、照片）。</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold text-orange-600">02</span>
                                <p>我们评估并确认租赁方案，签订合同。</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold text-orange-600">03</span>
                                <p>免费上门拆旧、装新、调试，三天内完成。</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.15s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            旧设备怎么处理？
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            回收的旧设备由我们统一处理，符合环保要求。
                            你不需要操心搬运、拆解或二手转卖，全部由我们负责。
                        </p>
                    </div>
                </div>

                <div
                    className="mt-12 text-center animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                >
                    <Link
                        href="/apply?tradeIn=yes"
                        className="inline-block rounded-2xl bg-orange-600 px-10 py-4 text-white font-semibold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition-all duration-200"
                    >
                        申请以旧换新
                    </Link>
                </div>
            </div>
        </div>
    );
}
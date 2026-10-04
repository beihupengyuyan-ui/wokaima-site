import Link from "next/link";
export default function TradeInPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-3xl mx-auto px-6 py-24 md:py-36">
                <div className="text-center mb-14 animate-fade-in-up">
                    <div className="text-6xl">🔄</div>
                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900">
                        以旧换新
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                        旧设备交给我们回收，直接免除 6 个月租期。
                    </p>
                </div>

                <div className="space-y-8">
                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.05s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            旧机怎么抵：免 6 个月租金，约 5,400 元
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            旧的蒸柜、炒灶或炉头都可以交给我们回收，在 36 个月的租期里直接免除 6 个月租金。
                            以月租 900 元的三门蒸柜计算，相当于省下 5,400 元；
                            旧设备由我们免费拆走，不收搬运费，也不收拆解费。
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">流程三天走完</h2>
                        <div className="mt-4 space-y-4 text-sm text-gray-600">
                            <div className="flex gap-4">
                                <span className="font-bold text-orange-600">01</span>
                                <p>提交旧设备信息（品牌、型号、使用年限、照片）。</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold text-orange-600">02</span>
                                <p>我们评估旧设备、确认租赁方案，双方签订合同。</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-bold text-orange-600">03</span>
                                <p>免费上门拆旧、装新、调试，三天内完成。</p>
                            </div>
                        </div>
                        <p className="mt-5 text-sm text-gray-500">
                            设备运输费、搬运费、上门安装调试费及相关辅材费用，全部由我方承担。
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.15s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">先试再换，旧机不操心</h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            换之前可以先免费试用 30 天，在真实生产环境里验证效果；
                            试用期内不满意，支持无理由退货退款，运费与安装费全免，你无需承担产品折旧或损耗。
                            回收的旧设备由我们统一处理，符合环保要求，搬运、拆解、二手转卖都不用你管。
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
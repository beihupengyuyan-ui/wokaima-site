import Link from "next/link";

export default function RentToOwnPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-3xl mx-auto px-6 py-24 md:py-36">
                <div className="text-center mb-14 animate-fade-in-up">
                    <div className="text-6xl">📋</div>
                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900">
                        租期与保障
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                        租金怎么算、试用怎么退、坏了谁修，一次说清。
                    </p>
                </div>

                <div className="space-y-8">
                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.05s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            租期与归属：36 期，期满设备归你
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            全站统一租期 36 个月，按天或按月付费。这也就是常说的「以租代售」：
                            租期内设备归沃凯玛所有，由我们负责保养维修；
                            期满你不用再付任何费用，所有权自动转移给你，设备从此是你的资产。
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            30 天免费试用，不满意无理由退
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            设备进场后 30 天内可以先试用。在真实生产环境里验证出品、效率与场地匹配度；
                            如果效果没达到预期，可以无理由退货退款，运费和安装费全部由我们承担，
                            你不需要承担任何产品折旧或损耗费用。
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.15s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            维保与响应：前 2 年全免
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            租期内设备由我们负责维保。前 2 年保养与维修全免，每 3 个月上门保养一次，
                            出现故障 2 小时内响应、24 小时内解决，不收上门费与工时费。
                            2 年以上按透明价收费：蒸柜保养 300 元/台/次，炒炉保养 100 元/眼/次。
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 animate-fade-in-up"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <h2 className="font-semibold text-xl text-gray-900">
                            租金之外，没有隐形费用
                        </h2>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            上门测量、送货、安装调试、旧设备拆除以及相关辅材，全部由我方承担；
                            以旧换新还能再免 6 个月租期。租金之外的支出，我们会提前列在方案里。
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
                    <Link
                        href="/apply"
                        className="inline-block rounded-2xl bg-orange-600 px-10 py-4 text-white font-semibold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition duration-150"
                    >
                        免费领取出租方案
                    </Link>
                    <p className="mt-6 text-sm text-gray-500">
                        想知道能省多少钱？
                        <Link href="/#rent" className="ml-1 font-medium text-orange-600 hover:underline">
                            看租金价目
                        </Link>
                        <span className="mx-2 text-gray-300">·</span>
                        <Link href="/trade-in" className="font-medium text-orange-600 hover:underline">
                            以旧换新抵 6 个月租金
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
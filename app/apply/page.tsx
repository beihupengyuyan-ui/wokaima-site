import { products } from "@/data/products";
import EscapeBack from "@/components/EscapeBack";



async function submitLead(formData: FormData) {
    "use server";
    const data = Object.fromEntries(formData.entries());
    console.log("LEAD:", data);
}

export default function ApplyPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <EscapeBack />
            <div className="max-w-2xl mx-auto px-6 py-20">
                {/* 标题区 */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
                        申请以旧换新
                    </h1>
                    <p className="mt-3 text-base text-gray-500">
                        填写信息，我们会在 1 个工作日内联系你。
                    </p>
                </div>

                {/* 表单卡片 */}
                <form
                    action={submitLead}
                    className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 md:p-10 space-y-6 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: "0.15s" }}
                >
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                姓名
                            </label>
                            <input
                                name="name"
                                required
                                placeholder="请输入姓名"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                电话
                            </label>
                            <input
                                name="phone"
                                required
                                placeholder="请输入手机号"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                公司 / 餐厅名称
                            </label>
                            <input
                                name="company"
                                placeholder="请输入名称"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                所在地区
                            </label>
                            <input
                                name="region"
                                placeholder="例如：四川成都"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            意向产品
                        </label>
                        <select
                            name="product"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200 appearance-none"
                        >
                            <option value="">请选择产品</option>
                            {products.map((p) => (
                                <option key={p.slug} value={p.slug}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            id="tradeIn"
                            name="tradeIn"
                            value="yes"
                            className="w-5 h-5 rounded-md border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <label htmlFor="tradeIn" className="text-sm text-gray-700">
                            我有旧设备需要以旧换新
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            备注
                        </label>
                        <textarea
                            name="note"
                            rows={4}
                            placeholder="旧设备品牌、型号、使用年限等"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200 resize-none"
                        />
                    </div>

                    <input type="hidden" name="ref" value="" />

                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-orange-600 py-4 text-white font-semibold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition-all duration-200 ease-out shadow-lg shadow-orange-600/20"
                    >
                        提交申请
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-8">
                    提交即表示同意我们与你联系，信息仅用于本次咨询。
                </p>
            </div>
        </div>
    );
}
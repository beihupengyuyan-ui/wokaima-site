async function submitPartner(formData: FormData) {
    "use server";
    const data = Object.fromEntries(formData.entries());

    const db = (await import("@/lib/db")).default;

    db.prepare(`
    INSERT INTO leads (name, phone, region, note, ref)
    VALUES (?, ?, ?, ?, ?)
  `).run(
        data.name,
        data.phone,
        data.region || null,
        `渠道类型：${data.channelType || "未填"}；预计月推荐量：${data.volume || "未填"}；${data.note || ""}`,
        "channel"
    );

    console.log("渠道线索已保存:", data);
}

export default function PartnersPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-2xl mx-auto px-6 py-24 md:py-36">
                {/* 标题区 */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
                        渠道合作
                    </h1>
                    <p className="mt-3 text-base text-gray-500">
                        介绍客户成功签约，即可获得提成。
                    </p>
                </div>

                {/* 合作说明卡片 */}
                <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 md:p-10 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <h2 className="font-semibold text-lg text-gray-900 mb-4">合作方式</h2>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>· 推荐客户成功租赁，按首月租金的一定比例提成。</p>
                        <p>· 提供专属推荐码，后台可追踪推荐记录。</p>
                        <p>· 长期合作可升级为区域代理。</p>
                    </div>
                </div>

                {/* 渠道商申请表单 */}
                <form
                    action={submitPartner}
                    className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 md:p-10 space-y-6 transition duration-200 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
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
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition duration-150"
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
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition duration-150"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                所在区域
                            </label>
                            <input
                                name="region"
                                placeholder="例如：四川成都"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition duration-150"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                渠道类型
                            </label>
                            <select
                                name="channelType"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition duration-150 appearance-none"
                            >
                                <option value="">请选择</option>
                                <option value="dealer">厨具经销商</option>
                                <option value="designer">厨房设计/工程公司</option>
                                <option value="individual">个人推荐</option>
                                <option value="other">其他</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            预计月推荐量
                        </label>
                        <select
                            name="volume"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition duration-150 appearance-none"
                        >
                            <option value="">请选择</option>
                            <option value="1-3">1-3 台</option>
                            <option value="4-10">4-10 台</option>
                            <option value="10+">10 台以上</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            备注
                        </label>
                        <textarea
                            name="note"
                            rows={4}
                            placeholder="您目前的客户群体、合作意向等"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition duration-150 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-orange-600 py-4 text-white font-semibold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition duration-150 ease-out shadow-lg shadow-orange-600/20"
                    >
                        申请成为渠道商
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-8">
                    提交后我们会在 1 个工作日内联系你。
                </p>
            </div>
        </div>
    );
}
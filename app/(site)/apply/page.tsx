"use client";

import { useState, useMemo } from "react";
import provinces from "china-division/dist/provinces.json";
import cities from "china-division/dist/cities.json";
import areas from "china-division/dist/areas.json";

export default function ApplyPage() {
    const [provinceCode, setProvinceCode] = useState("");
    const [cityCode, setCityCode] = useState("");
    const [areaCode, setAreaCode] = useState("");
    const [street, setStreet] = useState("");
    const [steamerQty, setSteamerQty] = useState(0);
    const [stoveQty, setStoveQty] = useState(0);
    const [burnerQty, setBurnerQty] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // 根据省筛选市
    const filteredCities = useMemo(
        () => cities.filter((c) => c.provinceCode === provinceCode),
        [provinceCode]
    );

    // 根据市筛选区
    const filteredAreas = useMemo(
        () => areas.filter((a) => a.cityCode === cityCode),
        [cityCode]
    );

    // 拼出完整地址
    const provinceName = provinces.find((p) => p.code === provinceCode)?.name || "";
    const cityName = cities.find((c) => c.code === cityCode)?.name || "";
    const areaName = areas.find((a) => a.code === areaCode)?.name || "";
    const fullAddress = `${provinceName}${cityName}${areaName}${street}`;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set("region", fullAddress);

        const res = await fetch("/submit", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            setSubmitted(true);
        } else {
            alert("提交失败，请稍后重试");
        }
        setLoading(false);
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-12 max-w-md w-full text-center animate-fade-in-up">
                    <div className="text-6xl">✅</div>
                    <h1 className="mt-6 text-2xl font-semibold text-gray-900">提交成功</h1>
                    <p className="mt-3 text-gray-500">
                        我们会在 1 个工作日内联系你，请保持电话畅通。
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-2xl mx-auto px-6 py-20">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
                        申请以旧换新
                    </h1>
                    <p className="mt-3 text-base text-gray-500">
                        填写信息，我们会在 1 个工作日内联系你。
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-8 md:p-10 space-y-6 animate-fade-in-up"
                    style={{ animationDelay: "0.15s" }}
                >
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                            <input
                                name="name"
                                required
                                placeholder="请输入姓名"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">电话</label>
                            <input
                                name="phone"
                                required
                                placeholder="请输入手机号"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">公司 / 餐厅名称</label>
                        <input
                            name="company"
                            placeholder="请输入名称"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200"
                        />
                    </div>

                    {/* 省市区三级联动 + 街道 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">所在地区</label>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <select
                                    value={provinceCode}
                                    onChange={(e) => {
                                        setProvinceCode(e.target.value);
                                        setCityCode("");
                                        setAreaCode("");
                                    }}
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200"
                                >
                                    <option value="">省</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={cityCode}
                                    onChange={(e) => {
                                        setCityCode(e.target.value);
                                        setAreaCode("");
                                    }}
                                    disabled={!provinceCode}
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200 disabled:opacity-40"
                                >
                                    <option value="">市</option>
                                    {filteredCities.map((c) => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={areaCode}
                                    onChange={(e) => setAreaCode(e.target.value)}
                                    disabled={!cityCode}
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200 disabled:opacity-40"
                                >
                                    <option value="">区 / 县</option>
                                    {filteredAreas.map((a) => (
                                        <option key={a.code} value={a.code}>{a.name}</option>
                                    ))}
                                </select>
                            </div>

                            <input
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="详细地址（街道、门牌号等）"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200"
                            />
                        </div>
                        <input type="hidden" name="region" value={fullAddress} />
                    </div>

                    {/* 产品需求 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">产品需求</label>
                        <div className="space-y-3 bg-gray-50 rounded-2xl p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">智能蒸柜</span>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setSteamerQty(Math.max(0, steamerQty - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition">−</button>
                                    <span className="w-8 text-center font-medium">{steamerQty}</span>
                                    <button type="button" onClick={() => setSteamerQty(steamerQty + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition">+</button>
                                    <span className="text-xs text-gray-400 w-6">台</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">节能整灶</span>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setStoveQty(Math.max(0, stoveQty - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition">−</button>
                                    <span className="w-8 text-center font-medium">{stoveQty}</span>
                                    <button type="button" onClick={() => setStoveQty(stoveQty + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition">+</button>
                                    <span className="text-xs text-gray-400 w-6">眼</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">节能炉心（只换炉心）</span>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setBurnerQty(Math.max(0, burnerQty - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition">−</button>
                                    <span className="w-8 text-center font-medium">{burnerQty}</span>
                                    <button type="button" onClick={() => setBurnerQty(burnerQty + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition">+</button>
                                    <span className="text-xs text-gray-400 w-6">眼</span>
                                </div>
                            </div>
                        </div>

                        <input type="hidden" name="steamerQty" value={steamerQty} />
                        <input type="hidden" name="stoveQty" value={stoveQty} />
                        <input type="hidden" name="burnerQty" value={burnerQty} />
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input type="checkbox" id="tradeIn" name="tradeIn" value="yes" className="w-5 h-5 rounded-md border-gray-300 text-orange-600 focus:ring-orange-500" />
                        <label htmlFor="tradeIn" className="text-sm text-gray-700">我有旧设备需要以旧换新</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                        <textarea
                            name="note"
                            rows={4}
                            placeholder="旧设备品牌、型号、使用年限等"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/50 transition-all duration-200 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-orange-600 py-4 text-white font-semibold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.97] transition-all duration-200 ease-out shadow-lg shadow-orange-600/20 disabled:opacity-50"
                    >
                        {loading ? "提交中..." : "提交申请"}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-8">
                    提交即表示同意我们与你联系，信息仅用于本次咨询。
                </p>
            </div>
        </div>
    );
}
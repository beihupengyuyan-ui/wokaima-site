"use client";

import { useState, useMemo, useEffect } from "react";
import provinces from "china-division/dist/provinces.json";
import cities from "china-division/dist/cities.json";
import areas from "china-division/dist/areas.json";
import Link from "next/link";

/**
 * 出租方案申请表。
 *
 * URL 预填：
 * - /apply?tradeIn=yes   以旧换新页的入口 → 勾选「我有旧设备需要以旧换新」，标题切成以旧换新
 * - /apply?product=slug  产品详情页的入口 → 对应设备数量先置 1
 *
 * 这里刻意用 useEffect + window.location.search，而不用 useSearchParams：
 * 后者会让整棵客户端组件树退化成纯客户端渲染，页面 HTML 里只剩一个空壳 ——
 * 这个表单是首页之外唯一的转化入口，必须保住预渲染。代价只是水合后一帧内
 * 完成勾选与数量回填，肉眼不可见；首帧状态与预渲染输出一致，不会水合不匹配。
 */
export default function ApplyForm() {
    const [provinceCode, setProvinceCode] = useState("");
    const [cityCode, setCityCode] = useState("");
    const [areaCode, setAreaCode] = useState("");
    const [street, setStreet] = useState("");
    const [steamerQty, setSteamerQty] = useState(0);
    const [stoveQty, setStoveQty] = useState(0);
    const [burnerQty, setBurnerQty] = useState(0);
    const [worktableQty, setWorktableQty] = useState(0);
    const [tradeInFromUrl, setTradeInFromUrl] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // 挂载时按 URL 预填。见文件头注释：首帧状态与预渲染输出一致，这里是刻意的 setState，
    // 不能挪进 useState 初始化（服务端拿不到 window.location，会水合不匹配）。
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get("tradeIn") === "yes") {
            setTradeInFromUrl(true);
        }

        switch (params.get("product")) {
            case "smart-steamer-3door":
                setSteamerQty(1);
                break;
            case "energy-wok-range":
                setStoveQty(1);
                break;
            case "stainless-work-table":
                setWorktableQty(1);
                break;
        }
    }, []);
    /* eslint-enable react-hooks/set-state-in-effect */

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

    const fieldLabels: Record<string, string> = {
        name: "姓名",
        phone: "电话",
        company: "公司 / 餐厅名称",
        region: "所在地区（省 / 市 / 区县）",
        street: "详细地址",
        product: "产品需求数量",
    };

    const inputClass = (key: string) =>
        `w-full rounded-2xl border bg-gray-50 px-5 py-4 text-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
            errors.includes(key)
                ? "border-red-400 focus:border-red-500 focus:ring-red-100/60"
                : "border-gray-200 focus:border-orange-500 focus:ring-orange-100/60"
        }`;

    const selectClass = (key: string) =>
        `w-full rounded-2xl border bg-gray-50 px-3 py-4 text-base text-gray-900 focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
            errors.includes(key)
                ? "border-red-400 focus:border-red-500 focus:ring-red-100/60"
                : "border-gray-200 focus:border-orange-500 focus:ring-orange-100/60"
        }`;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        formData.set("region", fullAddress);

        // 校验必填项
        const name = String(formData.get("name") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const company = String(formData.get("company") || "").trim();
        const totalQty = steamerQty + stoveQty + burnerQty + worktableQty;

        const nextErrors: string[] = [];
        if (!name) nextErrors.push("name");
        if (!phone) nextErrors.push("phone");
        if (!company) nextErrors.push("company");
        if (!provinceCode || !cityCode || !areaCode) nextErrors.push("region");
        if (!street.trim()) nextErrors.push("street");
        if (totalQty === 0) nextErrors.push("product");

        if (nextErrors.length > 0) {
            setErrors(nextErrors);
            return;
        }

        setErrors([]);
        setLoading(true);

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
            <div className="relative min-h-screen overflow-hidden bg-[#faf7f4] flex items-center justify-center px-6 py-20">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
                    <div className="absolute bottom-0 -right-24 h-96 w-96 rounded-full bg-amber-100/60 blur-3xl" />
                </div>
                <div className="relative max-w-xl w-full text-center animate-fade-in-up">
                    {/* 图标 */}
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center shadow-lg shadow-orange-200/50">
                        <svg
                            className="w-12 h-12 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    {/* 标题 */}
                    <h1 className="mt-10 text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                        提交成功
                    </h1>

                    <p className="mt-6 text-lg md:text-xl text-gray-500 leading-relaxed">
                        我们会在 1 个工作日内联系你
                        <br />
                        请保持电话畅通
                    </p>

                    {/* 感谢 */}
                    <p className="mt-14 text-base text-orange-600 font-semibold tracking-widest uppercase">
                        感谢您的信任与支持
                    </p>

                    {/* 反悔入口：提交后想撤单不必打电话 —— 凭手机号 + 姓名 / 公司名就能自助取消 */}
                    <p className="mt-12 text-sm text-gray-400 leading-relaxed">
                        填错信息或改变主意？可以在「我的申请」里凭手机号查询并取消。
                    </p>

                    {/* 返回链接 */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-base text-gray-500">
                        <Link
                            href="/"
                            className="hover:text-gray-900 transition-colors"
                        >
                            返回首页
                        </Link>
                        <span className="w-px h-4 bg-gray-200" />
                        <Link
                            href="/products"
                            className="hover:text-gray-900 transition-colors"
                        >
                            查看产品
                        </Link>
                        <span className="w-px h-4 bg-gray-200" />
                        <Link
                            href="/apply/lookup"
                            className="text-orange-600 hover:text-orange-700 transition-colors"
                        >
                            查询 / 取消申请
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#faf7f4]">
            {/* 背景装饰 */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
                <div className="absolute top-48 -right-24 h-96 w-96 rounded-full bg-amber-100/60 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />
            </div>

            <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-24">
                <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold tracking-wide text-orange-600">
                        <span className="text-base">{tradeInFromUrl ? "🔄" : "🍳"}</span> WOKAIMA · 厨具出租
                    </span>
                    <h1 className="mt-7 text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                        {tradeInFromUrl ? "申请" : "免费领取"}
                        <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                            {tradeInFromUrl ? "以旧换新" : "出租方案"}
                        </span>
                    </h1>
                    <p className="mt-5 text-base md:text-xl text-gray-500">
                        {tradeInFromUrl
                            ? "填写信息，1 个工作日内给你旧机抵扣与租金明细"
                            : "填写信息，1 个工作日内给你一份可落地的出租方案"}
                    </p>
                    <p className="mt-3 text-sm text-gray-400">
                        还没想好租什么也没关系，工程师会按店面情况给建议。
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_-24px_rgba(249,115,22,0.35)] ring-1 ring-orange-100 p-8 md:p-12 space-y-7 animate-fade-in-up"
                    style={{ animationDelay: "0.15s" }}
                >
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2.5">姓名 <span className="text-orange-500">*</span></label>
                            <input
                                name="name"
                                required
                                placeholder="请输入姓名"
                                className={inputClass("name")}
                            />
                        </div>
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2.5">电话 <span className="text-orange-500">*</span></label>
                            <input
                                name="phone"
                                required
                                placeholder="请输入手机号"
                                className={inputClass("phone")}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2.5">公司 / 餐厅名称</label>
                        <input
                            name="company"
                            required
                            placeholder="请输入名称"
                            className={inputClass("company")}
                        />
                    </div>

                    {/* 省市区三级联动 + 街道 */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2.5">所在地区 <span className="text-orange-500">*</span></label>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <select
                                    value={provinceCode}
                                    onChange={(e) => {
                                        setProvinceCode(e.target.value);
                                        setCityCode("");
                                        setAreaCode("");
                                    }}
                                    className={selectClass("region")}
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
                                    className={selectClass("region")}
                                >
                                    <option value="">{provinceCode ? "请选择市" : "请先选择省"}</option>
                                    {filteredCities.map((c) => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={areaCode}
                                    onChange={(e) => setAreaCode(e.target.value)}
                                    className={selectClass("region")}
                                >
                                    <option value="">{cityCode ? "请选择区 / 县" : "请先选择市"}</option>
                                    {filteredAreas.map((a) => (
                                        <option key={a.code} value={a.code}>{a.name}</option>
                                    ))}
                                </select>
                            </div>

                            <input
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="详细地址（街道、门牌号等）"
                                className={inputClass("street")}
                            />
                        </div>
                        <input type="hidden" name="region" value={fullAddress} />
                    </div>

                    {/* 产品需求 */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-3">产品需求</label>
                        <div className={`space-y-4 rounded-2xl p-6 ${errors.includes("product") ? "bg-red-50/60 ring-2 ring-red-200" : "bg-gradient-to-br from-gray-50 to-orange-50/40"}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-base font-medium text-gray-800">智能蒸柜</span>
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={() => setSteamerQty(Math.max(0, steamerQty - 1))} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 text-xl leading-none hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition">−</button>
                                    <span className="w-10 text-center text-xl font-semibold">{steamerQty}</span>
                                    <button type="button" onClick={() => setSteamerQty(steamerQty + 1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 text-xl leading-none hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition">+</button>
                                    <span className="text-sm text-gray-500 w-6">台</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-base font-medium text-gray-800">节能整灶</span>
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={() => setStoveQty(Math.max(0, stoveQty - 1))} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 text-xl leading-none hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition">−</button>
                                    <span className="w-10 text-center text-xl font-semibold">{stoveQty}</span>
                                    <button type="button" onClick={() => setStoveQty(stoveQty + 1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 text-xl leading-none hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition">+</button>
                                    <span className="text-sm text-gray-500 w-6">眼</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-base font-medium text-gray-800">节能炉心（只换炉心）</span>
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={() => setBurnerQty(Math.max(0, burnerQty - 1))} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 text-xl leading-none hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition">−</button>
                                    <span className="w-10 text-center text-xl font-semibold">{burnerQty}</span>
                                    <button type="button" onClick={() => setBurnerQty(burnerQty + 1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 text-xl leading-none hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition">+</button>
                                    <span className="text-sm text-gray-500 w-6">眼</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-base font-medium text-gray-800">不锈钢工作台</span>
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={() => setWorktableQty(Math.max(0, worktableQty - 1))} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 text-xl leading-none hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition">−</button>
                                    <span className="w-10 text-center text-xl font-semibold">{worktableQty}</span>
                                    <button type="button" onClick={() => setWorktableQty(worktableQty + 1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 text-xl leading-none hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition">+</button>
                                    <span className="text-sm text-gray-500 w-6">台</span>
                                </div>
                            </div>
                        </div>

                        <input type="hidden" name="steamerQty" value={steamerQty} />
                        <input type="hidden" name="stoveQty" value={stoveQty} />
                        <input type="hidden" name="burnerQty" value={burnerQty} />
                        <input type="hidden" name="worktableQty" value={worktableQty} />
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input type="checkbox" id="tradeIn" name="tradeIn" value="yes" checked={tradeInFromUrl} onChange={(e) => setTradeInFromUrl(e.target.checked)} className="w-6 h-6 rounded-md border-gray-300 text-orange-600 focus:ring-orange-500" />
                        <label htmlFor="tradeIn" className="text-base text-gray-800">
                            我有旧设备需要以旧换新（可免 6 个月租期）
                        </label>
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2.5">备注</label>
                        <textarea
                            name="note"
                            rows={4}
                            placeholder="店面情况、想租的设备、旧设备型号（如需以旧换新）等"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-lg text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/60 transition-all duration-200 resize-none"
                        />
                    </div>

                    {errors.length > 0 && (
                        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 animate-fade-in-up">
                            <p className="text-red-700 text-base font-semibold mb-1">请完善以下信息后再提交</p>
                            <p className="text-red-600 text-sm md:text-base">{errors.map((k) => fieldLabels[k]).join("、")}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 py-5 text-white font-bold text-xl hover:shadow-2xl hover:shadow-orange-600/40 active:scale-[0.98] transition-all duration-300 ease-out shadow-xl shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? "提交中..." : "立即提交申请"}
                        {!loading && <span className="transition-transform group-hover:translate-x-1">→</span>}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-8">
                    提交即表示同意我们与你联系，信息仅用于本次咨询。
                </p>
            </div>
        </div>
    );
}
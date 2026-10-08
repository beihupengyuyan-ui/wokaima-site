import Link from "next/link";
import { products } from "@/data/products";
import Reveal from "@/components/Reveal";
import ImageGallery from "@/components/ImageGallery";

// 首屏日租价格速览
const heroRates = [
    { name: "不锈钢工作台", price: "1", unit: "元 / 天", note: "¥30 / 月起 · 按米计价" },
    { name: "智能燃气蒸柜", price: "30", unit: "元 / 天", note: "¥900 / 月起 · 三门 48 盘" },
    { name: "节能炒灶", price: "7", unit: "元 / 眼 / 天", note: "¥210 / 眼 / 月起 · 现场定制" },
];

// 出租流程（全站唯一版本：首页与各详情页口径一致）
const rentSteps = [
    { no: "01", title: "提交需求", desc: "告诉我们开什么店、店面多大、要租哪些设备，1 个工作日内响应。" },
    { no: "02", title: "免费出方案", desc: "工程师评估现场，出具设备清单与每日租金明细，上门测量与报价全免。" },
    { no: "03", title: "送货安装", desc: "运输、安装、调试全部由我们承担，旧设备可同步免费拆走。" },
    { no: "04", title: "开门营业", desc: "设备进场当天就能开工，按天计费；租满 36 期设备归你，前 2 年维保全免。" },
];

// 租金里已经包含了什么（首页只讲一次，细则集中在「租期与保障」页）
const included = [
    {
        icon: "🆓",
        title: "免费试用 30 天",
        desc: "试用期内如果对效果不满意，无理由退货，运费与安装费全部由我们承担。",
    },
    {
        icon: "🚚",
        title: "送货安装全免",
        desc: "上门测量、送货、安装、调试一条龙，旧设备免费拆走，不另收搬运与辅材费。",
    },
    {
        icon: "🛠️",
        title: "维保全免 2 年",
        desc: "每 3 个月上门保养；故障 2 小时响应、24 小时解决，上门费与工时费全免。",
    },
    {
        icon: "📜",
        title: "租满 36 期归你",
        desc: "租期结束所有权自动转移给你，不用再付任何费用，设备从此是你的资产。",
    },
];

// 设备本身的两个看点（首页只做入口，内容各自成页）
const highlights = [
    {
        icon: "❄️",
        title: "清凉厨房",
        desc: "运行噪音低于 60 分贝、厨房降温约 5℃、蒸汽不外泄，夏天不用闷在灶前。",
        href: "/features/clean-kitchen",
    },
    {
        icon: "🔄",
        title: "以旧换新",
        desc: "旧蒸柜、旧灶具交给我们回收，直接抵掉 6 个月租金（约 5,400 元），拆旧装新全免费。",
        href: "/trade-in",
    },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* 首屏 */}
            <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/80 via-white to-white">
                <div className="geo-blur w-[720px] h-[720px] -top-72 -left-72" />
                <div className="geo-blur-soft w-[640px] h-[640px] -top-56 -right-56" />
                <div className="geo-grid" />

                <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-28 md:pt-36 md:pb-40 text-center">
                    <p className="inline-block rounded-full border border-orange-200 bg-white/80 px-6 py-2.5 text-xs md:text-sm text-orange-600 font-semibold tracking-[0.28em] uppercase animate-fade-in-up">
                        WOKAIMA
                        <span className="ml-2 tracking-[0.08em]">· 商用厨具出租</span>
                    </p>

                    <h1 className="mt-10 md:mt-12 text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-[1.18] animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        开店不必重资产
                        <br />
                        <span className="text-gradient-warm">厨具按天租</span>
                    </h1>

                    <p className="mt-10 md:mt-12 text-lg md:text-2xl text-gray-500 max-w-3xl mx-auto leading-[1.8] animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        整店厨具按天出租，租金里含送货、安装与前 2 年维保。
                        <br className="hidden md:block" />
                        不用一次性掏几十万，租满 36 期，设备直接归你。
                    </p>

                    <div className="mt-14 md:mt-16 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                        <Link
                            href="/apply"
                            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-9 py-4 text-lg font-semibold text-white shadow-xl shadow-orange-600/30 hover:shadow-2xl hover:shadow-orange-600/40 active:scale-[0.97] transition duration-150"
                        >
                            免费领取出租方案
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </Link>
                        <Link
                            href="#rent"
                            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white/70 px-9 py-4 text-lg font-semibold text-gray-900 transition-colors duration-150 hover:border-orange-300 hover:text-orange-600"
                        >
                            查看租金价目
                        </Link>
                    </div>

                    {/* 日租速览 */}
                    <div className="mt-20 md:mt-28 grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                        {heroRates.map((r) => (
                            <div
                                key={r.name}
                                className="rounded-[1.75rem] border border-orange-100 bg-white/80 backdrop-blur px-7 py-8 text-left shadow-[0_16px_50px_rgba(249,115,22,0.08)]"
                            >
                                <p className="text-sm text-gray-500">{r.name}</p>
                                <p className="mt-4 flex items-baseline gap-1.5">
                                    <span className="text-4xl md:text-5xl font-bold text-orange-600">{r.price}</span>
                                    <span className="text-sm text-gray-500">{r.unit}</span>
                                </p>
                                <p className="mt-3 text-xs text-gray-500">{r.note}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </section>

            {/* 省钱测算 + 成本对比：省下来的能耗，就是你付的租金 */}
            <section className="relative overflow-hidden bg-gray-950 text-white py-32 md:py-52">
                <div className="geo-grid-dark" />
                <div className="geo-blur-soft w-[560px] h-[560px] -bottom-48 -left-40 opacity-50" />

                <div className="relative z-10 max-w-6xl mx-auto px-6">
                    <Reveal>
                        <p className="text-xs md:text-sm text-orange-500 font-semibold tracking-[0.3em] uppercase mb-6">
                            COST &amp; SAVING
                        </p>
                        <h2 className="text-3xl md:text-6xl font-bold leading-[1.15] max-w-3xl">
                            省下来的能耗，
                            <br />
                            就是你付的租金
                        </h2>
                        <p className="mt-8 md:mt-10 text-lg md:text-xl text-gray-400 leading-[1.9] max-w-2xl">
                            同样一台三门蒸柜，一台要一次性买断，一台可以按天租。
                            差别不只是怎么付钱，更在于每个月烧掉多少燃气。
                        </p>
                    </Reveal>

                    {/* 三个数字，每个都带自己的计算口径 */}
                    <div className="mt-20 md:mt-28 grid md:grid-cols-3 gap-14 md:gap-12">
                        <Reveal>
                            <div>
                                <p className="text-6xl md:text-8xl font-bold leading-none text-orange-500">
                                    67<span className="text-4xl md:text-5xl">%</span>
                                </p>
                                <p className="mt-8 text-xl font-semibold">综合节能</p>
                                <p className="mt-4 text-base leading-[1.9] text-gray-400">
                                    全预混低氮燃烧 + 蒸汽循环回收，热效率 95% 以上；每小时耗气 1.7 方，传统蒸柜是 5.2 方。
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <div>
                                <p className="text-6xl md:text-8xl font-bold leading-none text-orange-500">
                                    <span className="text-4xl md:text-5xl">¥</span>3,360
                                </p>
                                <p className="mt-8 text-xl font-semibold">每月省下</p>
                                <p className="mt-4 text-base leading-[1.9] text-gray-400">
                                    按每天运行 8 小时、气价 4 元/方算：每小时省气 3.5 方，每天省 112 元，一个月 3,360 元。
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <div>
                                <p className="text-6xl md:text-8xl font-bold leading-none text-orange-500">
                                    6.5<span className="text-4xl md:text-5xl">个月</span>
                                </p>
                                <p className="mt-8 text-xl font-semibold">收回设备差价</p>
                                <p className="mt-4 text-base leading-[1.9] text-gray-400">
                                    比一台普通蒸柜多花的 22,000 元，靠省下的燃气费 6.5 个月收回；5 年累计省 20 万以上。
                                </p>
                            </div>
                        </Reveal>
                    </div>

                    {/* 对比口径：这一屏的金额都是「一台三门蒸柜」的量级，别被误读成整套厨房。
                        这里用胶囊标签（与「推荐」角标同一套深色区语言）+ 淡灰说明，
                        尺寸提到正文级，显眼但不抢下方数字的注意力 */}
                    <Reveal delay={0.08}>
                        <div className="mt-20 flex flex-wrap items-center gap-x-4 gap-y-3 md:mt-28">
                            <span className="inline-flex items-center gap-2.5 rounded-full border border-orange-400/40 bg-orange-500/10 px-5 py-2.5 text-sm font-semibold text-orange-200 md:px-6 md:text-base">
                                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                                以一台三门蒸柜为例
                            </span>
                            <span className="text-sm text-gray-400 md:text-base">整店配齐只是数量级更大</span>
                        </div>
                    </Reveal>

                    <div className="mt-10 grid md:grid-cols-2 gap-8 md:gap-12 md:mt-12">
                        <Reveal>
                            <div className="h-full rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 md:p-12">
                                <p className="text-sm text-gray-500 tracking-[0.1em] uppercase">一次性买断</p>
                                <p className="mt-6 flex items-baseline gap-3">
                                    <span className="text-5xl md:text-7xl font-bold text-gray-500">¥29,800</span>
                                    <span className="text-base text-gray-500">一次性</span>
                                </p>
                                <ul className="mt-7 space-y-3 text-base text-gray-400 leading-[1.9]">
                                    <li>开业前一次性付清，现金流被固定资产占住。</li>
                                    <li>折旧、故障、更新换代的风险，全部自己承担。</li>
                                    <li>设备坏了自己找师傅，停业的损失也算自己的。</li>
                                </ul>
                            </div>
                        </Reveal>

                        <Reveal delay={0.12}>
                            <div className="relative h-full overflow-hidden rounded-[2rem] border border-orange-500/40 bg-gradient-to-br from-orange-600/25 to-amber-500/5 p-10 md:p-12">
                                <span className="absolute right-8 top-8 rounded-full border border-orange-400/40 px-4 py-1 text-xs font-semibold text-orange-300">
                                    推荐
                                </span>
                                <p className="text-sm text-orange-400 tracking-[0.1em] uppercase">沃凯玛 · 按天出租</p>
                                <p className="mt-6 flex items-baseline gap-3">
                                    <span className="text-5xl md:text-7xl font-bold text-white">¥900</span>
                                    <span className="text-base text-orange-200">/ 月（30 元 / 天）</span>
                                </p>
                                <ul className="mt-7 space-y-3 text-base text-orange-100/80 leading-[1.9]">
                                    <li>按天或按月付费，用营业赚来的钱付设备。</li>
                                    <li>设备折旧与故障风险由我们承担，坏了我们上门修。</li>
                                    <li>36 期期满，所有权自动转移给你，设备从此是你的资产。</li>
                                </ul>
                            </div>
                        </Reveal>
                    </div>

                    {/* 总账：把两个口径拉到同一张表上 */}
                    <Reveal delay={0.18}>
                        <dl className="mt-8 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 md:grid-cols-3">
                            <div className="bg-gray-950 p-8 md:p-10">
                                <dt className="text-sm text-gray-500">首期支出</dt>
                                <dd className="mt-4 text-3xl font-bold text-white md:text-4xl">¥900</dd>
                                <p className="mt-3 text-sm leading-[1.8] text-gray-400">
                                    一台三门蒸柜买断要一次性付清 ¥29,800，出租只是它的 3%。
                                </p>
                            </div>
                            <div className="bg-gray-950 p-8 md:p-10">
                                <dt className="text-sm text-gray-500">36 期总支出</dt>
                                <dd className="mt-4 text-3xl font-bold text-white md:text-4xl">¥32,400</dd>
                                <p className="mt-3 text-sm leading-[1.8] text-gray-400">
                                    比买断多付 ¥2,600，换来前 2 年维保全免、30 天免费试用与上门服务。
                                </p>
                            </div>
                            <div className="bg-gray-950 p-8 md:p-10">
                                <dt className="text-sm text-gray-500">同期省下燃气费</dt>
                                <dd className="mt-4 text-3xl font-bold text-orange-500 md:text-4xl">¥120,960</dd>
                                <p className="mt-3 text-sm leading-[1.8] text-gray-400">
                                    每月 ¥3,360 × 36 期，是全部租金的 3.7 倍。
                                </p>
                            </div>
                        </dl>
                        <p className="mt-8 text-base leading-[1.9] text-gray-400">
                            以上是一台三门蒸柜的账。整店配齐动辄几十万，逻辑一样、只是数量级更大：
                            首期不用掏几十万，按天计费，租满 36 期设备照样归你。
                        </p>
                    </Reveal>

                    <Reveal delay={0.3}>
                        <div className="mt-20 md:mt-24">
                            <Link
                                href="/apply"
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-9 py-4 text-lg font-semibold text-white transition-colors duration-150 hover:bg-white/10"
                            >
                                算一算我能省多少 →
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 租金价目表 */}
            <section id="rent" className="relative bg-white py-32 md:py-52 scroll-mt-20 md:scroll-mt-24">
                <div className="max-w-6xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center">
                            <p className="text-xs md:text-sm text-orange-600 font-semibold tracking-[0.3em] uppercase mb-6">
                                PRICE LIST
                            </p>
                            <h2 className="text-3xl md:text-6xl font-bold text-gray-900 leading-[1.15]">
                                租金价目表
                            </h2>
                            <p className="mt-8 md:mt-10 text-lg md:text-xl text-gray-500 leading-[1.9] max-w-2xl mx-auto">
                                三个品类按天计价，租期都是 36 个月，租满归你。
                                租金里已含送货、安装与前 2 年维保，不用另外掏钱。
                            </p>
                        </div>
                    </Reveal>

                    {/* 三个产品三列等宽：图片 + 日租 + 月租 + 租期。这是全站唯一的产品与价格列表 */}
                    <div className="mt-20 md:mt-28 grid gap-6 md:grid-cols-3 md:gap-8">
                        {products.map((p, i) => (
                            <Reveal key={p.slug} delay={0.05 + i * 0.08}>
                                <Link
                                    href={`/products/${p.slug}`}
                                    className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white card-lift hover:border-orange-200"
                                >
                                    <div className="flex h-52 items-center justify-center bg-gradient-to-b from-orange-50/60 to-white p-6 md:h-56">
                                        {p.images.length > 0 ? (
                                            <img
                                                src={p.images[0]}
                                                alt={p.name}
                                                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-400">图片整理中</span>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col p-8 md:p-9">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-600 md:text-2xl">
                                                {p.name}
                                            </h3>
                                            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                                                {p.category}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-base text-gray-500">{p.tagline}</p>

                                        <div className="mt-7 flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-orange-600 md:text-5xl">
                                                {p.dailyRent}
                                            </span>
                                            <span className="text-sm text-gray-500">{p.dailyRentUnit}</span>
                                        </div>
                                        <p className="mt-3 pb-7 text-sm text-gray-500">
                                            约 ¥{p.monthlyRent}
                                            {p.priceUnit} · 租期 {p.leaseTerm}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-6 text-sm">
                                            <span className="text-gray-500">租满归你</span>
                                            <span className="font-medium text-orange-600 transition-transform group-hover:translate-x-1">
                                                查看详情 →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={0.2}>
                        <div className="mt-16 text-center">
                            <p className="text-sm text-gray-500 md:text-base">
                                以上为参考价，按台 / 按眼计价；整店配齐按设备清单合计 · 免费上门测量、免费出报价
                            </p>
                            <Link
                                href="/products"
                                className="mt-8 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-9 py-4 text-lg font-semibold text-gray-900 transition-colors duration-150 hover:border-orange-300 hover:text-orange-600"
                            >
                                查看完整参数与计价方式 →
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 出租流程：四步。每张卡都有悬浮反馈（上浮 + 暖色描边 + 标题变色） */}
            <section className="relative bg-gray-50 py-32 md:py-52">
                <div className="max-w-6xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center">
                            <p className="text-xs md:text-sm text-orange-600 font-semibold tracking-[0.3em] uppercase mb-6">
                                HOW IT WORKS
                            </p>
                            <h2 className="text-3xl md:text-6xl font-bold text-gray-900 leading-[1.15]">
                                租一台设备，只要四步
                            </h2>
                            <p className="mt-8 md:mt-10 text-lg md:text-xl text-gray-500 leading-[1.9] max-w-2xl mx-auto">
                                从提交需求到开门营业，最快 3 天。
                            </p>
                        </div>
                    </Reveal>

                    <div className="mt-20 md:mt-28 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {rentSteps.map((s, i) => (
                            <Reveal key={s.no} delay={0.08 * i} className="h-full">
                                <div className="group flex h-full flex-col rounded-[2rem] border border-gray-100 bg-white p-9 md:p-10 card-lift hover:border-orange-200">
                                    <span className="text-sm font-bold tracking-[0.3em] text-orange-500 transition-colors duration-300 group-hover:text-orange-600">
                                        {s.no}
                                    </span>
                                    <h3 className="mt-6 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-orange-600">
                                        {s.title}
                                    </h3>
                                    <p className="mt-4 text-sm text-gray-500 leading-[1.9]">{s.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* 租金里已经包含了这些 */}
            <section className="relative overflow-hidden bg-orange-50/70 py-32 md:py-52">
                <div className="max-w-6xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center">
                            <p className="text-xs md:text-sm text-orange-600 font-semibold tracking-[0.3em] uppercase mb-6">
                                WHAT&apos;S INCLUDED
                            </p>
                            <h2 className="text-3xl md:text-6xl font-bold text-gray-900 leading-[1.15]">
                                租金里，已经包含了这些
                            </h2>
                            <p className="mt-8 md:mt-10 text-lg md:text-xl text-gray-500 leading-[1.9] max-w-3xl mx-auto">
                                你付的是设备租金，搬运、安装与前 2 年的保养维修都不用另外掏钱。
                            </p>
                        </div>
                    </Reveal>

                    <div className="mt-20 md:mt-28 grid gap-6 md:grid-cols-2 md:gap-8">
                        {included.map((item, i) => (
                            <Reveal key={item.title} delay={0.06 * i}>
                                <div className="flex h-full items-start gap-6 rounded-[2rem] border border-orange-100 bg-white p-8 md:p-10 card-lift">
                                    <span className="text-4xl md:text-5xl">{item.icon}</span>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 md:text-2xl">{item.title}</h3>
                                        <p className="mt-3 text-base text-gray-500 leading-[1.9]">{item.desc}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* 设备本身：清凉厨房 / 以旧换新（两个入口，内容各自成页） */}
            <section className="bg-white py-32 md:py-52">
                <div className="max-w-6xl mx-auto px-6">
                    <Reveal>
                        <p className="text-xs md:text-sm text-orange-600 font-semibold tracking-[0.3em] uppercase mb-6">
                            MORE ABOUT THE EQUIPMENT
                        </p>
                        <h2 className="text-3xl md:text-6xl font-bold text-gray-900 leading-[1.15]">
                            设备本身，也值得挑一挑
                        </h2>
                        <p className="mt-8 md:mt-10 text-lg md:text-xl text-gray-500 leading-[1.9] max-w-2xl">
                            沃凯玛自己造设备，所以既能把机器做凉快，也敢让你拿旧机器来抵租金。
                        </p>
                    </Reveal>

                    <div className="mt-20 md:mt-28 grid md:grid-cols-2 gap-8 md:gap-10">
                        {highlights.map((item, i) => (
                            <Reveal key={item.title} delay={0.08 * i}>
                                <Link href={item.href} className="group block h-full">
                                    <div className="flex h-56 items-center justify-center rounded-[2rem] bg-gradient-to-br from-orange-50 to-white text-7xl transition duration-200 group-hover:scale-[1.03] group-hover:shadow-[0_30px_80px_rgba(249,115,22,0.18)] md:h-64">
                                        {item.icon}
                                    </div>
                                    <h3 className="mt-10 text-2xl font-bold text-gray-900 transition-colors group-hover:text-orange-600">
                                        {item.title}
                                    </h3>
                                    <p className="mt-4 text-base text-gray-500 leading-[1.9]">{item.desc}</p>
                                    <p className="mt-6 inline-block text-sm font-medium text-orange-600 transition-transform group-hover:translate-x-1">
                                        了解详情 →
                                    </p>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* 资质与服务客户：合并成一屏，资质只做概述，整段留给荣誉页 */}
            <section className="bg-gray-50 py-32 md:py-52">
                <div className="max-w-5xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center">
                            <p className="text-xs md:text-sm text-orange-600 font-semibold tracking-[0.4em] uppercase mb-6">
                                CERTIFICATION &amp; CUSTOMERS
                            </p>
                            <h2 className="text-3xl md:text-6xl font-bold text-gray-900 leading-[1.15]">
                                认证齐全，客户遍布全国
                            </h2>
                            <p className="mt-8 md:mt-10 text-lg md:text-xl text-gray-500 leading-[1.9] max-w-3xl mx-auto">
                                设备通过国家 3C 认证、符合 GB 35848 新国标，另有多项实用新型专利，
                                出租的设备同样享受原厂质保。从星级酒店到连锁餐饮，从院校到企事业单位，
                                我们服务过的客户遍布全国。
                            </p>
                            <Link
                                href="/honors"
                                className="mt-10 inline-block text-lg font-semibold text-orange-600 transition-transform hover:translate-x-1"
                            >
                                查看企业荣誉 →
                            </Link>
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="mt-20 md:mt-28">
                            <ImageGallery
                                images={["/images/cases/partners.png"]}
                                productName="沃凯玛工程案例"
                                fullWidth
                            />
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* 自有工厂：全站只有这里讲工厂与厂址，替换掉原本零信息量的品牌口号 */}
            <section className="bg-white py-32 md:py-52">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <Reveal>
                        <p className="text-xs md:text-sm text-orange-600 font-semibold tracking-[0.4em] uppercase mb-6">
                            WHO WE ARE
                        </p>
                        <h2 className="text-3xl md:text-6xl font-bold text-gray-900 leading-[1.15]">
                            厂家直租，不经中间商
                        </h2>
                        <p className="mt-8 md:mt-10 text-lg md:text-xl text-gray-500 leading-[1.9] max-w-3xl mx-auto">
                            设备由广汉沃凯玛厨房设备制造有限公司自行生产，厂址在四川省德阳市广汉市深圳路西三段 2 号。
                            自己造的机器，才敢让你先试 30 天，也才修得起、换得动、租得久。
                        </p>
                        <img
                            src="/images/brand/ip-banner.png"
                            alt="沃凯玛品牌形象"
                            className="mx-auto mt-16 w-full max-w-3xl"
                        />
                    </Reveal>
                </div>
            </section>

            {/* 底部 CTA */}
            <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-amber-500 py-32 text-white md:py-52">
                <div className="geo-grid-dark" />
                <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                    <Reveal>
                        <h2 className="text-4xl font-bold leading-[1.15] md:text-7xl">
                            先拿方案，再决定
                        </h2>
                        <p className="mt-8 text-lg leading-[1.9] text-orange-50/95 md:mt-10 md:text-2xl">
                            说说你的店面情况，1 个工作日内给你一份带明细的出租方案：
                            <br className="hidden md:block" />
                            设备清单、每日租金、上门测量全免，签不签都没关系。
                        </p>
                        <div className="mt-14 flex flex-col justify-center gap-4 md:mt-16 sm:flex-row">
                            <Link
                                href="/apply"
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-4 text-lg font-semibold text-orange-600 shadow-xl transition duration-150 hover:bg-orange-50 active:scale-[0.97]"
                            >
                                免费领取出租方案
                                <span className="transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center rounded-full border border-white/60 px-10 py-4 text-lg font-semibold text-white transition-colors duration-150 hover:bg-white/10"
                            >
                                查看租金价目
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    );
}

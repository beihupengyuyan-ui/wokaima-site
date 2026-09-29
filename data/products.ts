export type Product = {
    slug: string;
    name: string;
    category: "蒸柜" | "炉头" | "整灶";
    tagline: string;
    monthlyRent: number;
    leaseTerm: string;
    priceUnit: string;
    specs: Record<string, string>;
    features: string[];
    energySaving: { label: string; value: string }[];
    economy: { label: string; value: string }[];
    images: string[];
};

export const products: Product[] = [
    {
        slug: "smart-steamer-3door",
        name: "沃凯玛智能燃气三门蒸柜",
        category: "蒸柜",
        tagline: "热效率 95% 以上，综合节能 67%",
        monthlyRent: 900,
        priceUnit: "/ 月",
        leaseTerm: "36个月",
        specs: {
            电压: "220V",
            功率: "36KW",
            规格: "1550×1050×1850",
            盘数: "48盘",
            重量: "280KG",
            认证: "3C / GB 35848",
            内胆: "食品级 304 不锈钢",
        },
        features: [
            "全预混低氮燃烧，NOx < 30mg/m³",
            "9档变频控温，48kW 智能降至 12kW",
            "蒸汽循环回收 + 尾气余热回收",
            "干蒸汽锁鲜：蒸鱼 6 分钟、米饭 25 分钟",
            "运行噪音低于 60 分贝",
            "厨房环境温度降低约 5℃",
            "蒸汽密闭不外泄，降低厨房湿度",
        ],
        energySaving: [
            { label: "每小时省气", value: "3.5 方" },
            { label: "每日省", value: "¥112" },
            { label: "每月省", value: "¥3,360" },
            { label: "回收周期", value: "6.5 个月" },
            { label: "5 年累计省", value: "20 万+" },
        ],
        economy: [
            { label: "传统蒸柜采购", value: "¥7,800" },
            { label: "沃凯玛采购", value: "¥29,800" },
            { label: "传统耗气", value: "5.2 方/小时" },
            { label: "沃凯玛耗气", value: "1.7 方/小时" },
        ],
        images: ["/images/products/steamer-d3.png"],
    },
    {
        slug: "energy-wok-range",
        name: "节能炒灶",
        category: "整灶",
        tagline: "按灶眼计价，整灶定制或只换炉心",
        monthlyRent: 210,
        priceUnit: "/ 眼 / 月",
        leaseTerm: "36个月",


        specs: {
            计价方式: "按灶眼",
            灶眼数量: "单眼 / 双眼 / 三眼",
            尺寸: "1米 / 1.2米 / 1.8米 / 2米",
            水沟: "单水沟 / 双水沟",
            定制: "根据现场尺寸定制",
        },
        features: [
            "整灶定制：7 元/眼/天，210 元/眼/月",
            "只换炉心：5 元/眼/天，150 元/眼/月",
            "保留原灶，只换内部炉心，改造成本更低",
            "单眼、双眼、三眼均可定制",
            "宽度可选 1米 / 1.2米 / 1.8米 / 2米",
            "可选单水沟或双水沟",
            "租满三年买断",
        ],
        energySaving: [],
        economy: [
            { label: "整灶定制", value: "7 元/眼/天" },
            { label: "只换炉心", value: "5 元/眼/天" },
            { label: "整灶月租", value: "210 元/眼/月" },
            { label: "炉心月租", value: "150 元/眼/月" },
        ],
        images: [
            "/images/products/wok-range-flame.png",
            "/images/products/wok-range-detail.png",
        ],
    },
];

export function getProductBySlug(slug: string) {
    return products.find((p) => p.slug === slug);
}
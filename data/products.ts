export type Product = {
    slug: string;
    name: string;
    category: "蒸柜" | "炉头" | "整灶";
    tagline: string;
    monthlyRent: number;
    leaseTerm: string;
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
        slug: "energy-burner-single",
        name: "单眼节能炉头",
        category: "炉头",
        tagline: "热效率提升 30% 以上",
        monthlyRent: 900,
        leaseTerm: "36个月",
        specs: {
            类型: "单眼",
            控制: "独立控制",
        },
        features: [
            "热效率提升 30% 以上",
            "单眼独立控制，火力猛且省气",
            "灵活适配各类灶台布局",
        ],
        energySaving: [],
        economy: [],
        images: ["/images/burner-single.webp"],
    },
    {
        slug: "energy-stove-single",
        name: "节能整灶单眼",
        category: "整灶",
        tagline: "综合节能率高达 40%",
        monthlyRent: 900,
        leaseTerm: "36个月",
        specs: {
            类型: "单眼",
            设计: "烟灶一体化",
            技术: "聚能环加热",
        },
        features: [
            "烟灶一体化专业设计",
            "聚能环加热技术",
            "综合节能率高达 40%",
        ],
        energySaving: [],
        economy: [],
        images: ["/images/stove-single.webp"],
    },
];

export function getProductBySlug(slug: string) {
    return products.find((p) => p.slug === slug);
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 只作为拉丁字母/数字字面，汉字由 globals.css 的字体栈补齐，因此导出 CSS 变量而不是 className
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "沃凯玛 | 厨具出租 · 轻松开店",
    description:
        "商用厨房设备按天出租：工作台 1 元/天起，蒸柜 30 元/天起，炒灶 7 元/眼/天起。租期统一 36 个月，租金含送货、安装与前 2 年维保；30 天不满意可退，租满设备归你。",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN" className={inter.variable}>
        <body className="min-h-screen bg-white text-gray-900">
        {children}
        </body>
        </html>
    );
}
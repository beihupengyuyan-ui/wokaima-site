import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "沃凯玛 | 清凉厨房 · 以租代售",
    description: "商用蒸柜/厨灶，每天30元，三年租期，租满归你。清凉厨房，以旧换新。",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
        <body className={`${inter.className} min-h-screen bg-white text-gray-900`}>
        {children}
        </body>
        </html>
    );
}
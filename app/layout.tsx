import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
        <nav className="fixed top-0 w-full bg-white/90 backdrop-blur border-b z-50">
            <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
                <Link href="/" className="font-bold text-orange-600">
                    沃凯玛 WOKAIMA
                </Link>
                <div className="flex gap-4 text-sm">
                    <Link href="/products">产品</Link>
                    <Link href="/trade-in">以旧换新</Link>
                    <Link href="/partners">渠道合作</Link>
                    <Link href="/apply" className="text-orange-600 font-semibold">
                        立即申请
                    </Link>
                </div>
            </div>
        </nav>
        <main className="pt-14">{children}</main>
        <footer className="bg-gray-100 text-center text-sm text-gray-500 py-8 mt-20">
            <p>广汉沃凯玛厨房设备制造有限公司</p>
            <p>四川省德阳市广汉市深圳路西三段2号 · 13880788802</p>
        </footer>
        </body>
        </html>
    );
}
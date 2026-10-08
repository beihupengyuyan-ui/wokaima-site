import { cookies } from "next/headers";
import AdminNav from "@/components/AdminNav";
import { cancelStats } from "@/lib/leads";

/**
 * 后台外壳：未登录时只渲染 children（登录页 /admin 自己就是一张卡片），
 * 登录后才套上「一级导航 + 退出登录」的框架 —— 这样概览、线索、客户取消三个模块共用一套导航，
 * 不再各页自己写标题栏（原先只有 leads 子树有，客户取消模块压根没有入口）。
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const authed = cookieStore.get("admin_auth")?.value === "1";

    if (!authed) return <>{children}</>;

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <AdminNav cancelPending={cancelStats().pending} />
                    <a
                        href="/api/admin/logout"
                        className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                    >
                        退出登录
                    </a>
                </div>
                {children}
            </div>
        </div>
    );
}

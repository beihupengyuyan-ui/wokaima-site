import Link from "next/link";

export default function LeadsLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                            客户线索
                        </h1>
                    </div>
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
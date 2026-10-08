/**
 * 线索模块的标题 + 说明（页面框架、导航、退出登录都在 app/(admin)/admin/layout.tsx）。
 * 这里刻意写清「取消的线索不在本模块」：客户取消的申请统一收进 /admin/cancellations，
 * 免得工程师在这三个页签里找不到那笔单，又以为数据丢了。
 */
export default function LeadsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">客户线索</h1>
                <p className="mt-2 text-sm text-gray-500">
                    待处理 / 处理中 / 已完成 三个页签都是「还在跟」的线索。客户已取消的申请不在
                    这里，统一收进「客户取消订单」，处理完才算闭环。
                </p>
            </div>
            {children}
        </>
    );
}

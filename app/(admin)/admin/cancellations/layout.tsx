/**
 * 「客户取消订单」模块（/admin/cancellations）的标题 + 说明。
 * 抽成独立模块的原因写在 AdminNav 里：取消不是一种「进度」，它是需要有人负责的待办。
 */
export default function CancellationsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    客户取消订单
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">
                    客户（官网 / 小程序）自己撤掉的申请，以及后台自己标记放弃的线索。每张单都要有人过一遍：
                    能挽回就把订单复活，不能挽回也要把处理结果与原因记下来 ——
                    取消原因分布是选品、报价和话术最便宜的反馈。
                </p>
            </div>
            {children}
        </>
    );
}

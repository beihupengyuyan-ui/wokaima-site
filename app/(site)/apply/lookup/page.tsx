import OrderLookup from "./OrderLookup";

/**
 * /apply/lookup 外壳：我的申请（查进度 + 自助取消）。
 *
 * 和 /apply 一样，客户端组件只用 useEffect 读 localStorage 回填手机号 / 姓名，
 * 不用 useSearchParams —— 整页仍会被预渲染成静态 HTML，水合后一帧内完成回填。
 */
export default function ApplyLookupPage() {
    return <OrderLookup />;
}

import ApplyForm from "./ApplyForm";

/**
 * /apply 外壳。
 *
 * 表单本身是客户端组件，但只用 useEffect 读 URL 参数（不用 useSearchParams），
 * 所以这里不需要 Suspense 边界，整页仍然会被预渲染成静态 HTML ——
 * 既保留 SEO 与首屏速度，又能支持 /apply?tradeIn=yes 与 /apply?product=<slug> 的预填。
 */
export default function ApplyPage() {
    return <ApplyForm />;
}

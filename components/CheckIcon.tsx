/**
 * 气泡（chips）选中用的勾号，全站共用一套。
 *
 * 约定：**常驻渲染，不靠选中态显隐。** 未选中是浅灰，选中时跟随当前文字色
 * （红底上是白色、橙底上是白色、悬停时是橙红字）。
 *
 * 为什么不用「选中才出现勾」或「✓ 文字前缀」：那会让气泡在选中瞬间变宽，
 * 同一排的气泡整体位移 —— 手正要点第二下时目标就跑了，
 * 体感上就是「点了之后没法取消」。宽度恒定是这里唯一的硬要求。
 */
export default function CheckIcon({ on }: { on: boolean }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={`h-3 w-3 flex-shrink-0 ${on ? "" : "text-gray-300"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 8.5l3.2 3L13 4.5" />
        </svg>
    );
}

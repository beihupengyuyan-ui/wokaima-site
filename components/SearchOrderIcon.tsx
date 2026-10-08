/**
 * 顶部导航「查询申请」入口用的放大镜，与 CheckIcon 同一套写法（currentColor + aria-hidden）。
 *
 * 为什么要图标：md（768px）这一档 LOGO + 四项导航 + 主按钮只剩约 60px 余量，
 * 塞不下「查询申请」四个字（text-sm 要 56px 还不含间隙），所以 lg 以下只留图标 + aria-label，
 * lg 以上（≥1024px，余量 250px+）才配上文字。图标与文字联动，见 app/(site)/layout.tsx。
 */
export default function SearchOrderIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-5 w-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="8.75" cy="8.75" r="5.75" />
            <path d="M13.2 13.2 17 17" />
        </svg>
    );
}

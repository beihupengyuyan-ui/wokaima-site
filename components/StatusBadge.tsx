export default function StatusBadge({ status }: { status: string }) {
    const normalized =
        status === "pending" || status === "new"
            ? "pending"
            : status === "processing" || status === "contacted"
                ? "processing"
                : "done";

    if (normalized === "pending") {
        return (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
        </span>
        待处理
      </span>
        );
    }

    if (normalized === "processing") {
        return (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-blue-600" />
        处理中
      </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
      <span className="w-3.5 h-3.5 rounded-full bg-green-600 flex items-center justify-center">
        <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
          />
        </svg>
      </span>
      已完成
    </span>
    );
}
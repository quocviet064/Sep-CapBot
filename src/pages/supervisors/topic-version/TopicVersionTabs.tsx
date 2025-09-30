import { useMemo } from "react";
import { Skeleton } from "@/components/globals/atoms/skeleton";
import { useTopicVersionHistory } from "@/hooks/useTopicVersion";

type Props = {
  topicId: number;
  onOpenVersion: (versionId: number) => void;
  onOpenCurrent?: () => void;
  activeVersionId?: number | null;
  className?: string;
  showCurrentButton?: boolean;
};

export default function VersionTabs({
  topicId,
  onOpenVersion,
  onOpenCurrent,
  activeVersionId = null,
  className,
  showCurrentButton = true,
}: Props) {
  const { data, isLoading, error } = useTopicVersionHistory(topicId, 1, 50);

  const items = useMemo(() => {
    const list = (data?.listObjects ?? []).slice();
    list.sort((a, b) => (a.versionNumber ?? 0) - (b.versionNumber ?? 0));
    return list;
  }, [data]);

  const isCurrentActive =
    activeVersionId === null || typeof activeVersionId === "undefined";

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto ${className || ""}`}
    >
      {showCurrentButton && (
        <button
          onClick={() => onOpenCurrent?.()}
          className={[
            "rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-neutral-50",
            isCurrentActive ? "font-semibold" : "",
          ].join(" ")}
          title="Trang chi tiết hiện tại"
        >
          Phiên bản gốc
        </button>
      )}

      {isLoading ? (
        <>
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </>
      ) : error ? (
        <span className="text-xs text-red-600">Lỗi tải lịch sử</span>
      ) : (
        items.map((v) => {
          const active = activeVersionId === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onOpenVersion(v.id)}
              className={[
                "rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-neutral-50",
                active ? "font-semibold" : "",
              ].join(" ")}
              title={v.title}
            >
              Phiên bản {v.versionNumber}
            </button>
          );
        })
      )}
    </div>
  );
}

import { useMemo } from "react";
import { Skeleton } from "@/components/globals/atoms/skeleton";
import { useTopicVersionHistory } from "@/hooks/useTopicVersion";

type Props = {
  topicId: number;
  onOpenVersion: (versionId: number) => void;
  className?: string;
};

export default function VersionTabs({
  topicId,
  onOpenVersion,
  className,
}: Props) {
  const { data, isLoading, error } = useTopicVersionHistory(topicId, 1, 50);

  const items = useMemo(
    () =>
      (data?.listObjects ?? [])
        .slice()
        .sort((a, b) => b.versionNumber - a.versionNumber),
    [data],
  );

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto ${className || ""}`}
    >
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </>
      ) : error ? (
        <span className="text-xs text-red-600">Lỗi tải lịch sử</span>
      ) : (
        items.map((v) => (
          <button
            key={v.id}
            onClick={() => onOpenVersion(v.id)}
            className="rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
            title={v.title}
          >
            v{v.versionNumber}
          </button>
        ))
      )}
    </div>
  );
}

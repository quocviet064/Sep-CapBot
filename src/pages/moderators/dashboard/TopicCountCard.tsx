import React, { useMemo } from "react";

type Props = {
  submissions: any[];
  detailsById?: Record<string, any>;
  loading?: boolean;
};

export default function TopicCountCard({ submissions = [], detailsById = {}, loading }: Props) {
  const total = submissions.length;

  // You could compute unique topic count if topicId available
  const topicCount = useMemo(() => {
    const set = new Set<string | number>();
    submissions.forEach((s: any) => {
      if (s.topicId != null) set.add(String(s.topicId));
      else if ((detailsById[String(s.id)] as any)?.topicId != null) set.add(String((detailsById[String(s.id)] as any).topicId));
    });
    return set.size;
  }, [submissions, detailsById]);

  return (
    <div className="rounded border p-4">
      <div className="text-sm font-semibold">Tổng submissions</div>
      <div className="mt-2 flex items-baseline gap-4">
        <div className="text-3xl font-bold">{loading ? "..." : total}</div>
        <div className="text-sm text-muted-foreground">Topics: {topicCount}</div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">Dữ liệu list có thể thiếu AI check (chi tiết top {Math.min(submissions.length, 40)} đã fetch)</div>
    </div>
  );
}

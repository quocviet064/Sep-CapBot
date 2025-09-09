import { useMemo } from "react";
import { useAllSubmissions } from "@/hooks/useSubmission";

function StatCard({
  label,
  value,
  muted,
}: { label: string; value: number | string; muted?: string }) {
  return (
    <div className="rounded-xl border bg-white/70 p-4 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {muted ? <div className="text-[11px] text-gray-400 mt-1">{muted}</div> : null}
    </div>
  );
}

export default function TabOverview() {
  const { data, isLoading, error } = useAllSubmissions({
    PageSize: 100,
    MaxPages: 10,
  });

  const stats = useMemo(() => {
    const list = data ?? [];
    const total = list.length;
    const byStatus: Record<string, number> = {};
    let rounds = 0;
    for (const s of list) {
      const k = (s.status || "Unknown").toString();
      byStatus[k] = (byStatus[k] ?? 0) + 1;
      rounds += Number(s.submissionRound ?? 0);
    }
    return {
      total,
      avgRound: total ? (rounds / total).toFixed(2) : "0.00",
      byStatus,
    };
  }, [data]);

  if (isLoading) return <div className="text-sm text-gray-500">Đang tải số liệu…</div>;
  if (error) return <div className="text-red-600">Lỗi tải: {error.message}</div>;

  const statusEntries = Object.entries(stats.byStatus);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tổng submission" value={stats.total} />
        <StatCard label="Trung bình vòng nộp" value={stats.avgRound} muted="(ước tính)" />
        <StatCard
          label="Số trạng thái"
          value={statusEntries.length}
          muted="đếm theo field status"
        />
      </div>

      <div className="rounded-xl border bg-white/70 p-4 shadow-sm">
        <div className="mb-2 text-sm font-semibold">Phân bố theo trạng thái</div>
        {statusEntries.length === 0 ? (
          <div className="text-sm text-gray-500">Không có dữ liệu trạng thái.</div>
        ) : (
          <ul className="text-sm">
            {statusEntries.map(([k, v]) => (
              <li key={k} className="flex items-center justify-between border-b py-2 last:border-b-0">
                <span className="text-gray-600">{k}</span>
                <span className="font-medium">{v}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

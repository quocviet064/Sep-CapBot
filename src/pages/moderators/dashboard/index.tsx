import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { Chart, ChartConfiguration } from "chart.js/auto";
import { useSubmissions } from "@/hooks/useSubmission";
import {
  useQueries,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { getReviewersWorkload } from "@/services/reviewerAssignmentService";
import { getSubmissionDetail } from "@/services/submissionService";
import { useNavigate } from "react-router-dom";

type IdLike = number | string;

type SubmissionListItem = {
  id: IdLike;
  submittedAt?: string | null;
  submittedByName?: string | null;
  topicTitle?: string | null;
  aiCheckStatus?: string | null;
};

type SubmissionDetail = {
  id?: IdLike;
  aiCheckDetails?: unknown;
  aiCheckScore?: number | null;
  aiCheckStatus?: string | null;
};

type ReviewerPerformance = {
  totalAssignments: number;
  completedAssignments: number;
  onTimeRate?: number | null;
  averageScoreGiven?: number | null;
};

type ReviewerWorkloadItem = {
  id: IdLike;
  userName?: string | null;
  email?: string | null;
  currentAssignments?: number | null;
  skills?: string[];
  performance?: ReviewerPerformance | null;
};

function parseAiScore(detail?: SubmissionDetail | null): number | null {
  if (!detail) return null;
  try {
    if (typeof detail.aiCheckDetails === "string") {
      const parsed = JSON.parse(detail.aiCheckDetails);
      if (parsed?.overall_score != null) return Number(parsed.overall_score);
    } else if (
      detail.aiCheckDetails &&
      typeof (detail.aiCheckDetails as Record<string, unknown>)
        .overall_score !== "undefined"
    ) {
      const v = (detail.aiCheckDetails as Record<string, unknown>)
        .overall_score as number;
      return Number(v);
    }
  } catch {
    //aa
  }
  if (typeof detail.aiCheckScore === "number")
    return Number(detail.aiCheckScore) * 10;
  return null;
}

export default function ModeratorDashboard(): JSX.Element {
  const navigate = useNavigate();

  const subsQuery = useSubmissions({
    PageNumber: 1,
    PageSize: 50,
  });

  const submissions = (subsQuery.data?.listObjects ??
    []) as SubmissionListItem[];

  const detailQueries = useQueries({
    queries: submissions.map((s) => ({
      queryKey: ["submission-detail", s.id],
      queryFn: async () =>
        (await getSubmissionDetail(s.id)) as SubmissionDetail,
      enabled: s.id != null,
      staleTime: 1000 * 60 * 5,
    })),
  }) as Array<UseQueryResult<SubmissionDetail, unknown>>;

  const detailsMap = useMemo(() => {
    const m = new Map<IdLike, SubmissionDetail>();
    for (let i = 0; i < submissions.length; i++) {
      const id = submissions[i]?.id;
      const q = detailQueries[i];
      if (id != null && q?.data) m.set(id, q.data);
    }
    return m;
  }, [submissions, detailQueries]);

  const workloadQuery = useQuery<ReviewerWorkloadItem[]>({
    queryKey: ["reviewer-workload"],
    queryFn: async () =>
      (await getReviewersWorkload()) as ReviewerWorkloadItem[],
    staleTime: 1000 * 60 * 5,
  });

  const getAiScoreDisplay = (id: IdLike) => {
    const v = parseAiScore(detailsMap.get(id));
    return v == null || Number.isNaN(v) ? "-" : v;
  };

  const kpis = useMemo(() => {
    const total = submissions.length;
    let approved = 0;
    let needsRevision = 0;
    let underReview = 0;

    submissions.forEach((s) => {
      const d = detailsMap.get(s.id);
      const pct = parseAiScore(d);
      if (pct == null) {
        underReview++;
        return;
      }
      if (pct >= 80) approved++;
      else if (pct < 60) needsRevision++;
      else underReview++;
    });

    return { total, approved, needsRevision, underReview };
  }, [submissions, detailsMap]);

  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const pieRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);
  const lineChart = useRef<Chart | null>(null);
  const pieChart = useRef<Chart | null>(null);
  const barChart = useRef<Chart | null>(null);

  useEffect(() => {
    const days = 10;
    const labels: string[] = [];
    const counts: number[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      labels.push(iso);
      counts.push(0);
    }
    submissions.forEach((s) => {
      const dt = s.submittedAt ? new Date(s.submittedAt) : null;
      if (!dt || !isFinite(dt.getTime())) return;
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      const idx = labels.indexOf(iso);
      if (idx >= 0) counts[idx] = (counts[idx] ?? 0) + 1;
    });

    const statusMap: Record<string, number> = {};
    submissions.forEach((s) => {
      const d = detailsMap.get(s.id);
      const st = d?.aiCheckStatus ?? s.aiCheckStatus ?? "Unknown";
      statusMap[String(st)] = (statusMap[String(st)] ?? 0) + 1;
    });

    const buckets = [0, 0, 0, 0, 0];
    submissions.forEach((s) => {
      const pct = parseAiScore(detailsMap.get(s.id));
      if (pct == null || Number.isNaN(pct)) return;
      if (pct < 50) buckets[0]++;
      else if (pct < 60) buckets[1]++;
      else if (pct < 70) buckets[2]++;
      else if (pct < 80) buckets[3]++;
      else buckets[4]++;
    });

    if (lineRef.current) {
      if (lineChart.current) {
        lineChart.current.data.labels = labels;
        lineChart.current.data.datasets[0].data = counts;
        lineChart.current.update();
      } else {
        const cfg: ChartConfiguration = {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Submissions",
                data: counts,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.08)",
                tension: 0.25,
                pointRadius: 2,
              },
            ],
          },
          options: {
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: "#94a3b8" } },
              y: { ticks: { color: "#94a3b8" }, beginAtZero: true },
            },
          },
        };
        lineChart.current = new Chart(lineRef.current, cfg);
      }
    }

    if (pieRef.current) {
      const labelsPie = Object.keys(statusMap);
      const dataPie = labelsPie.map((k) => statusMap[k]);
      if (pieChart.current) {
        pieChart.current.data.labels = labelsPie;
        pieChart.current.data.datasets[0].data = dataPie;
        pieChart.current.update();
      } else {
        const cfg: ChartConfiguration = {
          type: "pie",
          data: {
            labels: labelsPie,
            datasets: [
              {
                data: dataPie,
                backgroundColor: [
                  "#f59e0b",
                  "#10b981",
                  "#ef4444",
                  "#60a5fa",
                  "#a78bfa",
                ],
              },
            ],
          },
          options: {
            plugins: {
              legend: { position: "bottom", labels: { color: "#94a3b8" } },
            },
          },
        };
        pieChart.current = new Chart(pieRef.current, cfg);
      }
    }

    if (barRef.current) {
      if (barChart.current) {
        barChart.current.data.datasets[0].data = buckets;
        barChart.current.update();
      } else {
        const cfg: ChartConfiguration = {
          type: "bar",
          data: {
            labels: ["0-50", "50-60", "60-70", "70-80", "80-100"],
            datasets: [
              {
                label: "# submissions",
                data: buckets,
                backgroundColor: "#3b82f6",
              },
            ],
          },
          options: {
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: "#94a3b8" } },
              y: { ticks: { color: "#94a3b8" }, beginAtZero: true },
            },
          },
        };
        barChart.current = new Chart(barRef.current, cfg);
      }
    }
  }, [submissions, detailsMap]);

  const [keyword, setKeyword] = useState("");
  const filtered = useMemo(() => {
    const kw = (keyword ?? "").trim().toLowerCase();
    if (!kw) return submissions;
    return submissions.filter(
      (s) =>
        String(s.id).toLowerCase().includes(kw) ||
        String(s.submittedByName ?? "")
          .toLowerCase()
          .includes(kw) ||
        String(s.topicTitle ?? "")
          .toLowerCase()
          .includes(kw),
    );
  }, [keyword, submissions]);

  const handleView = (id: IdLike) => {
    navigate(`/moderators/submissions/${encodeURIComponent(String(id))}`);
  };

  return (
    <div className="container mx-auto p-4" style={{ maxWidth: 1200 }}>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Moderator Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search ID / submitter / topic"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,0.12)",
              background: "transparent",
            }}
          />
          <button
            className="rounded border px-3 py-2"
            onClick={() => {
              subsQuery.refetch();
              detailQueries.forEach((q) => q.refetch());
              workloadQuery.refetch();
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded border p-4">
          <div className="text-muted-foreground text-sm">
            Total submissions (page)
          </div>
          <div className="text-2xl font-bold">{kpis.total}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-muted-foreground text-sm">
            Auto-approved (est.)
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {kpis.approved}
          </div>
        </div>
        <div className="rounded border p-4">
          <div className="text-muted-foreground text-sm">Needs revision</div>
          <div className="text-2xl font-bold text-amber-600">
            {kpis.needsRevision}
          </div>
        </div>
        <div className="rounded border p-4">
          <div className="text-muted-foreground text-sm">Under review</div>
          <div className="text-2xl font-bold text-slate-400">
            {kpis.underReview}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded border p-4">
          <div className="mb-2 text-sm font-semibold">
            Submissions (last 10 days)
          </div>
          <canvas ref={lineRef} />
        </div>
        <div className="rounded border p-4">
          <div className="mb-2 text-sm font-semibold">
            AI status distribution
          </div>
          <canvas ref={pieRef} />
        </div>
        <div className="rounded border p-4">
          <div className="mb-2 text-sm font-semibold">AI score buckets</div>
          <canvas ref={barRef} />
        </div>
      </div>

      <div className="mb-6 rounded-md border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Reviewer Workload
          </h3>
          <span className="text-xs text-slate-500">
            {workloadQuery.isLoading
              ? "Đang tải..."
              : `Tổng reviewer: ${workloadQuery.data?.length ?? 0}`}
          </span>
        </div>

        <div className="max-h-80 divide-y divide-slate-100 overflow-auto">
          {workloadQuery.isLoading ? (
            <div className="py-6 text-center text-sm text-slate-500">
              Đang tải dữ liệu...
            </div>
          ) : workloadQuery.data?.length ? (
            workloadQuery.data.slice(0, 8).map((rev) => {
              const p = rev.performance;
              const completionRate =
                p && p.totalAssignments > 0
                  ? (
                      (p.completedAssignments / p.totalAssignments) *
                      100
                    ).toFixed(0)
                  : "-";
              return (
                <div
                  key={rev.id}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-800">
                      {rev.userName ?? rev.email}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {rev.email}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {rev.skills?.length ? (
                        rev.skills.map((skill, i) => (
                          <span
                            key={`${skill}-${i}`}
                            className="inline-block rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">
                          Không có kỹ năng
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-sm whitespace-nowrap text-slate-600">
                    <div>
                      <span className="text-xs text-slate-500">
                        Assignments:
                      </span>{" "}
                      <span className="font-semibold">
                        {rev.currentAssignments ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Completed:</span>{" "}
                      <span className="font-semibold">
                        {p?.completedAssignments ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">On-time:</span>{" "}
                      <span className="font-semibold">
                        {p?.onTimeRate
                          ? (p.onTimeRate * 100).toFixed(0) + "%"
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Avg Score:</span>{" "}
                      <span className="font-semibold">
                        {p?.averageScoreGiven
                          ? p.averageScoreGiven.toFixed(1)
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">
                        Completion:
                      </span>{" "}
                      <span className="font-semibold">{completionRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-sm text-slate-500">
              Không có dữ liệu reviewer
            </div>
          )}
        </div>
      </div>

      <div className="rounded border p-4">
        <div className="mb-2 text-sm font-semibold">Submissions list</div>
        <div className="overflow-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid rgba(148,163,184,0.08)",
                }}
              >
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Topic</th>
                <th style={{ padding: 8 }}>Submitter</th>
                <th style={{ padding: 8 }}>AI score</th>
                <th style={{ padding: 8 }}>Submitted</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  style={{ borderBottom: "1px solid rgba(148,163,184,0.03)" }}
                >
                  <td style={{ padding: 8, verticalAlign: "top" }}>#{s.id}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>
                    {s.topicTitle ?? "-"}
                  </td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>
                    {s.submittedByName ?? "-"}
                  </td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>
                    {getAiScoreDisplay(s.id)}
                  </td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>
                    {s.submittedAt
                      ? new Date(s.submittedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleView(s.id)}
                        className="rounded border px-2 py-1 text-sm"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 12,
                      textAlign: "center",
                      color: "#94a3b8",
                    }}
                  >
                    No submissions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

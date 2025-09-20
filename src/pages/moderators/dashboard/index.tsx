// src/pages/moderators/dashboard/ModeratorDashboard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chart, ChartConfiguration } from "chart.js/auto";
import { useSubmissions } from "@/hooks/useSubmission";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getReviewersWorkload } from "@/services/reviewerAssignmentService";
import { getSubmissionDetail } from "@/services/submissionService";
import { useNavigate } from "react-router-dom";

/**
 * Moderator Dashboard (fixed)
 *
 * - Use `useSubmissions` to fetch list.
 * - Use `useQueries` (single-hook call) to fetch submission details for visible submissions.
 * - Compute KPIs & charts from details safely.
 */

function escapeHtml(s?: unknown) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function ModeratorDashboard(): JSX.Element {
  const navigate = useNavigate();

  // Submissions list (page)
  const subsQuery = useSubmissions({
    PageNumber: 1,
    PageSize: 50,
  });

  const submissions = subsQuery.data?.listObjects ?? [];

  // Use queries to fetch details for current submissions (safe: single hook call)
  // Build queries array from submissions (memoized to avoid re-creating unnecessarily)
  const detailQueries = useQueries({
    queries: submissions.map((s: any) => ({
      queryKey: ["submission-detail", s.id],
      queryFn: () => getSubmissionDetail(s.id),
      enabled: !!s.id,
      staleTime: 1000 * 60 * 5,
    })),
  });

  // Build a map id -> detail.data (only include finished ones)
  const detailsMap = useMemo(() => {
    const m = new Map<string | number, any>();
    for (let i = 0; i < submissions.length; i++) {
      const id = submissions[i]?.id;
      const q = detailQueries[i];
      if (id != null && q && q.data) m.set(id, q.data);
    }
    return m;
  }, [submissions, detailQueries]);

  // Workload query (react-query v5 object form)
  const workloadQuery = useQuery({
    queryKey: ["reviewer-workload"],
    queryFn: () => getReviewersWorkload(),
    staleTime: 1000 * 60 * 5,
  });

  // Helper to get AI score for a submission id using detailsMap
  const getAiScore = (id: number | string) => {
    const d = detailsMap.get(id);
    if (!d) return "-";
    try {
      if (typeof d.aiCheckDetails === "string") {
        const parsed = JSON.parse(d.aiCheckDetails);
        if (parsed?.overall_score != null) return Number(parsed.overall_score);
      } else if (d.aiCheckDetails?.overall_score != null) {
        return Number(d.aiCheckDetails.overall_score);
      }
    } catch {
      // ignore parse errors
    }
    if (typeof d.aiCheckScore === "number") return Number(d.aiCheckScore) * 10;
    return "-";
  };

  // KPIs computed from detailsMap + submissions
  const kpis = useMemo(() => {
    const total = submissions.length;
    let approved = 0;
    let needsRevision = 0;
    let underReview = 0;

    submissions.forEach((s: any) => {
      const d = detailsMap.get(s.id);
      let pct: number | null = null;
      if (!d) {
        // If no detail yet, count as underReview
        underReview++;
        return;
      }
      try {
        if (typeof d.aiCheckDetails === "string") {
          const parsed = JSON.parse(d.aiCheckDetails);
          if (parsed?.overall_score != null) pct = Number(parsed.overall_score);
        } else if (d.aiCheckDetails?.overall_score != null) {
          pct = Number(d.aiCheckDetails.overall_score);
        } else if (typeof d.aiCheckScore === "number") {
          pct = d.aiCheckScore * 10;
        }
      } catch {
        // parse error -> leave pct null
      }

      if (pct != null && pct >= 80) approved++;
      else if (pct != null && pct < 60) needsRevision++;
      else underReview++;
    });

    return { total, approved, needsRevision, underReview };
  }, [submissions, detailsMap]);

  // Chart refs
  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const pieRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);
  const lineChart = useRef<Chart | null>(null);
  const pieChart = useRef<Chart | null>(null);
  const barChart = useRef<Chart | null>(null);

  // Build charts (react to submissions & detailsMap)
  useEffect(() => {
    const days = 10;
    const labels: string[] = [];
    const counts: number[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString());
      counts.push(0);
    }
    submissions.forEach((s: any) => {
      const dt = s.submittedAt ? new Date(s.submittedAt) : null;
      if (!dt || !isFinite(dt.getTime())) return;
      const idx = labels.findIndex((lab) => {
        const parsed = new Date(lab);
        return parsed.toDateString() === dt.toDateString();
      });
      if (idx >= 0) counts[idx] = (counts[idx] ?? 0) + 1;
    });

    const statusMap: Record<string, number> = {};
    submissions.forEach((s: any) => {
      const d = detailsMap.get(s.id);
      const st = d?.aiCheckStatus ?? (s.aiCheckStatus ?? "Unknown");
      statusMap[String(st)] = (statusMap[String(st)] ?? 0) + 1;
    });

    const buckets = [0, 0, 0, 0, 0];
    submissions.forEach((s: any) => {
      const d = detailsMap.get(s.id);
      if (!d) return;
      let pct: number | null = null;
      try {
        if (typeof d.aiCheckDetails === "string") {
          const parsed = JSON.parse(d.aiCheckDetails);
          if (parsed?.overall_score != null) pct = Number(parsed.overall_score);
        } else if (d.aiCheckDetails?.overall_score != null) {
          pct = Number(d.aiCheckDetails.overall_score);
        } else if (typeof d.aiCheckScore === "number") {
          pct = d.aiCheckScore * 10;
        }
      } catch {
        // ignore parse errors
      }
      if (pct == null || Number.isNaN(pct)) return;
      if (pct < 50) buckets[0]++; else if (pct < 60) buckets[1]++; else if (pct < 70) buckets[2]++; else if (pct < 80) buckets[3]++; else buckets[4]++;
    });

    // Line chart
    if (lineRef.current) {
      if (lineChart.current) {
        lineChart.current.data.labels = labels;
        // @ts-ignore
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

    // Pie chart
    if (pieRef.current) {
      const labelsPie = Object.keys(statusMap);
      const dataPie = labelsPie.map((k) => statusMap[k]);
      if (pieChart.current) {
        pieChart.current.data.labels = labelsPie;
        // @ts-ignore
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
                backgroundColor: ["#f59e0b", "#10b981", "#ef4444", "#60a5fa", "#a78bfa"],
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

    // Bar chart
    if (barRef.current) {
      if (barChart.current) {
        // @ts-ignore
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
  const filtered = submissions.filter((s: any) => {
    const kw = (keyword ?? "").trim().toLowerCase();
    if (!kw) return true;
    return (
      String(s.id).toLowerCase().includes(kw) ||
      (s.submittedByName ?? "").toString().toLowerCase().includes(kw) ||
      (s.topicTitle ?? "").toString().toLowerCase().includes(kw)
    );
  });

  const handleView = (id: number | string) => {
    navigate(`/moderators/submissions/${encodeURIComponent(String(id))}`);
  };

  return (
    <div className="container mx-auto p-4" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
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
            className="rounded px-3 py-2 border"
            onClick={() => {
              subsQuery.refetch();
              // refetch detail queries by invalidating keys if needed; simplest: refetch all
              detailQueries.forEach((q) => q.refetch && q.refetch());
              workloadQuery.refetch();
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">Total submissions (page)</div>
          <div className="text-2xl font-bold">{kpis.total}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">Auto-approved (est.)</div>
          <div className="text-2xl font-bold text-emerald-600">{kpis.approved}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">Needs revision</div>
          <div className="text-2xl font-bold text-amber-600">{kpis.needsRevision}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">Under review</div>
          <div className="text-2xl font-bold text-slate-400">{kpis.underReview}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="rounded border p-4">
          <div className="text-sm font-semibold mb-2">Submissions (last 10 days)</div>
          <canvas ref={lineRef} />
        </div>

        <div className="rounded border p-4">
          <div className="text-sm font-semibold mb-2">AI status distribution</div>
          <canvas ref={pieRef} />
        </div>

        <div className="rounded border p-4">
          <div className="text-sm font-semibold mb-2">AI score buckets</div>
          <canvas ref={barRef} />
        </div>
      </div>

      {/* Workload quick view */}
      <div className="rounded border p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Reviewer workload (top)</div>
          <div className="text-xs text-muted-foreground">
            {workloadQuery.isLoading ? "Loading..." : `Total: ${workloadQuery.data?.length ?? 0}`}
          </div>
        </div>
        <div>
          {workloadQuery.data?.slice(0, 6).map((w: any) => (
            <div key={w.reviewerId ?? w.reviewerName} className="flex items-center justify-between py-1">
              <div>
                <div className="font-medium">{w.reviewerName ?? w.email ?? `#${w.reviewerId}`}</div>
                <div className="text-xs text-muted-foreground">Active: {w.currentActiveAssignments ?? 0}</div>
              </div>
              <div className="text-sm text-muted-foreground">{w.workloadScore ?? "-"}</div>
            </div>
          )) ?? <div className="text-sm text-muted-foreground">No data</div>}
        </div>
      </div>

      {/* Table */}
      <div className="rounded border p-4">
        <div className="text-sm font-semibold mb-2">Submissions list</div>
        <div className="overflow-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Topic</th>
                <th style={{ padding: 8 }}>Submitter</th>
                <th style={{ padding: 8 }}>AI score</th>
                <th style={{ padding: 8 }}>Submitted</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.03)" }}>
                  <td style={{ padding: 8, verticalAlign: "top" }}>#{s.id}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>{escapeHtml(s.topicTitle ?? "-")}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>{escapeHtml(s.submittedByName ?? "-")}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>{getAiScore(s.id)}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "-"}</td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleView(s.id)} className="rounded border px-2 py-1 text-sm">View</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 12, textAlign: "center", color: "#94a3b8" }}>No submissions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

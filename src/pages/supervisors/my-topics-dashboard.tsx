import React from "react";
import { motion, animate } from "framer-motion";
import {
  Rocket,
  CheckCircle2,
  XCircle,
  UploadCloud,
  CalendarDays,
} from "lucide-react";
import LoadingPage from "@/pages/loading-page";
import { fetchAllMyTopics } from "@/hooks/useTopic";

type Topic = {
  id: number;
  semesterName?: string | null;
  hasSubmitted?: boolean | null;
  latestSubmissionStatus?: string | null;
  isApproved?: boolean | null;
  createdAt?: string;
};

function normalizeStatus(
  s: unknown,
):
  | "Pending"
  | "UnderReview"
  | "Duplicate"
  | "RevisionRequired"
  | "EscalatedToModerator"
  | "Approved"
  | "Rejected" {
  const v = String(s ?? "")
    .trim()
    .toLowerCase();
  if (v === "approved") return "Approved";
  if (v === "rejected") return "Rejected";
  if (v === "underreview" || v === "under_review" || v === "under review")
    return "UnderReview";
  if (v === "duplicate") return "Duplicate";
  if (v === "revisionrequired" || v === "revision_required")
    return "RevisionRequired";
  if (v === "escalatedtomoderator" || v === "escalated_to_moderator")
    return "EscalatedToModerator";
  return "Pending";
}

function useCounter(target: number, duration = 0.9, decimals = 0) {
  const [display, setDisplay] = React.useState("0");
  React.useEffect(() => {
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Number(latest).toFixed(decimals)),
    });
    return () => controls.stop();
  }, [target, duration, decimals]);
  return display;
}

function classNames(...s: (string | false | null | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

function Metric({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  const text = useCounter(value);
  return (
    <div className="flex items-end gap-3 px-4 py-3">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white ring-1 ring-amber-200/50">
        {icon}
      </div>
      <div className="leading-none">
        <div className="text-[12px] font-semibold tracking-wider text-amber-700/90 uppercase">
          {label}
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-5xl font-black tracking-tight text-transparent">
            {text}
          </span>
          {suffix ? (
            <span className="pb-1 text-sm font-bold text-amber-600">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Ring({
  label,
  percent,
  accentFrom,
  accentTo,
  sub,
}: {
  label: string;
  percent: number;
  accentFrom: string;
  accentTo: string;
  sub?: string;
}) {
  const pct = Math.max(0, Math.min(1, percent));
  const deg = pct * 360;
  const text = useCounter(Math.round(pct * 100));
  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div
        className="relative grid h-32 w-32 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${accentFrom} ${deg}deg, #e5e7eb 0deg)`,
        }}
      >
        <div className="absolute inset-2 rounded-full bg-white shadow-inner" />
        <div className="relative z-[1] text-3xl font-extrabold text-slate-900">
          {text}%
        </div>
      </div>
      <div className="mt-2 line-clamp-1 max-w-[12rem] text-sm font-semibold text-slate-800">
        {label}
      </div>
      {typeof sub === "string" ? (
        <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
            style={{
              background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function Sparkline({ series }: { series: number[] }) {
  const n = series.length || 1;
  const max = Math.max(1, ...series);
  const pts = series.map((v, i) => {
    const x = (i / (n - 1)) * 100;
    const y = 40 - (v / max) * 36 - 2;
    return `${x},${y}`;
  });
  const d = `M0,40 L${pts.join(" ")} L100,40 Z`;
  const line = `M${pts[0] ?? "0,40"} L${pts.join(" ")}`;
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="h-20 w-full"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopOpacity="0.35" stopColor="#f59e0b" />
          <stop offset="100%" stopOpacity="0" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#g1)" />
      <path d={line} fill="none" strokeWidth="2.5" stroke="#f59e0b" />
    </svg>
  );
}

export default function MyTopicsDashboard() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [allTopics, setAllTopics] = React.useState<Topic[]>([]);
  const [semesterFilter, setSemesterFilter] = React.useState<string | "all">(
    "all",
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchAllMyTopics(undefined, undefined, undefined);
        if (!mounted) return;
        setAllTopics(list as Topic[]);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const semesters = React.useMemo(() => {
    const set = new Set(
      (allTopics ?? []).map((t) => t.semesterName).filter(Boolean) as string[],
    );
    return Array.from(set);
  }, [allTopics]);

  const filtered =
    semesterFilter === "all"
      ? allTopics
      : allTopics.filter((t) => t.semesterName === semesterFilter);

  const submitted = React.useMemo(
    () => filtered.filter((t) => t.hasSubmitted === true),
    [filtered],
  );
  const approved = React.useMemo(
    () =>
      submitted.filter(
        (t) => normalizeStatus(t.latestSubmissionStatus) === "Approved",
      ),
    [submitted],
  );
  const rejected = React.useMemo(
    () =>
      submitted.filter(
        (t) => normalizeStatus(t.latestSubmissionStatus) === "Rejected",
      ),
    [submitted],
  );

  const bySemester = React.useMemo(() => {
    const map = new Map<
      string,
      { total: number; submitted: number; approved: number; rejected: number }
    >();
    for (const t of filtered) {
      const key = t.semesterName ?? "Khác";
      if (!map.has(key))
        map.set(key, { total: 0, submitted: 0, approved: 0, rejected: 0 });
      const agg = map.get(key)!;
      agg.total += 1;
      if (t.hasSubmitted) {
        agg.submitted += 1;
        const st = normalizeStatus(t.latestSubmissionStatus);
        if (st === "Approved") agg.approved += 1;
        if (st === "Rejected") agg.rejected += 1;
      }
    }
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
  }, [filtered]);

  const monthlySeries = React.useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 12 }).map((_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - idx), 1);
      return { key: `${d.getFullYear()}-${d.getMonth() + 1}`, count: 0 };
    });
    for (const t of filtered) {
      const d = t.createdAt ? new Date(t.createdAt) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const b = buckets.find((x) => x.key === key);
      if (b) b.count += 1;
    }
    return buckets.map((b) => b.count);
  }, [filtered]);

  if (loading) return <LoadingPage />;
  if (error)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200/60 bg-red-50/70 px-6 py-4 text-red-700 shadow-sm">
          Lỗi: {error}
        </div>
      </div>
    );

  const total = filtered.length;
  const aPct = submitted.length
    ? (approved.length / submitted.length) * 100
    : 0;
  const rPct = submitted.length
    ? (rejected.length / submitted.length) * 100
    : 0;
  const oPct = Math.max(0, 100 - aPct - rPct);
  const otherSubmitted = Math.max(
    0,
    submitted.length - approved.length - rejected.length,
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(245,158,11,0.22),transparent_60%),radial-gradient(60%_40%_at_90%_10%,rgba(99,102,241,0.14),transparent_60%),radial-gradient(40%_30%_at_10%_20%,rgba(14,165,233,0.12),transparent_60%)]" />
        <div className="absolute inset-0 [background-size:22px_22px] opacity-[0.04] [background:linear-gradient(0deg,transparent_21px,rgba(2,6,23,0.08)_22px),linear-gradient(90deg,transparent_21px,rgba(2,6,23,0.08)_22px)]" />
      </div>

      <div className="mx-auto w-full max-w-[140rem] px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-3 text-4xl font-black tracking-tight">
              <span className="inline-grid place-items-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 p-2.5 text-white ring-1 ring-amber-200/50">
                <Rocket className="h-7 w-7" />
              </span>
              <span className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-500 bg-clip-text text-transparent">
                Bảng điều khiển đề tài
              </span>
            </h2>
            <p className="text-sm text-slate-500">
              Tổng quan đề tài, phân bố trạng thái, xu hướng và hiệu suất theo
              học kỳ.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-white/70 p-2 backdrop-blur">
            <button
              onClick={() => setSemesterFilter("all")}
              className={classNames(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                semesterFilter === "all"
                  ? "bg-amber-600 text-white"
                  : "text-slate-700 hover:bg-amber-50",
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Tất cả
            </button>
            {semesters.map((s) => (
              <button
                key={s}
                onClick={() => setSemesterFilter(s)}
                className={classNames(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                  semesterFilter === s
                    ? "bg-amber-600 text-white"
                    : "text-slate-700 hover:bg-amber-50",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-gradient-to-r from-amber-50/70 via-white/60 to-indigo-50/70 ring-1 ring-slate-200/50">
          <div className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={<Rocket className="h-5 w-5" />}
              label="Tổng đề tài"
              value={total}
            />
            <Metric
              icon={<UploadCloud className="h-5 w-5" />}
              label="Đã nộp"
              value={submitted.length}
            />
            <Metric
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Tỷ lệ duyệt"
              value={Math.round(aPct)}
              suffix="%"
            />
            <Metric
              icon={<XCircle className="h-5 w-5" />}
              label="Tỷ lệ từ chối"
              value={Math.round(rPct)}
              suffix="%"
            />
          </div>
          <div className="px-4 pb-5">
            <div className="h-6 w-full overflow-hidden rounded-full bg-amber-50 ring-1 ring-amber-100">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                initial={{ width: 0 }}
                animate={{ width: `${aPct}%` }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
              />
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400"
                initial={{ width: 0 }}
                animate={{ width: `${rPct}%` }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 18,
                  delay: 0.05,
                }}
                style={{ marginLeft: `${aPct}%` }}
              />
              <motion.div
                className="h-full bg-gradient-to-r from-amber-300 to-amber-200"
                initial={{ width: 0 }}
                animate={{ width: `${oPct}%` }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 18,
                  delay: 0.1,
                }}
                style={{ marginLeft: `${aPct + rPct}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-6 text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded bg-emerald-500" />
                Đã duyệt: <strong>{approved.length}</strong>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded bg-rose-500" />
                Từ chối: <strong>{rejected.length}</strong>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded bg-amber-300" />
                Khác: <strong>{otherSubmitted}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid items-start gap-10 xl:grid-cols-[2.2fr,1fr]">
          <div>
            <div className="mb-3 flex items-end justify-between">
              <div className="text-sm font-semibold text-slate-700">
                Xu hướng tạo đề tài (12 tháng)
              </div>
              <div className="text-xs text-slate-500">Số lượng theo tháng</div>
            </div>
            <div className="rounded-3xl bg-white/60 p-3 ring-1 ring-slate-200/60 backdrop-blur">
              <Sparkline series={monthlySeries} />
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-slate-700">
              Tỉ lệ theo học kỳ
            </div>
            <div className="rounded-3xl bg-white/60 p-2 ring-1 ring-slate-200/60 backdrop-blur">
              <div className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto py-2">
                {bySemester.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-600">
                    Chưa có dữ liệu
                  </div>
                ) : (
                  bySemester.map((s) => {
                    const pct = s.submitted > 0 ? s.approved / s.submitted : 0;
                    return (
                      <div key={s.name} className="snap-start">
                        <Ring
                          label={s.name}
                          percent={pct}
                          accentFrom="#f59e0b"
                          accentTo="#fb923c"
                          sub={`${s.approved}/${s.submitted}`}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-3 text-sm font-semibold text-slate-700">
            Bảng theo học kỳ
          </div>
          <div className="overflow-x-auto rounded-3xl bg-white/60 ring-1 ring-slate-200/60 backdrop-blur">
            <table className="w-full border-separate border-spacing-y-0">
              <thead>
                <tr className="text-left text-[12px] tracking-wider text-slate-500 uppercase">
                  <th className="px-5 py-3">Học kỳ</th>
                  <th className="px-5 py-3">Tổng</th>
                  <th className="px-5 py-3">Đã nộp</th>
                  <th className="px-5 py-3">Đã duyệt</th>
                  <th className="px-5 py-3">Từ chối</th>
                  <th className="px-5 py-3">Tỉ lệ duyệt</th>
                </tr>
              </thead>
              <tbody>
                {bySemester.map((s, i) => {
                  const pct =
                    s.submitted > 0
                      ? Math.round((s.approved / s.submitted) * 100)
                      : 0;
                  return (
                    <tr key={s.name} className={i % 2 ? "bg-white/70" : ""}>
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        {s.name}
                      </td>
                      <td className="px-5 py-3">{s.total}</td>
                      <td className="px-5 py-3">{s.submitted}</td>
                      <td className="px-5 py-3 text-emerald-700">
                        {s.approved}
                      </td>
                      <td className="px-5 py-3 text-rose-700">{s.rejected}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 w-36 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                            <motion.div
                              className="h-full"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{
                                type: "spring",
                                stiffness: 160,
                                damping: 20,
                              }}
                              style={{
                                background:
                                  "linear-gradient(90deg, #f59e0b, #6366f1)",
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {bySemester.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-5 text-sm text-slate-600"
                    >
                      Chưa có dữ liệu học kỳ
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { motion, animate } from "framer-motion";
import {
  Rocket,
  CheckCircle2,
  XCircle,
  UploadCloud,
  CalendarDays,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import LoadingPage from "@/pages/loading-page";
import { fetchAllMyTopics } from "@/hooks/useTopic";

// ==== Types (khớp TopicListItem) ====
type Topic = {
  id: number;
  semesterName?: string | null;
  hasSubmitted?: boolean | null;
  latestSubmissionStatus?: string | null;
  isApproved?: boolean | null;
  createdAt?: string;
};

// ==== Helpers ====
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

// Counter hiển thị text thường (tránh MotionValue -> ReactNode error)
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

// ==== KPI Tiles ====
function KpiTile({
  label,
  value,
  icon,
  gradient = "from-indigo-600 via-violet-500 to-sky-500",
  rotate = true,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient?: string;
  rotate?: boolean;
}) {
  const text = useCounter(value);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_50px_-24px_rgba(2,6,23,0.35)]">
      {/* halo xoay */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full opacity-30 blur-2xl"
        animate={rotate ? { rotate: 360 } : {}}
        transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, #a5b4fc, #7c3aed, #22d3ee, #a5b4fc)",
        }}
      />
      <div className="relative z-[1] flex items-center justify-between gap-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white ring-1 ring-white/10">
          {icon}
        </div>
        <span
          className={classNames(
            "rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm ring-1 ring-white/20",
            gradient,
          )}
        >
          KPI
        </span>
      </div>
      <div className="relative z-[1] mt-3 text-[12px] font-medium tracking-wider text-slate-500 uppercase">
        {label}
      </div>
      <div className="relative z-[1] mt-0.5 flex items-end gap-2">
        <span className="text-3xl font-black tracking-tight text-slate-900">
          {text}
        </span>
        <Sparkles className="mb-1 h-4 w-4 text-amber-500" />
      </div>
      <div
        className={classNames(
          "absolute inset-x-0 bottom-0 h-[6px] bg-gradient-to-r",
          gradient,
        )}
      />
    </div>
  );
}

// ==== Radial progress (conic) ====
function RadialStat({
  label,
  percent, // 0..1
  from = "#22c55e",
  to = "#0ea5e9",
}: {
  label: string;
  percent: number;
  from?: string;
  to?: string;
}) {
  const pct = Math.max(0, Math.min(1, percent));
  const deg = pct * 360;
  const text = useCounter(Math.round(pct * 100));

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
      <motion.div
        aria-hidden
        className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-30 blur-2xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        style={{
          background: "conic-gradient(#93c5fd,#a78bfa,#67e8f9,#93c5fd)",
        }}
      />
      <div
        className="relative grid h-28 w-28 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${from} ${deg}deg, #e5e7eb 0deg)`,
        }}
      >
        <div className="absolute inset-2 rounded-full bg-white shadow-inner" />
        <div className="relative z-[1] text-2xl font-extrabold text-slate-900">
          {text}%
        </div>
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-700">{label}</div>
      <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
        />
      </div>
    </div>
  );
}

// ==== Distribution Bar ====
function StatusBar({
  approved,
  rejected,
  others,
}: {
  approved: number;
  rejected: number;
  others: number;
}) {
  const total = Math.max(1, approved + rejected + others);
  const a = (approved / total) * 100;
  const r = (rejected / total) * 100;
  const o = 100 - a - r;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 text-sm font-semibold text-slate-700">
        Phân bố trạng thái (trên các đề tài đã nộp)
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
          initial={{ width: 0 }}
          animate={{ width: `${a}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
        />
        <motion.div
          className="h-full bg-gradient-to-r from-rose-500 to-rose-400"
          initial={{ width: 0 }}
          animate={{ width: `${r}%` }}
          transition={{
            type: "spring",
            stiffness: 140,
            damping: 18,
            delay: 0.05,
          }}
          style={{ marginLeft: `${a}%` }}
        />
        <motion.div
          className="h-full bg-gradient-to-r from-slate-400 to-slate-300"
          initial={{ width: 0 }}
          animate={{ width: `${o}%` }}
          transition={{
            type: "spring",
            stiffness: 140,
            damping: 18,
            delay: 0.1,
          }}
          style={{ marginLeft: `${a + r}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-emerald-500" />
          Đã phê duyệt: <strong>{approved}</strong>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-rose-500" />
          Từ chối: <strong>{rejected}</strong>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-slate-400" />
          Khác: <strong>{others}</strong>
        </span>
      </div>
    </div>
  );
}

// ==== Main Dashboard ====
export default function MyTopicsDashboard() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [allTopics, setAllTopics] = React.useState<Topic[]>([]);
  const [semesterFilter, setSemesterFilter] = React.useState<string | "all">(
    "all",
  );
  const [openFilter, setOpenFilter] = React.useState(false);

  // load topics
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

  // ✅ ALWAYS call hooks before any early return
  const bySemester = React.useMemo(() => {
    const map = new Map<
      string,
      { total: number; submitted: number; approved: number; rejected: number }
    >();
    for (const t of allTopics) {
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
  }, [allTopics]);

  // Early returns (sau khi mọi hook đã được gọi)
  if (loading) return <LoadingPage />;
  if (error)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200/60 bg-red-50/70 px-6 py-4 text-red-700 shadow-sm">
          Lỗi: {error}
        </div>
      </div>
    );

  // unique semesters + filtered list
  const semesters = Array.from(
    new Set((allTopics ?? []).map((t) => t.semesterName).filter(Boolean)),
  ) as string[];

  const filtered =
    semesterFilter === "all"
      ? allTopics
      : allTopics.filter((t) => t.semesterName === semesterFilter);

  // metrics
  const total = filtered.length;
  const submitted = filtered.filter((t) => t.hasSubmitted === true);
  const approved = submitted.filter(
    (t) => normalizeStatus(t.latestSubmissionStatus) === "Approved",
  );
  const rejected = submitted.filter(
    (t) => normalizeStatus(t.latestSubmissionStatus) === "Rejected",
  );
  const approvalRate = submitted.length
    ? approved.length / submitted.length
    : 0;
  const rejectRate = submitted.length ? rejected.length / submitted.length : 0;

  return (
    <div className="relative space-y-6">
      {/* background grid + halo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(37,99,235,0.15),transparent_60%),radial-gradient(40%_30%_at_90%_10%,rgba(14,165,233,0.12),transparent_60%),radial-gradient(30%_25%_at_10%_20%,rgba(99,102,241,0.10),transparent_60%)]" />
        <div className="absolute inset-0 [background-size:22px_22px] opacity-[0.05] [background:linear-gradient(0deg,transparent_21px,rgba(2,6,23,0.08)_22px),linear-gradient(90deg,transparent_21px,rgba(2,6,23,0.08)_22px)]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h2 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <span className="inline-grid place-items-center rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 p-2 text-white shadow-sm ring-1 ring-white/10">
              <Rocket className="h-6 w-6" />
            </span>
            <span className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-500 bg-clip-text text-transparent">
              Bảng điều khiển đề tài của tôi
            </span>
          </h2>
          <p className="text-sm text-slate-500">
            Theo dõi tổng quan, tỷ lệ duyệt / từ chối và số đề tài đã nộp.
          </p>
        </div>

        {/* Filter semester */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenFilter((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300"
          >
            <CalendarDays className="h-4 w-4 text-indigo-600" />
            {semesterFilter === "all" ? "Tất cả học kỳ" : semesterFilter}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </button>

          {openFilter && (
            <div className="absolute right-0 z-10 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <div
                className="cursor-pointer rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                onClick={() => {
                  setSemesterFilter("all");
                  setOpenFilter(false);
                }}
              >
                Tất cả học kỳ
              </div>
              {semesters.map((s) => (
                <div
                  key={s}
                  className="cursor-pointer rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                  onClick={() => {
                    setSemesterFilter(s);
                    setOpenFilter(false);
                  }}
                >
                  {s}
                </div>
              ))}
              <div className="mt-2 border-t pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSemesterFilter("all");
                    setOpenFilter(false);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Xóa lọc
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Tổng đề tài đã tạo"
          value={total}
          icon={<Rocket className="h-5 w-5" />}
          gradient="from-indigo-600 via-violet-500 to-sky-500"
          rotate
        />
        <KpiTile
          label="Đề tài đã nộp"
          value={submitted.length}
          icon={<UploadCloud className="h-5 w-5" />}
          gradient="from-sky-500 via-cyan-400 to-emerald-500"
          rotate
        />
        <KpiTile
          label="Tỷ lệ duyệt (trên đã nộp)"
          value={Math.round(approvalRate * 100)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          gradient="from-emerald-600 via-teal-500 to-lime-500"
          rotate
        />
        <KpiTile
          label="Tỷ lệ từ chối (trên đã nộp)"
          value={Math.round(rejectRate * 100)}
          icon={<XCircle className="h-5 w-5" />}
          gradient="from-rose-600 via-pink-500 to-orange-500"
          rotate
        />
      </div>

      {/* Charts / visual blocks */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <StatusBar
            approved={approved.length}
            rejected={rejected.length}
            others={Math.max(
              0,
              submitted.length - approved.length - rejected.length,
            )}
          />

          {/* mini per-semester board */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 text-sm font-semibold text-slate-700">
              Theo học kỳ
            </div>
            {bySemester.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                Chưa có dữ liệu học kỳ
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {bySemester.map((s) => {
                  const pct =
                    s.submitted > 0
                      ? Math.round((s.approved / s.submitted) * 100)
                      : 0;
                  return (
                    <div
                      key={s.name}
                      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <motion.div
                        aria-hidden
                        className="absolute -top-10 -left-10 h-28 w-28 rounded-full opacity-25 blur-2xl"
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 18,
                          ease: "linear",
                        }}
                        style={{
                          background:
                            "conic-gradient(#22c55e,#0ea5e9,#a78bfa,#22c55e)",
                        }}
                      />
                      <div className="relative z-[1] flex items-center justify-between gap-2">
                        <div className="line-clamp-1 text-sm font-bold text-slate-900">
                          {s.name}
                        </div>
                        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                          {s.total} đề tài
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 ring-1 ring-emerald-200">
                          <div className="font-bold">{s.approved}</div>
                          <div>Đã duyệt</div>
                        </div>
                        <div className="rounded-lg bg-rose-50 p-2 text-rose-700 ring-1 ring-rose-200">
                          <div className="font-bold">{s.rejected}</div>
                          <div>Từ chối</div>
                        </div>
                        <div className="rounded-lg bg-sky-50 p-2 text-sky-700 ring-1 ring-sky-200">
                          <div className="font-bold">{s.submitted}</div>
                          <div>Đã nộp</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
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
                                "linear-gradient(90deg, #22c55e, #0ea5e9)",
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Radials */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-700">
              Tỉ lệ (trên các đề tài đã nộp)
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <RadialStat
                label="Được duyệt"
                percent={approvalRate}
                from="#22c55e"
                to="#0ea5e9"
              />
              <RadialStat
                label="Từ chối"
                percent={rejectRate}
                from="#f43f5e"
                to="#fb7185"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 text-sm font-semibold text-slate-700">
              Ghi chú
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                • Tỉ lệ tính trên tập đề tài <strong>đã nộp</strong>.
              </li>
              <li>• Bộ lọc “Học kỳ” áp dụng cho toàn dashboard.</li>
              <li>• Màu sắc: xanh (duyệt), đỏ (từ chối), xám (khác).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

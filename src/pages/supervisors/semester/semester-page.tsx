import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Info,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useSemesters } from "@/hooks/useSemester";
import LoadingPage from "@/pages/loading-page";
import { useCriteriaBySemester } from "@/hooks/useEvaluationCriteria";

type SemesterItem = {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
};

function formatDateStr(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatus(start?: string | null, end?: string | null) {
  const now = Date.now();
  const s = start ? new Date(start).getTime() : NaN;
  const e = end ? new Date(end).getTime() : NaN;
  if (!Number.isNaN(s) && now < s)
    return {
      label: "Chưa bắt đầu",
      color: "bg-slate-600",
      ring: "ring-slate-300",
      pill: "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
      icon: <Hourglass className="h-4 w-4" />,
      topbar: "from-slate-600 to-slate-400",
      disabled: true,
    };
  if (!Number.isNaN(s) && !Number.isNaN(e) && now >= s && now <= e)
    return {
      label: "Đang mở",
      color: "bg-emerald-600",
      ring: "ring-emerald-300",
      pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      icon: <CheckCircle2 className="h-4 w-4" />,
      topbar: "from-emerald-600 to-teal-500",
      disabled: false,
    };
  if (!Number.isNaN(e) && now > e)
    return {
      label: "Đã quá hạn",
      color: "bg-rose-600",
      ring: "ring-rose-300",
      pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
      icon: <AlertCircle className="h-4 w-4" />,
      topbar: "from-rose-600 to-rose-400",
      disabled: true,
    };
  return {
    label: "Không xác định",
    color: "bg-slate-600",
    ring: "ring-slate-300",
    pill: "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
    icon: <Hourglass className="h-4 w-4" />,
    topbar: "from-slate-600 to-slate-400",
    disabled: true,
  };
}

function CriteriaPanel({ semesterId }: { semesterId: number }) {
  const { data, isLoading, error } = useCriteriaBySemester(semesterId);

  if (isLoading)
    return (
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
          <Info className="h-4 w-4" />
          Tiêu chí đánh giá
        </div>
        <div className="relative pl-12">
          <div className="absolute top-0 left-5 h-full w-[2px] bg-gradient-to-b from-indigo-300/70 via-slate-200 to-sky-300/70" />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="relative mb-2 pl-6">
              <div className="absolute top-2 left-2 grid h-5 w-5 place-items-center rounded-full bg-white ring-4 ring-indigo-200">
                <span className="block h-2.5 w-2.5 rounded-full bg-indigo-500" />
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-1 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {error.message || "Không tải được tiêu chí"}
      </div>
    );

  const list = data ?? [];
  const maxWeight = Math.max(...list.map((c) => Number(c.weight) || 0), 0);

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
        <Info className="h-4 w-4" />
        Tiêu chí đánh giá
      </div>
      {list.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          Chưa có tiêu chí
        </div>
      ) : (
        <div className="relative pl-12">
          <div className="absolute top-0 left-5 h-full w-[2px] bg-gradient-to-b from-indigo-300/70 via-slate-200 to-sky-300/70" />
          <ul className="space-y-2">
            {list.map((c, idx) => {
              const w = Number(c.weight) || 0;
              const wPct =
                maxWeight > 0 ? Math.min(100, (w / maxWeight) * 100) : 0;
              return (
                <li key={c.id} className="relative pl-6">
                  <div className="absolute top-2 left-2 grid h-5 w-5 place-items-center rounded-full bg-white ring-4 ring-indigo-200">
                    <span className="block h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-[15px] font-bold text-slate-900">
                          {c.name}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug break-words whitespace-pre-wrap text-slate-700">
                          {c.description || "Không có mô tả"}
                        </p>
                      </div>
                      <div className="shrink-0 space-y-1 text-right">
                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-200">
                          Tối đa: {c.maxScore}
                        </span>
                        <span className="block rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200">
                          Trọng số: {c.weight}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-sky-500"
                        style={{ width: `${wPct}%` }}
                      />
                    </div>
                  </div>
                  {idx !== list.length - 1 && (
                    <div className="ml-5 h-2 w-0.5 rounded bg-slate-200" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SemesterPage() {
  const { data: semesterData, isLoading, error } = useSemesters();
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  if (isLoading) return <LoadingPage />;
  if (error)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200/60 bg-red-50/70 px-6 py-4 text-red-700 shadow-sm">
          Lỗi: {error.message}
        </div>
      </div>
    );

  const list = (semesterData ?? []) as SemesterItem[];

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(37,99,235,0.15),transparent_60%),radial-gradient(40%_30%_at_90%_10%,rgba(14,165,233,0.12),transparent_60%),radial-gradient(30%_25%_at_10%_20%,rgba(99,102,241,0.10),transparent_60%)]" />
        <div className="absolute inset-0 [background-size:22px_22px] opacity-[0.05] [background:linear-gradient(0deg,transparent_21px,rgba(2,6,23,0.08)_22px),linear-gradient(90deg,transparent_21px,rgba(2,6,23,0.08)_22px)]" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h2 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <span className="inline-grid place-items-center rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 p-2 text-white shadow-sm ring-1 ring-white/10">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-500 bg-clip-text text-transparent">
              Danh sách học kỳ
            </span>
          </h2>
          <p className="text-sm text-slate-500">
            Nhấn “Xem đánh giá tiêu chí” để mở danh sách tiêu chí của học kỳ.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-[0_10px_40px_-20px_rgba(2,6,23,0.25)] backdrop-blur"
      >
        <motion.div
          aria-hidden
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, #a5b4fc, #7dd3fc, #bfdbfe, #a5b4fc)",
            opacity: 0.22,
            filter: "blur(12px)",
          }}
        />

        {list.length === 0 ? (
          <div className="grid min-h-[360px] place-items-center">
            <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-8 text-center text-slate-500 shadow-sm">
              Không có học kỳ nào được tìm thấy
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-0 left-5 h-full w-[2px] bg-gradient-to-b from-indigo-300/60 via-slate-200 to-sky-300/60" />
            <ul className="space-y-5">
              {list.map((s, idx) => {
                const status = getStatus(s.startDate, s.endDate);
                const startStr = formatDateStr(s.startDate);
                const endStr = formatDateStr(s.endDate);
                const open = expandedId === s.id;

                return (
                  <li key={s.id} className="relative pl-14">
                    <div
                      className={[
                        "absolute top-2 left-3 grid h-5 w-5 place-items-center rounded-full bg-white ring-4",
                        status.ring,
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "block h-2.5 w-2.5 rounded-full",
                          status.color,
                        ].join(" ")}
                      />
                    </div>

                    <div className="group relative rounded-2xl border border-slate-200/80 bg-white/90 p-0 shadow-sm transition hover:shadow-md">
                      <div
                        className={`h-[6px] w-full rounded-t-2xl bg-gradient-to-r ${status.topbar}`}
                      />
                      <div className="p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={[
                                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                                  status.pill,
                                ].join(" ")}
                              >
                                {status.icon}
                                {status.label}
                              </span>
                            </div>
                            <h3 className="mt-1 line-clamp-1 text-lg font-extrabold tracking-tight text-slate-900">
                              {s.name}
                            </h3>
                            <p className="mt-1 line-clamp-3 text-sm font-medium text-slate-700">
                              {s.description || "Không có mô tả"}
                            </p>
                          </div>
                          <div className="shrink-0 md:pl-6">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                              <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="h-4 w-4 text-indigo-600" />
                                <span className="font-semibold">
                                  {startStr}
                                </span>
                              </div>
                              <div className="mt-1.5 flex items-center gap-2 text-sm">
                                <CalendarDays className="h-4 w-4 text-sky-600" />
                                <span className="font-semibold">{endStr}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(open ? null : s.id);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-indigo-700 hover:to-sky-600"
                            aria-expanded={open}
                            aria-controls={`criteria-panel-${s.id}`}
                          >
                            <Eye className="h-4 w-4" />
                            {open
                              ? "Thu gọn tiêu chí"
                              : "Xem đánh giá tiêu chí"}
                            {open ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              id={`criteria-panel-${s.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              <CriteriaPanel semesterId={s.id} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {idx !== list.length - 1 && (
                      <div className="mt-2 ml-5 h-3 w-0.5 rounded bg-slate-200" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}

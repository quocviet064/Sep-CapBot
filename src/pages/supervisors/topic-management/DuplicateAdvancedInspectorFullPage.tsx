import { useLocation, useNavigate, generatePath } from "react-router-dom";
import { Button } from "@/components/globals/atoms/button";
import { Badge } from "@/components/globals/atoms/badge";
import {
  ArrowLeft,
  Gauge,
  Sparkles,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Lightbulb,
  Info,
  PlusCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "@/hooks/useCategory";
import { useSemesters } from "@/hooks/useSemester";
import {
  clamp01,
  statusTone,
  toneClasses,
  RadialGauge,
  useCountUp,
  pct,
} from "../ai-check-duplicate/kit";
import { toast } from "sonner";
import type {
  AdvancedDuplicateResponse,
  DuplicateCheckBlock,
} from "@/services/aiDuplicateAdvancedService";

type NavState = {
  result: AdvancedDuplicateResponse;
  formSnapshot?: {
    eN_Title?: string;
    vN_title?: string;
    abbreviation?: string;
    problem?: string;
    context?: string;
    content?: string;
    description?: string;
    objectives?: string;
    categoryId?: number;
    semesterId?: number;
    maxStudents?: number;
    categoryName?: string;
    semesterName?: string;
    fileToken?: string | null;
    topicId?: number;
    __fromSuggestion?: boolean;
  };
};

function StatusPill({
  status,
  value,
}: {
  status: DuplicateCheckBlock["status"];
  value: number;
}) {
  if (status === "duplicate_found")
    return (
      <Badge className="bg-red-600 text-white">
        <ShieldAlert className="mr-1 h-3.5 w-3.5" />
        Trùng lặp {pct(value)}
      </Badge>
    );
  if (status === "potential_duplicate")
    return (
      <Badge className="bg-amber-500 text-white">
        <AlertTriangle className="mr-1 h-3.5 w-3.5" />
        Có khả năng {pct(value)}
      </Badge>
    );
  return (
    <Badge className="bg-emerald-600 text-white">
      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
      Không trùng lặp
    </Badge>
  );
}

function RiskMeter({ value }: { value: number }) {
  const animated = useCountUp(value, 1200, 300);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/5"
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Gauge className="h-4 w-4 text-neutral-600" />
        Mức rủi ro trùng lặp
        <span className="ml-auto text-xs text-neutral-500">
          {pct(animated)}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-neutral-100">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: pct(animated) }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400"
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
        <span>Thấp</span>
        <span>Trung bình</span>
        <span>Cao</span>
      </div>
    </motion.div>
  );
}

function SectionPanel({
  title,
  icon,
  tone = "neutral",
  children,
  delay = 0.05,
  defaultOpen = false,
  collapsible = true,
}: {
  title: string;
  icon: React.ReactNode;
  tone?: "neutral" | "violet" | "sky" | "fuchsia";
  children: React.ReactNode;
  delay?: number;
  defaultOpen?: boolean;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const t = toneClasses(tone);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-black/5"
    >
      <div
        className={[
          "relative flex items-center justify-between px-4 py-3",
          "bg-gradient-to-r",
          t.grad,
        ].join(" ")}
      >
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-neutral-800 shadow-sm">
            {icon}
          </div>
          <div className="text-sm font-semibold text-neutral-900">{title}</div>
        </div>
        {collapsible && (
          <button
            onClick={() => setOpen((s) => !s)}
            className="text-xs text-neutral-700"
          >
            {open ? "Thu gọn" : "Mở rộng"}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {(!collapsible || open) && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden px-4 py-3 text-sm"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WarmupOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-white/70 backdrop-blur-sm"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="w-[320px] rounded-2xl border bg-white p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-neutral-600" />
              <div className="text-sm font-semibold">
                Đang tổng hợp kết quả AI…
              </div>
            </div>
            <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-neutral-100">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
                className="h-full bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200"
              />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function DuplicateAdvancedInspectorFullPage() {
  const nav = useNavigate();
  const { state } = useLocation() as { state?: NavState };
  const data = state?.result;

  const [warmup, setWarmup] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setWarmup(false), 650);
    return () => clearTimeout(id);
  }, []);

  const { data: categories = [] } = useCategories();
  const { data: semesters = [] } = useSemesters();

  const categoryMap = useMemo(() => {
    const m = new Map<number, string>();
    categories.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const semesterMap = useMemo(() => {
    const m = new Map<number, string>();
    semesters.forEach((s) => m.set(s.id, s.name));
    return m;
  }, [semesters]);

  const chipCategory =
    (state?.formSnapshot?.categoryId &&
      categoryMap.get(state.formSnapshot.categoryId)) ||
    state?.formSnapshot?.categoryName ||
    "—";

  const chipSemester =
    (state?.formSnapshot?.semesterId &&
      semesterMap.get(state.formSnapshot.semesterId)) ||
    state?.formSnapshot?.semesterName ||
    "—";

  const chips = [
    ["EN Title", state?.formSnapshot?.eN_Title],
    ["VN Title", state?.formSnapshot?.vN_title],
    ["Danh mục", chipCategory],
    ["Kỳ học", chipSemester],
  ] as const;

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4">
        <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <Sparkles className="h-6 w-6 text-neutral-600" />
          </div>
          <div className="mb-1 text-lg font-semibold">
            Không có dữ liệu kiểm tra
          </div>
          <div className="text-sm text-neutral-600">
            Hãy quay lại trang trước và thực hiện kiểm tra trùng lặp.
          </div>
          <div className="mt-5">
            <Button
              onClick={() => nav(-1)}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const s = data.duplicate_check;
  const mod = data.modification_proposal;
  const tone = statusTone(s.status) as "red" | "amber" | "emerald";
  const t = toneClasses(tone);

  const onCreateClick = () => {
    const topicId = state?.formSnapshot?.topicId;
    if (!topicId) {
      toast.error("Thiếu topicId để mở trang xác nhận chỉnh sửa.");
      return;
    }
    if (s.status === "duplicate_found") {
      toast.error(
        "Hệ thống phát hiện đề tài trùng lặp. Vui lòng chỉnh sửa hoặc dùng gợi ý trước khi tạo.",
      );
      return;
    }
    if (s.status === "potential_duplicate") {
      const ok = window.confirm(
        "Kết quả cho thấy có khả năng trùng lặp. Bạn có chắc chắn muốn tiếp tục?",
      );
      if (!ok) return;
    }
    nav(
      generatePath("/supervisors/topics/:id/suggest-preview", {
        id: String(topicId),
      }),
      {
        state: { formSnapshot: { ...(state?.formSnapshot ?? {}) } },
      },
    );
  };
  const onBack = () => {
    const topicId = state?.formSnapshot?.topicId;
    if (topicId) {
      nav(
        generatePath("/supervisors/topics/:id/suggest-edit", {
          id: String(topicId),
        }),
        { state: { formSnapshot: state?.formSnapshot } },
      );
    } else {
      nav(-1);
    }
  };

  const handleUseSuggestion = () => {
    const suggested = mod?.modified_topic || {};
    const topicId = state?.formSnapshot?.topicId;

    if (!topicId) {
      toast.error("Thiếu topicId để mở trang chỉnh sửa từ gợi ý.");
      return;
    }

    const categoryId =
      (suggested.categoryId as number | undefined) ??
      (state?.formSnapshot?.categoryId as number | undefined) ??
      0;
    const semesterId =
      (suggested.semesterId as number | undefined) ??
      (state?.formSnapshot?.semesterId as number | undefined) ??
      0;

    const categoryName =
      (categoryId && categories.find((c) => c.id === categoryId)?.name) ||
      state?.formSnapshot?.categoryName ||
      "";
    const semesterName =
      (semesterId && semesters.find((s) => s.id === semesterId)?.name) ||
      state?.formSnapshot?.semesterName ||
      "";

    const snapshot = {
      eN_Title: suggested.title ?? state?.formSnapshot?.eN_Title ?? "",
      vN_title: state?.formSnapshot?.vN_title ?? "",
      abbreviation: state?.formSnapshot?.abbreviation ?? "",
      problem: suggested.problem ?? state?.formSnapshot?.problem ?? "",
      context: suggested.context ?? state?.formSnapshot?.context ?? "",
      content: suggested.content ?? state?.formSnapshot?.content ?? "",
      description:
        suggested.description ?? state?.formSnapshot?.description ?? "",
      objectives: suggested.objectives ?? state?.formSnapshot?.objectives ?? "",
      categoryId,
      semesterId,
      maxStudents: state?.formSnapshot?.maxStudents ?? 5,
      categoryName,
      semesterName,
      fileToken: state?.formSnapshot?.fileToken ?? null,
      topicId,
      __fromSuggestion: true,
    };

    nav(
      generatePath("/supervisors/topics/:id/suggest-edit", {
        id: String(topicId),
      }),
      { state: { formSnapshot: snapshot } },
    );
  };

  return (
    <>
      <WarmupOverlay show={warmup} />

      <div className="w-full space-y-6 px-3 md:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-[0_10px_40px_-20px_rgba(2,6,23,0.25)] backdrop-blur"
        >
          <div className="pointer-events-none absolute -top-14 -right-14 h-56 w-56 rounded-full bg-gradient-to-br from-blue-300/25 to-cyan-300/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-gradient-to-tr from-indigo-300/20 to-sky-300/20 blur-2xl" />
          <div className="pointer-events-none absolute inset-0 [background-size:25px_25px] opacity-[0.05] [background:linear-gradient(0deg,transparent_24px,rgba(2,6,23,0.08)_25px),linear-gradient(90deg,transparent_24px,rgba(2,6,23,0.08)_25px)]" />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1.5">
              <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900">
                <span className="inline-grid place-items-center rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 p-2 text-white shadow-sm ring-1 ring-white/10">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <span className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-500 bg-clip-text text-transparent">
                  Kết quả kiểm tra trùng lặp
                </span>
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Thời gian xử lý:{" "}
                  {typeof s.processing_time === "number"
                    ? `${s.processing_time}s`
                    : "—"}
                </div>
                <span className="hidden h-3 w-px bg-slate-300 md:inline-block" />
                <div className="inline-flex items-center gap-1.5">
                  Ngưỡng phát hiện:{" "}
                  <span className="font-semibold text-slate-800">
                    {pct(s.threshold || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusPill
                status={s.status}
                value={Number(s.similarity_score) || 0}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <RadialGauge
              value={Number(s.similarity_score) || 0}
              label="Mức tương tự cao nhất"
              helper={
                s.status === "no_duplicate"
                  ? "Không phát hiện trùng."
                  : "So với đề tài gần nhất."
              }
              tone={tone}
              size={176}
              stroke={14}
              delay={warmup ? 800 : 200}
            />
          </div>
          <div className="md:col-span-1">
            <RadialGauge
              value={Number(s.threshold) || 0}
              label="Ngưỡng phát hiện"
              helper="Giới hạn đánh dấu trùng."
              tone="sky"
              size={176}
              stroke={14}
              delay={warmup ? 900 : 280}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/5"
          >
            <div className="mb-2 text-sm font-semibold">Thông tin nhanh</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border bg-white/60 p-3">
                <div className="text-xs text-neutral-500">Trạng thái</div>
                <div className="mt-1">
                  <StatusPill
                    status={s.status}
                    value={Number(s.similarity_score) || 0}
                  />
                </div>
              </div>
              <div className="rounded-xl border bg-white/60 p-3">
                <div className="text-xs text-neutral-500">Thời gian</div>
                <div className="mt-1 font-medium">
                  {typeof s.processing_time === "number"
                    ? `${s.processing_time}s`
                    : "—"}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RiskMeter value={Number(s.similarity_score) || 0} />
          </div>
          {state?.formSnapshot && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/5"
            >
              <div className="mb-2 text-sm font-semibold">Tóm tắt đề xuất</div>
              <div className="flex flex-wrap gap-2">
                {chips.map(([k, v]) => (
                  <span
                    key={String(k)}
                    className="rounded-full border bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
                    title={`${k}: ${v || "—"}`}
                  >
                    {k}:{" "}
                    <span className="text-neutral-900">{String(v ?? "—")}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SectionPanel
            title="Phân tích chi tiết"
            icon={<FileSearch className="h-4 w-4" />}
            tone="sky"
            defaultOpen
            delay={0.12}
          >
            {s.message ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: String(s.message).replace(/\n/g, "<br/>"),
                }}
              />
            ) : (
              <div className="text-sm text-neutral-500">—</div>
            )}
          </SectionPanel>
          <SectionPanel
            title="Khuyến nghị cải thiện"
            icon={<Lightbulb className="h-4 w-4" />}
            tone="fuchsia"
            defaultOpen
            delay={0.18}
          >
            {Array.isArray(s.recommendations) &&
            s.recommendations.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5">
                {s.recommendations.map((r, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="text-sm text-neutral-800"
                  >
                    {r}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-neutral-500">—</div>
            )}
          </SectionPanel>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="relative overflow-hidden rounded-3xl border-0 shadow-lg ring-1 ring-black/5"
        >
          <div className="absolute inset-0 -z-0 bg-[radial-gradient(60%_60%_at_100%_0%,rgba(99,102,241,.16),rgba(99,102,241,0)_60%),radial-gradient(40%_50%_at_0%_100%,rgba(236,72,153,.14),rgba(236,72,153,0)_60%)]" />
          <div className="flex items-center justify-between bg-neutral-900/95 px-6 py-4 text-white backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-base font-semibold tracking-wide">
                  Đề tài tương tự
                </div>
                <div className="text-xs text-white/70">
                  Các chủ đề có mức gần giống cao nhất với đề tài của bạn
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px]">
              <Sparkles className="h-3.5 w-3.5" />
              Relevance Ranking
            </div>
          </div>

          <div className="bg-white p-5">
            {s.similar_topics?.length ? (
              <div className="divide-y">
                {s.similar_topics.map((topic, i) => {
                  const semesterName = topic.semesterId
                    ? semesterMap.get(topic.semesterId) || null
                    : null;
                  const categoryName = topic.categoryId
                    ? categoryMap.get(topic.categoryId) || null
                    : null;
                  return (
                    <motion.div
                      key={`${topic.id}-${topic.topicId}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.06 + i * 0.04 }}
                      className="group relative flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-neutral-50/70"
                    >
                      <div className="relative h-11 w-11 shrink-0">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(${t.color} ${
                              clamp01(topic.similarity_score) * 360
                            }deg, #E5E7EB ${
                              clamp01(topic.similarity_score) * 360
                            }deg)`,
                          }}
                        />
                        <div className="absolute inset-[5px] rounded-full bg-white shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/5" />
                        <div className="absolute inset-0 grid place-items-center text-[11px] font-bold text-neutral-800">
                          {Math.round(clamp01(topic.similarity_score) * 100)}%
                        </div>
                      </div>

                      <div className="grid w-full min-w-0 grid-cols-1 items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-semibold text-neutral-900">
                            {topic.eN_Title || "—"}
                          </div>
                          <div className="truncate text-[13px] text-neutral-600">
                            {topic.vN_title || "—"}
                          </div>
                          <div className="mt-1 flex min-w-0 items-center gap-2 text-[12px] text-neutral-500">
                            <div className="truncate">
                              {semesterName || "Semester —"}
                            </div>
                            <span className="opacity-40">•</span>
                            <div className="truncate">
                              {categoryName || "Category —"}
                            </div>
                            {topic.source ? (
                              <>
                                <span className="opacity-40">•</span>
                                <div className="truncate">{topic.source}</div>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 md:justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full px-3"
                            onClick={() =>
                              topic.topicId &&
                              nav(
                                `/supervisors/ai-check-duplicate/${topic.topicId}`,
                              )
                            }
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-600">
                Không có đề tài tương tự
              </div>
            )}
          </div>
        </motion.div>

        {mod?.modified_topic && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="overflow-hidden rounded-3xl border bg-white p-0 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 px-6 py-4 text-white">
              <div className="text-base font-semibold tracking-wide">
                Đề xuất chỉnh sửa
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px]">
                <Sparkles className="h-3.5 w-3.5" />
                Gợi ý AI
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-3">
              <div className="relative rounded-2xl border bg-gradient-to-b from-violet-50 to-white p-4 ring-1 ring-violet-100">
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-violet-200/40 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-fuchsia-200/40 blur-2xl" />
                <RadialGauge
                  value={Number(mod.similarity_improvement) || 0}
                  label="Cải thiện ước tính"
                  helper="Sau khi áp dụng chỉnh sửa"
                  size={188}
                  stroke={14}
                  tone="emerald"
                  delay={warmup ? 800 : 200}
                />
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border bg-white/70 p-3">
                    <div className="text-[11px] text-neutral-500">
                      Trạng thái hiện tại
                    </div>
                    <div className="mt-1 font-medium">
                      <StatusPill
                        status={s.status}
                        value={Number(s.similarity_score) || 0}
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border bg-white/70 p-3">
                    <div className="text-[11px] text-neutral-500">
                      Ngưỡng phát hiện
                    </div>
                    <div className="mt-1 font-semibold">
                      {pct(Number(s.threshold) || 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="rounded-2xl border bg-white p-4 ring-1 ring-black/5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Phần nội dung gợi ý
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {typeof mod.processing_time === "number"
                        ? `${mod.processing_time}s`
                        : "—"}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border bg-neutral-50 p-3">
                      <div className="text-[11px] text-neutral-500">
                        Tiêu đề gợi ý
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm font-medium text-neutral-900">
                        {mod.modified_topic.title || "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-neutral-50 p-3">
                      <div className="text-[11px] text-neutral-500">
                        Mục tiêu
                      </div>
                      <div className="mt-1 text-sm text-neutral-800">
                        {mod.modified_topic.objectives || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="rounded-xl border bg-white p-3">
                      <div className="text-[11px] text-neutral-500">Mô tả</div>
                      <div className="mt-1 text-sm text-neutral-800">
                        {mod.modified_topic.description || "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-white p-3">
                      <div className="text-[11px] text-neutral-500">
                        Nội dung
                      </div>
                      <div className="mt-1 text-sm whitespace-pre-wrap text-neutral-800">
                        {mod.modified_topic.content || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {(Array.isArray(mod.modifications_made) &&
                  mod.modifications_made.length > 0) ||
                mod.rationale ? (
                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border bg-white p-4 ring-1 ring-black/5">
                      <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
                        <Gauge className="h-4 w-4 text-violet-600" />
                        Các chỉnh sửa đã thực hiện
                      </div>
                      {mod.modifications_made?.length ? (
                        <ul className="space-y-2">
                          {mod.modifications_made.map((m, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25, delay: i * 0.05 }}
                              className="flex items-start gap-2"
                            >
                              <span className="mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200">
                                {i + 1}
                              </span>
                              <span className="text-sm text-neutral-800">
                                {m}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-neutral-500">—</div>
                      )}
                    </div>

                    <div className="rounded-2xl border bg-white p-4 ring-1 ring-black/5">
                      <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
                        <Info className="h-4 w-4 text-fuchsia-600" />
                        Lý do
                      </div>
                      <div className="min-h-[84px] rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-800">
                        {mod.rationale || "—"}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}

        <div className="sticky bottom-3 z-30">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onBack}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(s.status === "duplicate_found" ||
                s.status === "potential_duplicate") && (
                <Button
                  variant={
                    s.status === "duplicate_found" ? undefined : "outline"
                  }
                  onClick={handleUseSuggestion}
                  className="inline-flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Sử dụng gợi ý
                </Button>
              )}

              {s.status === "duplicate_found" ? (
                <div
                  onClick={() =>
                    toast.error(
                      "Hệ thống phát hiện đề tài trùng lặp. Không thể tạo ngay lúc này.",
                    )
                  }
                  className="inline-flex items-center"
                  title="Không thể tạo vì hệ thống phát hiện trùng lặp"
                ></div>
              ) : (
                <Button
                  onClick={onCreateClick}
                  className="inline-flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Tạo chỉnh sửa
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

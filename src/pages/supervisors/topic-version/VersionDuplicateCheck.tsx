import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
import { useCategories } from "@/hooks/useCategory";
import { useSemesters } from "@/hooks/useSemester";
import { useCheckDuplicateAdvanced } from "@/hooks/useAiDuplicateAdvanced";
import {
  pct,
  clamp01,
  statusTone,
  toneClasses,
  RadialGauge,
  useCountUp,
} from "../ai-check-duplicate/kit";

type FormSnapshot = {
  eN_Title?: string;
  vN_title?: string;
  title?: string;
  abbreviation?: string;
  problem?: string;
  context?: string;
  content?: string;
  description?: string;
  objectives?: string;
  methodology?: string;
  expectedOutcomes?: string;
  requirements?: string;
  supervisorId?: number;
  supervisorName?: string;
  docFileName?: string;
  docFileSize?: number;
  categoryId?: number;
  categoryName?: string;
  semesterId?: number;
  semesterName?: string;
  maxStudents?: number;
  fileToken?: string | null;
  fileId?: number;
  __fromSuggestion?: boolean;
};

type LocationState = {
  formSnapshot?: FormSnapshot;
  topicId?: number;
  submissionId?: number;
};

type DuplicateStatus =
  | "duplicate_found"
  | "potential_duplicate"
  | "no_duplicate";

type StateType = {
  result: {
    duplicate_check: {
      status: DuplicateStatus;
      similarity_score: number;
      similar_topics: Array<{
        id: string;
        topicId: number;
        versionId: number | null;
        versionNumber: number | null;
        eN_Title: string | null;
        vN_title: string | null;
        semesterId?: number | null;
        categoryId?: number | null;
        similarity_score: number;
        source?: string | null;
        createdAt?: string | null;
      }>;
      threshold: number;
      message?: string;
      recommendations?: string[];
      processing_time?: number;
    };
    modification_proposal?: {
      modified_topic?: {
        title?: string;
        eN_Title?: string;
        description?: string;
        objectives?: string;
        problem?: string;
        context?: string;
        content?: string;
        categoryId?: number;
        supervisorId?: number;
        semesterId?: number;
        maxStudents?: number;
        methodology?: string;
        expectedOutcomes?: string;
        requirements?: string;
      };
      modifications_made?: string[];
      rationale?: string;
      similarity_improvement?: number;
      processing_time?: number;
    };
  };
  formSnapshot?: FormSnapshot;
};

type ModifiedTopic = NonNullable<
  StateType["result"]["modification_proposal"]
>["modified_topic"];

function StatusPill({
  status,
  value,
}: {
  status: StateType["result"]["duplicate_check"]["status"];
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

export default function VersionDuplicateCheck() {
  const nav = useNavigate();
  const { state } = useLocation() as { state?: LocationState };
  const topicId = state?.topicId;
  const [searchParams] = useSearchParams();

  const submissionIdFromQuery = searchParams.get("submissionId");
  const submissionId =
    typeof state?.submissionId === "number"
      ? state.submissionId
      : submissionIdFromQuery
        ? Number(submissionIdFromQuery)
        : undefined;

  const snap = state?.formSnapshot;

  const handleBack = () => {
    if (snap && topicId) {
      nav(`/topics/${topicId}/versions/create-suggest`, {
        state: { seed: { ...snap }, ...(submissionId ? { submissionId } : {}) },
      });
    } else {
      nav(-1);
    }
  };

  const threshold = Number(searchParams.get("threshold") ?? "0.8") || 0.8;
  const last_n_semesters =
    Number(searchParams.get("last_n_semesters") ?? "3") || 3;
  const semester_id_param = searchParams.get("semester_id");
  const semester_id = semester_id_param ? Number(semester_id_param) : undefined;

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

  const chips = [
    ["EN Title", snap?.eN_Title || ""],
    ["VN Title", snap?.vN_title || ""],
    ["Danh mục", snap?.categoryName || ""],
    ["Kỳ học", snap?.semesterName || ""],
  ] as const;

  const { mutateAsync: checkDuplicate, isPending } =
    useCheckDuplicateAdvanced();
  const [result, setResult] = useState<StateType["result"] | null>(null);
  const [warmup, setWarmup] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setWarmup(false), 650);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const doCheck = async () => {
      if (!snap) return;

      const body = {
        title: String(snap.vN_title ?? "").trim(),
        vN_title: String(snap.vN_title ?? "").trim(),
        eN_Title: String(snap.eN_Title ?? "").trim(),
        problem: String(snap.problem ?? "").trim(),
        context: String(snap.context ?? "").trim(),
        content: String(snap.content ?? "").trim(),
        description: String(snap.description ?? "").trim(),
        objectives: String(snap.objectives ?? "").trim(),
        semesterId:
          typeof snap.semesterId === "number"
            ? Number(snap.semesterId)
            : undefined,
        fileId: typeof snap.fileId === "number" ? snap.fileId : undefined,
      };

      if (!body.title) {
        toast.error(
          "Thiếu VN Title (title). Vui lòng nhập trước khi kiểm tra.",
        );
        return;
      }

      try {
        const res = await checkDuplicate({
          body,
          params: {
            threshold,
            last_n_semesters,
            semester_id:
              typeof semester_id === "number" ? semester_id : undefined,
          },
        });

        setResult({
          duplicate_check: res.duplicate_check,
          modification_proposal: res.modification_proposal,
        });
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Không kiểm tra được trùng lặp. Vui lòng thử lại.";
        toast.error(msg);
      }
    };

    if (snap) void doCheck();
  }, [snap, checkDuplicate, threshold, last_n_semesters, semester_id]);

  if (!snap) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4">
        <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <Sparkles className="h-6 w-6 text-neutral-600" />
          </div>
          <div className="mb-1 text-lg font-semibold">
            Thiếu dữ liệu kiểm tra
          </div>
          <div className="text-sm text-neutral-600">
            Hãy quay lại trang Tạo phiên bản và nhập thông tin trước khi kiểm
            tra.
          </div>
          <div className="mt-5">
            <Button
              onClick={handleBack}
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

  if (!result) {
    return (
      <>
        <WarmupOverlay show={isPending || warmup} />
        <div className="mx-auto max-w-4xl space-y-4 p-4">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Sparkles className="h-6 w-6 text-neutral-600" />
            </div>
            <div className="mb-1 text-lg font-semibold">
              Đang kiểm tra trùng lặp…
            </div>
            <div className="text-sm text-neutral-600">
              Vui lòng đợi trong giây lát để hiển thị kết quả.
            </div>
            <div className="mt-5">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const s = result.duplicate_check;
  const mod = result.modification_proposal;
  const tone = statusTone(s.status) as "red" | "amber" | "emerald";
  const t = toneClasses(tone);

  const handleUseSuggestion = () => {
    const suggested = (mod?.modified_topic ?? {}) as ModifiedTopic;

    const categoryId = suggested?.categoryId ?? snap.categoryId ?? 0;
    const semesterId = suggested?.semesterId ?? snap.semesterId ?? 0;

    const categoryName =
      (categoryId && categories.find((c) => c.id === categoryId)?.name) ||
      snap.categoryName ||
      "";
    const semesterName =
      (semesterId && semesters.find((s) => s.id === semesterId)?.name) ||
      snap.semesterName ||
      "";

    const seed: FormSnapshot = {
      eN_Title: suggested?.eN_Title ?? snap.eN_Title ?? "",
      vN_title: suggested?.title ?? snap.vN_title ?? "",
      description: suggested?.description ?? snap.description ?? "",
      objectives: suggested?.objectives ?? snap.objectives ?? "",
      methodology: suggested?.methodology ?? snap.methodology ?? "",
      expectedOutcomes:
        suggested?.expectedOutcomes ?? snap.expectedOutcomes ?? "",
      requirements: suggested?.requirements ?? snap.requirements ?? "",
      problem: suggested?.problem ?? snap.problem ?? "",
      context: suggested?.context ?? snap.context ?? "",
      content: suggested?.content ?? snap.content ?? "",
      supervisorId: snap.supervisorId,
      supervisorName: snap.supervisorName,
      categoryId,
      categoryName,
      semesterId,
      semesterName,
      docFileName: snap.docFileName,
      docFileSize: snap.docFileSize,
      fileId: snap.fileId,
    };

    if (!topicId || Number.isNaN(Number(topicId))) {
      toast.error(
        "Thiếu topicId. Vui lòng mở kiểm tra trùng lặp lại từ trang phiên bản của đề tài.",
      );
      return;
    }

    nav(`/topics/${topicId}/versions/create-suggest`, {
      state: { seed, ...(submissionId ? { submissionId } : {}) },
    });
  };

  const onCreateClick = () => {
    if (s.status === "duplicate_found") {
      toast.error(
        "Hệ thống phát hiện đề tài trùng lặp. Vui lòng chỉnh sửa hoặc dùng gợi ý trước khi tạo.",
      );
      return;
    }

    if (s.status === "potential_duplicate") {
      const ok = window.confirm(
        "Kết quả cho thấy có khả năng trùng lặp. Bạn có chắc chắn muốn tiếp tục tạo đề tài?",
      );
      if (!ok) return;
    }

    nav("/supervisors/topics/create-version-confirm", {
      state: {
        formSnapshot: { ...(snap ?? {}) },
        topicId,
        submissionId,
      },
    });
  };

  return (
    <>
      <WarmupOverlay show={false} />

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
                  Kết quả kiểm tra trùng lặp (Phiên bản)
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
              delay={200}
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
              delay={280}
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
          {!!snap && (
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
                <Sparkles className="h-4 w-4" />
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
                      key={`${topic.id}-${topic.topicId}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.06 + i * 0.04 }}
                      className="group relative flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-neutral-50/70"
                    >
                      <div className="relative h-11 w-11 shrink-0">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(${t.color} ${clamp01(topic.similarity_score) * 360}deg, #E5E7EB ${
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
                            onClick={() => {
                              toast.info(
                                "Mở chi tiết đề tài tương tự (chưa cấu hình route).",
                              );
                            }}
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
                  delay={200}
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
                        Tiêu đề gợi ý (VN)
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm font-medium text-neutral-900">
                        {mod.modified_topic?.title || "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-neutral-50 p-3">
                      <div className="text-[11px] text-neutral-500">
                        Mục tiêu
                      </div>
                      <div className="mt-1 text-sm text-neutral-800">
                        {mod.modified_topic?.objectives || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="rounded-xl border bg-white p-3">
                      <div className="text-[11px] text-neutral-500">Mô tả</div>
                      <div className="mt-1 text-sm text-neutral-800">
                        {mod.modified_topic?.description || "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-white p-3">
                      <div className="text-[11px] text-neutral-500">
                        Nội dung
                      </div>
                      <div className="mt-1 text-sm whitespace-pre-wrap text-neutral-800">
                        {mod.modified_topic?.content || "—"}
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
                onClick={handleBack}
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
                >
                  <Button
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-2 opacity-60 select-none"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Tạo đề tài
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={onCreateClick}
                  className="inline-flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Tạo đề tài
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

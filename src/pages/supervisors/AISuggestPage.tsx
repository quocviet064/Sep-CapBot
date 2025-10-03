import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  Atom,
  CalendarDays,
  FileText,
  Sparkles,
  Tag,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/globals/atoms/button";
import { Badge } from "@/components/globals/atoms/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/globals/atoms/dropdown-menu";
import { useSemesters, useSemesterById } from "@/hooks/useSemester";
import { formatDateTime } from "@/utils/formatter";
import { useTopicSuggestionsV2 } from "@/hooks/useAiDuplicateAdvanced";

const STORAGE_NS = "AISuggestPage:v4";
const AI_IMG = "/assets/ai-mascot.png";
const CACHE_MAX_AGE_MS = 10 * 60 * 1000;

type AppWindow = Window & { __APP_USER_ID__?: string | number };

function getScopedKey() {
  const uid =
    typeof window !== "undefined"
      ? String((window as AppWindow).__APP_USER_ID__ ?? "anon")
      : "anon";
  return `${STORAGE_NS}:${uid}`;
}

type Suggestion = {
  eN_Title?: string | null;
  vN_title?: string | null;
  abbreviation?: string | null;
  problem?: string | null;
  context?: string | null;
  content?: string | null;
  description?: string | null;
  objectives?: string | null;
  category?: string | null;
  difficulty_level?: string | null;
  estimated_duration?: string | null;
  team_size?: number | null;
  suggested_roles?: string[] | null;
};

type TopicSuggestResponse = {
  suggestions: Suggestion[];
  trending_areas?: string[];
  processing_time?: number;
  generated_at?: string;
};

function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 w-full rounded bg-slate-100" />
      ))}
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </div>
        <div className="truncate text-sm font-semibold text-slate-900">
          {value}
        </div>
        {hint && <div className="truncate text-xs text-slate-500">{hint}</div>}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-[conic-gradient(at_20%_10%,#ffedd5,transparent_30%,#fde68a_60%,transparent_70%)] opacity-70" />
      <div className="relative flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg"
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Atom className="h-7 w-7" />
            </motion.div>
            <motion.span
              className="absolute -right-2 -bottom-2 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-orange-600 ring-1 ring-orange-200"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              AI
            </motion.span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Gợi ý đề tài hoàn hảo
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Tìm ý tưởng đề tài theo xu hướng bằng AI. Chọn học kỳ, khám phá
              gợi ý, và áp dụng ngay cho nhóm của bạn.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-slate-200 bg-white hover:bg-white"
          onClick={() => (history.length > 1 ? history.back() : undefined)}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
      </div>
    </div>
  );
}

function AiMascot({
  onActivate,
  disabled,
  isLoading,
  departing,
}: {
  onActivate?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  departing?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotX = useSpring(useTransform(my, [0, 1], [12, -12]), {
    stiffness: 120,
    damping: 12,
  });
  const rotY = useSpring(useTransform(mx, [0, 1], [-16, 16]), {
    stiffness: 120,
    damping: 12,
  });
  const scale = useSpring(hovered && !disabled ? 1.06 : 1, {
    stiffness: 180,
    damping: 18,
  });
  const glow = useSpring(hovered && !disabled ? 0.8 : 0.45, {
    stiffness: 140,
    damping: 16,
  });

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        r: 140 + (i % 4) * 14,
        size: 4 - (i % 3),
        dur: 12 + (i % 5) * 2,
        delay: (i * 0.37) % 3,
      })),
    [],
  );

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLoading) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const handleActivate = () => {
    if (!disabled && onActivate) onActivate();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate?.();
    }
  };

  const showHint = !isLoading && !departing;
  const hintText = disabled
    ? "Hãy chọn học kỳ và chạm vào tôi, sẽ có điều bất ngờ"
    : "Chạm vào tôi, sẽ có điều bất ngờ";

  return (
    <motion.div
      className="relative mx-auto mt-4 flex w-full items-center justify-center"
      initial={false}
      animate={
        departing
          ? { x: 800, y: -120, rotate: 18, scale: 0.85, opacity: 0 }
          : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
      }
      transition={{ duration: 2, ease: "easeIn" }}
      style={{ pointerEvents: departing ? "none" : "auto" }}
    >
      <motion.div
        className="absolute -z-10 h-80 w-80 rounded-full bg-gradient-to-br from-orange-300/25 via-amber-300/25 to-yellow-300/25 blur-3xl"
        style={{ opacity: glow }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-2xl"
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.06, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleActivate}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Kích hoạt khám phá bằng AI"
        className={`relative grid place-items-center rounded-2xl ${disabled ? "cursor-default" : "cursor-pointer"} select-none`}
        style={{ perspective: 900 }}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
      >
        <AnimatePresence>
          {showHint && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 md:-right-2 md:left-auto md:translate-x-0"
            >
              <div className="relative rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-lg ring-1 ring-slate-200">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  <motion.span
                    animate={{ opacity: [0.85, 1, 0.85] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="whitespace-nowrap"
                  >
                    {hintText}
                  </motion.span>
                </div>
                <div className="absolute top-full left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1 rotate-45 bg-white ring-1 ring-slate-200 md:right-6 md:left-auto" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative"
          style={{
            rotateX: isLoading ? 0 : rotX,
            rotateY: isLoading ? 0 : rotY,
            scale,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            className="absolute inset-0 -z-10"
            animate={{ opacity: [0.25, 0.7, 0.25] }}
            transition={{
              duration: isLoading ? 1.6 : 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="absolute top-full left-1/2 h-4 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400/30 blur-md" />
          </motion.div>

          <motion.svg
            viewBox="0 0 300 300"
            className="absolute -z-10 h-[22rem] w-[22rem]"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: isLoading ? 10 : 22,
              ease: "linear",
            }}
            style={{ transformOrigin: "50% 50%" }}
          >
            <defs>
              <linearGradient id="ring1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
            </defs>
            <circle
              cx="150"
              cy="150"
              r="110"
              fill="none"
              stroke="url(#ring1)"
              strokeWidth="3"
              strokeDasharray="14 16"
              opacity="0.9"
            />
          </motion.svg>

          <motion.svg
            viewBox="0 0 300 300"
            className="absolute -z-10 h-[20rem] w-[20rem]"
            animate={{ rotate: -360 }}
            transition={{
              repeat: Infinity,
              duration: isLoading ? 7 : 16,
              ease: "linear",
            }}
            style={{ transformOrigin: "50% 50%" }}
          >
            <circle
              cx="150"
              cy="150"
              r="96"
              fill="none"
              stroke="rgba(59,130,246,0.35)"
              strokeWidth="2"
              strokeDasharray="6 10"
            />
          </motion.svg>

          <motion.div
            className="absolute -z-10 h-[19rem] w-[19rem] rounded-full ring-2 ring-amber-300/30"
            animate={{ rotate: [0, 360] }}
            transition={{
              repeat: Infinity,
              duration: isLoading ? 14 : 28,
              ease: "linear",
            }}
          >
            <span className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-orange-500 shadow-[0_0_14px_rgba(251,146,60,0.85)]" />
            <span className="absolute top-1/2 right-0 h-2 w-2 -translate-y-1/2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.85)]" />
            <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.85)]" />
          </motion.div>

          <motion.div
            animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              repeat: isLoading ? Infinity : 0,
              duration: isLoading ? 1.6 : 0.001,
              ease: "linear",
            }}
            className="relative grid place-items-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.img
              src={AI_IMG}
              alt="AI Mascot"
              draggable={false}
              className={`h-72 w-72 drop-shadow-[0_20px_40px_rgba(251,146,60,0.35)] ${disabled ? "opacity-80" : ""}`}
              animate={
                isLoading
                  ? {
                      scale: [1, 1.08, 1],
                      y: [0, -6, 0],
                      filter: [
                        "brightness(1)",
                        "brightness(1.15)",
                        "brightness(1)",
                      ],
                    }
                  : { y: [-6, -20, -6], rotate: [-4, 4, -4] }
              }
              transition={{
                duration: isLoading ? 1.2 : 3.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={!disabled ? { scale: 1.08 } : undefined}
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            />

            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.25rem]">
              <motion.div
                className="absolute -top-16 -left-28 h-96 w-24 rotate-12 bg-gradient-to-b from-white/0 via-white/40 to-white/0 mix-blend-screen"
                animate={{
                  x: [0, 360],
                  y: [0, 180],
                  opacity: isLoading ? [0.2, 0.9, 0.2] : [0.15, 0.5, 0.15],
                }}
                transition={{
                  duration: isLoading ? 1.6 : 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-x-4 top-1/3 h-0.5 bg-gradient-to-r from-cyan-200/0 via-cyan-200/70 to-cyan-200/0 mix-blend-screen"
                animate={{
                  y: ["0%", "65%", "0%"],
                  opacity: isLoading ? [0.3, 1, 0.3] : [0.1, 0.85, 0.1],
                }}
                transition={{
                  duration: isLoading ? 1.2 : 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[1.25rem]"
            animate={{
              boxShadow: isLoading
                ? [
                    "0 0 0 0 rgba(251,191,36,0.00)",
                    "0 0 72px 14px rgba(251,191,36,0.55)",
                    "0 0 0 0 rgba(251,191,36,0.00)",
                  ]
                : [
                    "0 0 0 0 rgba(251,191,36,0.00)",
                    "0 0 48px 8px rgba(251,191,36,0.35)",
                    "0 0 0 0 rgba(251,191,36,0.00)",
                  ],
            }}
            transition={{
              duration: isLoading ? 1.4 : 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="pointer-events-none absolute inset-0 -z-10">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute top-1/2 left-1/2 block"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: isLoading ? Math.max(4, p.dur - 6) : p.dur,
                  ease: "linear",
                  delay: p.delay,
                }}
                style={{
                  width: 0,
                  height: 0,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <span
                  className="block rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  style={{
                    width: p.size,
                    height: p.size,
                    transform: `translate(${p.r}px, 0px)`,
                    filter: "drop-shadow(0 0 6px rgba(251,146,60,0.9))",
                  }}
                />
              </motion.span>
            ))}
          </div>

          <motion.button
            disabled={disabled}
            onClick={handleActivate}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-semibold shadow ${disabled ? "bg-slate-200 text-slate-500" : "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white hover:brightness-110"} focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600`}
            animate={
              isLoading
                ? { scale: [1, 1.05, 1] }
                : {
                    y: [0, -2, 0],
                    boxShadow: [
                      "0 0 0 rgba(0,0,0,0)",
                      "0 8px 20px rgba(251,146,60,0.35)",
                      "0 0 0 rgba(0,0,0,0)",
                    ],
                  }
            }
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Khám phá
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function AISuggestPage() {
  const navigate = useNavigate();
  const [semesterId, setSemesterId] = useState<string>("");
  const [persistedSuggest, setPersistedSuggest] =
    useState<TopicSuggestResponse | null>(null);
  const [robotDeparting, setRobotDeparting] = useState(false);

  useEffect(() => {
    try {
      const key = getScopedKey();
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          semesterId?: string;
          suggestData?: TopicSuggestResponse | null;
          savedAt?: number;
        };
        if (!parsed.savedAt || Date.now() - parsed.savedAt > CACHE_MAX_AGE_MS) {
          sessionStorage.removeItem(key);
        } else {
          if (parsed.semesterId) setSemesterId(parsed.semesterId);
          if (parsed.suggestData) setPersistedSuggest(parsed.suggestData);
        }
      }
    } catch (e) {
      void e;
    }
  }, []);

  useEffect(() => {
    try {
      const key = getScopedKey();
      const payload = {
        semesterId,
        suggestData: persistedSuggest,
        savedAt: Date.now(),
      };
      sessionStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      void e;
    }
  }, [semesterId, persistedSuggest]);

  useEffect(() => {
    const clear = () => {
      try {
        sessionStorage.removeItem(getScopedKey());
        sessionStorage.removeItem("AISuggestPage:v3");
      } catch (e) {
        void e;
      }
    };
    window.addEventListener("app:logout", clear);
    return () => window.removeEventListener("app:logout", clear);
  }, []);

  const {
    data: semesters,
    isLoading: semLoading,
    isError: semError,
  } = useSemesters();
  const { data: semesterDetail, isFetching: semFetching } =
    useSemesterById(semesterId);

  const {
    mutate: fetchSuggestions,
    data: rawSuggestData,
    isPending: isSuggesting,
    isError: suggestError,
    reset: resetSuggest,
  } = useTopicSuggestionsV2();

  const suggestData = rawSuggestData as unknown as
    | TopicSuggestResponse
    | undefined;

  useEffect(() => {
    if (suggestData) setPersistedSuggest(suggestData);
  }, [suggestData]);

  const derived = useMemo(() => {
    if (!semesterDetail) return null;
    const start = new Date(semesterDetail.startDate);
    const end = new Date(semesterDetail.endDate);
    const today = new Date();
    const ms = 86400000;
    const total = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / ms) + 1,
    );
    const passed = Math.min(
      total,
      Math.max(0, Math.ceil((today.getTime() - start.getTime()) / ms) + 1),
    );
    const remaining = Math.max(0, total - passed);
    let status: "upcoming" | "active" | "ended" = "upcoming";
    if (today < start) status = "upcoming";
    else if (today > end) status = "ended";
    else status = "active";
    const pct = Math.min(100, Math.max(0, Math.round((passed / total) * 100)));
    return { total, passed, remaining, status, pct };
  }, [semesterDetail]);

  const onSearch = () => {
    if (!semesterId || robotDeparting) return;
    resetSuggest();
    setPersistedSuggest(null);
    fetchSuggestions({
      semester_id: Number(semesterId),
      student_level: "undergraduate",
      team_size: 4,
    });
  };

  const handleUseTopic = (sug: Suggestion) => {
    if (robotDeparting) return;
    setRobotDeparting(true);
    const navState = {
      fromAISuggest: true,
      prefill: {
        eN_Title: sug.eN_Title ?? "",
        vN_title: sug.vN_title ?? "",
        abbreviation: sug.abbreviation ?? "",
        problem: sug.problem ?? "",
        context: sug.context ?? "",
        content: sug.content ?? "",
        description: sug.description ?? "",
        objectives: sug.objectives ?? "",
        maxStudents: typeof sug.team_size === "number" ? sug.team_size : 5,
        semesterId: Number(semesterId) || 0,
        categoryId: 0,
      },
      aiMeta: {
        category: sug.category,
        difficulty_level: sug.difficulty_level,
        estimated_duration: sug.estimated_duration,
        suggested_roles: sug.suggested_roles,
      },
    };
    setTimeout(() => {
      navigate("/supervisors/topics/create-new", { state: navState });
    }, 2000);
  };

  const data: TopicSuggestResponse | null =
    persistedSuggest ?? suggestData ?? null;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(1200px_600px_at_0%_-10%,rgba(255,237,213,0.7),transparent),radial-gradient(1000px_500px_at_120%_10%,rgba(254,215,170,0.6),transparent)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,.8),rgba(255,255,255,.96))]" />
      <div className="mx-auto w-full max-w-[160rem] px-10 py-8 md:px-12 md:py-10">
        <Hero />

        <div className="mt-8 grid grid-cols-[520px_1fr] gap-6">
          <div className="relative rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-amber-200/60 blur-3xl" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Học kỳ & Tiến độ
                    </div>
                    <div className="text-xs text-slate-600">
                      Chọn học kỳ và xem tổng quan
                    </div>
                  </div>
                </div>
                <Badge className="bg-white text-slate-700 ring-1 ring-slate-200">
                  {semesters?.length ?? 0} kỳ
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-900 shadow-sm transition outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-orange-600 disabled:opacity-60"
                      disabled={semLoading || semError || robotDeparting}
                    >
                      <span className="truncate">
                        {semesterId
                          ? semesters?.find((s) => String(s.id) === semesterId)
                              ?.name
                          : "— Chọn học kỳ —"}
                      </span>
                      <span className="ml-3 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        Mở danh sách
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[28rem] p-2">
                    <div className="max-h-72 overflow-y-auto">
                      {semesters?.map((s) => (
                        <DropdownMenuItem
                          key={s.id}
                          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                          onClick={() => setSemesterId(String(s.id))}
                          disabled={robotDeparting}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-slate-900">
                              {s.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDateTime(s.startDate)} →{" "}
                              {formatDateTime(s.endDate)}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title="Trạng thái"
                  value={
                    derived
                      ? derived.status === "active"
                        ? "Đang diễn ra"
                        : derived.status === "upcoming"
                          ? "Sắp bắt đầu"
                          : "Đã kết thúc"
                      : "—"
                  }
                  hint={semesterDetail?.name ?? ""}
                />
                <StatCard
                  icon={<Clock className="h-4 w-4" />}
                  title="Tiến độ"
                  value={derived ? `${derived.pct}%` : "—"}
                  hint={
                    derived
                      ? `Đã qua ${Math.min(derived.passed, derived.total)} • Còn ${derived.remaining}`
                      : ""
                  }
                />
                <StatCard
                  icon={<CalendarDays className="h-4 w-4" />}
                  title="Thời gian"
                  value={
                    semesterDetail
                      ? `${formatDateTime(semesterDetail.startDate)} • ${formatDateTime(semesterDetail.endDate)}`
                      : "—"
                  }
                />
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"
                  style={{ width: `${derived?.pct ?? 0}%` }}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-center gap-2 text-[10px] tracking-wide text-slate-500 uppercase">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  Xu hướng
                </div>
                <div className="line-clamp-2 text-sm text-slate-800">
                  {semesterDetail?.description || "—"}
                </div>
              </div>

              <AiMascot
                onActivate={onSearch}
                disabled={!semesterId || isSuggesting || robotDeparting}
                isLoading={isSuggesting}
                departing={robotDeparting}
              />

              {semFetching && <SkeletonBlock lines={3} />}
              {semError && (
                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  Không tải được dữ liệu học kỳ. Vui lòng thử lại.
                </div>
              )}
            </div>
          </div>

          <div className="relative rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="absolute -top-10 right-6 h-28 w-28 rounded-full bg-orange-200/50 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Đề xuất từ AI
                    </div>
                    <div className="text-xs text-slate-600">
                      Dựa trên xu hướng và cấu hình
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {data?.trending_areas?.map((t) => (
                    <Badge
                      key={t}
                      className="bg-white text-slate-700 ring-1 ring-slate-200"
                    >
                      {t}
                    </Badge>
                  ))}
                  {data?.processing_time != null && (
                    <Badge className="bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      ~{Number(data.processing_time).toFixed(1)}s
                    </Badge>
                  )}
                </div>
              </div>

              {!semesterId && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                  Hãy chọn học kỳ ở panel bên trái để bắt đầu khám phá.
                </div>
              )}

              <AnimatePresence mode="wait">
                {semesterId && (
                  <motion.div
                    key={`ai-${semesterId}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-5"
                  >
                    {isSuggesting && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-sm text-slate-600">
                          Đang phân tích xu hướng và tạo gợi ý…
                        </div>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-1/3 animate-[progress_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
                        </div>
                      </div>
                    )}

                    {suggestError && !isSuggesting && (
                      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                        Không thể lấy gợi ý. Vui lòng thử lại.
                      </div>
                    )}

                    {!isSuggesting && !suggestError && !data && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                        Chưa có dữ liệu gợi ý. Nhấn Khám phá ở robot sau khi
                        chọn học kỳ.
                      </div>
                    )}

                    {!isSuggesting && data && (
                      <>
                        {data.suggestions?.length === 0 ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                            Không có gợi ý phù hợp.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {data.suggestions.map((sug, idx) => {
                              const title = sug.vN_title || "Đề tài đề xuất";
                              return (
                                <div
                                  key={`${title}-${idx}`}
                                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                  <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500" />
                                  <div className="mb-2 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-500" />
                                        <div className="text-sm font-semibold break-words text-slate-900">
                                          {title}
                                        </div>
                                      </div>
                                      {sug.eN_Title && (
                                        <div className="mt-1 text-xs break-words text-slate-500">
                                          EN: {sug.eN_Title}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      {sug.abbreviation && (
                                        <Badge className="bg-orange-500 text-white">
                                          {sug.abbreviation}
                                        </Badge>
                                      )}
                                      {sug.difficulty_level && (
                                        <Badge className="bg-white text-slate-700 ring-1 ring-slate-200">
                                          {sug.difficulty_level}
                                        </Badge>
                                      )}
                                      {sug.estimated_duration && (
                                        <Badge className="bg-white text-slate-700 ring-1 ring-slate-200">
                                          {sug.estimated_duration}
                                        </Badge>
                                      )}
                                      {typeof sug.team_size === "number" && (
                                        <Badge className="bg-white text-slate-700 ring-1 ring-slate-200">
                                          Team {sug.team_size}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 text-sm text-slate-700">
                                    {sug.problem && (
                                      <div className="grid grid-cols-[110px_1fr] gap-2">
                                        <div className="font-medium text-slate-900">
                                          Problem:
                                        </div>
                                        <div className="break-words whitespace-normal">
                                          {sug.problem}
                                        </div>
                                      </div>
                                    )}
                                    {sug.context && (
                                      <div className="grid grid-cols-[110px_1fr] gap-2">
                                        <div className="font-medium text-slate-900">
                                          Context:
                                        </div>
                                        <div className="break-words whitespace-normal">
                                          {sug.context}
                                        </div>
                                      </div>
                                    )}
                                    {sug.content && (
                                      <div className="grid grid-cols-[110px_1fr] gap-2">
                                        <div className="font-medium text-slate-900">
                                          Content:
                                        </div>
                                        <div className="break-words whitespace-normal">
                                          {sug.content}
                                        </div>
                                      </div>
                                    )}
                                    {sug.description && (
                                      <div className="grid grid-cols-[110px_1fr] gap-2">
                                        <div className="font-medium text-slate-900">
                                          Description:
                                        </div>
                                        <div className="break-words whitespace-normal">
                                          {sug.description}
                                        </div>
                                      </div>
                                    )}
                                    {sug.objectives && (
                                      <div className="grid grid-cols-[110px_1fr] gap-2">
                                        <div className="font-medium text-slate-900">
                                          Objectives:
                                        </div>
                                        <div className="break-words whitespace-normal">
                                          {sug.objectives}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {sug.category && (
                                      <Badge className="bg-white text-slate-700 ring-1 ring-slate-200">
                                        {sug.category}
                                      </Badge>
                                    )}
                                    {sug.suggested_roles?.map((r) => (
                                      <Badge
                                        key={r}
                                        className="bg-slate-50 text-slate-700 ring-1 ring-slate-200"
                                      >
                                        {r}
                                      </Badge>
                                    ))}
                                  </div>

                                  <div className="mt-4">
                                    <motion.button
                                      type="button"
                                      disabled={robotDeparting}
                                      onClick={() => handleUseTopic(sug)}
                                      whileTap={{ scale: 0.92 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:opacity-60"
                                    >
                                      <Sparkles className="h-3.5 w-3.5" />
                                      Sử dụng
                                    </motion.button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {data?.generated_at && (
                          <div className="text-right text-xs text-slate-500">
                            Generated at: {formatDateTime(data.generated_at)}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="pointer-events-none fixed inset-x-0 top-[10%] -z-10 mx-auto h-72 w-[70%] rounded-[80px] bg-gradient-to-r from-orange-300/20 via-amber-300/20 to-yellow-300/20 blur-3xl"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </div>
  );
}

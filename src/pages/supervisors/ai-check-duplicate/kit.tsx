import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export type DuplicateStatus =
  | "duplicate_found"
  | "potential_duplicate"
  | "no_duplicate";

export type SimilarTopic = {
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
};

export type DuplicateCheck = {
  status: DuplicateStatus;
  similarity_score: number;
  similar_topics: SimilarTopic[];
  threshold: number;
  message?: string;
  recommendations?: string[];
  processing_time?: number;
};

export type ModificationProposal = {
  modified_topic?: {
    title?: string;
    description?: string;
    objectives?: string;
    problem?: string;
    context?: string;
    content?: string;
    category_id?: number;
    supervisor_id?: number;
    semester_id?: number;
    max_students?: number;
  };
  modifications_made?: string[];
  rationale?: string;
  similarity_improvement?: number;
  processing_time?: number;
};

export type StateType = {
  result: {
    duplicate_check: DuplicateCheck;
    modification_proposal?: ModificationProposal;
  };
  formSnapshot?: Record<string, unknown>;
};

export type Tone =
  | "red"
  | "amber"
  | "emerald"
  | "neutral"
  | "violet"
  | "sky"
  | "fuchsia";

export function statusTone(
  status: "duplicate_found" | "potential_duplicate" | "no_duplicate",
): Exclude<Tone, "neutral" | "violet" | "sky" | "fuchsia"> {
  if (status === "duplicate_found") return "red";
  if (status === "potential_duplicate") return "amber";
  return "emerald";
}

export function toneClasses(tone: Tone) {
  switch (tone) {
    case "red":
      return {
        text: "text-red-600",
        ring: "ring-red-200/60",
        bgSoft: "bg-red-50",
        grad: "from-red-500/18 via-red-600/16 to-red-500/10",
        color: "#DC2626",
      };
    case "amber":
      return {
        text: "text-amber-600",
        ring: "ring-amber-200/60",
        bgSoft: "bg-amber-50",
        grad: "from-amber-500/18 via-amber-600/16 to-amber-500/10",
        color: "#D97706",
      };
    case "emerald":
      return {
        text: "text-emerald-600",
        ring: "ring-emerald-200/60",
        bgSoft: "bg-emerald-50",
        grad: "from-emerald-500/18 via-emerald-600/16 to-emerald-500/10",
        color: "#059669",
      };
    case "violet":
      return {
        text: "text-violet-600",
        ring: "ring-violet-200/60",
        bgSoft: "bg-violet-50",
        grad: "from-violet-500/18 via-violet-600/16 to-violet-500/10",
        color: "#7C3AED",
      };
    case "sky":
      return {
        text: "text-sky-600",
        ring: "ring-sky-200/60",
        bgSoft: "bg-sky-50",
        grad: "from-sky-500/18 via-sky-600/16 to-sky-500/10",
        color: "#0284C7",
      };
    case "fuchsia":
      return {
        text: "text-fuchsia-600",
        ring: "ring-fuchsia-200/60",
        bgSoft: "bg-fuchsia-50",
        grad: "from-fuchsia-500/18 via-fuchsia-600/16 to-fuchsia-500/10",
        color: "#C026D3",
      };
    default:
      return {
        text: "text-neutral-700",
        ring: "ring-neutral-200/60",
        bgSoft: "bg-neutral-50",
        grad: "from-neutral-500/10 via-neutral-600/8 to-neutral-500/5",
        color: "#6B7280",
      };
  }
}

export const clamp01 = (n: number) =>
  Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
export const pct = (n: number) => `${Math.round(clamp01(n) * 100)}%`;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function useCountUp(
  target: number,
  durationMs = 1200,
  startDelayMs = 250,
) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const fromRef = useRef(0);
  useEffect(() => {
    const targetClamped = clamp01(Number(target) || 0);
    const from = clamp01(fromRef.current);
    const t0 = performance.now() + startDelayMs;
    const t1 = t0 + durationMs;
    const loop = (t: number) => {
      if (t < t0) {
        setValue(from);
        raf.current = requestAnimationFrame(loop);
        return;
      }
      const p = Math.min(1, (t - t0) / (t1 - t0));
      const eased = easeOutCubic(p);
      const v = from + (targetClamped - from) * eased;
      setValue(v);
      if (p < 1) {
        raf.current = requestAnimationFrame(loop);
      } else {
        fromRef.current = targetClamped;
      }
    };
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs, startDelayMs]);
  return value;
}

export function RadialGauge({
  value,
  label,
  helper,
  tone = "emerald",
  size = 156,
  stroke = 12,
  delay = 200,
  duration = 1200,
}: {
  value: number;
  label: string;
  helper?: string;
  tone?: Tone;
  size?: number;
  stroke?: number;
  delay?: number;
  duration?: number;
}) {
  const animated = useCountUp(value, duration, delay);
  const deg = clamp01(animated) * 360;
  const t = toneClasses(tone);
  const inner = size - stroke * 2;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative grid place-items-center overflow-hidden rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/5"
    >
      <div
        className={[
          "pointer-events-none absolute inset-0 -z-0 opacity-70 blur-2xl",
          `bg-gradient-to-tr ${t.grad}`,
        ].join(" ")}
      />
      <div className="relative flex items-center gap-4">
        <div
          className="relative grid place-items-center rounded-full p-[2px]"
          style={{ width: size, height: size }}
        >
          <div
            className="relative grid place-items-center rounded-full"
            style={{
              width: size - 4,
              height: size - 4,
              background: `conic-gradient(${t.color} ${deg}deg, #E5E7EB ${deg}deg)`,
            }}
          >
            <div
              className="rounded-full bg-white shadow-[inset_0_1px_0_rgba(0,0,0,0.04)]"
              style={{ width: inner, height: inner }}
            />
            <div
              className={[
                "pointer-events-none absolute inset-[6px] rounded-full ring-2",
                t.ring,
              ].join(" ")}
            />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <motion.div
                key={Math.round(clamp01(value) * 100)}
                className="text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <div className="text-2xl font-bold text-neutral-900">{`${Math.round(clamp01(animated) * 100)}%`}</div>
                <div className="text-[11px] text-neutral-500">{label}</div>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{label}</div>
          {helper ? (
            <div className="text-xs text-neutral-500">{helper}</div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

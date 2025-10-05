import { useMemo } from "react";

type SubmissionDetailLike = {
  id?: number | string | null;
  topicTitle?: string | null;
  additionalNotes?: string | null;
  tags?: unknown;
  aiCheckDetails?: unknown;
  aiCheckScore?: number | null;
  aiCheckStatus?: string | null;
  status?: string | number | null;
  submittedAt?: string | null;
  submittedByName?: string | null;
  phaseName?: string | null;
  documentUrl?: string | null;
};

type Props = {
  submissionDetail?: SubmissionDetailLike | null;
};

function statusColorClass(status?: string | number | null) {
  if (status == null) return "bg-slate-100 text-slate-700";
  const s = String(status).toLowerCase();
  if (s.includes("under") || s.includes("pending"))
    return "bg-yellow-100 text-yellow-800";
  if (s.includes("approved")) return "bg-green-100 text-green-800";
  if (s.includes("rejected")) return "bg-red-100 text-red-800";
  if (s.includes("duplicate")) return "bg-purple-100 text-purple-800";
  if (s.includes("revision")) return "bg-orange-100 text-orange-800";
  if (s.includes("escalated")) return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

function clamp(n?: number, min = 0, max = 100) {
  if (typeof n !== "number" || !isFinite(n)) return 0;
  return Math.max(min, Math.min(max, n));
}

function scoreColorSmall(score?: number | null) {
  if (score == null) return "text-gray-600";
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

function formatDateTime(d?: string | null) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? String(d) : dt.toLocaleString();
  } catch {
    return String(d);
  }
}

type AICheckParsed = {
  overall_score?: number;
  overall_rating?: string;
  summary?: string;
  [k: string]: unknown;
};

export default function TopicSubmissionDetail({ submissionDetail }: Props) {
  const aiRaw = submissionDetail?.aiCheckDetails ?? null;

  const aiCheck = useMemo((): {
    raw: string | null;
    parsed: AICheckParsed | null;
    error: string | null;
  } => {
    if (!aiRaw) return { raw: null, parsed: null, error: null };
    const rawStr = typeof aiRaw === "string" ? aiRaw : JSON.stringify(aiRaw);
    try {
      const parsed = JSON.parse(rawStr) as AICheckParsed;
      return { raw: rawStr, parsed, error: null };
    } catch (err) {
      return { raw: rawStr, parsed: null, error: String(err) };
    }
  }, [aiRaw]);

  const overallScorePercent = useMemo(() => {
    if (aiCheck.parsed?.overall_score != null)
      return clamp(aiCheck.parsed.overall_score);
    const score10 = submissionDetail?.aiCheckScore;
    if (typeof score10 === "number") return clamp(score10 * 10);
    return null;
  }, [aiCheck.parsed, submissionDetail?.aiCheckScore]);

  const title =
    (submissionDetail?.topicTitle && submissionDetail.topicTitle.trim()) ||
    `Submission #${submissionDetail?.id ?? "—"}`;

  const description = submissionDetail?.additionalNotes ?? null;

  const tags: string[] = useMemo(() => {
    const raw = submissionDetail?.tags;
    const arr = Array.isArray(raw) ? (raw as unknown[]) : [];
    return arr.filter((x): x is string => typeof x === "string");
  }, [submissionDetail?.tags]);

  const overallRating =
    aiCheck.parsed?.overall_rating ?? submissionDetail?.aiCheckStatus ?? null;
  const overallSummaryShort = aiCheck.parsed?.summary ?? undefined;

  return (
    <div className="space-y-4">
      <div className="w-full rounded-md border bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Submission</div>
            <div className="mt-1 line-clamp-1 text-xl font-bold">{title}</div>
            {description && (
              <div className="mt-2 line-clamp-3 text-sm text-slate-600">
                {description}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {tags.slice(0, 6).map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="inline-block rounded-full border px-2 py-1 text-xs font-semibold text-[#0ea5a0]"
                  style={{ background: "#ecfeff" }}
                >
                  {t}
                </span>
              ))}
              {tags.length > 6 && (
                <span className="text-xs text-slate-500">
                  +{tags.length - 6} more
                </span>
              )}
            </div>
          </div>

          <div className="min-w-[180px] text-right text-sm">
            <div className="mb-2">
              <div
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColorClass(submissionDetail?.status)}`}
              >
                {submissionDetail?.status ?? "—"}
              </div>
            </div>
            <div className="text-xs text-slate-500">Submitted</div>
            <div className="mb-2 font-medium">
              {submissionDetail?.submittedAt
                ? formatDateTime(submissionDetail.submittedAt)
                : "—"}
            </div>
            <div className="text-xs text-slate-500">Submitted by</div>
            <div className="font-medium">
              {submissionDetail?.submittedByName ?? "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <div className="text-xs text-slate-500">Phase</div>
            <div className="font-medium">
              {submissionDetail?.phaseName ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Document</div>
            <div className="font-medium">
              {submissionDetail?.documentUrl ? (
                <a
                  href={submissionDetail.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  Open document
                </a>
              ) : (
                "—"
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs text-slate-500">Additional notes</div>
            <div className="text-sm text-slate-700">
              {submissionDetail?.additionalNotes ?? "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-md border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">AI Check Overall</div>
            <div className="text-xs text-slate-500">
              {overallRating ?? "No status"}
            </div>
            {overallSummaryShort && (
              <div className="mt-1 line-clamp-2 text-sm text-slate-500">
                {overallSummaryShort}
              </div>
            )}
          </div>
          <div className="w-48">
            {overallScorePercent != null ? (
              <div>
                <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
                  <div
                    style={{ width: `${overallScorePercent}%` }}
                    className="h-2 bg-emerald-500"
                  />
                </div>
                <div
                  className={`mt-1 text-sm ${scoreColorSmall(overallScorePercent)}`}
                >
                  {overallScorePercent}%{" "}
                  {aiCheck.parsed?.overall_rating
                    ? ` • ${aiCheck.parsed.overall_rating}`
                    : ""}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">No overall score</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

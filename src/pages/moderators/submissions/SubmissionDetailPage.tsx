import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSubmissionReviewSummary, type SubmissionReviewSummaryDTO } from "@/services/submissionReviewService";
import { useSubmissionDetail } from "@/hooks/useSubmission";
import type { SubmissionListItem } from "@/services/submissionService";
import {
  useBulkAssignReviewers,
  useAvailableReviewers,
  useAssignmentsBySubmission,
} from "@/hooks/useReviewerAssignment";
import ReviewerPickerDialog from "./ReviewerPickerDialog";
import SubmissionAssignmentsDialog from "./SubmissionAssignmentsDialog";

type AiCheckDetails = {
  overall_score?: number;
  overall_rating?: string;
  summary?: string;
  criteria?: Array<{
    id?: string;
    question?: string;
    score?: number;
    weight?: number;
    assessment?: string;
    evidence?: string;
    recommendations?: string[];
  }>;
  missing_fields?: string[];
  risks?: string[];
  next_steps?: string[];
  processing_time?: number;
  [k: string]: any;
};

function scoreColor(score?: number) {
  if (score == null) return "bg-gray-500";
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

function scoreColorSmall(score?: number) {
  if (score == null) return "text-gray-600";
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

function clamp(n?: number, min = 0, max = 100) {
  if (typeof n !== "number" || !isFinite(n)) return 0;
  return Math.max(min, Math.min(max, n));
}

export default function SubmissionDetailPage() {
  const navigate = useNavigate();
  const { submissionId } = useParams<{ submissionId: string }>();
  const { state } = useLocation();
  const initialRow = (state?.row as SubmissionListItem | undefined) ?? undefined;

  const [showReviews, setShowReviews] = useState<boolean>(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false); // open ReviewerPickerDialog
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false); // open SubmissionAssignmentsDialog
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});

  const { data: submissionDetail } = useSubmissionDetail(submissionId);
  const bulkAssign = useBulkAssignReviewers();

  // fetch assignments for this submission (shows assigned reviewers)
  const { data: assignments, isLoading: loadingAssignments } = useAssignmentsBySubmission(submissionId);

  // NOTE: useAvailableReviewers will run only when we pass submissionId (we pass it only when dialog open)
  const { data: availableReviewers } = useAvailableReviewers(isPickerOpen ? submissionId : undefined);

  // Parse AI check safely
  const aiCheck = useMemo(() => {
    const raw: unknown = (submissionDetail as any)?.aiCheckDetails;
    if (!raw) return { raw: null, parsed: null, error: null };
    const rawStr = typeof raw === "string" ? raw : JSON.stringify(raw);
    try {
      const parsed = JSON.parse(rawStr) as AiCheckDetails;
      return { raw: rawStr, parsed, error: null };
    } catch (err) {
      return { raw: rawStr, parsed: null, error: String(err) };
    }
  }, [submissionDetail]);

  // Reviews lazy query
  const {
    data: summary,
    isLoading: loadingSummary,
    refetch: refetchSummary,
  } = useQuery<SubmissionReviewSummaryDTO, Error>({
    queryKey: ["submission-review-summary", submissionId ?? null],
    queryFn: async () => {
      try {
        const res = await getSubmissionReviewSummary(submissionId!);
        return res;
      } catch (e: any) {
        // BE can return 500 if no reviews — treat as empty summary
        if (e?.response?.status === 500) {
          return {
            submissionId,
            totalReviews: 0,
            averageScore: null,
            recommendationsCount: { approve: 0, minor: 0, major: 0, reject: 0 },
            reviews: [],
            finalDecision: null,
          } as SubmissionReviewSummaryDTO;
        }
        throw e;
      }
    },
    enabled: false,
  });

  const header = {
    id: submissionId,
    code: String(initialRow?.id ?? submissionId),
    title: initialRow?.title ?? (submissionDetail as any)?.topicTitle ?? `Submission #${submissionId}`,
    submittedByName: initialRow?.submittedByName ?? (submissionDetail as any)?.submittedByName ?? "-",
    round: initialRow?.submissionRound ?? (submissionDetail as any)?.submissionRound ?? "-",
    submittedAt: initialRow?.submittedAt ?? (submissionDetail as any)?.submittedAt ?? "-",
  };

  const toggleShowReviews = async () => {
    const next = !showReviews;
    setShowReviews(next);
    if (next) await refetchSummary();
  };

  // open picker: enable availableReviewers fetch
  const openPicker = () => {
    if (!submissionId) return;
    setIsPickerOpen(true);
  };
  const closePicker = () => setIsPickerOpen(false);

  const openAssignments = () => {
    if (!submissionId) return;
    setIsAssignmentsOpen(true);
  };
  const closeAssignments = () => setIsAssignmentsOpen(false);

  const handleConfirmAssign = async (selectedReviewerIds: (number | string)[]) => {
    if (!submissionId) return;
    try {
      await bulkAssign.mutateAsync({ submissionId, reviewerIds: selectedReviewerIds } as any);
      // refetch assignments & reviews
      // useAssignmentsBySubmission has its own cache; react-query should auto-update if service invalidates,
      // but to be safe you can call refetchSummary and optionally trigger assignments refetch if you keep its refetch.
      if (showReviews) refetchSummary();
      closePicker();
    } catch {
      closePicker();
    }
  };

  const getPrettyJson = (raw?: string | null) => {
    if (!raw) return null;
    try {
      const obj = JSON.parse(raw);
      return JSON.stringify(obj, null, 2);
    } catch {
      return raw;
    }
  };

  const downloadAiPretty = () => {
    if (!aiCheck.raw) return;
    const pretty = getPrettyJson(aiCheck.raw) ?? aiCheck.raw;
    const blob = new Blob([pretty], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submission-${submissionId}-ai-check.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyAiPretty = async () => {
    if (!aiCheck.raw) return;
    const pretty = getPrettyJson(aiCheck.raw) ?? aiCheck.raw;
    try {
      await navigator.clipboard.writeText(pretty);
    } catch {
      // ignore
    }
  };

  const toggleCriterion = (id: string) => {
    setExpandedCriteria((s) => ({ ...s, [id]: !s[id] }));
  };

  // compute overallScorePercent: prefer aiCheck.parsed.overall_score (0-100),
  // else use submissionDetail.aiCheckScore (assumed 0-10) * 10
  const overallScorePercent = useMemo(() => {
    if (aiCheck.parsed?.overall_score != null) return clamp(aiCheck.parsed.overall_score);
    const score10 = (submissionDetail as any)?.aiCheckScore;
    if (typeof score10 === "number") return clamp(score10 * 10);
    return null;
  }, [aiCheck.parsed, submissionDetail]);

  const overallScoreRaw = useMemo(() => {
    if (aiCheck.parsed?.overall_score != null) return aiCheck.parsed.overall_score;
    const score10 = (submissionDetail as any)?.aiCheckScore;
    if (typeof score10 === "number") return score10;
    return null;
  }, [aiCheck.parsed, submissionDetail]);

  const overallRating = aiCheck.parsed?.overall_rating ?? (submissionDetail as any)?.aiCheckStatus ?? null;
  const overallSummaryShort = aiCheck.parsed?.summary ?? undefined;

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center rounded border px-3 py-2"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/moderators/submissions"))}
        >
          ← Trở về
        </button>
        <div>
          <div className="text-lg font-semibold">{header.title}</div>
          <div className="text-sm text-muted-foreground">
            #{header.code} • {header.submittedByName}
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <button type="button" className="rounded border px-3 py-2" onClick={toggleShowReviews}>
            {showReviews ? "Ẩn đánh giá" : "Xem đánh giá"}
          </button>

          <button
            type="button"
            className="rounded border px-3 py-2"
            onClick={openPicker}
            disabled={!submissionId}
            title={!submissionId ? "Chưa chọn submission" : undefined}
          >
            Assign reviewers
          </button>

          {/* Show manage button when assignment exist */}
          <button
            type="button"
            className="rounded border px-3 py-2"
            onClick={openAssignments}
            disabled={!submissionId || loadingAssignments || (assignments?.length ?? 0) === 0}
            title={
              !submissionId ? "Chưa chọn submission" :
              loadingAssignments ? "Đang tải..." :
              (assignments?.length ?? 0) === 0 ? "Chưa có reviewer để quản lý" : undefined
            }
          >
            Manage assignments
          </button>
        </div>
      </div>

      {/* Topic + Reviewers (use assignments API) */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded border p-4">
          <div className="text-sm font-semibold mb-2">Topic</div>
          <div className="text-base">{(submissionDetail as any)?.topicTitle ?? "—"}</div>
          <div className="mt-3 text-sm text-muted-foreground">
            {(submissionDetail as any)?.additionalNotes ?? "No notes."}
          </div>
        </div>

        <div className="rounded border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Reviewers</div>
            <div className="text-xs text-muted-foreground">{loadingAssignments ? "Đang tải..." : `${assignments?.length ?? 0}`}</div>
          </div>

          {loadingAssignments ? (
            <div className="text-sm text-muted-foreground">Đang tải danh sách reviewers…</div>
          ) : (assignments && assignments.length > 0) ? (
            <ul className="space-y-2">
              {assignments.map((a) => (
                <li key={String(a.id)} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{a.reviewer?.userName ?? `#${a.reviewerId}`}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.assignmentType === 1 ? "Primary" : a.assignmentType === 2 ? "Secondary" : "Additional"}
                      {a.deadline ? ` • Deadline: ${new Date(a.deadline).toLocaleString()}` : ""}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.status ? (a.status === 1 ? "Assigned" : a.status === 2 ? "In progress" : a.status === 3 ? "Completed" : "Overdue") : "—"}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">No reviewers assigned.</div>
          )}
        </div>
      </div>

      {/* AI Check section */}
      <div className="rounded border p-4 space-y-4">
        {/* Overall card */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">AI Check Overall</div>
            <div className="text-xs text-muted-foreground">{overallRating ?? "No status"}</div>
            {overallSummaryShort && (
              <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{overallSummaryShort}</div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="w-64">
              {overallScorePercent != null ? (
                <div className="w-full">
                  <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                    <div style={{ width: `${overallScorePercent}%` }} className={`${scoreColor(overallScorePercent)} h-2`} />
                  </div>
                  <div className={`mt-1 text-sm ${scoreColorSmall(overallScorePercent)}`}>
                    {overallScorePercent}%{" "}
                    {overallScoreRaw != null && <>• Raw: {overallScoreRaw}</>}
                    {aiCheck.parsed?.overall_rating ? ` • ${aiCheck.parsed.overall_rating}` : ""}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No overall score</div>
              )}
            </div>

            <div className="flex gap-2">
              {aiCheck.raw && (
                <>
                  <button type="button" className="rounded border px-2 py-1 text-sm" onClick={copyAiPretty}>
                    Copy JSON
                  </button>
                  <button type="button" className="rounded border px-2 py-1 text-sm" onClick={downloadAiPretty}>
                    Tải JSON
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Details header */}
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm font-semibold">AI Check Details</div>
        </div>

        {aiCheck.error && (
          <div className="text-sm text-yellow-600 mb-3">Không thể parse aiCheckDetails: {aiCheck.error}</div>
        )}

        {!aiCheck.parsed && !aiCheck.error && (
          <div className="text-sm text-muted-foreground">Không có AI Check details.</div>
        )}

        {aiCheck.parsed && (
          <div className="space-y-4">
            {aiCheck.parsed.summary && (
              <div>
                <div className="text-sm font-semibold">Summary</div>
                <div className="mt-1 text-sm">{aiCheck.parsed.summary}</div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t" />

            {Array.isArray(aiCheck.parsed.criteria) && aiCheck.parsed.criteria.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2">Criteria</div>
                <div className="space-y-2">
                  {aiCheck.parsed.criteria.map((c, idx) => {
                    const idKey = c.id ?? `crit-${idx}`;
                    const expanded = !!expandedCriteria[idKey];
                    const score = typeof c.score === "number" ? c.score : undefined;
                    const pct = clamp(typeof score === "number" && score <= 10 ? score * 10 : (score ?? 0), 0, 100);
                    return (
                      <div key={idKey} className="border rounded">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-3"
                          onClick={() => toggleCriterion(idKey)}
                          aria-expanded={expanded}
                        >
                          <div className="text-left font-medium">{c.question ?? `Criterion ${idx + 1}`}</div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`text-xs px-2 py-0.5 rounded ${scoreColor(pct)} text-white font-semibold`}
                                style={{ minWidth: 44, textAlign: "center" }}
                              >
                                {score ?? "-"}
                              </div>
                              <div style={{ width: 120 }} className="hidden sm:block">
                                <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                                  <div style={{ width: `${pct}%` }} className={`${scoreColor(pct)} h-2`} />
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">{expanded ? "▲" : "▼"}</div>
                            </div>
                          </div>
                        </button>

                        {expanded && (
                          <div className="p-3 pt-0">
                            {c.assessment && <div className="text-sm mb-2">{c.assessment}</div>}
                            {c.evidence && <div className="text-xs text-muted-foreground mb-2">Evidence: {c.evidence}</div>}
                            {Array.isArray(c.recommendations) && c.recommendations.length > 0 && (
                              <div>
                                <div className="text-sm font-semibold mb-1">Recommendations</div>
                                <ul className="list-disc ml-5 text-sm">
                                  {c.recommendations.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-3">
              {Array.isArray(aiCheck.parsed.missing_fields) && aiCheck.parsed.missing_fields.length > 0 && (
                <div className="rounded border p-3">
                  <div className="text-sm font-semibold mb-1">Missing fields</div>
                  <ul className="list-disc ml-5 text-sm">
                    {aiCheck.parsed.missing_fields.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(aiCheck.parsed.risks) && aiCheck.parsed.risks.length > 0 && (
                <div className="rounded border p-3">
                  <div className="text-sm font-semibold mb-1">Risks</div>
                  <ul className="list-disc ml-5 text-sm">
                    {aiCheck.parsed.risks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(aiCheck.parsed.next_steps) && aiCheck.parsed.next_steps.length > 0 && (
                <div className="rounded border p-3">
                  <div className="text-sm font-semibold mb-1">Next steps</div>
                  <ul className="list-disc ml-5 text-sm">
                    {aiCheck.parsed.next_steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      {showReviews && (
        <section className="rounded border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Reviews</div>
            <div className="text-sm opacity-70">{loadingSummary ? "Đang tải..." : `Total: ${summary?.totalReviews ?? 0}`}</div>
          </div>
          {/* TODO: Render chi tiết review (reuse summary) */}
        </section>
      )}

      {/* Reviewer picker dialog */}
      {isPickerOpen && (
        <ReviewerPickerDialog
          isOpen={isPickerOpen}
          submissionId={submissionId}
          availableReviewers={availableReviewers ?? []}
          onClose={closePicker}
          onConfirm={(ids) => handleConfirmAssign(ids)}
        />
      )}

      {/* Assignments management dialog */}
      {isAssignmentsOpen && (
        <SubmissionAssignmentsDialog
          isOpen={isAssignmentsOpen}
          submissionId={submissionId}
          onClose={closeAssignments}
        />
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  suggestBySubmission,
  type ReviewerSuggestionBySubmissionInputDTO,
  type ReviewerSuggestionOutputDTO,
  type ReviewerSuggestionDTO,
} from "@/services/reviewerSuggestionService";
import { assignReviewer } from "@/services/reviewerAssignmentService";
import type { AssignReviewerDTO } from "@/services/reviewerAssignmentService";

type Props = {
  submissionId: number;
  open: boolean;
  onClose: () => void;
};

type SkillFieldScores = Record<string, number | string>;
type ExtendedSuggestion = ReviewerSuggestionDTO & {
  skillMatchFieldScores?: SkillFieldScores;
  SkillMatchFieldScores?: SkillFieldScores;
  matchedSkills?: string[];
  skillMatchTopTokens?: Record<string, string[]>;
  reviewerSkills?: Record<string, string | number>;
};

export default function ReviewerSuggestionDialog({
  submissionId,
  open,
  onClose,
}: Props) {
  const qc = useQueryClient();

  const [autoAssignOnServer, setAutoAssignOnServer] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [globalDeadline, setGlobalDeadline] = useState<string>("");
  const [maxSuggestions, setMaxSuggestions] = useState<number>(2);

  const suggestMut = useMutation<
    ReviewerSuggestionOutputDTO,
    unknown,
    { input: ReviewerSuggestionBySubmissionInputDTO; assign?: boolean }
  >({
    mutationFn: ({ input, assign }) => suggestBySubmission(input, !!assign),
    onError: () => toast.error("Gợi ý reviewer thất bại"),
  });

  const assignMut = useMutation<unknown, unknown, AssignReviewerDTO>({
    mutationFn: (payload) => assignReviewer(payload),
    onSuccess: () => {
      toast.success("Phân công thành công");
      qc.invalidateQueries({
        queryKey: ["reviewer-assignments", "by-submission", submissionId],
      });
      qc.invalidateQueries({
        queryKey: ["reviewer-suggestion", "by-submission", submissionId],
      });
    },
    onError: () => toast.error("Phân công thất bại"),
  });

  const suggestLoading = suggestMut.isPending;
  const assignLoading = assignMut.isPending;

  const output = suggestMut.data;
  const suggestions: ExtendedSuggestion[] = useMemo(
    () => (output?.suggestions ?? []) as ExtendedSuggestion[],
    [output],
  );

  const aiExplanation: string | null = output?.aiExplanation ?? null;
  const assignmentResults = output?.assignmentResults ?? null;
  const assignmentErrors = output?.assignmentErrors ?? null;

  const toIso = (dateStr?: string) => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  const onAssign = (rev: ExtendedSuggestion) => {
    if (!globalDeadline) {
      toast.error("Vui lòng chọn deadline trước khi phân công.");
      return;
    }
    if (!rev.isEligible) {
      toast.error("Reviewer không hợp lệ — không thể assign trực tiếp.");
      return;
    }
    const payload: AssignReviewerDTO = {
      submissionId,
      reviewerId: rev.reviewerId,
      assignmentType: 1,
      deadline: toIso(globalDeadline),
      notes: undefined,
      skillMatchScore: rev.skillMatchScore ?? undefined,
    };
    assignMut.mutate(payload);
  };

  const toggleExpand = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const copyAiExplanation = async () => {
    if (!aiExplanation) return;
    try {
      await navigator.clipboard.writeText(aiExplanation);
      toast.success("Copied AI explanation");
    } catch {
      toast.error("Copy failed");
    }
  };

  const formatPercent = (val: unknown) => {
    if (val === null || typeof val === "undefined" || val === "-") return "-";
    const num = Number(val);
    if (Number.isNaN(num)) return String(val);
    if (num >= 0 && num <= 1) return `${(num * 100).toFixed(1)}%`;
    if (num > 1 && num <= 100) return `${num.toFixed(1)}%`;
    return `${num.toFixed(1)}%`;
  };

  const renderFieldScores = (s: ExtendedSuggestion) => {
    const fieldScores =
      s.skillMatchFieldScores ?? s.SkillMatchFieldScores ?? null;
    if (!fieldScores) return null;
    const keys = Object.keys(fieldScores);
    if (keys.length === 0) return null;
    return (
      <div className="mt-2 rounded border bg-slate-50 p-2 text-sm">
        <div className="mb-1 font-medium">Field match scores</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {keys.map((k) => (
            <div
              key={k}
              className="flex items-center justify-between gap-2 rounded border px-2 py-1"
            >
              <div className="text-xs text-slate-700">{k}</div>
              <div className="text-sm font-semibold">
                {formatPercent(fieldScores[k])}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMatchedSkills = (s: ExtendedSuggestion) => {
    const matchedSkills = s.matchedSkills ?? [];
    if (!Array.isArray(matchedSkills) || matchedSkills.length === 0) {
      return (
        <div className="mt-2 text-sm text-amber-700">
          Reviewer skill do not match with this type of topic
        </div>
      );
    }
    return (
      <div className="mt-2">
        <div className="font-medium">Kỹ năng phù hợp</div>
        <ul className="ml-5 list-disc text-sm">
          {matchedSkills.map((skill, idx) => (
            <li key={idx}>{skill}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTopTokens = (s: ExtendedSuggestion) => {
    const topTokens = s.skillMatchTopTokens ?? {};
    const entries = Object.entries(topTokens);
    if (entries.length === 0) return null;
    return (
      <div className="mt-2">
        <div className="mb-1 text-sm font-medium">Top skill tokens</div>
        <div className="flex flex-wrap gap-1">
          {entries.map(([field, tokens]) =>
            Array.isArray(tokens)
              ? tokens.map((token, i) => (
                  <span
                    key={`${field}-${i}`}
                    className="rounded-full border border-blue-300 bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                    title={`Field: ${field}`}
                  >
                    {token}
                  </span>
                ))
              : null,
          )}
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!suggestLoading && !assignLoading) onClose();
        }}
      />
      <div className="relative z-10 min-h-[320px] w-full max-w-6xl min-w-[640px] overflow-hidden rounded bg-white shadow-lg">
        {suggestLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <div className="text-sm font-medium">Đang gợi ý reviewer...</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-b p-4">
          <h3 className="text-lg font-semibold">Gợi ý reviewer (AI)</h3>

          <div className="ml-4 flex items-center gap-2">
            <label
              className={`flex items-center gap-2 text-sm ${suggestLoading ? "opacity-50" : ""}`}
            >
              <input
                type="checkbox"
                checked={autoAssignOnServer}
                onChange={(e) => setAutoAssignOnServer(e.target.checked)}
                className="h-4 w-4"
                disabled={suggestLoading}
              />
              <span>Auto-create assignments on server</span>
            </label>

            <label className="text-sm">Deadline</label>
            <input
              type="date"
              value={globalDeadline}
              onChange={(e) => setGlobalDeadline(e.target.value)}
              className="rounded border px-2 py-1 text-sm"
              title="Deadline áp dụng cho hành động Assign"
              disabled={suggestLoading || assignLoading}
            />

            <label
              className={`flex items-center gap-2 text-sm ${suggestLoading ? "opacity-50" : ""}`}
            >
              <span>Số lượng</span>
              <input
                type="number"
                min={1}
                value={maxSuggestions}
                onChange={(e) => setMaxSuggestions(Number(e.target.value || 1))}
                className="w-16 rounded border px-2 py-1 text-sm"
                title="Số lượng reviewer AI sẽ đề xuất"
                disabled={suggestLoading}
              />
            </label>

            <button
              className="flex items-center gap-2 rounded border px-3 py-1 text-sm disabled:opacity-60"
              onClick={() => {
                const input: ReviewerSuggestionBySubmissionInputDTO = {
                  SubmissionId: Number(submissionId),
                  MaxSuggestions: Number(maxSuggestions || 2),
                  UsePrompt: true,
                  Deadline: null,
                };
                suggestMut.mutate({ input, assign: autoAssignOnServer });
              }}
              disabled={suggestLoading}
              title={suggestLoading ? "Đang gợi ý..." : "Gợi ý reviewer"}
            >
              {suggestLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span>Gợi ý...</span>
                </>
              ) : (
                "Gợi ý"
              )}
            </button>

            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={() => {
                if (!suggestLoading && !assignLoading) onClose();
              }}
            >
              Đóng
            </button>
          </div>
        </div>

        <div className="max-h-[72vh] space-y-4 overflow-auto p-4">
          {aiExplanation && (
            <div className="rounded border bg-yellow-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-1 font-semibold">AI explanation</div>
                  <pre className="text-sm whitespace-pre-wrap">
                    {aiExplanation}
                  </pre>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={copyAiExplanation}
                    className="rounded border px-2 py-1 text-sm"
                    disabled={suggestLoading}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {Array.isArray(assignmentResults) && assignmentResults.length > 0 && (
            <div className="rounded border bg-slate-50 p-3">
              <div className="mb-1 font-semibold">
                Server assignment results
              </div>
              <ul className="ml-5 list-disc text-sm">
                {assignmentResults.map((r, idx) => (
                  <li key={idx}>{JSON.stringify(r)}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(assignmentErrors) && assignmentErrors.length > 0 && (
            <div className="rounded border bg-red-50 p-3 text-sm text-red-700">
              <div className="mb-1 font-semibold">Assignment errors</div>
              <ul className="ml-5 list-disc">
                {assignmentErrors.map((e, idx) => (
                  <li key={idx}>{String(e)}</li>
                ))}
              </ul>
            </div>
          )}

          {(!suggestions || suggestions.length === 0) && !suggestLoading && (
            <div className="text-sm text-slate-500">Không có gợi ý</div>
          )}

          <div className="space-y-3">
            {suggestions.map((s) => {
              const key = String(s.reviewerId);
              return (
                <div key={key} className="rounded border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">
                        {s.reviewerName ?? `Reviewer ${s.reviewerId}`}
                      </div>
                      <div className="text-sm text-slate-600">
                        Match Score:{" "}
                        <span className="font-semibold">
                          {formatPercent(
                            s.skillMatchScore ?? s.overallScore ?? 0,
                          )}
                        </span>
                        {" • "}Overall:{" "}
                        <span className="font-semibold">
                          {formatPercent(s.overallScore ?? 0)}
                        </span>
                        {" • "}Active:{" "}
                        <span className="font-semibold">
                          {s.currentActiveAssignments ?? 0}
                        </span>
                      </div>
                      {renderMatchedSkills(s)}
                      {s.isEligible === false && (
                        <div className="mt-1 text-sm text-rose-600">
                          Ineligible:{" "}
                          {(s.ineligibilityReasons ?? []).join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-slate-500">
                        #{s.reviewerId}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAssign(s)}
                          className={`rounded px-3 py-1 text-sm ${s.isEligible ? "bg-green-600 text-white" : "cursor-not-allowed bg-gray-200 text-gray-600"}`}
                          disabled={
                            !s.isEligible ||
                            assignLoading ||
                            !globalDeadline ||
                            suggestLoading
                          }
                          title={
                            !globalDeadline
                              ? "Vui lòng chọn deadline trước khi phân công"
                              : !s.isEligible
                                ? "Reviewer không hợp lệ"
                                : "Assign reviewer"
                          }
                        >
                          Assign
                        </button>
                      </div>
                      <button
                        onClick={() => toggleExpand(key)}
                        className="text-xs text-slate-500 underline"
                        disabled={suggestLoading}
                      >
                        {expanded[key] ? "Hide details" : "Show details"}
                      </button>
                    </div>
                  </div>

                  {expanded[key] && (
                    <div className="mt-3">
                      {renderFieldScores(s)}
                      {s.reviewerSkills && (
                        <div className="mt-2">
                          <div className="font-medium">Reviewer skills</div>
                          <ul className="ml-5 list-disc">
                            {Object.entries(s.reviewerSkills).map(
                              ([skill, level]) => (
                                <li key={skill}>
                                  {skill}:{" "}
                                  <span className="font-semibold">
                                    {String(level)}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                        <div>
                          Completed:{" "}
                          <span className="font-semibold">
                            {s.completedAssignments ?? 0}
                          </span>
                        </div>
                        <div>
                          Avg score:{" "}
                          <span className="font-semibold">
                            {s.averageScoreGiven == null
                              ? "-"
                              : formatPercent(s.averageScoreGiven)}
                          </span>
                        </div>
                        <div>
                          On-time rate:{" "}
                          <span className="font-semibold">
                            {s.onTimeRate == null
                              ? "-"
                              : formatPercent(s.onTimeRate)}
                          </span>
                        </div>
                        <div>
                          Quality rating:{" "}
                          <span className="font-semibold">
                            {s.qualityRating == null
                              ? "-"
                              : formatPercent(s.qualityRating)}
                          </span>
                        </div>
                        <div>
                          Performance score:{" "}
                          <span className="font-semibold">
                            {s.performanceScore == null
                              ? "-"
                              : formatPercent(s.performanceScore)}
                          </span>
                        </div>
                      </div>
                      {renderTopTokens(s)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

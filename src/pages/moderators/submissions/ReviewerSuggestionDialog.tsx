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

export default function ReviewerSuggestionDialog({ submissionId, open, onClose }: Props) {
  const qc = useQueryClient();

  const [autoAssignOnServer, setAutoAssignOnServer] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [globalDeadline, setGlobalDeadline] = useState<string>("");
  const [maxSuggestions, setMaxSuggestions] = useState<number>(2);

  const suggestMut = useMutation({
    mutationFn: (vars: { input: ReviewerSuggestionBySubmissionInputDTO; assign?: boolean }) =>
      suggestBySubmission(vars.input, !!vars.assign),
    onError: () => {
      toast.error("Gợi ý reviewer thất bại");
    },
  });

  const assignMut = useMutation({
    mutationFn: (payload: AssignReviewerDTO) => assignReviewer(payload),
    onSuccess: () => {
      toast.success("Phân công thành công");
      qc.invalidateQueries({ queryKey: ["reviewer-assignments", "by-submission", submissionId] });
      qc.invalidateQueries({ queryKey: ["reviewer-suggestion", "by-submission", submissionId] });
    },
    onError: () => {
      toast.error("Phân công thất bại");
    },
  });

  const suggestLoading = Boolean((suggestMut as any).isLoading);
  const assignLoading = Boolean((assignMut as any).isLoading);

  const output: ReviewerSuggestionOutputDTO | undefined = useMemo(() => {
    return (suggestMut.data as ReviewerSuggestionOutputDTO | undefined) ?? undefined;
  }, [suggestMut.data]);

  const suggestions: ReviewerSuggestionDTO[] = useMemo(() => {
    return output?.suggestions ?? [];
  }, [output]);

  const aiExplanation = output?.aiExplanation ?? null;
  const assignmentResults = output?.assignmentResults ?? null;
  const assignmentErrors = output?.assignmentErrors ?? null;

  const toIso = (dateStr?: string) => {
    if (!dateStr) return undefined;
    try {
      const d = new Date(dateStr);
      return d.toISOString();
    } catch {
      return undefined;
    }
  };

  const onAssign = (rev: ReviewerSuggestionDTO) => {
    if (!globalDeadline) {
      toast.error("Vui lòng chọn deadline trước khi phân công.");
      return;
    }
    if (!rev.isEligible) {
      toast.error("Reviewer không hợp lệ — không thể assign trực tiếp. Kiểm tra ineligibility reasons.");
      return;
    }
    const payload: AssignReviewerDTO = {
      submissionId,
      reviewerId: rev.reviewerId,
      assignmentType: 1,
      deadline: toIso(globalDeadline),
      notes: undefined,
      skillMatchScore: rev.skillMatchScore ?? undefined,
    } as AssignReviewerDTO;
    assignMut.mutate(payload);
  };

  const onAssignAllEligible = () => {
    if (!globalDeadline) {
      toast.error("Vui lòng chọn deadline trước khi phân công.");
      return;
    }
    const eligible = suggestions.filter((s) => s.isEligible);
    if (eligible.length === 0) {
      toast.error("Không có reviewer hợp lệ để phân công.");
      return;
    }
    const iso = toIso(globalDeadline);
    eligible.forEach((s) => {
      assignMut.mutate({
        submissionId,
        reviewerId: s.reviewerId,
        assignmentType: 1,
        deadline: iso,
      } as AssignReviewerDTO);
    });
  };

  const toggleExpand = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const copyAiExplanation = async () => {
    if (!aiExplanation) return;
    try {
      await navigator.clipboard.writeText(aiExplanation);
      toast.success("Copied AI explanation");
    } catch {
      toast.error("Copy failed");
    }
  };

  const formatPercent = (val: any) => {
    if (val === null || val === undefined || val === "-") return "-";
    const num = Number(val);
    if (Number.isNaN(num)) return String(val);
    if (num >= 0 && num <= 1) return `${(num * 100).toFixed(1)}%`;
    if (num > 1 && num <= 100) return `${num.toFixed(1)}%`;
    return `${num.toFixed(1)}%`;
  };

  const renderFieldScores = (s: ReviewerSuggestionDTO) => {
    const fieldScores = (s as any).skillMatchFieldScores ?? (s as any).SkillMatchFieldScores ?? null;
    if (!fieldScores || typeof fieldScores !== "object") return null;
    const keys = Object.keys(fieldScores);
    return (
      <div className="mt-2 border rounded bg-slate-50 p-2 text-sm">
        <div className="font-medium mb-1">Field match scores</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {keys.map((k) => (
            <div key={k} className="flex items-center justify-between gap-2 border rounded px-2 py-1">
              <div className="text-xs text-slate-700">{k}</div>
              <div className="text-sm font-semibold">{formatPercent(fieldScores[k])}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMatchedSkills = (s: ReviewerSuggestionDTO) => {
    const matchedSkills = (s as any).matchedSkills ?? [];
    if (!Array.isArray(matchedSkills) || matchedSkills.length === 0) {
      return <div className="mt-2 text-sm text-amber-700">Reviewer skill do not match with this type of topic</div>;
    }

    return (
      <div className="mt-2">
        <div className="font-medium">Kỹ năng phù hợp</div>
        <ul className="list-disc ml-5 text-sm">
          {matchedSkills.map((skill: string, idx: number) => (
            <li key={idx}>{skill}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTopTokens = (s: ReviewerSuggestionDTO) => {
    const topTokens = (s as any).skillMatchTopTokens ?? {};
    if (!topTokens || typeof topTokens !== "object" || Object.keys(topTokens).length === 0) return null;

    return (
      <div className="mt-2">
        <div className="font-medium text-sm mb-1">Top skill tokens</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(topTokens).map(([field, tokens]) =>
            Array.isArray(tokens)
              ? tokens.map((token: string, i: number) => (
                <span
                  key={`${field}-${i}`}
                  className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 border border-blue-300 rounded-full"
                  title={`Field: ${field}`}
                >
                  {token}
                </span>
              ))
              : null
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

      <div className="relative z-10 w-full max-w-6xl bg-white rounded shadow-lg overflow-hidden min-w-[640px] min-h-[320px]">
        {suggestLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <div className="text-sm font-medium">Đang gợi ý reviewer...</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border-b gap-4">
          <h3 className="text-lg font-semibold">Gợi ý reviewer (AI)</h3>

          <div className="flex items-center gap-2 ml-4">
            <label className={`flex items-center gap-2 text-sm ${suggestLoading ? "opacity-50" : ""}`}>
              <input
                type="checkbox"
                checked={autoAssignOnServer}
                onChange={(e) => setAutoAssignOnServer(e.target.checked)}
                className="w-4 h-4"
                disabled={suggestLoading}
              />
              <span>Auto-create assignments on server</span>
            </label>

            <label className="text-sm">Deadline (áp dụng khi assign) *</label>
            <input
              type="date"
              value={globalDeadline}
              onChange={(e) => setGlobalDeadline(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              title="Deadline áp dụng cho hành động Assign / Assign all (bắt buộc)"
              disabled={suggestLoading || assignLoading}
            />

            <label className={`text-sm flex items-center gap-2 ${suggestLoading ? "opacity-50" : ""}`}>
              <span>Số lượng</span>
              <input
                type="number"
                min={1}
                max={50}
                value={String(maxSuggestions)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (Number.isNaN(val)) return setMaxSuggestions(1);
                  setMaxSuggestions(Math.max(1, Math.min(50, val)));
                }}
                className="w-16 border rounded px-2 py-1 text-sm"
                title="Số lượng reviewer AI sẽ đề xuất"
                disabled={suggestLoading}
              />
            </label>

            <button
              className="px-3 py-1 rounded border text-sm flex items-center gap-2 disabled:opacity-60"
              onClick={() =>
                suggestMut.mutate({
                  input: {
                    SubmissionId: Number(submissionId),
                    MaxSuggestions: Number(maxSuggestions ?? 2),
                    UsePrompt: true,
                    Deadline: null,
                  } as any,
                  assign: autoAssignOnServer,
                })
              }
              disabled={suggestLoading}
              title={suggestLoading ? "Đang gợi ý..." : "Gợi ý reviewer"}
            >
              {suggestLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Gợi ý...</span>
                </>
              ) : (
                "Gợi ý"
              )}
            </button>

            <button
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
              onClick={onAssignAllEligible}
              disabled={assignLoading || !(suggestions && suggestions.some((s) => s.isEligible)) || !globalDeadline || suggestLoading}
              title={!globalDeadline ? "Vui lòng chọn deadline trước khi phân công" : undefined}
            >
              Phân công tất cả hợp lệ
            </button>

            <button
              className="px-3 py-1 rounded border text-sm"
              onClick={() => {
                if (!suggestLoading && !assignLoading) onClose();
              }}
            >
              Đóng
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-[72vh] overflow-auto">
          {aiExplanation && (
            <div className="rounded border bg-yellow-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold mb-1">AI explanation</div>
                  <pre className="text-sm whitespace-pre-wrap">{aiExplanation}</pre>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={copyAiExplanation} className="px-2 py-1 rounded border text-sm" disabled={suggestLoading}>
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {assignmentResults && Array.isArray(assignmentResults) && assignmentResults.length > 0 && (
            <div className="rounded border p-3 bg-slate-50">
              <div className="font-semibold mb-1">Server assignment results</div>
              <ul className="text-sm list-disc ml-5">
                {assignmentResults.map((r: any, idx: number) => (
                  <li key={idx}>{JSON.stringify(r)}</li>
                ))}
              </ul>
            </div>
          )}

          {assignmentErrors && Array.isArray(assignmentErrors) && assignmentErrors.length > 0 && (
            <div className="rounded border p-3 bg-red-50 text-sm text-red-700">
              <div className="font-semibold mb-1">Assignment errors</div>
              <ul className="list-disc ml-5">
                {assignmentErrors.map((e: any, idx: number) => (
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
                <div key={key} className="border rounded p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">{s.reviewerName ?? `Reviewer ${s.reviewerId}`}</div>
                      <div className="text-sm text-slate-600">
                        Match Score: <span className="font-semibold">{formatPercent(s.skillMatchScore ?? s.overallScore ?? 0)}</span>
                        {" • "}Overall: <span className="font-semibold">{formatPercent(s.overallScore ?? 0)}</span>
                        {/* {" • "}Workload: <span className="font-semibold">{s.workloadScore ?? 0}</span> */}
                        {" • "}Active: <span className="font-semibold">{s.currentActiveAssignments ?? 0}</span>
                      </div>

                      {renderMatchedSkills(s)}

                      {s.isEligible === false && (
                        <div className="mt-1 text-sm text-rose-600">
                          Ineligible: {(s.ineligibilityReasons ?? []).join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-slate-500">#{s.reviewerId}</div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onAssign(s)}
                          className={`px-3 py-1 rounded text-sm ${s.isEligible
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-600 cursor-not-allowed"
                            }`}
                          disabled={!s.isEligible || assignLoading || !globalDeadline || suggestLoading}
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
                          <ul className="list-disc ml-5">
                            {Object.entries(s.reviewerSkills).map(([skill, level]) => (
                              <li key={skill}>
                                {skill}: <span className="font-semibold">{String(level)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-sm">
                        <div>
                          Completed: <span className="font-semibold">{s.completedAssignments ?? 0}</span>
                        </div>
                        <div>
                          Avg score:{" "}
                          <span className="font-semibold">
                            {s.averageScoreGiven === null || s.averageScoreGiven === undefined
                              ? "-"
                              : formatPercent(s.averageScoreGiven)}
                          </span>
                        </div>
                        <div>
                          On-time rate:{" "}
                          <span className="font-semibold">
                            {s.onTimeRate === null || s.onTimeRate === undefined ? "-" : formatPercent(s.onTimeRate)}
                          </span>
                        </div>
                        <div>
                          Quality rating:{" "}
                          <span className="font-semibold">
                            {s.qualityRating === null || s.qualityRating === undefined ? "-" : formatPercent(s.qualityRating)}
                          </span>
                        </div>
                        <div>
                          Performance score:{" "}
                          <span className="font-semibold">
                            {s.performanceScore === null || s.performanceScore === undefined
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

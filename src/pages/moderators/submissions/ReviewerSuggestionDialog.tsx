// src/components/moderator/submissions/ReviewerSuggestionDialog.tsx
import React, { useEffect, useMemo, useState } from "react";
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

/**
 * ReviewerSuggestionDialog with single global deadline
 * - global deadline input in header applies to assign actions (single/all).
 */
export default function ReviewerSuggestionDialog({ submissionId, open, onClose }: Props) {
  const qc = useQueryClient();

  const [autoAssignOnServer, setAutoAssignOnServer] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // single global deadline applied when assigning
  const [globalDeadline, setGlobalDeadline] = useState<string>("");

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

  useEffect(() => {
    if (!open) return;
    suggestMut.mutate({
      input: {
        SubmissionId: Number(submissionId),
        MaxSuggestions: 2,
        UsePrompt: true,
        Deadline: null,
      } as any,
      assign: autoAssignOnServer,
    });
  }, [open, submissionId, autoAssignOnServer]);

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
      return new Date(dateStr).toISOString();
    } catch {
      return undefined;
    }
  };

  const onAssign = (rev: ReviewerSuggestionDTO) => {
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
              <div className="text-sm font-semibold">{String(fieldScores[k])}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTopTokens = (s: ReviewerSuggestionDTO) => {
    const tokens = (s as any).skillMatchTopTokens ?? (s as any).SkillMatchTopTokens ?? null;
    if (!tokens || typeof tokens !== "object") return null;
    const keys = Object.keys(tokens);
    return (
      <div className="mt-2 text-sm">
        <div className="font-medium mb-1">Top tokens</div>
        {keys.map((k) => (
          <div key={k} className="mb-1">
            <div className="text-xs text-slate-600">{k}</div>
            <div className="text-sm">{Array.isArray(tokens[k]) ? tokens[k].slice(0, 8).join(", ") : String(tokens[k])}</div>
          </div>
        ))}
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!suggestMut.isLoading && !assignMut.isLoading) onClose();
        }}
      />

      <div className="relative z-10 w-full max-w-6xl bg-white rounded shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b gap-4">
          <h3 className="text-lg font-semibold">Gợi ý reviewer (AI)</h3>

          <div className="flex items-center gap-2 ml-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoAssignOnServer}
                onChange={(e) => setAutoAssignOnServer(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Auto-create assignments on server</span>
            </label>

            <label className="text-sm">Deadline (áp dụng khi assign)</label>
            <input
              type="date"
              value={globalDeadline}
              onChange={(e) => setGlobalDeadline(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              title="Deadline áp dụng cho hành động Assign / Assign all"
            />

            <button
              className="px-3 py-1 rounded border text-sm"
              onClick={() =>
                suggestMut.mutate({
                  input: {
                    SubmissionId: Number(submissionId),
                    MaxSuggestions: 8,
                    UsePrompt: true,
                    Deadline: null,
                  } as any,
                  assign: autoAssignOnServer,
                })
              }
              disabled={suggestMut.isLoading}
            >
              Lấy lại
            </button>

            <button
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
              onClick={onAssignAllEligible}
              disabled={assignMut.isLoading || !(suggestions && suggestions.some((s) => s.isEligible))}
            >
              Phân công tất cả hợp lệ
            </button>

            <button
              className="px-3 py-1 rounded border text-sm"
              onClick={() => {
                if (!suggestMut.isLoading && !assignMut.isLoading) onClose();
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
                  <button
                    onClick={copyAiExplanation}
                    className="px-2 py-1 rounded border text-sm"
                  >
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

          {(!suggestions || suggestions.length === 0) && !suggestMut.isLoading && (
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
                        Score: <span className="font-semibold">{s.skillMatchScore ?? s.overallScore ?? 0}</span>
                        {" • "}Overall: <span className="font-semibold">{s.overallScore ?? 0}</span>
                        {" • "}Workload: <span className="font-semibold">{s.workloadScore ?? 0}</span>
                        {" • "}Active: <span className="font-semibold">{s.currentActiveAssignments ?? 0}</span>
                      </div>
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
                          className={`px-3 py-1 rounded text-sm ${s.isEligible ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600 cursor-not-allowed"}`}
                          disabled={!s.isEligible || assignMut.isLoading}
                          title={!s.isEligible ? "Reviewer không hợp lệ" : "Assign reviewer"}
                        >
                          Assign
                        </button>
                      </div>

                      <button
                        onClick={() => toggleExpand(key)}
                        className="text-xs text-slate-500 underline"
                      >
                        {expanded[key] ? "Hide details" : "Show details"}
                      </button>
                    </div>
                  </div>

                  {expanded[key] && (
                    <div className="mt-3">
                      {renderFieldScores(s)}
                      {renderTopTokens(s)}
                      <div className="mt-2 text-xs text-slate-600">
                        <div className="font-medium mb-1">Raw suggestion</div>
                        <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(s, null, 2)}</pre>
                      </div>
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

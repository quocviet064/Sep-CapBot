import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSubmissionDetail } from "@/hooks/useSubmission";
import { useTopicDetail } from "@/hooks/useTopic";
import { useSubmissionReviewSummary } from "@/hooks/useSubmissionReview";

import type { SubmissionListItem } from "@/services/submissionService";
import type { TopicDetailResponse, SubmissionDTO } from "@/services/topicService";
import type { SubmissionReviewSummaryDTO } from "@/services/submissionReviewService";

import {
  useBulkAssignReviewers,
  useAvailableReviewers,
  useAssignmentsBySubmission,
  useCancelAssignment,
} from "@/hooks/useReviewerAssignment";

import ReviewerPickerDialog from "./ReviewerPickerDialog";
import ReviewerSuggestionDialog from "./ReviewerSuggestionDialog";
import AICheckSection from "./components/AICheckSection";
import ReviewsModal from "./components/ReviewsModal";
import SidebarActions from "./components/SidebarActions";
import FinalReviewDialog from "./components/FinalReviewDialog";

function statusColorClass(status?: string) {
  if (!status) return "bg-slate-100 text-slate-700";
  const s = status.toLowerCase();
  if (s.includes("under") || s.includes("pending")) return "bg-yellow-100 text-yellow-800";
  if (s.includes("approved")) return "bg-green-100 text-green-800";
  if (s.includes("rejected")) return "bg-red-100 text-red-800";
  if (s.includes("duplicate")) return "bg-purple-100 text-purple-800";
  if (s.includes("revision") || s.includes("revisionrequired")) return "bg-orange-100 text-orange-800";
  if (s.includes("escalated")) return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

type RouteState = {
  topicId?: number;
  row?: SubmissionListItem;
  topicDetail?: TopicDetailResponse;
  topicVersionId?: number;
} | undefined;

export default function SubmissionDetailPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { submissionId } = useParams<{ submissionId: string }>();
  const { state } = useLocation();

  const typedState = state as RouteState;
  const initialRow = (typedState?.row as SubmissionListItem | undefined) ?? undefined;
  const sid: number | undefined = submissionId ? Number(submissionId) : undefined;

  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewsModalSubmissionId, setReviewsModalSubmissionId] = useState<number | string | null>(null);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const { data: submissionDetailShort } = useSubmissionDetail(sid);

  const topicIdFromState = typedState?.topicId ?? (submissionDetailShort as any)?.topicId ?? undefined;
  const topicId: number | undefined = topicIdFromState ? Number(topicIdFromState) : undefined;

  const { data: topicDetailResponse, refetch: refetchTopicDetail } = useTopicDetail(topicId);
  const topicDetail = topicDetailResponse as TopicDetailResponse | undefined;

  // summary for current submission (quick info)
  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useSubmissionReviewSummary(sid);

  const selectedSubmission = useMemo<SubmissionDTO | undefined>(() => {
    if (!topicDetail) return (initialRow ?? (submissionDetailShort as any)) as SubmissionDTO | undefined;
    const subs = topicDetail.submissions ?? [];
    if (sid) {
      const found = subs.find((s) => s.id === sid);
      if (found) return found;
    }
    const sorted = subs.slice().sort((a, b) => {
      const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return tb - ta;
    });
    return sorted[0] ?? ((initialRow ?? (submissionDetailShort as any)) as SubmissionDTO | undefined);
  }, [topicDetail, sid, initialRow, submissionDetailShort]);

  useEffect(() => {
    const id = selectedSubmission?.id;
    if (!id) return;
    const existing = qc.getQueryData(["submission-detail", id]);
    if (!existing) {
      qc.setQueryData(["submission-detail", id], selectedSubmission);
    }
  }, [qc, selectedSubmission]);

  // assignments for the current submission (hook uses key "assignmentsBySubmission")
  const { data: assignments, isLoading: loadingAssignments } = useAssignmentsBySubmission(sid);
  const { data: availableReviewers, isLoading: loadingAvailable } = useAvailableReviewers(isPickerOpen ? sid : undefined);
  const bulkAssign = useBulkAssignReviewers();
  const cancelAssignment = useCancelAssignment();

  // ------------ detect topicVersionId and compute displayedTopic --------------
  const topicVersionIdFromState = typedState?.topicVersionId ?? undefined;
  const topicVersionIdFromSubmission = (selectedSubmission as any)?.topicVersionId ?? undefined;
  const topicVersionId: number | undefined =
    (topicVersionIdFromState ?? topicVersionIdFromSubmission) != null ? Number(topicVersionIdFromState ?? topicVersionIdFromSubmission) : undefined;

  const displayedTopic = useMemo<any>(() => {
    if (!topicDetail) return undefined;
    if (!topicVersionId) return topicDetail;

    const possibleLists = [
      (topicDetail as any).versions,
      (topicDetail as any).topicVersions,
      (topicDetail as any).versionList,
      (topicDetail as any).topicVersionList,
    ].filter(Boolean) as any[];

    for (const list of possibleLists) {
      if (!Array.isArray(list)) continue;
      const found = list.find((v: any) => Number(v.id) === Number(topicVersionId));
      if (found) return found;
    }

    return topicDetail;
  }, [topicDetail, topicVersionId]);

  const requiredReviewers = topicDetail?.requiredReviewers ?? 2;
  const assignedCount = (assignments ?? []).length;
  const isAssignDisabled = assignedCount >= requiredReviewers;

  const recCount = (summary as any)?.recommendationsCount ?? (summary as any)?.recommendationCounts;
  const isEscalated = (() => {
    const status = (selectedSubmission as any)?.status ?? topicDetail?.latestSubmissionStatus ?? "";
    if (String(status).toLowerCase().includes("escalat")) return true;
    if (recCount) {
      const ok = Number(recCount.approve ?? recCount.Approve ?? 0);
      const rej = Number(recCount.reject ?? recCount.Reject ?? 0);
      if (ok > 0 && rej > 0) return true;
    }
    return false;
  })();

  // ---------- help to pick topic/version from assignment ----------
  function normalizeTopicLike(t: any) {
    if (!t) return null;
    return {
      id: t.id ?? t.topicId,
      eN_Title: t.eN_Title ?? t.title ?? t.name ?? null,
      vN_title: t.vN_title ?? t.vNTitle ?? null,
      description: t.description ?? t.desc ?? null,
      documentUrl: t.documentUrl ?? t.document_url ?? t.fileUrl ?? null,
      maxStudents: t.maxStudents ?? t.max_students ?? t.max ?? null,
      categoryName: t.categoryName ?? t.category ?? null,
      semesterName: t.semesterName ?? t.semester ?? null,
      supervisorName: t.supervisorName ?? t.supervisor ?? null,
      __raw: t,
    };
  }

  function pickDisplayedTopicFromAssignment(assignment: any) {
    const tv = assignment?.topicVersion ?? null;
    const t = assignment?.topic ?? null;

    if (tv && typeof tv === "object") {
      const st = (tv.status ?? tv.Status ?? "").toString().toLowerCase();
      if (st === "submitted" || st.includes("submitted")) {
        return { displayTopic: normalizeTopicLike(tv), displayTopicSource: "topicVersion" };
      }
      if (!t) {
        return { displayTopic: normalizeTopicLike(tv), displayTopicSource: "topicVersion" };
      }
    }

    if (t) {
      return { displayTopic: normalizeTopicLike(t), displayTopicSource: "topic" };
    }

    if (tv) return { displayTopic: normalizeTopicLike(tv), displayTopicSource: "topicVersion" };

    return { displayTopic: null, displayTopicSource: "none" };
  }

  const assignmentsWithDisplay = useMemo(() => {
    return (assignments ?? []).map((a: any) => {
      const picked = pickDisplayedTopicFromAssignment(a);
      return {
        ...a,
        displayTopic: picked.displayTopic,
        displayTopicSource: picked.displayTopicSource,
      };
    });
  }, [assignments]);

  // ---------- reviews modal handlers ----------
  const openReviewsForSubmission = async (submissionToOpen?: number | string | null) => {
    const target = submissionToOpen ?? sid ?? null;
    if (!target) {
      toast.error("Submission ID không hợp lệ để xem review");
      return;
    }
    setReviewsModalSubmissionId(target);
    setShowReviewsModal(true);

    if (String(target) === String(sid)) {
      try {
        await refetchSummary?.();
      } catch {
        // ignore
      }
    }
  };

  const closeReviews = () => {
    setShowReviewsModal(false);
    setReviewsModalSubmissionId(null);
  };

  const openPicker = () => (sid ? setIsPickerOpen(true) : toast.error("Submission ID không hợp lệ"));
  const closePicker = () => setIsPickerOpen(false);
  const openSuggestions = () => (sid ? setIsSuggestionOpen(true) : toast.error("Submission ID không hợp lệ"));
  const closeSuggestions = () => setIsSuggestionOpen(false);
  const openFinalReview = () => (sid ? setIsFinalReviewOpen(true) : toast.error("Submission ID không hợp lệ"));
  const closeFinalReview = () => setIsFinalReviewOpen(false);

  const handleConfirmAssign = async (arg: any) => {
    if (!sid) {
      toast.error("Submission ID không hợp lệ");
      return;
    }
    if (isAssignDisabled) {
      toast.error(`Đã có ${assignedCount} reviewer. Không thể phân công thêm.`);
      return;
    }

    let payload: any = null;

    if (arg && Array.isArray(arg.assignments)) {
      payload = { assignments: arg.assignments.map((a: any) => ({ ...a, submissionId: a.submissionId ?? sid })) };
    } else if (Array.isArray(arg)) {
      const reviewerIds = arg.map((id: any) => Number(id)).filter((n) => !Number.isNaN(n));
      if (reviewerIds.length === 0) {
        toast.error("Vui lòng chọn reviewer hợp lệ");
        return;
      }
      payload = {
        assignments: reviewerIds.map((rid) => ({ submissionId: sid, reviewerId: rid, assignmentType: 1 })),
      };
    } else if (arg && Array.isArray(arg.reviewerIds)) {
      const reviewerIds = (arg.reviewerIds as any[]).map((id) => Number(id)).filter((n) => !Number.isNaN(n));
      if (reviewerIds.length === 0) {
        toast.error("Vui lòng chọn reviewer hợp lệ");
        return;
      }
      const at = arg.assignmentType ?? 1;
      const dl = arg.deadline ?? undefined;
      payload = {
        assignments: reviewerIds.map((rid) => ({ submissionId: sid, reviewerId: rid, assignmentType: at, deadline: dl })),
      };
    } else {
      toast.error("Dữ liệu phân công không hợp lệ");
      return;
    }

    const missingDeadline = payload.assignments.some((a: any) => !a.deadline);
    if (missingDeadline) {
      console.warn("Some assignments missing deadline:", payload);
    }

    setAssigning(true);
    try {
      const res = await bulkAssign.mutateAsync(payload as any);
      if (res && typeof res === "object" && (res.success === false || res.error)) {
        toast.error(res.message ?? res.error ?? "Phân công reviewer thất bại");
      } else {
        toast.success("Phân công reviewer thành công");
        if (topicId) qc.invalidateQueries({ queryKey: ["topicDetail", topicId] });
        qc.invalidateQueries({ queryKey: ["submission-review-summary", String(sid)] });
        qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", String(sid)] });
        qc.invalidateQueries({ queryKey: ["submission-detail", String(sid)] });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Phân công reviewer thất bại");
    } finally {
      setAssigning(false);
      closePicker();
    }
  };

  const handleRemoveAssignment = (assignmentId?: number | string) => {
    if (!assignmentId) {
      toast.error("Assignment ID không hợp lệ");
      return;
    }
    const ok = window.confirm("Bạn có chắc muốn huỷ phân công reviewer này không?");
    if (!ok) return;
    cancelAssignment.mutate(assignmentId, {
      onSuccess: () => {
        toast.success("Đã huỷ phân công reviewer");
        if (sid) {
          qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", String(sid)] });
          qc.invalidateQueries({ queryKey: ["submission-detail", String(sid)] });
          qc.invalidateQueries({ queryKey: ["submission-review-summary", String(sid)] });
        }
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? err?.message ?? "Không thể huỷ phân công");
      },
    });
  };

  const refreshTopicDetail = async () => {
    try {
      if (topicId) await refetchTopicDetail?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Không thể tải lại thông tin đề tài");
    }
  };

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4 min-w-0">
              <div className="bg-white border rounded-md p-4 w-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Topic</div>
                    <div className="text-xl font-bold mt-1 truncate">{(displayedTopic as any)?.eN_Title ?? (displayedTopic as any)?.vN_title ?? "—"}</div>
                    <div className="text-sm text-slate-600 mt-2 line-clamp-3">{(displayedTopic as any)?.description ?? "—"}</div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {(((displayedTopic as any)?.tags ?? []) as string[]).slice(0, 6).map((t: string, i: number) => (
                        <span key={i} className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-[#ecfeff] text-[#0ea5a0] border" >
                          {t}
                        </span>
                      ))}
                      {Array.isArray((displayedTopic as any)?.tags) && (displayedTopic as any).tags.length > 6 && (
                        <span className="text-xs text-slate-500">+{(displayedTopic as any).tags.length - 6} more</span>
                      )}
                    </div>

                    {(((displayedTopic as any)?.keywords ?? (displayedTopic as any)?.keywordsList) ?? "") && (
                      <div className="mt-3 text-xs text-slate-500">
                        <strong>Keywords:</strong>{" "}
                        {(displayedTopic as any).keywords ?? ((displayedTopic as any).keywordsList?.join?.(", ") ?? "")}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-right min-w-[180px]">
                    <div className="mb-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass((topicDetail as any)?.latestSubmissionStatus ?? "")}`}>
                        {(topicDetail as any)?.latestSubmissionStatus ?? "—"}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">Max students</div>
                    <div className="font-medium mb-2">{(displayedTopic as any)?.maxStudents ?? "—"}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                  <div>
                    <div className="text-xs text-slate-500">Category</div>
                    <div className="font-medium">{(displayedTopic as any)?.categoryName ?? "—"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Semester</div>
                    <div className="font-medium">{(displayedTopic as any)?.semesterName ?? "—"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Supervisor</div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-sm">
                        {(((displayedTopic as any)?.supervisorName ?? "U") as string).split(" ").map((p: string) => p[0]?.toUpperCase()).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{(displayedTopic as any)?.supervisorName ?? "—"}</div>
                        <div className="text-xs text-slate-500">{(displayedTopic as any)?.supervisorEmail ?? ""}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Document</div>
                    <div className="font-medium">
                      {(displayedTopic as any)?.documentUrl ? (
                        <a href={(displayedTopic as any).documentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                          Download document
                        </a>
                      ) : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <AICheckSection submissionDetail={selectedSubmission} />
            </div>

            <aside className="space-y-4 min-w-0">
              <SidebarActions
                assignments={assignmentsWithDisplay}
                loadingAssignments={loadingAssignments}
                showReviews={!!showReviewsModal}
                toggleShowReviews={() => (!showReviewsModal ? openReviewsForSubmission() : closeReviews())}
                onOpenPicker={openPicker}
                onOpenSuggestions={openSuggestions}
                onOpenAssignments={() => {
                  if (sid) qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", String(sid)] });
                }}
                onOpenFinalReview={openFinalReview}
                submissionId={sid}
                onRemoveAssignment={handleRemoveAssignment}
                reviewSummary={summary}
                isAssignDisabled={isAssignDisabled}
                isEscalated={isEscalated}
                onOpenReviewForSubmission={(submissionToOpen) => openReviewsForSubmission(submissionToOpen)}
              />
            </aside>
          </div>
        </div>
      </div>

      {isPickerOpen && sid && (
        <ReviewerPickerDialog
          isOpen={isPickerOpen}
          submissionId={sid}
          availableReviewers={availableReviewers ?? []}
          onClose={closePicker}
          onConfirm={(payloadOrIds: any) => handleConfirmAssign(payloadOrIds)}
          loading={bulkAssign.isLoading || loadingAvailable || assigning}
          confirmDisabled={isAssignDisabled || assigning}
          assignedCount={assignedCount}
          requiredReviewers={requiredReviewers}
        />
      )}

      {isSuggestionOpen && sid && (
        <ReviewerSuggestionDialog submissionId={sid} open={isSuggestionOpen} onClose={closeSuggestions} />
      )}

      <ReviewsModal
        open={showReviewsModal}
        onClose={closeReviews}
        submissionId={reviewsModalSubmissionId ?? undefined}
        summary={String(reviewsModalSubmissionId ?? "") === String(sid ?? "") ? (summary as SubmissionReviewSummaryDTO | undefined) : undefined}
        loading={String(reviewsModalSubmissionId ?? "") === String(sid ?? "") ? loadingSummary : undefined}
        onOpenRefetch={async () => {
          try {
            await refetchSummary?.();
          } catch (err: any) {
            toast.error(err?.message ?? "Không thể tải lại summary");
          }
        }}
      />

      {isFinalReviewOpen && sid && (
        <FinalReviewDialog
          isOpen={isFinalReviewOpen}
          onClose={closeFinalReview}
          submissionId={sid}
          onSuccess={async () => {
            try {
              if (topicId) await refetchTopicDetail?.();
              await refetchSummary?.();
            } catch {
              // ignore
            }
          }}
        />
      )}
    </div>
  );
}

import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { SubmissionListItem } from "@/services/submissionService";
import {
  useSubmissionReviewSummary,
  useModeratorFinalReview,
} from "@/hooks/useSubmissionReview";

const RECODES = {
  Approve: 1,
  Minor: 2,
  Major: 3,
  Reject: 4,
} as const;

export default function SubmissionDetailPage() {
  const navigate = useNavigate();
  const { submissionId } = useParams<{ submissionId: string }>();
  const { state } = useLocation();
  const initialRow = (state?.row as SubmissionListItem | undefined) ?? undefined;

  const { data: summary, isLoading, isError } = useSubmissionReviewSummary(
    submissionId
  );

  const { mutate: saveDecision, isPending: saving } = useModeratorFinalReview();

  const hasAnyReviewer = (summary?.reviews?.length ?? 0) > 0;
  const submittedReviews = useMemo(
    () => (summary?.reviews ?? []).filter((r) => !!r.submittedAt),
    [summary]
  );

  const header = {
    id: submissionId,
    code: String(initialRow?.id ?? submissionId),
    title: initialRow?.title ?? `Submission #${submissionId}`,
    submittedByName: initialRow?.submittedByName ?? "-",
    round: (initialRow as any)?.submissionRound ?? (initialRow as any)?.round ?? "-",
    semester: (initialRow as any)?.semester ?? "-",
    submittedAt: (initialRow as any)?.submittedAt ?? "-",
    status: (initialRow as any)?.status ?? undefined,
    assignedCount: initialRow ? (initialRow as any)?.assignedCount ?? summary?.totalReviews ?? 0 : summary?.totalReviews ?? 0,
  };

  return (
    <div className="container mx-auto p-4 space-y-3">
      {/* Top bar */}
      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center rounded-md border px-3 py-2 hover:bg-muted"
          onClick={() => {
            // quay lại trang trước, nếu không có history thì về overview
            if (window.history.length > 1) navigate(-1);
            else navigate("/moderators/submissions/overview");
          }}
        >
          ← Trở về
        </button>
        <div className="ml-2 text-lg font-semibold truncate">
          {header.title} <span className="opacity-60">— {header.submittedByName}</span>
        </div>
      </div>

      {/* Submission detail */}
      <div className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">Submission detail</div>
          {header.status ? (
            <span className="text-xs rounded-full border px-2 py-0.5 opacity-80">
              {String(header.status)}
            </span>
          ) : null}
        </div>
        <dl className="grid gap-2 sm:grid-cols-[140px_1fr] text-sm">
          <dt className="opacity-60">Mã</dt>
          <dd className="font-medium">{header.code}</dd>
          <dt className="opacity-60">Sinh viên</dt>
          <dd>{header.submittedByName}</dd>
          <dt className="opacity-60">Round</dt>
          <dd>{header.round}</dd>
          <dt className="opacity-60">Semester</dt>
          <dd>{header.semester}</dd>
          <dt className="opacity-60">Submitted</dt>
          <dd>{header.submittedAt}</dd>
          <dt className="opacity-60">Assigned</dt>
          <dd>{header.assignedCount}</dd>
          {summary?.averageScore != null && (
            <>
              <dt className="opacity-60">Avg score</dt>
              <dd className="font-medium">{summary.averageScore}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Reviewers & Reviews */}
      <div className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">Reviewers &amp; Reviews</div>
          <button
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            onClick={() =>
              navigate("/moderators/submissions/assign", {
                state: { preselectSubmissionId: submissionId },
              })
            }
          >
            {hasAnyReviewer ? "Assign thêm" : "Assign reviewers"}
          </button>
        </div>

        {isLoading && <div className="text-sm opacity-70">Đang tải reviews...</div>}
        {isError && <div className="text-sm text-red-400">Không tải được reviews.</div>}

        {!isLoading && (summary?.reviews?.length ?? 0) === 0 && (
          <div className="rounded-md border border-dashed p-3 text-sm opacity-70">
            Chưa phân công reviewer.
          </div>
        )}

        <div className="grid gap-3">
          {(summary?.reviews ?? []).map((r) => {
            const submitted = !!r.submittedAt;
            return (
              <div key={String(r.reviewId)} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{r.reviewerName ?? "Reviewer"}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border px-2 py-0.5 opacity-80">
                      {submitted ? "Submitted" : "Assigned"}
                    </span>
                    {submitted && r.overallScore != null && (
                      <span className="rounded-full border px-2 py-0.5">
                        Score {r.overallScore}
                      </span>
                    )}
                    {submitted && r.recommendation != null && (
                      <span className="rounded-full border px-2 py-0.5">
                        {recLabel(r.recommendation)}
                      </span>
                    )}
                  </div>
                </div>

                {submitted && (r as any).comment && (
                  <div className="mt-2 text-sm opacity-80">{(r as any).comment}</div>
                )}

                {submitted && r.submittedAt && (
                  <div className="mt-1 text-xs opacity-60">Nộp: {r.submittedAt}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final decision của Moderator */}
      <div className="rounded-lg border p-4">
        <div className="mb-2 font-semibold">Final decision</div>

        {summary?.finalDecision?.finalRecommendation ? (
          <div className="text-sm">
            <span className="rounded-full border px-2 py-0.5">
              {recLabel(summary.finalDecision.finalRecommendation)}
            </span>
            {summary.finalDecision.finalScore != null && (
              <span className="ml-2 rounded-full border px-2 py-0.5">
                Score {summary.finalDecision.finalScore}
              </span>
            )}
            {summary.finalDecision.moderatorNotes && (
              <div className="mt-1 text-sm opacity-80">
                Note: {summary.finalDecision.moderatorNotes}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <ActionBtn
              label="Pass"
              onClick={() =>
                saveDecision({
                  submissionId: submissionId!,
                  finalRecommendation: RECODES.Approve,
                })
              }
              disabled={saving}
            />
            <ActionBtn
              label="Minor"
              onClick={() =>
                saveDecision({
                  submissionId: submissionId!,
                  finalRecommendation: RECODES.Minor,
                })
              }
              disabled={saving}
            />
            <ActionBtn
              label="Major"
              onClick={() =>
                saveDecision({
                  submissionId: submissionId!,
                  finalRecommendation: RECODES.Major,
                })
              }
              disabled={saving}
            />
            <ActionBtn
              label="Fail"
              onClick={() =>
                saveDecision({
                  submissionId: submissionId!,
                  finalRecommendation: RECODES.Reject,
                })
              }
              disabled={saving}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const style = {
    Pass: "border-emerald-600",
    Minor: "border-amber-500",
    Major: "border-orange-600",
    Fail: "border-red-600",
  } as Record<string, string>;
  return (
    <button
      className={cn(
        "rounded-md border px-3 py-2 text-sm hover:bg-muted",
        style[label] ?? ""
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function recLabel(v?: number | null) {
  if (v === 1) return "Approve";
  if (v === 2) return "Minor";
  if (v === 3) return "Major";
  if (v === 4) return "Reject";
  return "-";
}

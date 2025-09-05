import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, Gavel, XCircle } from "lucide-react";

import LoadingPage from "@/pages/loading-page";
import { Button } from "@/components/globals/atoms/button";
import { Badge } from "@/components/globals/atoms/badge";
import { Label } from "@/components/globals/atoms/label";
import { Input } from "@/components/globals/atoms/input";
import { Textarea } from "@/components/globals/atoms/textarea";
import { toast } from "sonner";

import { formatDateTime } from "@/utils/formatter";
import { useSubmissionDetail } from "@/hooks/useSubmission";
import {
  useSubmissionReviewSummary,
  useModeratorFinalReview,
} from "@/hooks/useSubmissionReview";
import type { ReviewerRecommendation } from "@/services/submissionReviewService";

function SectionCard({
  title,
  desc,
  children,
  icon,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4 shadow-sm ring-1 ring-black/[0.02] backdrop-blur-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900/90 text-white shadow-sm">
          {icon ?? <FileText className="h-4 w-4" />}
        </div>
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {desc ? <p className="text-muted-foreground text-xs">{desc}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="bg-muted rounded-md px-4 py-2 text-sm whitespace-pre-line text-gray-800">
        {children || <span className="text-gray-400 italic">--</span>}
      </div>
    </div>
  );
}

const recLabel = (r?: number) =>
  r === 1 ? "Approve" : r === 2 ? "Minor revision" : r === 3 ? "Major revision" : r === 4 ? "Reject" : "—";

const StatusPill = ({ approved }: { approved?: boolean | null }) =>
  approved ? (
    <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
      Đã duyệt
    </Badge>
  ) : (
    <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-700">
      <XCircle className="mr-1 h-3.5 w-3.5" />
      Chưa duyệt
    </Badge>
  );

export default function TopicApprovalDetailPage() {
  const { id } = useParams<{ id: string }>(); // submissionId
  const submissionId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  // Detail submission (tiêu đề, người nộp, ngày nộp, file… nếu BE có)
  const sub = useSubmissionDetail(submissionId);

  // Summary review (điểm TB, danh sách reviews, quyết định cuối)
  const summary = useSubmissionReviewSummary(submissionId);
  const finalMut = useModeratorFinalReview();

  // Form final decision
  const [finalRecommendation, setFinalRecommendation] = useState<ReviewerRecommendation | null>(null);
  const [finalScore, setFinalScore] = useState<number | "">("");
  const [moderatorNotes, setModeratorNotes] = useState<string>("");
  const [revisionDeadline, setRevisionDeadline] = useState<string>("");

  // Khi đã có summary.finalDecision -> fill form để edit/override (nếu cần)
  useEffect(() => {
    const fd = summary.data?.finalDecision;
    if (fd) {
      setFinalRecommendation((fd.finalRecommendation ?? null) as ReviewerRecommendation | null);
      setFinalScore(typeof fd.finalScore === "number" ? fd.finalScore : "");
      setModeratorNotes(fd.moderatorNotes ?? "");
      setRevisionDeadline(fd.revisionDeadline ?? "");
    }
  }, [summary.data?.finalDecision]);

  const requiredProgress = useMemo(() => {
    const s = sub.data;
    if (!s) return { count: 0, total: 3, progress: 0 };
    const req = {
      documentUrl: s.documentUrl,
      submittedAt: s.submittedAt,
      status: s.status,
    } as const;
    const keys = Object.keys(req) as (keyof typeof req)[];
    const complete = keys.filter((k) => Boolean(req[k])).length;
    return {
      count: complete,
      total: keys.length,
      progress: Math.round((complete / keys.length) * 100),
    };
  }, [sub.data]);

  const onSaveDecision = () => {
    if (!submissionId) return;
    if (!finalRecommendation) {
      toast.info("Chọn quyết định cuối cùng (Approve / Minor / Major / Reject).");
      return;
    }
    // nếu là minor/major cần deadline
    if ((finalRecommendation === 2 || finalRecommendation === 3) && !revisionDeadline.trim()) {
      toast.info("Vui lòng nhập hạn chỉnh sửa khi chọn Revision.");
      return;
    }
    finalMut.mutate(
      {
        submissionId,
        finalRecommendation,
        finalScore: finalScore === "" ? undefined : Number(finalScore),
        moderatorNotes: moderatorNotes?.trim() || undefined,
        revisionDeadline: revisionDeadline || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đã lưu quyết định của Moderator.");
        },
      },
    );
  };

  // Loading gates
  if (sub.isLoading || summary.isLoading) return <LoadingPage />;
  if (sub.error) return <p className="p-4 text-red-600">{sub.error.message}</p>;
  if (summary.error) return <p className="p-4 text-red-600">{summary.error.message}</p>;
  if (!sub.data) return <p className="text-sm">Không tìm thấy submission.</p>;

  const reviews = summary.data?.reviews ?? [];
  const avg = summary.data?.averageScore ?? null;
  const counts = summary.data?.recommendationsCount ?? {};
  const fd = summary.data?.finalDecision;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Gavel className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Duyệt submission #{sub.data.id}
              </h2>
              <p className="text-xs text-white/70">
                Xem lịch sử đánh giá của reviewer & đưa ra quyết định cuối cùng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusPill approved={fd?.finalRecommendation === 1} />
            <div className="w-48">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span>Hoàn thiện</span>
                <span className="font-semibold">{requiredProgress.progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${requiredProgress.progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* LEFT: Submission info + Reviewer history */}
        <div className="space-y-4 xl:col-span-2">
          <SectionCard title="Thông tin submission">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoBlock label="Người nộp">{sub.data.submittedByName}</InfoBlock>
              <InfoBlock label="Ngày nộp">{formatDateTime(sub.data.submittedAt)}</InfoBlock>
              <InfoBlock label="File đính kèm">
                {sub.data.documentUrl ? (
                  <a
                    className="text-blue-600 underline hover:text-blue-800"
                    href={sub.data.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {sub.data.documentUrl}
                  </a>
                ) : (
                  "—"
                )}
              </InfoBlock>
              <InfoBlock label="Ghi chú thêm">{sub.data.additionalNotes}</InfoBlock>
            </div>
          </SectionCard>

          <SectionCard
            title="Lịch sử đánh giá của reviewer"
            desc="Tổng hợp các review đã nộp cho submission này."
            icon={<FileText className="h-4 w-4" />}
          >
            {reviews.length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có reviewer nào nộp đánh giá.</div>
            ) : (
              <div className="rounded-md border overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Reviewer</th>
                      <th className="p-2 text-right">Điểm</th>
                      <th className="p-2 text-left">Khuyến nghị</th>
                      <th className="p-2 text-left">Thời điểm nộp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={String(r.reviewId)} className="border-t">
                        <td className="p-2">{r.reviewerName ?? `#${r.reviewerId}`}</td>
                        <td className="p-2 text-right">{typeof r.overallScore === "number" ? r.overallScore : "—"}</td>
                        <td className="p-2">{recLabel(r.recommendation)}</td>
                        <td className="p-2">{r.submittedAt ? formatDateTime(r.submittedAt) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Điểm trung bình</div>
                <div className="text-lg font-semibold">{avg ?? "—"}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Phân bố khuyến nghị</div>
                <div className="mt-1 text-xs">
                  ✅ Approve: <b>{counts.approve ?? 0}</b> &nbsp;•&nbsp; ✏️ Minor: <b>{counts.minor ?? 0}</b>{" "}
                  &nbsp;•&nbsp; 🛠 Major: <b>{counts.major ?? 0}</b> &nbsp;•&nbsp; ❌ Reject: <b>{counts.reject ?? 0}</b>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT: Final decision form */}
        <div className="space-y-4">
          <SectionCard
            title="Quyết định của Moderator"
            desc="Chọn kết luận cuối cùng dựa trên đánh giá và ghi chú (nếu cần)."
            icon={<Gavel className="h-4 w-4" />}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Kết luận</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((v) => (
                    <label key={v} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
                      <input
                        type="radio"
                        name="finalRec"
                        value={v}
                        checked={finalRecommendation === (v as ReviewerRecommendation)}
                        onChange={() => setFinalRecommendation(v as ReviewerRecommendation)}
                      />
                      <span>{recLabel(v)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm">Điểm cuối (tuỳ chọn)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={finalScore}
                    onChange={(e) => setFinalScore(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="VD: 85"
                  />
                </div>

                {(finalRecommendation === 2 || finalRecommendation === 3) && (
                  <div className="space-y-1">
                    <Label className="text-sm">Hạn chỉnh sửa</Label>
                    <Input
                      type="datetime-local"
                      value={revisionDeadline}
                      onChange={(e) => setRevisionDeadline(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Ghi chú</Label>
                <Textarea
                  rows={5}
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Lý do, hướng dẫn chỉnh sửa (nếu có)…"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={onSaveDecision}
                  disabled={finalMut.isPending}
                  className="inline-flex items-center gap-2"
                >
                  {finalMut.isPending ? "Đang lưu..." : "Lưu quyết định"}
                </Button>
              </div>

              {fd && (
                <div className="rounded-md border bg-muted/50 p-3 text-xs">
                  <div className="mb-1 font-medium">Quyết định gần nhất</div>
                  <div>
                    {recLabel(fd.finalRecommendation)} • Điểm:{" "}
                    {typeof fd.finalScore === "number" ? fd.finalScore : "—"}
                  </div>
                  <div>Ghi chú: {fd.moderatorNotes || "—"}</div>
                  <div>Hạn chỉnh sửa: {fd.revisionDeadline ? formatDateTime(fd.revisionDeadline) : "—"}</div>
                  <div>
                    Bởi: {fd.decidedByName || `#${fd.decidedBy}`} • {fd.decidedAt ? formatDateTime(fd.decidedAt) : "—"}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-3 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
          <Button variant="ghost" onClick={() => navigate(-1)} className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div />
        </div>
      </div>
    </div>
  );
}

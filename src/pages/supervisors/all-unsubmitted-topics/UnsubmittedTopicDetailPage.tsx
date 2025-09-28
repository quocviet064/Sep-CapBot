// src/pages/topics/unsubmitted/UnsubmittedTopicDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BookOpen, ArrowLeft, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import LoadingPage from "@/pages/loading-page";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import { Label } from "@/components/globals/atoms/label";
import { formatDateTime } from "@/utils/formatter";
import {
  getTopicDetail,
  type TopicDetailResponse,
} from "@/services/topicService";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import VersionTabs from "../topic-management/TopicVersionTabs";
import type { TopicListItem } from "@/services/topicService";
import SubmitTopicDialog from "./SubmitTopicDialog";

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
          {icon ?? <BookOpen className="h-4 w-4" />}
        </div>
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {desc ? (
            <p className="text-muted-foreground text-xs">{desc}</p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="bg-muted rounded-md px-4 py-2 text-sm whitespace-pre-line text-gray-800">
        {children || <span className="text-gray-400 italic">--</span>}
      </div>
    </div>
  );
}

function FileAttachment({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const resolved = normalizeAssetUrl(url);
  const filename = (() => {
    try {
      const p = new URL(resolved).pathname;
      const raw = decodeURIComponent(p.split("/").filter(Boolean).pop() || "");
      return raw || "tai-lieu";
    } catch {
      return "tai-lieu";
    }
  })();
  const handleClick = () => {
    const a = document.createElement("a");
    a.href = resolved;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.open(resolved, "_blank", "noopener,noreferrer");
  };
  return (
    <button
      onClick={handleClick}
      className={`group flex w-full items-center justify-between rounded-xl border bg-white/70 px-3 py-2 text-left shadow-sm ring-1 ring-black/[0.02] transition hover:bg-white ${className || ""}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900/90 text-white">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{filename}</div>
          <div className="text-muted-foreground text-xs">Nhấn để tải và mở</div>
        </div>
      </div>
      <Download className="h-4 w-4 opacity-60 transition group-hover:opacity-100" />
    </button>
  );
}

type SubmissionLite = {
  additionalNotes?: string | null;
  status?: string | null;
  submittedAt?: string | null;
};
type WithSubs = { submissions?: SubmissionLite[] };
type WithVersionSubs = { currentVersion?: { submissions?: SubmissionLite[] } };

const pickLatestSubmission = (
  data: TopicDetailResponse,
): SubmissionLite | null => {
  const listA = (data as WithSubs).submissions ?? [];
  const listB = (data as WithVersionSubs).currentVersion?.submissions ?? [];
  const list = [...listA, ...listB];
  if (list.length === 0) return null;
  const sorted = [...list].sort((a, b) => {
    const ta = a.submittedAt ? Date.parse(a.submittedAt) : 0;
    const tb = b.submittedAt ? Date.parse(b.submittedAt) : 0;
    return tb - ta;
  });
  return sorted[0] || null;
};

const statusLabel: Record<string, string> = {
  Pending: "Chờ xử lý",
  UnderReview: "Đang duyệt",
  Duplicate: "Trùng đề tài",
  RevisionRequired: "Yêu cầu chỉnh sửa",
  EscalatedToModerator: "Chuyển Moderator",
  Approved: "Đã duyệt",
  Rejected: "Từ chối",
};

const statusClass = (s: string) => {
  switch (s) {
    case "Pending":
      return "bg-slate-600 text-white";
    case "UnderReview":
      return "bg-blue-600 text-white";
    case "Duplicate":
      return "bg-purple-600 text-white";
    case "RevisionRequired":
      return "bg-amber-600 text-white";
    case "EscalatedToModerator":
      return "bg-fuchsia-600 text-white";
    case "Approved":
      return "bg-emerald-600 text-white";
    case "Rejected":
      return "bg-red-600 text-white";
    default:
      return "bg-slate-600 text-white";
  }
};

function TopicDetailPage({
  data,
  onBack,
  onSubmit,
}: {
  data: TopicDetailResponse;
  onBack?: () => void;
  onSubmit?: () => void;
}) {
  const navigate = useNavigate();
  const current = data.currentVersion;
  const resolvedStatus = data.latestSubmissionStatus ?? null;
  const resolvedSubmittedAt = data.latestSubmittedAt ?? null;
  const isRevisionRequired = resolvedStatus === "RevisionRequired";

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Chi tiết đề tài</h2>
              <p className="text-xs text-white/70">
                Xem thông tin đề tài đồ án
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {isRevisionRequired && (
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-neutral-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7h18M3 12h18M3 17h18"
                />
              </svg>
              <span className="text-sm font-semibold tracking-wide text-neutral-700 uppercase">
                Lựa chọn phiên bản chủ đề để nộp
              </span>
            </div>
            <Button
              onClick={() => {
                const seed = {
                  eN_Title: data.eN_Title ?? "",
                  vN_title: data.vN_title ?? "",
                  description: data.description ?? "",
                  objectives: data.objectives ?? "",
                  methodology: data.currentVersion?.methodology ?? "",
                  expectedOutcomes: data.currentVersion?.expectedOutcomes ?? "",
                  requirements: data.currentVersion?.requirements ?? "",
                  problem: data.problem ?? "",
                  context: data.context ?? "",
                  content: data.content ?? "",
                  supervisorId: data.supervisorId ?? 0,
                  supervisorName: data.supervisorName ?? "",
                  categoryId: data.categoryId ?? 0,
                  categoryName: data.categoryName ?? "",
                  semesterId: data.semesterId ?? 0,
                  semesterName: data.semesterName ?? "",
                };
                navigate(`/topics/${data.id}/versions/new`, {
                  state: { seed },
                });
              }}
              className="inline-flex items-center gap-2"
            >
              + Tạo phiên bản mới
            </Button>
          </div>
        )}
        <VersionTabs
          topicId={data.id}
          onOpenVersion={(versionId) => {
            if (versionId === 0) {
              navigate(`/unsubmitted/topics/${data.id}`);
              return;
            }
            navigate(`/topics/${data.id}/versions/${versionId}`, {
              state: {
                categoryName: data.categoryName,
                semesterName: data.semesterName,
              },
            });
          }}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Thông tin cơ bản"
            desc="Các trường nhận diện và phân loại đề tài."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoBlock label="Title (EN)">{data.eN_Title}</InfoBlock>
              <InfoBlock label="Tiêu đề (VN)">{data.vN_title}</InfoBlock>
              <InfoBlock label="Viết tắt">{data.abbreviation}</InfoBlock>
              <InfoBlock label="Giảng viên hướng dẫn">
                {data.supervisorName}
              </InfoBlock>
              <InfoBlock label="Danh mục">{data.categoryName}</InfoBlock>
              <InfoBlock label="Học kỳ">{data.semesterName}</InfoBlock>
              <InfoBlock label="Trạng thái duyệt">
                {data.isApproved ? (
                  <Badge className="bg-green-600 text-white">Đã duyệt</Badge>
                ) : (
                  <Badge className="bg-orange-500 text-white">Chưa duyệt</Badge>
                )}
              </InfoBlock>
              <InfoBlock label="Legacy">
                {data.isLegacy ? (
                  <Badge className="bg-green-600 text-white">Có</Badge>
                ) : (
                  <Badge className="bg-red-600 text-white">Không</Badge>
                )}
              </InfoBlock>
            </div>
          </SectionCard>

          <SectionCard
            title="Nội dung & đính kèm"
            desc="Toàn bộ mô tả học thuật và tệp minh chứng."
          >
            <div className="space-y-4">
              <InfoBlock label="Mô tả">{data.description}</InfoBlock>
              <InfoBlock label="Mục tiêu">{data.objectives}</InfoBlock>
              <InfoBlock label="Nội dung">{data.content}</InfoBlock>
              <InfoBlock label="Vấn đề">{data.problem}</InfoBlock>
              <InfoBlock label="Bối cảnh">{data.context}</InfoBlock>
            </div>

            <div className="mt-4 space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Tài liệu hiện tại
              </Label>
              <div>
                {current?.documentUrl ? (
                  <FileAttachment url={current.documentUrl} />
                ) : data.documentUrl ? (
                  <FileAttachment url={data.documentUrl} />
                ) : (
                  <div className="rounded-xl border bg-white/70 px-3 py-2 text-sm text-neutral-500">
                    —
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Tóm tắt" desc="Xem nhanh các thông tin đã chọn.">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Danh mục</span>
                  <span className="font-medium">
                    {data.categoryName || "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Học kỳ</span>
                  <span className="font-medium">
                    {data.semesterName || "—"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SV tối đa</span>
                  <span className="font-medium">{data.maxStudents}</span>
                </div>
              </div>

              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Title (EN)</span>
                  <span className="font-medium">{data.eN_Title || "—"}</span>
                </div>
              </div>

              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tiêu đề (VN)</span>
                  <span className="font-medium">{data.vN_title || "—"}</span>
                </div>
              </div>

              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Viết tắt</span>
                  <span className="font-medium">
                    {data.abbreviation || "—"}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Thông tin hệ thống">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Trạng thái đề tài</span>
                <span className="font-medium">
                  {resolvedStatus ? (
                    <Badge className={statusClass(resolvedStatus)}>
                      {statusLabel[resolvedStatus] ?? resolvedStatus}
                    </Badge>
                  ) : data.hasSubmitted === false ? (
                    <Badge className="bg-slate-600 text-white">Chưa nộp</Badge>
                  ) : (
                    <Badge className="bg-slate-600 text-white">Chưa nộp</Badge>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Tổng số phiên bản</span>
                <span className="font-medium">
                  {String(data.totalVersions)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Người nộp</span>
                <span className="font-medium">
                  {data.hasSubmitted === false
                    ? "—"
                    : data.lastModifiedBy || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Thời gian nộp</span>
                <span className="font-medium">
                  {resolvedSubmittedAt
                    ? formatDateTime(resolvedSubmittedAt)
                    : data.hasSubmitted === false
                      ? "—"
                      : "—"}
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Thông tin ghi chú kèm theo (nếu có)">
            <div className="space-y-2 text-sm">
              <div
                className={[
                  "min-h-[96px] w-full rounded-xl border bg-white/70 px-3 py-2",
                  "break-words whitespace-pre-wrap",
                  "text-sm text-neutral-800 shadow-sm ring-1 ring-black/5",
                ].join(" ")}
                role="note"
                aria-label="Ghi chú nộp"
              >
                {(() => {
                  const latest = pickLatestSubmission(data);
                  if (data.hasSubmitted === false)
                    return (
                      <span className="text-neutral-400 italic">
                        — Chưa có ghi chú vì đề tài chưa nộp —
                      </span>
                    );
                  if (latest?.additionalNotes && latest.additionalNotes.trim())
                    return latest.additionalNotes;
                  return (
                    <span className="text-neutral-400 italic">
                      — Không có ghi chú —
                    </span>
                  );
                })()}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="sticky bottom-3 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => (onBack ? onBack() : window.history.back())}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (isRevisionRequired) {
                  toast.error(
                    "Đề tài này đã bị yêu cầu chỉnh sửa, bạn cần tạo và nộp phiên bản mới cho đề tài này .",
                  );
                  return;
                }
                onSubmit?.();
              }}
              className="inline-flex items-center gap-2"
            >
              Nộp đề tài
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "Không tải được chi tiết đề tài";

export default function UnsubmittedTopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState<TopicDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSubmit, setOpenSubmit] = useState(false);

  const defaultPhaseId = useMemo(() => {
    const raw = searchParams.get("phaseId");
    const n = raw ? Number(raw) : NaN;
    return Number.isNaN(n) ? undefined : n;
  }, [searchParams]);
  const defaultPhaseName = searchParams.get("phaseName") || undefined;

  const reload = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const detail = await getTopicDetail(Number(id));
      setData(detail);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    reload();
  }, [id]);

  const goBackToList = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const qs = new URLSearchParams();
    const keepKeys = ["semesterId", "semesterName", "phaseId", "phaseName"];
    keepKeys.forEach((k) => {
      const v = searchParams.get(k);
      if (v) qs.set(k, v);
    });
    const suffix = qs.toString();
    navigate(`/unsubmitted/topics${suffix ? `?${suffix}` : ""}`, {
      replace: true,
    });
  };

  if (loading) return <LoadingPage />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p className="text-sm">Không tìm thấy đề tài.</p>;

  return (
    <>
      <TopicDetailPage
        data={data}
        onBack={() => navigate(-1)}
        onSubmit={() => setOpenSubmit(true)}
      />
      <SubmitTopicDialog
        isOpen={openSubmit}
        onClose={() => setOpenSubmit(false)}
        topic={
          {
            id: data.id,
            eN_Title: data.eN_Title,
            vN_title: data.vN_title,
            semesterName: data.semesterName,
          } as unknown as TopicListItem
        }
        defaultPhaseId={defaultPhaseId}
        defaultPhaseName={defaultPhaseName}
        onSuccess={async () => {
          setOpenSubmit(false);
          goBackToList();
        }}
      />
    </>
  );
}

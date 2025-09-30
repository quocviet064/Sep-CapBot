import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, generatePath } from "react-router-dom";
import {
  BookOpen,
  Loader2,
  ArrowLeft,
  PencilLine,
  FileText,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import LoadingPage from "@/pages/loading-page";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import { Label } from "@/components/globals/atoms/label";
import { formatDateTime } from "@/utils/formatter";
import { useDeleteTopic } from "@/hooks/useTopic";
import VersionTabs from "../topic-version/TopicVersionTabs";

import {
  getTopicDetail,
  type TopicDetailResponse,
} from "@/services/topicService";
import { normalizeAssetUrl } from "@/utils/assetUrl";

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

const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "Không tải được chi tiết đề tài";

export default function MyTopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate: deleteTopic, isPending: deleting } = useDeleteTopic();

  const [data, setData] = useState<TopicDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const detail = await getTopicDetail(Number(id));
        setData(detail);
      } catch (e: unknown) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const progress = useMemo(() => {
    if (!data) return 0;

    const fields: Array<string | number | null | undefined> = [
      data.eN_Title,
      data.vN_title,
      data.abbreviation,
      data.problem,
      data.context,
      data.content,
      data.description,
      data.objectives,
      data.categoryId,
      data.maxStudents,
    ];

    const isFilled = (v: string | number | null | undefined): boolean => {
      if (typeof v === "number") return v > 0;
      if (typeof v === "string") return v.trim().length > 0;
      return false;
    };

    const complete = fields.filter(isFilled).length;
    return Math.round((complete / fields.length) * 100);
  }, [data]);

  const handleDelete = () => {
    if (!data) return;

    if (data.hasSubmitted) {
      toast.warning("Đề tài đã nộp — không thể xoá.");
      return;
    }
    if (!confirm("Bạn chắc chắn muốn xoá đề tài này?")) return;
    deleteTopic(data.id, {
      onSuccess: () => navigate("/supervisors/topics/myTopic-page"),
    });
  };

  const handleEdit = () => {
    if (!data) return;
    if (data.hasSubmitted) {
      toast.info("Đề tài đã nộp — bạn không thể chỉnh sửa nội dung.");
      return;
    }
    navigate(
      generatePath("/topics/my/:id/edit", {
        id: String(data.id),
      }),
    );
  };

  if (loading) return <LoadingPage />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p className="text-sm">Không tìm thấy đề tài.</p>;

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
                Xem và chỉnh sửa thông tin đề tài đồ án
              </p>
            </div>
          </div>
          <div className="w-48">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span>Hoàn thiện</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
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
        </div>

        <VersionTabs
          topicId={data.id}
          onOpenVersion={(versionId) => {
            if (versionId === 0) {
              navigate(`/topics/${data.id}`);
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
              <InfoBlock label="SV tối đa">
                {String(data.maxStudents)}
              </InfoBlock>
              <InfoBlock label="Trạng thái duyệt">
                {data.isApproved ? (
                  <Badge className="bg-green-600 text-white">Đã duyệt</Badge>
                ) : (
                  <Badge className="bg-orange-500 text-white">Chưa duyệt</Badge>
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
                {data.currentVersion?.documentUrl ? (
                  <FileAttachment url={data.currentVersion.documentUrl} />
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
                <span className="text-muted-foreground">
                  Trạng thái hiện tại
                </span>
                <span className="font-medium">
                  <Badge>{data.hasSubmitted ? "Đã nộp" : "Chưa nộp"}</Badge>
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Tổng số phiên bản</span>
                <span className="font-medium">
                  {String(data.totalVersions)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Ngày tạo</span>
                <span className="font-medium">
                  {formatDateTime(data.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Người tạo</span>
                <span className="font-medium">{data.createdBy}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Sửa lần cuối</span>
                <span className="font-medium">
                  {data.lastModifiedAt
                    ? formatDateTime(data.lastModifiedAt)
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Người sửa cuối</span>
                <span className="font-medium">
                  {data.lastModifiedBy || "—"}
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Trạng thái">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div className="text-sm">
                <div className="font-medium">Hoàn thiện biểu mẫu</div>
                <div className="text-muted-foreground text-xs" />
              </div>
              <div className="w-24">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-neutral-900"
                    style={{ width: `${progress}%` }}
                  />
                </div>
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
              onClick={() => navigate("/supervisors/topics/myTopic-page")}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {!data.hasSubmitted && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Xóa
              </Button>
            )}

            <Button
              onClick={handleEdit}
              title={
                data.hasSubmitted
                  ? "Đề tài đã nộp — không thể chỉnh sửa"
                  : undefined
              }
              className={[
                "inline-flex min-w-36 items-center gap-2",
                data.hasSubmitted ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
              aria-disabled={data.hasSubmitted}
            >
              <PencilLine className="h-4 w-4" /> Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

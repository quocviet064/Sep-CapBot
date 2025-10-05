import { useNavigate, useParams, useLocation } from "react-router-dom";
import { BookOpen, ArrowLeft, FileText, Download } from "lucide-react";
import { Button } from "@/components/globals/atoms/button";
import { Label } from "@/components/globals/atoms/label";
import { formatDateTime } from "@/utils/formatter";
import { useTopicVersionDetail } from "@/hooks/useTopicVersion";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import type { TopicVersionDetail } from "@/services/topicVersionService";

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
        {children || <span className="text-gray-400 italic">—</span>}
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

const fmt = (s?: string | null) => (s && String(s).trim().length ? s : "—");
const fmtDate = (d?: string | null) => (d ? formatDateTime(d) : "—");

const TVS_LABEL_VN: Record<number, string> = {
  1: "Bản nháp",
  2: "Chờ nộp",
  3: "Đã nộp",
  4: "Đang đánh giá",
  5: "Đã duyệt",
  6: "Từ chối",
  7: "Yêu cầu chỉnh sửa",
  8: "Đã lưu trữ",
};

const normalizeTopicVersionStatusCode = (
  v?: string | number | null,
): number | undefined => {
  if (v == null) return undefined;
  if (typeof v === "number") return TVS_LABEL_VN[v] ? v : undefined;
  const s = String(v).trim();
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return TVS_LABEL_VN[n] ? n : undefined;
  }
  const m = s.toLowerCase().replace(/\s|_/g, "");
  if (m === "draft") return 1;
  if (m === "submissionpending") return 2;
  if (m === "submitted") return 3;
  if (m === "underreview") return 4;
  if (m === "approved") return 5;
  if (m === "rejected") return 6;
  if (m === "revisionrequired") return 7;
  if (m === "archived") return 8;
  return undefined;
};

const topicVersionStatusLabelVN = (v?: string | number | null): string =>
  TVS_LABEL_VN[normalizeTopicVersionStatusCode(v) ?? 0] ?? "—";

const REQUIRED_FIELDS = [
  "eN_Title",
  "vN_title",
  "description",
  "objectives",
  "content",
  "problem",
  "context",
  "methodology",
  "expectedOutcomes",
  "requirements",
] as const;

type RequiredKey = (typeof REQUIRED_FIELDS)[number];
type VersionSlice = Pick<TopicVersionDetail, RequiredKey>;

export default function TopicListVersionDetailPage() {
  const navigate = useNavigate();
  const { topicId, versionId } = useParams<{
    topicId: string;
    versionId: string;
  }>();
  const vid = Number(versionId);
  const {
    data: ver,
    isLoading,
    error,
  } = useTopicVersionDetail(Number.isFinite(vid) ? vid : undefined);

  const location = useLocation() as {
    state?: { categoryName?: string; semesterName?: string };
  };
  const categoryNameFromNav = location.state?.categoryName;
  const semesterNameFromNav = location.state?.semesterName;

  type VersionMeta = { categoryName?: string; semesterName?: string };
  const meta = (ver as unknown as VersionMeta) ?? {};
  const categoryLabel = categoryNameFromNav ?? meta.categoryName ?? "—";
  const semesterLabel = semesterNameFromNav ?? meta.semesterName ?? "—";

  if (isLoading) {
    return (
      <div className="rounded-xl border p-3 text-sm">Đang tải phiên bản…</div>
    );
  }
  if (error || !ver) {
    return (
      <div className="rounded-xl border p-3 text-sm text-red-600">
        Không tìm thấy phiên bản.
      </div>
    );
  }

  const verSlice = ver as unknown as VersionSlice;
  const completeCount = REQUIRED_FIELDS.filter(
    (k) => String(verSlice[k] ?? "").trim().length > 0,
  ).length;
  const progress = Math.round((completeCount / REQUIRED_FIELDS.length) * 100);
  const statusVN = topicVersionStatusLabelVN(ver.status);

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
              <h2 className="text-lg font-semibold">Chi tiết phiên bản</h2>
              <p className="text-xs text-white/70">
                v{ver.versionNumber} • Trạng thái: {statusVN}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
            <Button
              onClick={() =>
                navigate(
                  `/supervisors/topics/all-topics-list/topics/${topicId}`,
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
              Về chi tiết đề tài
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Thông tin cơ bản"
            desc="Các trường nhận diện phiên bản."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoBlock label="Title (EN)">{fmt(ver.eN_Title)}</InfoBlock>
              <InfoBlock label="Tiêu đề (VN)">{fmt(ver.vN_title)}</InfoBlock>
              <InfoBlock label="Danh mục">{fmt(categoryLabel)}</InfoBlock>
              <InfoBlock label="Học kỳ">{fmt(semesterLabel)}</InfoBlock>
            </div>
          </SectionCard>

          <SectionCard
            title="Nội dung & đính kèm"
            desc="Toàn bộ mô tả học thuật và tệp minh chứng."
          >
            <div className="space-y-4">
              <InfoBlock label="Mô tả">{fmt(ver.description)}</InfoBlock>
              <InfoBlock label="Mục tiêu">{fmt(ver.objectives)}</InfoBlock>
              <InfoBlock label="Vấn đề">{fmt(ver.problem)}</InfoBlock>
              <InfoBlock label="Bối cảnh">{fmt(ver.context)}</InfoBlock>
              <InfoBlock label="Nội dung">{fmt(ver.content)}</InfoBlock>
            </div>

            <div className="mt-4 space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Tài liệu hiện tại
              </Label>
              <div>
                {ver.documentUrl ? (
                  <FileAttachment url={ver.documentUrl} />
                ) : (
                  <div className="rounded-xl border bg-white/70 px-3 py-2 text-sm text-neutral-500">
                    —
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Phương pháp nghiên cứu"
            desc="Toàn bộ mô tả nghiên cứu."
          >
            <div className="space-y-4">
              <InfoBlock label="Phương pháp">{fmt(ver.methodology)}</InfoBlock>
              <InfoBlock label="Kết quả kỳ vọng">
                {fmt(ver.expectedOutcomes)}
              </InfoBlock>
              <InfoBlock label="Yêu cầu">{fmt(ver.requirements)}</InfoBlock>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Tóm tắt" desc="Xem nhanh các thông tin đã chọn.">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Title (EN)</span>
                  <span className="font-medium">{fmt(ver.eN_Title)}</span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tiêu đề (VN)</span>
                  <span className="font-medium">{fmt(ver.vN_title)}</span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phiên bản</span>
                  <span className="font-medium">v{ver.versionNumber}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Thông tin hệ thống">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Ngày tạo</span>
                <span className="font-medium">{fmtDate(ver.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Người tạo</span>
                <span className="font-medium">{fmt(ver.createdBy)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Sửa lần cuối</span>
                <span className="font-medium">
                  {fmtDate(ver.lastModifiedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Người sửa cuối</span>
                <span className="font-medium">{fmt(ver.lastModifiedBy)}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Trạng thái">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div className="text-sm">
                <div className="font-medium">Hoàn thiện biểu mẫu</div>
                <div className="text-muted-foreground text-xs">
                  {completeCount}/{REQUIRED_FIELDS.length} trường bắt buộc
                </div>
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
            <div className="mt-3 grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm text-neutral-600">
                  Trạng thái phiên bản
                </span>
                <span className="rounded-full border bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {statusVN}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="sticky bottom-3 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-start gap-2 rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
          <Button
            variant="ghost"
            onClick={() =>
              navigate(`/supervisors/topics/all-topics-list/topics/${topicId}`)
            }
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}

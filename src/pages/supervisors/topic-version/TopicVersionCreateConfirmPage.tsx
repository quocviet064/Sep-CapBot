import { useMemo, type ReactNode } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Button } from "@/components/globals/atoms/button";
import { BookOpen, ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCreateTopicVersion } from "@/hooks/useTopicVersion";
import { useResubmitSubmission } from "@/hooks/useSubmission";
import type { CreateTopicVersionPayload } from "@/services/topicVersionService";

type FormSnapshot = {
  eN_Title?: string;
  vN_title?: string;
  title?: string;
  abbreviation?: string;
  problem?: string;
  context?: string;
  content?: string;
  description?: string;
  objectives?: string;
  methodology?: string;
  expectedOutcomes?: string;
  requirements?: string;
  supervisorId?: number;
  supervisorName?: string;
  docFileName?: string;
  docFileSize?: number;
  categoryId?: number;
  categoryName?: string;
  semesterId?: number;
  semesterName?: string;
  maxStudents?: number;
  fileToken?: string | null;
  __fromSuggestion?: boolean;
  fileId?: number;
};

function SectionCard({
  title,
  desc,
  children,
  icon,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  icon?: ReactNode;
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

function RField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}) {
  const v = (value ?? "") as string | number;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium">{label}</label>
      </div>
      <div
        className={[
          "w-full rounded-xl border bg-neutral-50/70 px-3 py-2 text-sm text-neutral-900",
          multiline ? "h-40 overflow-y-auto whitespace-pre-wrap" : "",
        ].join(" ")}
      >
        {String(v || "—")}
      </div>
    </div>
  );
}

export default function TopicCreateConfirmPage() {
  const nav = useNavigate();
  const { state } = useLocation() as {
    state?: {
      formSnapshot?: FormSnapshot;
      topicId?: number;
      submissionId?: number | string;
    };
  };
  const snap = state?.formSnapshot;

  const { topicId: paramTid } = useParams<{ topicId?: string }>();
  const [searchParams] = useSearchParams();

  const topicId =
    state?.topicId ??
    (paramTid ? Number(paramTid) : undefined) ??
    (searchParams.get("topicId")
      ? Number(searchParams.get("topicId"))
      : undefined);

  const submissionId =
    state?.submissionId ?? searchParams.get("submissionId") ?? undefined;

  const progress = useMemo(() => {
    const required = [
      snap?.vN_title,
      snap?.eN_Title,
      snap?.description,
      snap?.objectives,
      snap?.problem,
      snap?.context,
      snap?.content,
      snap?.methodology,
      snap?.expectedOutcomes,
      snap?.requirements,
    ];
    const done = required.filter(
      (x) => String(x ?? "").trim().length > 0,
    ).length;
    return Math.round((done / 10) * 100);
  }, [state]);

  const fileUrl = (() => {
    const base = import.meta.env.VITE_FILE_DOWNLOAD_URL as string | undefined;
    if (snap?.fileToken) {
      const root = base ?? "/files";
      const name = encodeURIComponent(snap.docFileName ?? "attachment");
      return `${root}/${encodeURIComponent(snap.fileToken)}?filename=${name}`;
    }
    if (snap?.docFileName) {
      const root = base ?? "/files";
      return `${root}?filename=${encodeURIComponent(snap.docFileName)}`;
    }
    return undefined;
  })();

  const { mutateAsync: createVersion, isPending: creating } =
    useCreateTopicVersion();
  const { mutateAsync: resubmit, isPending: resubmitting } =
    useResubmitSubmission();
  const busy = creating || resubmitting;

  if (!snap) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4">
        <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <CheckCircle2 className="h-6 w-6 text-neutral-600" />
          </div>
          <div className="mb-1 text-lg font-semibold">
            Thiếu dữ liệu xác nhận
          </div>
          <div className="text-sm text-neutral-600">
            Vui lòng quay lại và thực hiện lại bước kiểm tra trùng lặp.
          </div>
          <div className="mt-5">
            <Button
              onClick={() => nav(-1)}
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

  const goConfirm = async () => {
    if (!Number.isFinite(topicId)) {
      toast.error(
        "Thiếu topicId để tạo phiên bản. Hãy truyền topicId qua state, param, hoặc query.",
      );
      return;
    }
    try {
      const s = snap!;
      const payload: CreateTopicVersionPayload = {
        topicId: Number(topicId),
        eN_Title: String(s.eN_Title ?? ""),
        vN_title: String(s.vN_title ?? ""),
        description: String(s.description ?? ""),
        objectives: String(s.objectives ?? ""),
        methodology: String(s.methodology ?? ""),
        expectedOutcomes: String(s.expectedOutcomes ?? ""),
        requirements: String(s.requirements ?? ""),
        problem: String(s.problem ?? ""),
        context: String(s.context ?? ""),
        content: String(s.content ?? ""),
        fileId: typeof s.fileId === "number" ? s.fileId : undefined,
      };
      if (!payload.fileId) {
        toast.error("Thiếu fileId – hãy đính kèm tệp trước khi tạo.");
        console.warn("Create payload thiếu fileId:", payload);
        return;
      }
      console.log("CreateTopicVersion payload:", payload);
      const created = await createVersion(payload);
      if (submissionId) {
        await resubmit({
          id: submissionId,
          topicVersionId: (created as { id: number | string }).id,
        });
        toast.success("Đã tạo phiên bản & resubmit thành công!");
      } else {
        toast.success("Đã tạo phiên bản thành công.");
      }
      nav(`/topics/my/${topicId}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể hoàn tất tạo & resubmit.";
      toast.error(message);
    }
  };

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
              <h2 className="text-lg font-semibold">
                Xác nhận tạo phiên bản mới đề tài
              </h2>
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Thông tin cơ bản"
            desc="Các trường định danh đề tài."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RField label="EN Title" value={snap.eN_Title} />
              <RField label="VN Title" value={snap.vN_title} />
            </div>
          </SectionCard>

          <SectionCard
            title="Nội dung chi tiết"
            desc="Nội dung chi tiết của đê tài"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RField label="Vấn đề (problem)" multiline value={snap.problem} />
              <RField
                label="Bối cảnh (context)"
                multiline
                value={snap.context}
              />
              <RField
                label="Nội dung (content)"
                multiline
                value={snap.content}
              />
              <RField label="Mô tả" multiline value={snap.description} />
              <RField label="Mục tiêu" multiline value={snap.objectives} />
            </div>
          </SectionCard>

          <SectionCard title="Nội dung nghiên cứu" desc="Các trường bổ sung.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RField
                label="Phương pháp (Methodology)"
                multiline
                value={snap.methodology}
              />
              <RField
                label="Kết quả kỳ vọng (Expected outcomes)"
                multiline
                value={snap.expectedOutcomes}
              />
              <RField
                label="Yêu cầu (Requirements)"
                multiline
                value={snap.requirements}
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Thuộc về" desc="Thông tin danh mục, kỳ học, GV.">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Giảng viên</span>
                <span className="font-medium">
                  {snap.supervisorName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Danh mục</span>
                <span className="font-medium">{snap.categoryName || "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Học kỳ</span>
                <span className="font-medium">{snap.semesterName || "—"}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tóm tắt" desc="Xem nhanh thông tin đã nhập.">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">EN Title</div>
                <div className="line-clamp-2 text-sm font-medium">
                  {snap.eN_Title || "—"}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">VN Title</div>
                <div className="line-clamp-2 text-sm font-medium">
                  {snap.vN_title || "—"}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Tài liệu</div>
                <div className="text-sm font-medium">
                  {snap.docFileName ? (
                    <a
                      href={fileUrl}
                      download={snap.docFileName}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white/80 px-2 py-1 text-[12px] shadow-sm hover:bg-white hover:ring-1 hover:ring-neutral-300"
                      title="Mở hoặc tải tài liệu"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span className="font-medium">{snap.docFileName}</span>
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Trạng thái">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div className="text-sm">
                <div className="font-medium">Hoàn thiện biểu mẫu</div>
                <div className="text-muted-foreground text-xs">
                  {Math.round((progress / 100) * 10)}/10 trường bắt buộc
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
          </SectionCard>
        </div>
      </div>

      <div className="sticky bottom-3 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
          <div className="flex items-center">
            <Button
              variant="secondary"
              onClick={() => nav(-1)}
              className="min-w-36"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={goConfirm}
              disabled={busy}
              className="inline-flex min-w-44 items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {busy ? "Đang xử lý..." : "Xác nhận & tạo đề tài"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

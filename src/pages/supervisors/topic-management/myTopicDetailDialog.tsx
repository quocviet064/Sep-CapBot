import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Loader2, ArrowLeft, PencilLine, Save } from "lucide-react";

import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import { Label } from "@/components/globals/atoms/label";
import { formatDateTime } from "@/utils/formatter";
import { useUpdateTopic } from "@/hooks/useTopic";
import type { TopicDetailResponse } from "@/services/topicService";
import { useNavigate } from "react-router-dom";
import VersionTabs from "./TopicVersionTabs";

/* =========================
   Small UI helpers (reused style from CreateTopicPage)
========================= */
function RequiredBadge() {
  return (
    <Badge className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-red-600 uppercase shadow-sm">
      Bắt buộc
    </Badge>
  );
}

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

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{label}</label>
          {required ? <RequiredBadge /> : null}
        </div>
        {hint ? (
          <span className="text-muted-foreground text-xs">{hint}</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : null}
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

/* =========================
   Page Component
========================= */
interface TopicDetailPageProps {
  /** Dữ liệu chi tiết đề tài. Bạn có thể thay bằng hook fetch theo id nếu cần. */
  data: TopicDetailResponse | null;
  /** Tuỳ chọn: trở về trang trước */
  onBack?: () => void;
  /** Callback khi cập nhật thành công */
  onUpdate?: (updated: TopicDetailResponse) => void;
}

export default function TopicDetailPage({
  data,
  onBack,
  onUpdate,
}: TopicDetailPageProps) {
  const { mutateAsync: updateTopic } = useUpdateTopic();

  // ----- State -----
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [maxStudents, setMaxStudents] = useState<number>(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setDescription(data.description);
      setObjectives(data.objectives);
      setCategoryId(data.categoryId);
      setMaxStudents(data.maxStudents);
    }
  }, [data]);

  const current = data?.currentVersion;

  const requiredFilled = useMemo(() => {
    const req = {
      title: title.trim(),
      description: description.trim(),
      objectives: objectives.trim(),
      categoryId,
      maxStudents,
    };
    const keys = Object.keys(req) as (keyof typeof req)[];
    const complete = keys.filter((k) =>
      typeof req[k] === "number"
        ? Number(req[k]) > 0
        : String(req[k]).length > 0,
    ).length;
    return {
      count: complete,
      total: keys.length,
      progress: Math.round((complete / keys.length) * 100),
    };
  }, [title, description, objectives, categoryId, maxStudents]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Vui lòng nhập tiêu đề";
    if (!description.trim()) e.description = "Vui lòng nhập mô tả";
    if (!objectives.trim()) e.objectives = "Vui lòng nhập mục tiêu";
    if (!categoryId) e.categoryId = "Vui lòng nhập ID danh mục";
    if (!maxStudents || Number(maxStudents) <= 0)
      e.maxStudents = "Số SV tối đa phải > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!data) return;
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading("Đang lưu thay đổi...");
    try {
      const updated = await updateTopic({
        id: data.id,
        title,
        description,
        objectives,
        categoryId,
        maxStudents,
      });
      toast.success("🎉 Lưu thành công!", { id: toastId });
      onUpdate?.({ ...data, ...updated });
      setIsEditing(false);
    } catch (err) {
      toast.error("❌ Lưu thất bại, vui lòng thử lại!", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!data) {
    return (
      <div className="rounded-2xl border bg-yellow-50 p-4 text-sm text-yellow-900">
        Không có dữ liệu đề tài để hiển thị.
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-4">
      {/* PAGE HEADER (giống CreateTopicPage) */}
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

          {/* Progress bắt buộc */}
          <div className="w-48">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span>Hoàn thiện</span>
              <span className="font-semibold">{requiredFilled.progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${requiredFilled.progress}%` }}
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
              Lựa chọn phiên bản chủ đề
            </span>
          </div>

          <Button
            onClick={() => {
              if (!data) return;
              const seed = {
                title: data.title ?? "",
                description: data.description ?? "",
                objectives: data.objectives ?? "",
                methodology: data.currentVersion?.methodology ?? "",
                expectedOutcomes: data.currentVersion?.expectedOutcomes ?? "",
                requirements: data.currentVersion?.requirements ?? "",
                documentUrl: data.currentVersion?.documentUrl ?? "",
              };
              navigate(`/topics/${data.id}/versions/new`, { state: { seed } });
            }}
            className="inline-flex items-center gap-2"
          >
            + Tạo phiên bản mới
          </Button>
        </div>

        <VersionTabs
          topicId={data.id}
          onOpenVersion={(versionId) => {
            if (versionId === 0) {
              navigate(`/topics/${data.id}`);
              return;
            }
            navigate(`/topics/${data.id}/versions/${versionId}`);
          }}
          className="mt-2"
        />
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Cột trái: thông tin cơ bản */}
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Thông tin cơ bản"
            desc="Các trường bắt buộc để định danh đề tài và phân loại."
          >
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${isUpdating ? "pointer-events-none opacity-70" : ""}`}
            >
              {isEditing ? (
                <>
                  <Field label="Tiêu đề" required error={errors.title}>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>

                  <Field
                    label="Số lượng SV tối đa"
                    required
                    error={errors.maxStudents}
                  >
                    <input
                      type="number"
                      min={1}
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(Number(e.target.value))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>

                  <Field
                    label="Danh mục (ID)"
                    required
                    error={errors.categoryId}
                  >
                    <input
                      type="number"
                      min={1}
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>

                  <InfoBlock label="Học kỳ">{data.semesterName}</InfoBlock>

                  <div className="md:col-span-2">
                    <Field label="Mục tiêu" required error={errors.objectives}>
                      <textarea
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                        className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Mô tả" required error={errors.description}>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                      />
                    </Field>
                  </div>
                </>
              ) : (
                <>
                  <InfoBlock label="Tiêu đề">{data.title}</InfoBlock>
                  <InfoBlock label="Giảng viên hướng dẫn">
                    {data.supervisorName}
                  </InfoBlock>
                  <InfoBlock label="Danh mục">{data.categoryName}</InfoBlock>
                  <InfoBlock label="Học kỳ">{data.semesterName}</InfoBlock>

                  <div className="md:col-span-2">
                    <InfoBlock label="Mục tiêu">{data.objectives}</InfoBlock>
                  </div>

                  <div className="md:col-span-2">
                    <InfoBlock label="Mô tả">{data.description}</InfoBlock>
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          {/* Nội dung nghiên cứu (chỉ đọc như dialog gốc) */}
          <SectionCard
            title="Nội dung nghiên cứu"
            desc="Các trường thông tin bổ sung của phiên bản hiện tại."
          >
            {current ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoBlock label="Phương pháp">{current.methodology}</InfoBlock>
                <InfoBlock label="Kết quả mong đợi">
                  {current.expectedOutcomes}
                </InfoBlock>
                <InfoBlock label="Yêu cầu">{current.requirements}</InfoBlock>
                <InfoBlock label="Tài liệu đính kèm">
                  {current.documentUrl ? (
                    <a
                      href={current.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {current.documentUrl}
                    </a>
                  ) : (
                    "--"
                  )}
                </InfoBlock>
                <InfoBlock label="Ngày tạo phiên bản">
                  {formatDateTime(current.createdAt)}
                </InfoBlock>
                <InfoBlock label="Người tạo phiên bản">
                  {current.createdBy}
                </InfoBlock>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Chưa có phiên bản nội dung.
              </div>
            )}
          </SectionCard>
        </div>

        {/* Cột phải: tóm tắt & meta */}
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
                  <span className="font-medium">
                    {maxStudents || data.maxStudents || "—"}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Tiêu đề</div>
                <div className="line-clamp-2 text-sm font-medium">
                  {title || data.title || "—"}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Trạng thái">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div className="text-sm">
                <div className="font-medium">Hoàn thiện biểu mẫu</div>
                <div className="text-muted-foreground text-xs">
                  {requiredFilled.count}/{requiredFilled.total} trường bắt buộc
                </div>
              </div>
              <div className="w-24">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-neutral-900"
                    style={{ width: `${requiredFilled.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Thông tin hệ thống">
            <div className="space-y-3 text-sm">
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
            </div>
          </SectionCard>
        </div>
      </div>

      {/* STICKY ACTION BAR */}
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
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isUpdating}
                  className="inline-flex min-w-36 items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Lưu thay đổi
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="inline-flex min-w-36 items-center gap-2"
              >
                <PencilLine className="h-4 w-4" /> Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

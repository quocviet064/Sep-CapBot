// src/pages/TopicVersionDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, ArrowLeft, PencilLine, Save, Loader2 } from "lucide-react";

import { Button } from "@/components/globals/atoms/button";
import { Label } from "@/components/globals/atoms/label";
import { formatDateTime } from "@/utils/formatter";
import {
  useTopicVersionDetail,
  useUpdateTopicVersion,
} from "@/hooks/useTopicVersion";

/* =========================
   Small UI helpers (giống TopicDetail)
========================= */
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
          {required ? (
            <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-red-600 uppercase shadow-sm">
              Bắt buộc
            </span>
          ) : null}
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

function StatusBadge({ status }: { status?: string }) {
  const style =
    status === "Approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "Rejected"
        ? "bg-red-50 text-red-700 border-red-200"
        : status === "Submitted"
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {status || "--"}
    </span>
  );
}

const fmt = (s?: string | null) => (s && String(s).trim().length ? s : "--");
const fmtDate = (d?: string | null) => (d ? formatDateTime(d) : "--");

/* =========================
   Page
========================= */
export default function TopicVersionDetailPage() {
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
  const { mutateAsync: updateVersion } = useUpdateTopicVersion();

  // --- Edit state (đồng nhất bố cục/height với TopicDetail) ---
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [methodology, setMethodology] = useState("");
  const [expectedOutcomes, setExpectedOutcomes] = useState("");
  const [requirements, setRequirements] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ver) {
      setTitle(ver.title || "");
      setDescription(ver.description || "");
      setObjectives(ver.objectives || "");
      setMethodology(ver.methodology || "");
      setExpectedOutcomes(ver.expectedOutcomes || "");
      setRequirements(ver.requirements || "");
      setDocumentUrl(ver.documentUrl || "");
    }
  }, [ver]);

  const isDraft = ver?.status === "Draft";

  const requiredFilled = useMemo(() => {
    const req = {
      title: title.trim(),
      description: description.trim(),
      objectives: objectives.trim(),
    };
    const keys = Object.keys(req) as (keyof typeof req)[];
    const complete = keys.filter((k) => String(req[k]).length > 0).length;
    return {
      count: complete,
      total: keys.length,
      progress: Math.round((complete / keys.length) * 100),
    };
  }, [title, description, objectives]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Vui lòng nhập tiêu đề";
    if (!description.trim()) e.description = "Vui lòng nhập mô tả";
    if (!objectives.trim()) e.objectives = "Vui lòng nhập mục tiêu";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!ver) return;
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }
    setSaving(true);
    const tid = toast.loading("Đang lưu phiên bản...");
    try {
      await updateVersion({
        id: ver.id,
        title,
        description,
        objectives,
        methodology,
        expectedOutcomes,
        requirements,
        documentUrl,
      });
      toast.success("🎉 Cập nhật phiên bản thành công!", { id: tid });
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "❌ Cập nhật phiên bản thất bại", {
        id: tid,
      });
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="space-y-4">
      {/* PAGE HEADER (đồng nhất với TopicDetail) */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Phiên bản v{ver.versionNumber} — {fmt(ver.title)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden w-48 md:block">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span>Hoàn thiện</span>
                <span className="font-semibold">
                  {requiredFilled.progress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${requiredFilled.progress}%` }}
                />
              </div>
            </div>
            <StatusBadge status={ver.status} />
            <Button
              variant="secondary"
              onClick={() => navigate(`/topics/my/${topicId}`)}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Về chi tiết đề tài
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT (đồng nhất tỉ lệ/ô nhập với trang TopicDetail) */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Trái: form/hiển thị chính */}
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Thông tin cơ bản"
            desc="Dữ liệu tại thời điểm tạo phiên bản."
          >
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${saving ? "pointer-events-none opacity-70" : ""}`}
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

                  {/* chừa ô trống để cân cột như trang gốc */}
                  <div />

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
                  <InfoBlock label="Tiêu đề">{fmt(ver.title)}</InfoBlock>
                  {/* chừa ô trống để bố cục 2 cột cân nhau như trang gốc */}
                  <div />

                  <div className="md:col-span-2">
                    <InfoBlock label="Mục tiêu">
                      {fmt(ver.objectives)}
                    </InfoBlock>
                  </div>
                  <div className="md:col-span-2">
                    <InfoBlock label="Mô tả">{fmt(ver.description)}</InfoBlock>
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Nội dung nghiên cứu"
            desc={`Thuộc v${ver.versionNumber}`}
          >
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${saving ? "pointer-events-none opacity-70" : ""}`}
            >
              {isEditing ? (
                <>
                  <Field label="Phương pháp">
                    <textarea
                      value={methodology}
                      onChange={(e) => setMethodology(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                  <Field label="Kết quả mong đợi">
                    <textarea
                      value={expectedOutcomes}
                      onChange={(e) => setExpectedOutcomes(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                  <Field label="Yêu cầu">
                    <textarea
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                  <Field label="Tài liệu đính kèm (URL)">
                    <input
                      value={documentUrl}
                      onChange={(e) => setDocumentUrl(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm break-all outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                </>
              ) : (
                <>
                  <InfoBlock label="Phương pháp">
                    {fmt(ver.methodology)}
                  </InfoBlock>
                  <InfoBlock label="Kết quả mong đợi">
                    {fmt(ver.expectedOutcomes)}
                  </InfoBlock>
                  <InfoBlock label="Yêu cầu">{fmt(ver.requirements)}</InfoBlock>
                  <InfoBlock label="Tài liệu đính kèm">
                    {ver.documentUrl ? (
                      <a
                        href={ver.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-blue-600 underline hover:text-blue-800"
                      >
                        {ver.documentUrl}
                      </a>
                    ) : (
                      "--"
                    )}
                  </InfoBlock>
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Trạng thái nộp duyệt">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoBlock label="Trạng thái">
                <StatusBadge status={ver.status} />
              </InfoBlock>
              <InfoBlock label="Người nộp duyệt">
                {fmt(ver.submittedByUserName)}
              </InfoBlock>
              <InfoBlock label="Thời điểm nộp duyệt">
                {fmtDate(ver.submittedAt)}
              </InfoBlock>
            </div>
          </SectionCard>
        </div>

        {/* Phải: tóm tắt & hệ thống */}
        <div className="space-y-4">
          <SectionCard title="Tóm tắt" desc="Xem nhanh các thông tin đã chọn.">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Tiêu đề</div>
                <div className="line-clamp-2 text-sm font-medium">
                  {isEditing ? title || "—" : fmt(ver.title)}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Mục tiêu</div>
                <div className="line-clamp-3">
                  {isEditing ? objectives || "—" : fmt(ver.objectives)}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">v{ver.versionNumber}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Thông tin hệ thống">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Version ID</span>
                <span className="font-medium">#{ver.id}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Topic ID</span>
                <span className="font-medium">#{ver.topicId}</span>
              </div>
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
        </div>
      </div>

      {/* STICKY ACTION BAR (đồng style) */}
      <div className="sticky bottom-3 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(`/topics/my/${topicId}`)}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đề tài
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (ver) {
                      setTitle(ver.title || "");
                      setDescription(ver.description || "");
                      setObjectives(ver.objectives || "");
                      setMethodology(ver.methodology || "");
                      setExpectedOutcomes(ver.expectedOutcomes || "");
                      setRequirements(ver.requirements || "");
                      setDocumentUrl(ver.documentUrl || "");
                      setErrors({});
                    }
                    setIsEditing(false);
                  }}
                  disabled={saving}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex min-w-36 items-center gap-2"
                >
                  {saving ? (
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
                disabled={!isDraft}
                title={
                  isDraft
                    ? ""
                    : "Chỉ sửa được khi phiên bản đang ở trạng thái Draft"
                }
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

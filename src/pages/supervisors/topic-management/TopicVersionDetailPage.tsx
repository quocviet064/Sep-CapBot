import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  BookOpen,
  Loader2,
  ArrowLeft,
  PencilLine,
  Save,
  FileText,
  Download,
  Upload,
  X,
  Asterisk,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import { Label } from "@/components/globals/atoms/label";
import { formatDateTime } from "@/utils/formatter";
import {
  useDeleteTopicVersion,
  useTopicVersionDetail,
  useUpdateTopicVersion,
} from "@/hooks/useTopicVersion";
import { uploadFileReturnId } from "@/services/fileService";
import { normalizeAssetUrl } from "@/utils/assetUrl";

function RequiredBadge() {
  return (
    <Badge
      className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-0.5 py-0 text-[7px] leading-tight font-medium text-rose-700 shadow-sm"
      title="Trường bắt buộc"
      aria-label="Trường bắt buộc"
    >
      <Asterisk className="h-2.5 w-2.5" />
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

function normalizeStatusLabel(s?: string | number | null) {
  if (s == null) return undefined;
  const v = String(s).toLowerCase();
  if (v === "0" || v === "draft") return "Draft";
  if (v === "1" || v === "submitted") return "Submitted";
  if (v === "2" || v === "approved") return "Approved";
  if (v === "3" || v === "rejected") return "Rejected";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

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
  const { mutateAsync: deleteVersion, isPending: deleting } =
    useDeleteTopicVersion();

  const [isEditing, setIsEditing] = useState(false);

  const [eN_Title, setENTitle] = useState("");
  const [vN_title, setVNTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [methodology, setMethodology] = useState("");
  const [expectedOutcomes, setExpectedOutcomes] = useState("");
  const [requirements, setRequirements] = useState("");
  const [problem, setProblem] = useState("");
  const [context, setContext] = useState("");
  const [content, setContent] = useState("");

  const [documentUrl, setDocumentUrl] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const location = useLocation() as {
    state?: { categoryName?: string; semesterName?: string };
  };
  const categoryNameFromNav = location.state?.categoryName;
  const semesterNameFromNav = location.state?.semesterName;

  type VersionMeta = { categoryName?: string; semesterName?: string };
  const meta = (ver as unknown as VersionMeta) ?? {};
  const categoryLabel = categoryNameFromNav ?? meta.categoryName ?? "—";
  const semesterLabel = semesterNameFromNav ?? meta.semesterName ?? "—";

  useEffect(() => {
    if (ver) {
      setENTitle(ver.eN_Title || "");
      setVNTitle(ver.vN_title || "");
      setDescription(ver.description || "");
      setObjectives(ver.objectives || "");
      setMethodology(ver.methodology || "");
      setExpectedOutcomes(ver.expectedOutcomes || "");
      setRequirements(ver.requirements || "");
      setProblem(ver.problem || "");
      setContext(ver.context || "");
      setContent(ver.content || "");
      setDocumentUrl(ver.documentUrl || "");
    }
  }, [ver]);

  const completeCount = useMemo(() => {
    const vals = {
      eN_Title,
      vN_title,
      description,
      objectives,
      content,
      problem,
      context,
      methodology,
      expectedOutcomes,
      requirements,
    };
    return REQUIRED_FIELDS.filter(
      (k) => String(vals[k] ?? "").trim().length > 0,
    ).length;
  }, [
    eN_Title,
    vN_title,
    description,
    objectives,
    content,
    problem,
    context,
    methodology,
    expectedOutcomes,
    requirements,
  ]);

  const progress = Math.round((completeCount / REQUIRED_FIELDS.length) * 100);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!eN_Title.trim()) e.eN_Title = "Vui lòng nhập EN Title";
    if (!vN_title.trim()) e.vN_title = "Vui lòng nhập VN Title";
    if (!description.trim()) e.description = "Vui lòng nhập mô tả";
    if (!objectives.trim()) e.objectives = "Vui lòng nhập mục tiêu";
    if (!content.trim()) e.content = "Vui lòng nhập nội dung";
    if (!problem.trim()) e.problem = "Vui lòng nhập vấn đề";
    if (!context.trim()) e.context = "Vui lòng nhập bối cảnh";
    if (!methodology.trim()) e.methodology = "Vui lòng nhập phương pháp";
    if (!expectedOutcomes.trim())
      e.expectedOutcomes = "Vui lòng nhập kết quả kỳ vọng";
    if (!requirements.trim()) e.requirements = "Vui lòng nhập yêu cầu";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateFile = (f: File) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const okType =
      allowed.includes(f.type) ||
      [".pdf", ".doc", ".docx"].some((ext) =>
        f.name.toLowerCase().endsWith(ext),
      );
    if (!okType) return "Chỉ chấp nhận PDF, DOC, DOCX";
    if (f.size > 20 * 1024 * 1024) return "Kích thước tối đa 20MB";
    return "";
  };

  const pickFile = () => fileInputRef.current?.click();

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const f = list.item(0);
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      setFileError(err);
      toast.error(err);
      return;
    }
    setDocFile(f);
    setFileError(undefined);
  };

  const removeFile = () => {
    setDocFile(null);
    setFileError(undefined);
  };

  const handleSave = async () => {
    if (!ver) return;
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }
    setSaving(true);

    const toastId = toast.loading("Đang lưu phiên bản...");

    try {
      if (docFile) {
        const upId = toast.loading("Đang upload tài liệu...", { id: toastId });
        try {
          await uploadFileReturnId(docFile);
          toast.success("Upload thành công", { id: upId });
        } catch {
          toast.error("Upload tệp thất bại", { id: upId });
          setSaving(false);
          return;
        }
      }

      await updateVersion({
        id: ver.id,
        eN_Title: eN_Title.trim(),
        vN_title: vN_title.trim(),
        description: description.trim(),
        objectives: objectives.trim(),
        methodology: methodology.trim(),
        expectedOutcomes: expectedOutcomes.trim(),
        requirements: requirements.trim(),
        problem: problem.trim(),
        context: context.trim(),
        content: content.trim(),
        documentUrl: documentUrl.trim(),
        status: ver.status,
      });

      toast.success("Cập nhật phiên bản thành công!", { id: toastId });
      setDocFile(null);
      setIsEditing(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Cập nhật phiên bản thất bại";
      toast.error(message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!ver) return;
    if (!window.confirm("Bạn chắc chắn muốn xoá phiên bản này?")) return;

    try {
      await toast.promise(deleteVersion(ver.id), {
        loading: "Đang xóa phiên bản...",
        success: "Đã xóa phiên bản thành công",
        error: "Xóa phiên bản thất bại",
      });
      navigate(`/topics/my/${topicId}`);
    } catch {
      /* noop */
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

  const normalizedStatus = normalizeStatusLabel(ver.status);

  return (
    <div className="space-y-4">
      {/* HERO HEADER */}
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
                v{ver.versionNumber} • Trạng thái: {normalizedStatus || "—"}
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
              onClick={() => navigate(`/unsubmitted/topics/${topicId}`)}
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
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${saving ? "pointer-events-none opacity-70" : ""}`}
            >
              {isEditing ? (
                <>
                  <Field label="Title (EN)" required error={errors.eN_Title}>
                    <input
                      value={eN_Title}
                      onChange={(e) => setENTitle(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>

                  <Field label="Tiêu đề (VN)" required error={errors.vN_Title}>
                    <input
                      value={vN_title}
                      onChange={(e) => setVNTitle(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>

                  <Field label="Danh mục">
                    <input
                      disabled
                      className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-600"
                      value={categoryLabel}
                    />
                  </Field>

                  <Field label="Học kỳ">
                    <input
                      disabled
                      className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-600"
                      value={semesterLabel}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <InfoBlock label="Title (EN)">{fmt(ver.eN_Title)}</InfoBlock>
                  <InfoBlock label="Tiêu đề (VN)">
                    {fmt(ver.vN_title)}
                  </InfoBlock>

                  <InfoBlock label="Danh mục">{fmt(categoryLabel)}</InfoBlock>
                  <InfoBlock label="Học kỳ">{fmt(semesterLabel)}</InfoBlock>
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Nội dung & đính kèm"
            desc="Toàn bộ mô tả học thuật và tệp minh chứng."
          >
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Field label="Mô tả" required error={errors.description}>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                  <Field label="Mục tiêu" required error={errors.objectives}>
                    <textarea
                      value={objectives}
                      onChange={(e) => setObjectives(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                  <Field label="Nội dung" required error={errors.content}>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                  <Field label="Vấn đề" required error={errors.problem}>
                    <textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>

                  <Field label="Bối cảnh" required error={errors.context}>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                </>
              ) : (
                <>
                  <InfoBlock label="Mô tả">{fmt(ver.description)}</InfoBlock>
                  <InfoBlock label="Mục tiêu">{fmt(ver.objectives)}</InfoBlock>
                  <InfoBlock label="Vấn đề">{fmt(ver.problem)}</InfoBlock>
                  <InfoBlock label="Bối cảnh">{fmt(ver.context)}</InfoBlock>
                  <InfoBlock label="Nội dung">{fmt(ver.content)}</InfoBlock>
                </>
              )}
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

              {isEditing && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium">Thay tài liệu</label>
                    <span className="text-xs text-neutral-500">
                      PDF, DOC, DOCX • Tối đa 20MB • 1 tệp
                    </span>
                  </div>
                  <div
                    className={`group relative flex w-full items-start gap-3 rounded-2xl border-2 border-dashed p-3 transition ${
                      fileError
                        ? "border-red-300 bg-red-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                    onClick={pickFile}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      onFiles(e.dataTransfer.files);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-50 ring-1 ring-neutral-200 ring-inset">
                        <Upload className="h-4 w-4 opacity-70" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {docFile ? "Đã chọn 1 tệp" : "Kéo & thả tệp vào đây"}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {docFile
                            ? "Bấm để thay tệp khác"
                            : "Hoặc bấm để chọn"}
                        </span>
                      </div>
                    </div>
                    {docFile && (
                      <div className="ml-auto flex max-h-20 max-w-[55%] flex-wrap items-center gap-2 overflow-y-auto">
                        <div
                          className="flex items-center gap-2 rounded-md border bg-white/80 px-2 py-1 text-[12px] shadow-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span className="max-w-[180px] truncate">
                            {docFile.name}
                          </span>
                          <button
                            type="button"
                            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile();
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={(e) => onFiles(e.target.files)}
                    />
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Phương pháp nghiên cứu"
            desc="Toàn bộ mô tả nghiên cứu."
          >
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Field
                    label="Phương pháp"
                    required
                    error={errors.methodology}
                  >
                    <textarea
                      value={methodology}
                      onChange={(e) => setMethodology(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                  <Field
                    label="Kết quả kỳ vọng"
                    required
                    error={errors.expectedOutcomes}
                  >
                    <textarea
                      value={expectedOutcomes}
                      onChange={(e) => setExpectedOutcomes(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                  <Field label="Yêu cầu" required error={errors.requirements}>
                    <textarea
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </Field>
                </>
              ) : (
                <>
                  <InfoBlock label="Phương pháp">
                    {fmt(ver.methodology)}
                  </InfoBlock>
                  <InfoBlock label="Kết quả kỳ vọng">
                    {fmt(ver.expectedOutcomes)}
                  </InfoBlock>
                  <InfoBlock label="Yêu cầu">{fmt(ver.requirements)}</InfoBlock>
                </>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Tóm tắt" desc="Xem nhanh các thông tin đã chọn.">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Title (EN)</span>
                  <span className="font-medium">
                    {isEditing ? eN_Title || "—" : fmt(ver.eN_Title)}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tiêu đề (VN)</span>
                  <span className="font-medium">
                    {isEditing ? vN_title || "—" : fmt(ver.vN_title)}
                  </span>
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
                  Trạng thái hiện tại
                </span>
                <span className="rounded-full border bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {normalizedStatus || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm text-neutral-600">
                  Người nộp duyệt
                </span>
                <span className="text-sm font-medium">
                  {fmt(ver.submittedByUserName)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm text-neutral-600">
                  Thời điểm nộp duyệt
                </span>
                <span className="text-sm font-medium">
                  {fmtDate(ver.submittedAt)}
                </span>
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
              onClick={() => navigate(`/topics/my/${topicId}`)}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>

          <div className="flex items-center gap-2">
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

            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (ver) {
                      setENTitle(ver.eN_Title || "");
                      setVNTitle(ver.vN_title || "");
                      setDescription(ver.description || "");
                      setObjectives(ver.objectives || "");
                      setMethodology(ver.methodology || "");
                      setExpectedOutcomes(ver.expectedOutcomes || "");
                      setRequirements(ver.requirements || "");
                      setProblem(ver.problem || "");
                      setContext(ver.context || "");
                      setContent(ver.content || "");
                      setDocumentUrl(ver.documentUrl || "");
                      setDocFile(null);
                      setFileError(undefined);
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
                disabled={normalizeStatusLabel(ver.status) !== "Draft"}
                title={
                  normalizeStatusLabel(ver.status) === "Draft"
                    ? ""
                    : "Chỉ sửa được khi phiên bản ở trạng thái Draft"
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

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  BookOpen,
  Loader2,
  ArrowLeft,
  FileText,
  Download,
  Upload,
  X,
  Asterisk,
  ShieldAlert,
} from "lucide-react";

import LoadingPage from "@/pages/loading-page";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import { Label } from "@/components/globals/atoms/label";
import { useCategories } from "@/hooks/useCategory";
import VersionTabs from "../topic-version/TopicVersionTabs";

import {
  getTopicDetail,
  type TopicDetailResponse,
} from "@/services/topicService";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import { uploadFileReturnId } from "@/services/fileService";
import {
  checkDuplicateAdvanced,
  type AdvancedDuplicatePayload,
} from "@/services/aiDuplicateAdvancedService";
import { formatDateTime } from "@/utils/formatter";

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

function formatBytes(b: number) {
  if (b === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(b) / Math.log(k));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

type AxiosErrorLike = {
  response?: { data?: { detail?: unknown } };
  message?: string;
};

export default function MyTopicEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: categories } = useCategories();

  const [data, setData] = useState<TopicDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [eN_Title, setENTitle] = useState("");
  const [vN_title, setVNTitle] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [problem, setProblem] = useState("");
  const [context, setContext] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [maxStudents, setMaxStudents] = useState<number>(1);

  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isChecking, setIsChecking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const detail = await getTopicDetail(Number(id));
        setData(detail);
        setENTitle(detail.eN_Title || "");
        setVNTitle(detail.vN_title || "");
        setAbbreviation(detail.abbreviation || "");
        setProblem(detail.problem || "");
        setContext(detail.context || "");
        setContent(detail.content || "");
        setDescription(detail.description || "");
        setObjectives(detail.objectives || "");
        setCategoryId(detail.categoryId);
        setMaxStudents(detail.maxStudents);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "Không tải được chi tiết đề tài",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const semesterId = data?.semesterId ?? 0;

  const form = {
    eN_Title,
    vN_title,
    abbreviation,
    problem,
    context,
    content,
    description,
    objectives,
    categoryId,
    maxStudents,
  } as const;

  const requiredKeys: (keyof typeof form)[] = [
    "eN_Title",
    "vN_title",
    "abbreviation",
    "problem",
    "context",
    "content",
    "description",
    "objectives",
    "categoryId",
    "maxStudents",
  ];

  const completeCount = requiredKeys.filter((k) =>
    typeof form[k] === "number"
      ? Number(form[k]) > 0
      : String(form[k]).trim().length > 0,
  ).length;

  const progress = Math.round((completeCount / requiredKeys.length) * 100);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!eN_Title.trim()) e.eN_Title = "Vui lòng nhập Title (EN)";
    if (!vN_title.trim()) e.vN_title = "Vui lòng nhập Tiêu đề (VN)";
    if (!abbreviation.trim()) e.abbreviation = "Vui lòng nhập viết tắt";
    if (!description.trim()) e.description = "Vui lòng nhập mô tả";
    if (!objectives.trim()) e.objectives = "Vui lòng nhập mục tiêu";
    if (!context.trim()) e.context = "Vui lòng nhập bối cảnh";
    if (!content.trim()) e.content = "Vui lòng nhập nội dung";
    if (!problem.trim()) e.problem = "Vui lòng nhập vấn đề";
    if (!categoryId) e.categoryId = "Vui lòng chọn danh mục";
    if (!maxStudents || Number(maxStudents) <= 0)
      e.maxStudents = "Số SV tối đa phải > 0";
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
    const incoming = Array.from(list).slice(0, 1);
    const f = incoming[0];
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      setFileError(err);
      toast.error(err);
      return;
    }
    setDocFiles([f]);
    setFileError(undefined);
  };

  const removeFile = () => {
    setDocFiles([]);
    setFileError(undefined);
  };

  const handleCheckDuplicate = async () => {
    if (!data) return;
    if (!validate()) {
      toast.error("Vui lòng điền đầy đủ trường bắt buộc trước khi kiểm tra");
      return;
    }
    if (isChecking) return;

    setIsChecking(true);
    const tId = toast.loading("Đang kiểm tra trùng lặp...");

    try {
      let uploadedFileId: number | undefined = undefined;
      if (docFiles.length > 0) {
        const upId = toast.loading("Đang upload tài liệu đính kèm...", {
          id: tId,
        });
        try {
          uploadedFileId = await uploadFileReturnId(docFiles[0]);
          toast.success("Upload tệp thành công", { id: upId });
        } catch {
          toast.error("Upload tệp thất bại", { id: upId });
          throw new Error("Không thể upload tệp để kiểm tra trùng lặp.");
        }
      }

      const base: AdvancedDuplicatePayload = {
        eN_Title: eN_Title.trim(),
        vN_title: vN_title.trim(),
        abbreviation: (abbreviation ?? "").trim() || undefined,
        problem: problem.trim(),
        context: context.trim(),
        content: content.trim(),
        description: description.trim(),
        objectives: objectives.trim(),
        ...(Number(semesterId) > 0 ? { semesterId: Number(semesterId) } : {}),
      };

      const body = Object.fromEntries(
        Object.entries(base).filter(
          ([, v]) =>
            v !== undefined &&
            v !== null &&
            !(typeof v === "string" && v.trim() === ""),
        ),
      ) as AdvancedDuplicatePayload;

      const payload: AdvancedDuplicatePayload =
        typeof uploadedFileId === "number"
          ? { ...body, fileId: uploadedFileId }
          : body;

      const result = await checkDuplicateAdvanced(payload);

      toast.success("Hoàn tất kiểm tra", { id: tId });

      navigate("/supervisors/ai-check-duplicate/advanced-result", {
        state: {
          result,
          formSnapshot: {
            eN_Title,
            vN_title,
            abbreviation,
            problem,
            context,
            content,
            description,
            objectives,
            categoryId,
            semesterId,
            maxStudents,
            categoryName:
              categories?.find((c) => c.id === categoryId)?.name ||
              data.categoryName ||
              "",
            semesterName: data.semesterName || "",
            topicId: data.id,
            fileId: uploadedFileId,
          },
        },
      });
    } catch (e: unknown) {
      const err = e as AxiosErrorLike;
      const detail =
        (err.response?.data?.detail as unknown as string | undefined) ??
        err.message ??
        "Không kiểm tra được trùng lặp.";
      toast.error(
        typeof detail === "string" ? detail : JSON.stringify(detail),
        { id: tId },
      );
    } finally {
      setIsChecking(false);
    }
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
                Sửa thông tin & kiểm tra trùng lặp
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
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${isChecking ? "pointer-events-none opacity-70" : ""}`}
            >
              <Field label="Title (EN)" required error={errors.eN_Title}>
                <input
                  value={eN_Title}
                  onChange={(e) => setENTitle(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                />
              </Field>
              <Field label="Tiêu đề (VN)" required error={errors.vN_title}>
                <input
                  value={vN_title}
                  onChange={(e) => setVNTitle(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                />
              </Field>
              <Field label="Viết tắt" required error={errors.abbreviation}>
                <input
                  value={abbreviation}
                  onChange={(e) => setAbbreviation(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                />
              </Field>
              <Field label="Vấn đề" required error={errors.problem}>
                <input
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                />
              </Field>
              <Field label="Bối cảnh" required error={errors.context}>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
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

              <Field label="Danh mục" required error={errors.categoryId}>
                <select
                  value={categoryId || ""}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                >
                  <option value="" disabled>
                    {categories?.length ? "Chọn danh mục" : "Đang tải..."}
                  </option>
                  {(categories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
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
            </div>
          </SectionCard>

          <SectionCard
            title="Nội dung & đính kèm"
            desc="Toàn bộ mô tả học thuật và tệp minh chứng."
          >
            <div className="space-y-4">
              <InfoBlock label="Mô tả">{description}</InfoBlock>
              <InfoBlock label="Mục tiêu">{objectives}</InfoBlock>
              <InfoBlock label="Nội dung">{content}</InfoBlock>
              <InfoBlock label="Vấn đề">{problem}</InfoBlock>
              <InfoBlock label="Bối cảnh">{context}</InfoBlock>
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

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label className="font-medium">Thay tài liệu</label>
                <span className="text-xs text-neutral-500">
                  PDF, DOC, DOCX • Tối đa 20MB • 1 tệp
                </span>
              </div>
              <div
                className={`group relative flex w-full items-start gap-3 rounded-2xl border-2 border-dashed p-3 transition ${fileError ? "border-red-300 bg-red-50" : "border-neutral-200 hover:border-neutral-300"} ${isChecking ? "pointer-events-none opacity-60" : ""}`}
                onClick={() => pickFile()}
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
                      {docFiles.length > 0
                        ? "Đã chọn 1 tệp"
                        : "Kéo & thả tệp vào đây"}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {docFiles.length > 0
                        ? "Bấm để thay tệp khác"
                        : "Hoặc bấm để chọn"}
                    </span>
                  </div>
                </div>

                {docFiles.length > 0 && (
                  <div className="ml-auto flex max-h-20 max-w-[55%] flex-wrap items-center gap-2 overflow-y-auto">
                    {docFiles.map((f) => (
                      <div
                        key={f.name + f.size}
                        className="flex items-center gap-2 rounded-md border bg-white/80 px-2 py-1 text-[12px] shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="max-w-[160px] truncate">{f.name}</span>
                        <span className="text-[10px] text-neutral-500">
                          {formatBytes(f.size)}
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
                    ))}
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
              {fileError ? (
                <p className="text-xs font-medium text-red-600">{fileError}</p>
              ) : null}
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
                    {categories?.find((c) => c.id === categoryId)?.name ||
                      data.categoryName ||
                      "—"}
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
                  <span className="font-medium">{maxStudents}</span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Title (EN)</span>
                  <span className="font-medium">{eN_Title || "—"}</span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tiêu đề (VN)</span>
                  <span className="font-medium">{vN_title || "—"}</span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Viết tắt</span>
                  <span className="font-medium">{abbreviation || "—"}</span>
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
                <div className="text-muted-foreground text-xs">
                  {completeCount}/{requiredKeys.length} trường bắt buộc
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
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCheckDuplicate}
              disabled={isChecking}
              className="inline-flex min-w-40 items-center gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang kiểm tra...
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" /> Kiểm tra trùng lặp
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

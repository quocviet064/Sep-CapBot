import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import {
  BookOpen,
  ArrowLeft,
  Upload,
  FileText,
  X,
  Asterisk,
  Sparkles,
} from "lucide-react";
import capBotAPI from "@/lib/CapBotApi";

type FormSnapshot = {
  eN_Title?: string;
  vN_title?: string;
  abbreviation?: string;
  description?: string;
  objectives?: string;
  methodology?: string;
  expectedOutcomes?: string;
  requirements?: string;
  problem?: string;
  context?: string;
  content?: string;
  categoryId?: number;
  categoryName?: string;
  semesterId?: number;
  semesterName?: string;
  supervisorId?: number;
  supervisorName?: string;
  maxStudents?: number;
  fileId?: number;
  fileToken?: string | null;
  docFileName?: string;
  docFileSize?: number;
  __fromSuggestion?: boolean;
};

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
  children: ReactNode;
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

function formatBytes(b: number) {
  if (!b || b <= 0) return "—";
  const k = 1024;
  const i = Math.floor(Math.log(b) / Math.log(k));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

const DRAFT_KEY = "draft:supervisors-topics-create";

function pickFileId(v: unknown): number | undefined {
  if (!v || typeof v !== "object") return undefined;
  const obj = v as Record<string, unknown>;
  if (typeof obj.fileId === "number") return obj.fileId;
  if (typeof obj.id === "number") return obj.id;
  const data = obj.data as Record<string, unknown> | undefined;
  if (data) {
    if (typeof data.fileId === "number") return data.fileId;
    if (typeof data.id === "number") return data.id;
  }
  return undefined;
}

export default function TopicVersionCreateBackPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: {
      formSnapshot?: FormSnapshot;
      seed?: FormSnapshot;
      topicId?: number;
      submissionId?: number;
    };
  };
  const incoming = state?.formSnapshot ?? state?.seed;
  const topicId = state?.topicId;
  const submissionId = state?.submissionId;

  const loadDraft = (): FormSnapshot | null => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as FormSnapshot) : null;
    } catch {
      return null;
    }
  };
  const saveDraft = (snap: FormSnapshot) => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(snap));
    } catch {
      return;
    }
  };
  const clearDraft = () => {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      return;
    }
  };

  const seed: FormSnapshot =
    useMemo(() => incoming ?? loadDraft() ?? {}, [incoming]) ?? {};

  const [eN_Title, setENTitle] = useState(seed.eN_Title ?? "");
  const [vN_title, setVNTitle] = useState(seed.vN_title ?? "");
  const [description, setDescription] = useState(seed.description ?? "");
  const [objectives, setObjectives] = useState(seed.objectives ?? "");
  const [methodology, setMethodology] = useState(seed.methodology ?? "");
  const [expectedOutcomes, setExpectedOutcomes] = useState(
    seed.expectedOutcomes ?? "",
  );
  const [requirements, setRequirements] = useState(seed.requirements ?? "");
  const [problem, setProblem] = useState(seed.problem ?? "");
  const [context, setContext] = useState(seed.context ?? "");
  const [content, setContent] = useState(seed.content ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const requiredKeys = [
    "eN_Title",
    "vN_title",
    "description",
    "objectives",
    "problem",
    "context",
    "content",
    "methodology",
    "expectedOutcomes",
    "requirements",
  ] as const;

  const completeCount = useMemo(() => {
    const vals = {
      eN_Title,
      vN_title,
      description,
      objectives,
      problem,
      context,
      content,
      methodology,
      expectedOutcomes,
      requirements,
    };
    return requiredKeys.filter((k) => String(vals[k]).trim().length > 0).length;
  }, [
    eN_Title,
    vN_title,
    description,
    objectives,
    problem,
    context,
    content,
    methodology,
    expectedOutcomes,
    requirements,
  ]);

  const progress = Math.round((completeCount / requiredKeys.length) * 100);

  const [docFile, setDocFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [prevDocMeta, setPrevDocMeta] = useState<{
    name: string;
    size?: number;
  } | null>(
    seed.docFileName
      ? { name: seed.docFileName, size: seed.docFileSize }
      : null,
  );

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
    setPrevDocMeta(null);
    setFileError(undefined);
  };

  const removeFile = () => {
    setDocFile(null);
    setFileError(undefined);
  };

  useEffect(() => {
    if (incoming) {
      saveDraft({
        ...seed,
        eN_Title,
        vN_title,
        description,
        objectives,
        methodology,
        expectedOutcomes,
        requirements,
        problem,
        context,
        content,
        fileId: seed.fileId,
        docFileName: prevDocMeta?.name ?? seed.docFileName,
        docFileSize:
          typeof prevDocMeta?.size === "number"
            ? prevDocMeta.size
            : seed.docFileSize,
      });
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      saveDraft({
        ...seed,
        eN_Title,
        vN_title,
        description,
        objectives,
        methodology,
        expectedOutcomes,
        requirements,
        problem,
        context,
        content,
        fileId: seed.fileId,
        docFileName: docFile?.name ?? prevDocMeta?.name ?? seed.docFileName,
        docFileSize: docFile?.size ?? prevDocMeta?.size ?? seed.docFileSize,
      });
    }, 250);
    return () => clearTimeout(id);
  }, [
    eN_Title,
    vN_title,
    description,
    objectives,
    methodology,
    expectedOutcomes,
    requirements,
    problem,
    context,
    content,
    docFile,
    prevDocMeta,
    seed,
  ]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!eN_Title.trim()) e.eN_Title = "Vui lòng nhập EN Title";
    if (!vN_title.trim()) e.vN_title = "Vui lòng nhập VN Title";
    if (!description.trim()) e.description = "Vui lòng nhập mô tả";
    if (!objectives.trim()) e.objectives = "Vui lòng nhập mục tiêu";
    if (!problem.trim()) e.problem = "Vui lòng nhập vấn đề";
    if (!context.trim()) e.context = "Vui lòng nhập bối cảnh";
    if (!content.trim()) e.content = "Vui lòng nhập nội dung";
    if (!methodology.trim()) e.methodology = "Vui lòng nhập phương pháp";
    if (!expectedOutcomes.trim())
      e.expectedOutcomes = "Vui lòng nhập kết quả kỳ vọng";
    if (!requirements.trim()) e.requirements = "Vui lòng nhập yêu cầu";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setENTitle("");
    setVNTitle("");
    setDescription("");
    setObjectives("");
    setMethodology("");
    setExpectedOutcomes("");
    setRequirements("");
    setProblem("");
    setContext("");
    setContent("");
    setErrors({});
    setDocFile(null);
    setFileError(undefined);
    setPrevDocMeta(null);
    clearDraft();
  };

  const uploadAndGetFileId = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file, file.name);
    const res = await capBotAPI.post("/File/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const id = pickFileId(res?.data as unknown);
    if (typeof id !== "number") {
      console.error("Upload response:", res?.data);
      throw new Error("Không lấy được fileId từ phản hồi tải lên");
    }
    return id;
  };

  const goCheckDuplicate = async () => {
    if (!validate()) {
      toast.error(
        "Vui lòng kiểm tra lại các trường bắt buộc trước khi kiểm tra trùng lặp",
      );
      return;
    }

    try {
      let fileId = seed.fileId;
      if (docFile) {
        fileId = await uploadAndGetFileId(docFile);
      }

      const formSnapshot: FormSnapshot = {
        ...seed,
        eN_Title,
        vN_title,
        description,
        objectives,
        methodology,
        expectedOutcomes,
        requirements,
        problem,
        context,
        content,
        categoryId: seed.categoryId,
        categoryName: seed.categoryName,
        semesterId: seed.semesterId,
        semesterName: seed.semesterName,
        supervisorId: seed.supervisorId,
        supervisorName: seed.supervisorName,
        maxStudents: seed.maxStudents ?? 1,
        fileId,
        docFileName: docFile?.name ?? prevDocMeta?.name ?? seed.docFileName,
        docFileSize: docFile?.size ?? prevDocMeta?.size ?? seed.docFileSize,
      };

      saveDraft(formSnapshot);

      navigate("/topics/topic-version/duplicate-check", {
        state: {
          formSnapshot,
          topicId,
          submissionId,
        },
      });
    } catch (err: unknown) {
      let msg = "Không upload được tệp";
      if (typeof err === "string") msg = err;
      else if (err instanceof Error) msg = err.message;
      else if (typeof err === "object" && err !== null) {
        const maybeResponse = (
          err as {
            response?: { data?: { message?: unknown } };
          }
        ).response;
        const m = maybeResponse?.data?.message;
        if (typeof m === "string") msg = m;
      }
      toast.error(msg);
    }
  };

  const goTopicDetailOrBack = () => {
    if (topicId && Number.isFinite(topicId)) {
      navigate(`/topics/my/${topicId}`);
    } else {
      navigate(-1);
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
              <h2 className="text-lg font-semibold">Tạo phiên bản mới</h2>
              <p className="text-xs text-white/70">
                Trạng thái khởi tạo: Draft
              </p>
            </div>
          </div>

          <div className="w-48">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span>Tiến độ</span>
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
            desc="Các trường bắt buộc để định danh phiên bản (khớp API)."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="EN Title" required error={errors.eN_Title}>
                <input
                  type="text"
                  className="w-full rounded-xl border px-3 py-2 text-sm ring-0 transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="English title"
                  value={eN_Title}
                  onChange={(e) => setENTitle(e.target.value)}
                />
              </Field>
              <Field label="VN Title" required error={errors.vN_title}>
                <input
                  type="text"
                  className="w-full rounded-xl border px-3 py-2 text-sm ring-0 transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Tiêu đề tiếng Việt"
                  value={vN_title}
                  onChange={(e) => setVNTitle(e.target.value)}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Nội dung chi tiết" desc="Khớp các field API.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Vấn đề (problem)" required error={errors.problem}>
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Vấn đề cần giải quyết"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                />
              </Field>
              <Field label="Bối cảnh (context)" required error={errors.context}>
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Bối cảnh"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </Field>
              <Field label="Nội dung (content)" required error={errors.content}>
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Nội dung chính"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </Field>
              <Field label="Mô tả" required error={errors.description}>
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Tóm tắt nội dung/thay đổi của phiên bản"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <Field label="Mục tiêu" required error={errors.objectives}>
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Tóm tắt nội dung/thay đổi của phiên bản"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                />
              </Field>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium">Tài liệu đính kèm</label>
                  <span className="text-xs text-neutral-500">
                    PDF, DOC, DOCX • Tối đa 20MB • 1 tệp
                  </span>
                </div>
                <div
                  className={`group relative flex min-h-[90px] w-full items-start gap-3 rounded-2xl border-2 border-dashed p-3 transition ${
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
                        {docFile || prevDocMeta
                          ? "Đã chọn 1 tệp"
                          : "Kéo & thả tệp vào đây"}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {docFile || prevDocMeta
                          ? "Bấm để thay tệp khác"
                          : "Hoặc bấm để chọn"}
                      </span>
                    </div>
                  </div>

                  {(docFile || prevDocMeta) && (
                    <div className="ml-auto flex max-h-20 max-w-[55%] flex-wrap items-center gap-2 overflow-y-auto">
                      <div
                        className="flex items-center gap-2 rounded-md border bg-white/80 px-2 py-1 text-[12px] shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="max-w-[160px] truncate">
                          {docFile?.name ?? prevDocMeta?.name}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {docFile
                            ? formatBytes(docFile.size)
                            : formatBytes(prevDocMeta?.size || 0)}
                        </span>
                        <button
                          type="button"
                          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (docFile) {
                              removeFile();
                            } else {
                              setPrevDocMeta(null);
                              saveDraft({
                                ...seed,
                                docFileName: undefined,
                                docFileSize: undefined,
                              });
                            }
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
                {fileError ? (
                  <p className="text-xs font-medium text-red-600">
                    {fileError}
                  </p>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Nội dung nghiên cứu" desc="Các trường bổ sung.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Phương pháp (Methodology)"
                required
                error={errors.methodology}
              >
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Phương pháp thực hiện"
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                />
              </Field>
              <Field
                label="Kết quả kỳ vọng (Expected outcomes)"
                required
                error={errors.expectedOutcomes}
              >
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Sản phẩm/kết quả mong đợi"
                  value={expectedOutcomes}
                  onChange={(e) => setExpectedOutcomes(e.target.value)}
                />
              </Field>
              <Field
                label="Yêu cầu (Requirements)"
                required
                error={errors.requirements}
              >
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Chuẩn đầu vào, công cụ, kiến thức cần có..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </Field>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Thuộc về" desc="Thông tin kế thừa/đã chọn.">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Thuộc đề tài</span>
                <span className="font-medium">{seed.eN_Title || "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Giảng viên</span>
                <span className="font-medium">
                  {seed.supervisorName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Danh mục</span>
                <span className="font-medium">{seed.categoryName || "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Học kỳ</span>
                <span className="font-medium">{seed.semesterName || "—"}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tóm tắt">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">EN Title</div>
                <div className="line-clamp-2 text-sm font-medium">
                  {eN_Title || "—"}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">VN Title</div>
                <div className="line-clamp-2 text-sm font-medium">
                  {vN_title || "—"}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Tài liệu</div>
                <div className="text-sm font-medium">
                  {docFile || prevDocMeta ? `1 tệp` : "—"}
                </div>
                {(docFile || prevDocMeta) && (
                  <div className="mt-1 text-xs text-neutral-600">
                    {(docFile?.name ?? prevDocMeta?.name) || "—"} •{" "}
                    {docFile
                      ? formatBytes(docFile.size)
                      : formatBytes(prevDocMeta?.size || 0)}
                  </div>
                )}
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Tiến độ</div>
                <div className="text-sm font-medium">{progress}%</div>
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
              onClick={() =>
                window.history.length > 1 ? navigate(-1) : goTopicDetailOrBack()
              }
              className="min-w-36"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về chi tiết đề tài
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={resetForm}>
              Xoá nội dung
            </Button>

            <Button
              onClick={goCheckDuplicate}
              variant="default"
              className="inline-flex min-w-44 items-center gap-2"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Kiểm tra trùng lặp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

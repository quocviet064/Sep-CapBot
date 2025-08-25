import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import {
  BookOpen,
  Loader2,
  ArrowLeft,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { useCreateTopicVersion } from "@/hooks/useTopicVersion";
import { useTopicDetail } from "@/hooks/useTopic";

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

type VersionSeed = {
  title: string;
  description: string;
  objectives: string;
  methodology: string;
  expectedOutcomes: string;
  requirements: string;
};

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Đã xảy ra lỗi";
}

function formatBytes(b: number) {
  if (b === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(b) / Math.log(k));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function TopicVersionCreatePage() {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const tid = topicId ? Number(topicId) : NaN;

  const location = useLocation() as { state?: { seed?: Partial<VersionSeed> } };
  const navSeed = location.state?.seed;

  const {
    data: topic,
    isLoading: loadingTopic,
    error: topicError,
  } = useTopicDetail(topicId);

  const fetchedSeed: Partial<VersionSeed> | undefined = useMemo(() => {
    if (!topic) return undefined;
    return {
      title: topic.title ?? "",
      description: topic.description ?? "",
      objectives: topic.objectives ?? "",
      methodology: topic.currentVersion?.methodology ?? "",
      expectedOutcomes: topic.currentVersion?.expectedOutcomes ?? "",
      requirements: topic.currentVersion?.requirements ?? "",
    };
  }, [topic]);

  const initialSeed: VersionSeed = {
    title: navSeed?.title ?? fetchedSeed?.title ?? "",
    description: navSeed?.description ?? fetchedSeed?.description ?? "",
    objectives: navSeed?.objectives ?? fetchedSeed?.objectives ?? "",
    methodology: navSeed?.methodology ?? fetchedSeed?.methodology ?? "",
    expectedOutcomes:
      navSeed?.expectedOutcomes ?? fetchedSeed?.expectedOutcomes ?? "",
    requirements: navSeed?.requirements ?? fetchedSeed?.requirements ?? "",
  };

  const { mutateAsync: createVersion, isPending } = useCreateTopicVersion();

  const [title, setTitle] = useState(initialSeed.title);
  const [description, setDescription] = useState(initialSeed.description);
  const [objectives, setObjectives] = useState(initialSeed.objectives);
  const [methodology, setMethodology] = useState(initialSeed.methodology);
  const [expectedOutcomes, setExpectedOutcomes] = useState(
    initialSeed.expectedOutcomes,
  );
  const [requirements, setRequirements] = useState(initialSeed.requirements);

  useEffect(() => {
    if (navSeed || !fetchedSeed) return;
    setTitle((v) => (v ? v : (fetchedSeed.title ?? "")));
    setDescription((v) => (v ? v : (fetchedSeed.description ?? "")));
    setObjectives((v) => (v ? v : (fetchedSeed.objectives ?? "")));
    setMethodology((v) => (v ? v : (fetchedSeed.methodology ?? "")));
    setExpectedOutcomes((v) => (v ? v : (fetchedSeed.expectedOutcomes ?? "")));
    setRequirements((v) => (v ? v : (fetchedSeed.requirements ?? "")));
  }, [fetchedSeed, navSeed]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const requiredKeys = ["title", "description", "objectives"] as const;
  const completeCount = useMemo(() => {
    const vals = { title, description, objectives };
    return requiredKeys.filter((k) => String(vals[k]).trim().length > 0).length;
  }, [title, description, objectives]);
  const progress = Math.round((completeCount / requiredKeys.length) * 100);

  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Vui lòng nhập tiêu đề";
    if (!description.trim()) e.description = "Vui lòng nhập mô tả";
    if (!objectives.trim()) e.objectives = "Vui lòng nhập mục tiêu";
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
    const incoming = Array.from(list);
    const valids: File[] = [];
    for (const f of incoming) {
      const err = validateFile(f);
      if (err) {
        setFileError(err);
        toast.error(err);
        continue;
      }
      valids.push(f);
    }
    const merged = [...docFiles, ...valids];
    const deduped = merged.filter(
      (f, idx, arr) =>
        arr.findIndex(
          (x) => x.name === f.name && x.size === f.size && x.type === f.type,
        ) === idx,
    );
    setDocFiles(deduped);
    setFileError(undefined);
  };

  const removeFile = (i: number) =>
    setDocFiles((p) => p.filter((_, idx) => idx !== i));

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setObjectives("");
    setMethodology("");
    setExpectedOutcomes("");
    setRequirements("");
    setErrors({});
    setDocFiles([]);
    setFileError(undefined);
  };

  const onSubmit = async () => {
    if (!Number.isFinite(tid)) {
      toast.error("Thiếu topicId hợp lệ");
      return;
    }
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }
    const id = toast.loading("Đang tạo phiên bản...");
    try {
      const fd = new FormData();
      fd.append("topicId", String(tid));
      fd.append("title", title);
      fd.append("description", description);
      fd.append("objectives", objectives);
      fd.append("methodology", methodology || "");
      fd.append("expectedOutcomes", expectedOutcomes || "");
      fd.append("requirements", requirements || "");
      docFiles.forEach((f) => fd.append("documents", f, f.name));
      await createVersion(fd as any);
      toast.success("🎉 Tạo phiên bản thành công!", { id });
      navigate(`/topics/my/${tid}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err), { id });
    }
  };

  if (!navSeed && loadingTopic) {
    return (
      <div className="rounded-xl border p-3 text-sm">
        Đang tải dữ liệu đề tài…
      </div>
    );
  }
  if (!navSeed && topicError) {
    toast.error("Không tải được dữ liệu đề tài để điền sẵn");
  }

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
            desc="Các trường bắt buộc để định danh phiên bản."
          >
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${isPending ? "pointer-events-none opacity-70" : ""}`}
            >
              <Field label="Tiêu đề" required error={errors.title}>
                <input
                  type="text"
                  className="w-full rounded-xl border px-3 py-2 text-sm ring-0 transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Nhập tiêu đề phiên bản"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>
              <Field label="Thuộc đề tài">
                <input
                  disabled
                  className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-600"
                  value={Number.isFinite(tid) ? `#${tid}` : "—"}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Mục tiêu" required error={errors.objectives}>
                  <textarea
                    className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    placeholder="Trình bày mục tiêu của phiên bản"
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Mô tả" required error={errors.description}>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    placeholder="Tóm tắt nội dung/thay đổi của phiên bản"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Nội dung nghiên cứu"
            desc="Các trường bổ sung (tuỳ chọn)."
          >
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${isPending ? "pointer-events-none opacity-70" : ""}`}
            >
              <Field label="Phương pháp (Methodology)">
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Phương pháp thực hiện"
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                />
              </Field>
              <Field label="Kết quả kỳ vọng (Expected outcomes)">
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Sản phẩm/kết quả mong đợi"
                  value={expectedOutcomes}
                  onChange={(e) => setExpectedOutcomes(e.target.value)}
                />
              </Field>
              <Field label="Yêu cầu (Requirements)">
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Chuẩn đầu vào, công cụ, kiến thức cần có..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </Field>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium">Tài liệu đính kèm</label>
                  <span className="text-xs text-neutral-500">
                    PDF, DOC, DOCX • Tối đa 20MB
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
                        {docFiles.length > 0
                          ? `Đã chọn ${docFiles.length} tệp`
                          : "Kéo & thả tệp vào đây"}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {docFiles.length > 0
                          ? "Bấm để thêm tệp khác"
                          : "Hoặc bấm để chọn"}
                      </span>
                    </div>
                  </div>
                  {docFiles.length > 0 && (
                    <div className="ml-auto flex max-h-20 max-w-[55%] flex-wrap items-center gap-2 overflow-y-auto">
                      {docFiles.map((f, i) => (
                        <div
                          key={f.name + f.size}
                          className="flex items-center gap-2 rounded-md border bg-white/80 px-2 py-1 text-[12px] shadow-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span className="max-w-[140px] truncate">
                            {f.name}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {formatBytes(f.size)}
                          </span>
                          <button
                            type="button"
                            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(i);
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
                    multiple
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
        </div>

        <div className="space-y-4">
          <SectionCard title="Tóm tắt" desc="Xem nhanh thông tin đã nhập.">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Đề tài</span>
                  <span className="font-medium">
                    {Number.isFinite(tid) ? `#${tid}` : "—"}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Tiêu đề</div>
                <div className="line-clamp-2 text-sm font-medium">
                  {title || "—"}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Mục tiêu</div>
                <div className="line-clamp-3">{objectives || "—"}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Tài liệu</div>
                <div className="text-sm font-medium">
                  {docFiles.length > 0 ? `${docFiles.length} tệp` : "—"}
                </div>
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
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-2 rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
          <Button variant="ghost" onClick={resetForm} disabled={isPending}>
            Xoá nội dung
          </Button>
          <Button onClick={onSubmit} disabled={isPending} className="min-w-36">
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo...
              </span>
            ) : (
              "Tạo phiên bản"
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/topics/my/${tid}`)}
            className="min-w-36"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Về chi tiết đề tài
          </Button>
        </div>
      </div>
    </div>
  );
}

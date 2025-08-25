// src/pages/topics/CreateTopicPage.tsx
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/globals/atoms/dropdown-menu";
import {
  ChevronDown,
  BookOpen,
  CheckCircle2,
  Loader2,
  Search,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { useCreateTopic } from "@/hooks/useTopic";
import type { CreateTopicPayload } from "@/services/topicService";
import type { CategoryType } from "@/schemas/categorySchema";
import type { SemesterDTO } from "@/services/semesterService";
import { useCategories } from "@/hooks/useCategory";
import { useSemesters } from "@/hooks/useSemester";

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

function formatBytes(b: number) {
  if (b === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(b) / Math.log(k));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function CreateTopicPage() {
  const { mutateAsync: createTopic, isPending } = useCreateTopic();

  const {
    data: categories = [],
    isLoading: catLoading,
    error: catError,
  } = useCategories();
  const {
    data: semesters = [],
    isLoading: semLoading,
    error: semError,
  } = useSemesters();

  const [catQuery, setCatQuery] = useState("");
  const [semQuery, setSemQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = catQuery.trim().toLowerCase();
    if (!q) return categories as CategoryType[];
    return (categories as CategoryType[]).filter((c) =>
      c.name.toLowerCase().includes(q),
    );
  }, [catQuery, categories]);

  const filteredSemesters = useMemo(() => {
    const q = semQuery.trim().toLowerCase();
    if (!q) return semesters as SemesterDTO[];
    return (semesters as SemesterDTO[]).filter((s) =>
      s.name.toLowerCase().includes(q),
    );
  }, [semQuery, semesters]);

  const [form, setForm] = useState<CreateTopicPayload>({
    title: "",
    description: "",
    objectives: "",
    categoryId: 0,
    semesterId: 0,
    maxStudents: 5,
    methodology: "",
    expectedOutcomes: "",
    requirements: "",
    documentUrl: "",
  });

  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof CreateTopicPayload>(
    key: K,
    value: CreateTopicPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const selectedCategoryName =
    (form.categoryId &&
      (categories as CategoryType[]).find((c) => c.id === form.categoryId)
        ?.name) ||
    "Danh mục";
  const selectedSemesterName =
    (form.semesterId &&
      (semesters as SemesterDTO[]).find((s) => s.id === form.semesterId)
        ?.name) ||
    "Kỳ học";

  const requiredKeys: (keyof CreateTopicPayload)[] = [
    "title",
    "description",
    "objectives",
    "categoryId",
    "semesterId",
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
    if (!form.title?.trim()) e.title = "Vui lòng nhập tên đề tài";
    if (!form.description?.trim()) e.description = "Vui lòng nhập mô tả";
    if (!form.objectives?.trim()) e.objectives = "Vui lòng nhập mục tiêu";
    if (!form.categoryId) e.categoryId = "Vui lòng chọn danh mục";
    if (!form.semesterId) e.semesterId = "Vui lòng chọn kỳ học";
    if (!form.maxStudents || Number(form.maxStudents) <= 0)
      e.maxStudents = "Số SV tối đa phải lớn hơn 0";
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
    setForm({
      title: "",
      description: "",
      objectives: "",
      categoryId: 0,
      semesterId: 0,
      maxStudents: 5,
      methodology: "",
      expectedOutcomes: "",
      requirements: "",
      documentUrl: "",
    });
    setDocFiles([]);
    setFileError(undefined);
  };

  const onSubmit = async () => {
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description || "");
    fd.append("objectives", form.objectives || "");
    fd.append("categoryId", String(form.categoryId || 0));
    fd.append("semesterId", String(form.semesterId || 0));
    fd.append("maxStudents", String(form.maxStudents || 0));
    fd.append("methodology", form.methodology || "");
    fd.append("expectedOutcomes", form.expectedOutcomes || "");
    fd.append("requirements", form.requirements || "");
    fd.append("documentUrl", "");
    docFiles.forEach((f) => fd.append("documents", f, f.name));
    await toast.promise(createTopic(fd as unknown as CreateTopicPayload), {
      loading: "Đang tạo đề tài...",
      success: "🎉 Tạo đề tài thành công!",
      error: (err: unknown) =>
        (err as { message?: string } | undefined)?.message ||
        "Tạo đề tài thất bại",
    });
    resetForm();
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
              <h2 className="text-lg font-semibold">Tạo đề tài mới</h2>
              <p className="text-xs text-white/70">
                Nhập thông tin cơ bản và nội dung nghiên cứu
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
            desc="Các trường bắt buộc để định danh đề tài và phân loại."
            icon={<CheckCircle2 className="h-4 w-4" />}
          >
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${isPending ? "pointer-events-none opacity-70" : ""}`}
            >
              <Field label="Tên đề tài" required error={errors.title}>
                <input
                  type="text"
                  className="w-full rounded-xl border px-3 py-2 text-sm ring-0 transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Nhập tên đề tài"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
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
                  className="w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  value={form.maxStudents}
                  onChange={(e) =>
                    update("maxStudents", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Danh mục" required error={errors.categoryId}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between rounded-xl px-3 py-2 text-sm"
                      disabled={isPending || catLoading}
                    >
                      <span
                        className={`max-w-[240px] truncate ${form.categoryId ? "" : "text-muted-foreground"}`}
                      >
                        {catLoading ? "Đang tải..." : selectedCategoryName}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="max-h-80 w-[360px] overflow-hidden rounded-xl p-0"
                  >
                    <div className="sticky top-0 z-10 border-b bg-white/90 p-2 backdrop-blur">
                      <div className="flex items-center rounded-lg border bg-white px-2">
                        <Search className="h-3.5 w-3.5 opacity-60" />
                        <input
                          autoFocus
                          placeholder="Tìm danh mục..."
                          className="h-8 w-full bg-transparent px-2 text-xs outline-none"
                          value={catQuery}
                          onChange={(e) => setCatQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-auto p-1">
                      <DropdownMenuLabel className="px-2">
                        Danh mục
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {(filteredCategories as CategoryType[]).map((c) => (
                        <DropdownMenuItem
                          key={c.id}
                          onClick={() => update("categoryId", c.id)}
                          className="cursor-pointer text-sm"
                        >
                          {c.name}
                        </DropdownMenuItem>
                      ))}
                      {!catLoading && filteredCategories.length === 0 && (
                        <div className="text-muted-foreground px-3 py-2 text-xs">
                          Không tìm thấy danh mục phù hợp
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                {catError ? (
                  <p className="text-xs text-red-600">
                    {(catError as Error).message}
                  </p>
                ) : null}
              </Field>
              <Field label="Kỳ học" required error={errors.semesterId}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between rounded-xl px-3 py-2 text-sm"
                      disabled={isPending || semLoading}
                    >
                      <span
                        className={`max-w-[240px] truncate ${form.semesterId ? "" : "text-muted-foreground"}`}
                      >
                        {semLoading ? "Đang tải..." : selectedSemesterName}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="max-h-80 w-[360px] overflow-hidden rounded-xl p-0"
                  >
                    <div className="sticky top-0 z-10 border-b bg-white/90 p-2 backdrop-blur">
                      <div className="flex items-center rounded-lg border bg-white px-2">
                        <Search className="h-3.5 w-3.5 opacity-60" />
                        <input
                          placeholder="Tìm kỳ học..."
                          className="h-8 w-full bg-transparent px-2 text-xs outline-none"
                          value={semQuery}
                          onChange={(e) => setSemQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-auto p-1">
                      <DropdownMenuLabel className="px-2">
                        Kỳ học
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {(filteredSemesters as SemesterDTO[]).map((s) => (
                        <DropdownMenuItem
                          key={s.id}
                          onClick={() => update("semesterId", s.id)}
                          className="cursor-pointer text-sm"
                        >
                          {s.name}
                        </DropdownMenuItem>
                      ))}
                      {!semLoading && filteredSemesters.length === 0 && (
                        <div className="text-muted-foreground px-3 py-2 text-xs">
                          Không tìm thấy kỳ học phù hợp
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                {semError ? (
                  <p className="text-xs text-red-600">
                    {(semError as Error).message}
                  </p>
                ) : null}
              </Field>
              <div className="md:col-span-2">
                <Field label="Mục tiêu" required error={errors.objectives}>
                  <textarea
                    className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    placeholder="Trình bày mục tiêu đề tài"
                    value={form.objectives}
                    onChange={(e) => update("objectives", e.target.value)}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Mô tả" required error={errors.description}>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    placeholder="Tóm tắt đề tài, phạm vi, ý nghĩa..."
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Nội dung nghiên cứu"
            desc="Các trường thông tin bổ sung, có thể điền sau."
          >
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${isPending ? "pointer-events-none opacity-70" : ""}`}
            >
              <Field label="Phương pháp (Methodology)">
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Phương pháp thực hiện nghiên cứu"
                  value={form.methodology}
                  onChange={(e) => update("methodology", e.target.value)}
                />
              </Field>
              <Field label="Kết quả kỳ vọng (Expected outcomes)">
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Sản phẩm/kết quả mong đợi"
                  value={form.expectedOutcomes}
                  onChange={(e) => update("expectedOutcomes", e.target.value)}
                />
              </Field>
              <Field label="Yêu cầu (Requirements)">
                <textarea
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Chuẩn đầu vào, công cụ, kiến thức cần có..."
                  value={form.requirements}
                  onChange={(e) => update("requirements", e.target.value)}
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
          <SectionCard title="Tóm tắt" desc="Xem nhanh các thông tin đã chọn.">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Danh mục</span>
                  <span className="font-medium">
                    {form.categoryId ? selectedCategoryName : "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Kỳ học</span>
                  <span className="font-medium">
                    {form.semesterId ? selectedSemesterName : "—"}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SV tối đa</span>
                  <span className="font-medium">{form.maxStudents || "—"}</span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Tên đề tài</div>
                <div className="line-clamp-2 text-sm font-medium">
                  {form.title || "—"}
                </div>
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
              "Tạo đề tài"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import {
  BookOpen,
  LayoutTemplate,
  Loader2,
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ClipboardList,
  ClipboardCheck,
  AlignLeft,
  Ruler,
  Grid3X3,
  Type,
  Image as ImageIcon,
  FileText as DocIcon,
  Sparkles,
  Copy,
  Download,
} from "lucide-react";

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

type CheckItem = {
  id: string;
  label: string;
  weight: number;
  icon: React.ReactNode;
};
type CheckResult = {
  id: string;
  status: "pass" | "warn" | "fail";
  note: string;
  score: number;
};
type Analysis = {
  score: number;
  level: "Tốt" | "Cần cải thiện" | "Chưa đạt";
  results: CheckResult[];
  summary: string;
};

const CHECKS: CheckItem[] = [
  {
    id: "template",
    label: "Đúng mẫu template",
    weight: 0.2,
    icon: <LayoutTemplate className="h-4 w-4" />,
  },
  {
    id: "margins",
    label: "Lề & khổ giấy",
    weight: 0.15,
    icon: <Ruler className="h-4 w-4" />,
  },
  {
    id: "typography",
    label: "Font & cỡ chữ",
    weight: 0.15,
    icon: <Type className="h-4 w-4" />,
  },
  {
    id: "structure",
    label: "Mục lục & đề mục",
    weight: 0.15,
    icon: <Grid3X3 className="h-4 w-4" />,
  },
  {
    id: "citations",
    label: "Trích dẫn & tài liệu tham khảo",
    weight: 0.15,
    icon: <DocIcon className="h-4 w-4" />,
  },
  {
    id: "figures",
    label: "Bảng biểu & hình ảnh",
    weight: 0.1,
    icon: <ImageIcon className="h-4 w-4" />,
  },
  {
    id: "layout",
    label: "Giãn dòng & căn lề",
    weight: 0.1,
    icon: <AlignLeft className="h-4 w-4" />,
  },
];

const TEMPLATES = [
  { id: "std-2024", name: "Mẫu chuẩn Khoa CNTT 2024" },
  { id: "ieee", name: "IEEE Conference" },
  { id: "acm", name: "ACM Article" },
  { id: "custom", name: "Tuỳ chỉnh" },
];

function formatBytes(b: number) {
  if (b === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(b) / Math.log(k));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function CheckAIFormatTemplatePage() {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [isChecking, setIsChecking] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Vui lòng nhập tên đề tài";
    if (!desc.trim()) e.desc = "Vui lòng nhập mô tả ngắn";
    if (docFiles.length === 0) e.file = "Vui lòng đính kèm ít nhất 1 tệp";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pickFile = () => fileInputRef.current?.click();

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

  const summaryCard = useMemo(() => {
    if (!analysis)
      return { ring: "#e5e7eb", label: "Chưa có", color: "text-neutral-600" };
    if (analysis.level === "Tốt")
      return { ring: "#10b981", label: "Tốt", color: "text-emerald-600" };
    if (analysis.level === "Cần cải thiện")
      return {
        ring: "#f59e0b",
        label: "Cần cải thiện",
        color: "text-amber-600",
      };
    return { ring: "#ef4444", label: "Chưa đạt", color: "text-red-600" };
  }, [analysis]);

  const fakeAnalyze = async () => {
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }
    setIsChecking(true);
    setAnalysis(null);
    const id = toast.loading("AI đang kiểm tra định dạng & template…");
    setTimeout(() => {
      const seed =
        (title.length +
          desc.length +
          docFiles.reduce((s, f) => s + f.size, 0)) %
        100;
      const results: CheckResult[] = CHECKS.map((c, idx) => {
        const base = Math.floor((seed + idx * 7) % 100);
        const status = base >= 80 ? "pass" : base >= 55 ? "warn" : "fail";
        const score = Math.round(base);
        const note =
          c.id === "template"
            ? status === "pass"
              ? "Khớp đúng mẫu được chọn"
              : status === "warn"
                ? "Sai một số tiểu mục của template"
                : "Không khớp cấu trúc template"
            : c.id === "margins"
              ? status === "pass"
                ? "Lề chuẩn A4"
                : status === "warn"
                  ? "Sai lệch nhỏ về lề trên/dưới"
                  : "Sai khổ giấy hoặc lề không đúng"
              : c.id === "typography"
                ? status === "pass"
                  ? "Font & cỡ chữ đúng quy định"
                  : status === "warn"
                    ? "Một số đoạn dùng cỡ chữ chưa đúng"
                    : "Sai font/cỡ chữ ở nhiều vị trí"
                : c.id === "structure"
                  ? status === "pass"
                    ? "Mục lục tự động và đánh số đúng"
                    : status === "warn"
                      ? "Thiếu số ở vài đề mục"
                      : "Mục lục không khớp nội dung"
                  : c.id === "citations"
                    ? status === "pass"
                      ? "Định dạng trích dẫn hợp lệ"
                      : status === "warn"
                        ? "Chưa thống nhất kiểu trích dẫn"
                        : "Thiếu thông tin hoặc sai chuẩn"
                    : c.id === "figures"
                      ? status === "pass"
                        ? "Hình/bảng có chú thích đúng"
                        : status === "warn"
                          ? "Một số hình thiếu nguồn"
                          : "Thiếu đánh số và tham chiếu"
                      : status === "pass"
                        ? "Giãn dòng 1.5, căn đều"
                        : status === "warn"
                          ? "Một vài trang căn lề chưa chuẩn"
                          : "Giãn dòng/căn lề sai toàn văn";
        return { id: c.id, status, note, score };
      });
      const total = results.reduce((s, r) => {
        const w = CHECKS.find((c) => c.id === r.id)?.weight ?? 0;
        const ns = r.status === "pass" ? 1 : r.status === "warn" ? 0.6 : 0.2;
        return s + ns * w * 100;
      }, 0);
      const score = Math.round(total);
      const level =
        score >= 80 ? "Tốt" : score >= 60 ? "Cần cải thiện" : "Chưa đạt";
      const summary =
        level === "Tốt"
          ? "Bài đáp ứng phần lớn yêu cầu định dạng, có thể nộp sau khi rà soát lần cuối."
          : level === "Cần cải thiện"
            ? "Cần chỉnh một số hạng mục để đạt chuẩn nộp."
            : "Định dạng còn lệch chuẩn, cần chỉnh sửa đáng kể.";
      setAnalysis({ score, level, results, summary });
      setIsChecking(false);
      toast.success("Hoàn tất kiểm tra", { id });
    }, 1200);
  };

  const copyReport = async () => {
    if (!analysis) return;
    const lines = analysis.results
      .map((r) => {
        const label = CHECKS.find((c) => c.id === r.id)?.label ?? r.id;
        const s =
          r.status === "pass"
            ? "Đạt"
            : r.status === "warn"
              ? "Cảnh báo"
              : "Không đạt";
        return `- ${label}: ${s} (${r.score}%) — ${r.note}`;
      })
      .join("\n");
    const txt = `Báo cáo Check AI Format/Template
Đề tài: ${title}
Template: ${TEMPLATES.find((t) => t.id === templateId)?.name}
Điểm tổng: ${analysis.score} (${analysis.level})
Tóm tắt: ${analysis.summary}
Chi tiết:
${lines}`;
    try {
      await navigator.clipboard.writeText(txt);
      toast.success("Đã sao chép báo cáo");
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  const exportJSON = () => {
    if (!analysis) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            title,
            template: templateId,
            files: docFiles.map((f) => ({ name: f.name, size: f.size })),
            analysis,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "checkai-format-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                AI Check Format • Template
              </h2>
              <p className="text-xs text-white/70">
                Kiểm tra định dạng luận văn/đồ án theo mẫu
              </p>
            </div>
          </div>
          <Badge className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white">
            Prototype
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Thông tin đầu vào"
            desc="Chọn template, nhập tiêu đề và mô tả ngắn."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Template" required>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full rounded-xl border bg-white px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tên đề tài" required error={errors.title}>
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Ví dụ: Hệ thống phát hiện tin giả tiếng Việt"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Mô tả ngắn" required error={errors.desc}>
                  <textarea
                    className="min-h-[100px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    placeholder="Tóm tắt nội dung và mục tiêu để AI hiểu bối cảnh kiểm tra"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </Field>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium">Tài liệu cần kiểm tra</label>
                  <span className="text-xs text-neutral-500">
                    PDF, DOC, DOCX • Tối đa 20MB
                  </span>
                </div>
                <div
                  className={`group relative flex min-h-[90px] w-full items-start gap-3 rounded-2xl border-2 border-dashed p-3 transition ${
                    fileError || errors.file
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
                {errors.file ? (
                  <p className="text-xs font-medium text-red-600">
                    {errors.file}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setTemplateId(TEMPLATES[0].id);
                  setTitle("");
                  setDesc("");
                  setDocFiles([]);
                  setErrors({});
                  setAnalysis(null);
                }}
              >
                Làm mới
              </Button>
              <Button
                onClick={fakeAnalyze}
                disabled={isChecking}
                className="min-w-40"
              >
                {isChecking ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang kiểm tra…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Chạy Check AI
                  </span>
                )}
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title="Chi tiết kiểm tra"
            desc="Điểm và trạng thái cho từng hạng mục."
          >
            {isChecking ? (
              <div className="space-y-3">
                <div className="h-8 w-40 animate-pulse rounded-lg bg-neutral-200" />
                <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
                <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
                <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
              </div>
            ) : analysis ? (
              <div className="space-y-3">
                {analysis.results.map((r) => {
                  const c = CHECKS.find((x) => x.id === r.id)!;
                  const color =
                    r.status === "pass"
                      ? "text-emerald-600 bg-emerald-50"
                      : r.status === "warn"
                        ? "text-amber-600 bg-amber-50"
                        : "text-red-600 bg-red-50";
                  const Icon =
                    r.status === "pass" ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : r.status === "warn" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    );
                  return (
                    <div
                      key={r.id}
                      className="flex items-start justify-between rounded-xl border p-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 ring-1 ring-neutral-200 ring-inset">
                            {c.icon}
                          </div>
                          <span className="text-sm font-semibold">
                            {c.label}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] ${color}`}
                          >
                            {Icon}
                            {r.status === "pass"
                              ? "Đạt"
                              : r.status === "warn"
                                ? "Cảnh báo"
                                : "Không đạt"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-neutral-600">
                          {r.note}
                        </div>
                      </div>
                      <div className="ml-4 w-28 shrink-0 text-right">
                        <div className="text-xs text-neutral-500">Điểm</div>
                        <div className="text-lg font-bold">{r.score}%</div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-200">
                          <div
                            className="h-full rounded-full bg-neutral-900"
                            style={{ width: `${r.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={copyReport}
                    className="inline-flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Sao chép báo cáo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportJSON}
                    className="inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Tải JSON
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border p-4 text-sm text-neutral-600">
                Chưa có kết quả. Hãy chạy Check AI.
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            title="Đánh giá tổng quan"
            desc="Tóm tắt điểm và mức độ đạt chuẩn."
            icon={<ClipboardList className="h-4 w-4" />}
          >
            <div className="flex items-center gap-4">
              <div
                className="grid h-24 w-24 place-items-center rounded-full bg-neutral-100"
                style={{
                  background: `conic-gradient(${summaryCard.ring} ${(analysis?.score ?? 0) * 3.6}deg, #e5e7eb 0)`,
                }}
              >
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center">
                  <div className="text-xl font-bold">
                    {analysis?.score ?? 0}%
                  </div>
                  <div className="text-[10px] text-neutral-500">Điểm tổng</div>
                </div>
              </div>
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 ${analysis ? "" : "bg-neutral-100"}`}
                >
                  <ClipboardCheck className={`h-4 w-4 ${summaryCard.color}`} />
                  <span
                    className={`text-sm font-semibold ${summaryCard.color}`}
                  >
                    {summaryCard.label}
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-600">
                  {analysis?.summary ?? "Kết quả sẽ hiển thị sau khi kiểm tra."}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border p-2">
                    <div className="text-neutral-500">Template</div>
                    <div className="font-medium">
                      {TEMPLATES.find((t) => t.id === templateId)?.name}
                    </div>
                  </div>
                  <div className="rounded-lg border p-2">
                    <div className="text-neutral-500">Số tệp</div>
                    <div className="font-medium">{docFiles.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Gợi ý cải thiện"
            desc="Ưu tiên các hạng mục có trạng thái Cảnh báo/Không đạt."
            icon={<CheckCircle2 className="h-4 w-4" />}
          >
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>
                Tải template gốc và áp dụng Styles để đồng bộ font, heading,
                spacing.
              </li>
              <li>
                Đảm bảo mục lục tự động, không gõ tay; cập nhật Numbering cho
                tất cả đề mục.
              </li>
              <li>
                Thiết lập lề A4: Trái 3.5cm, Phải 2.0cm, Trên/Dưới 2.5cm (tuỳ
                chuẩn).
              </li>
              <li>
                Thống nhất kiểu trích dẫn (IEEE/APA) và định dạng danh mục tài
                liệu.
              </li>
              <li>
                Đặt caption cho tất cả Hình/Bảng và tham chiếu chéo trong nội
                dung.
              </li>
            </ul>
            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
              <Sparkles className="h-3.5 w-3.5" />
              Gợi ý tự động dựa trên template đã chọn.
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

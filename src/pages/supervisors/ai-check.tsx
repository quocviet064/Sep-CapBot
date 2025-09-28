import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import {
  BookOpen,
  Brain,
  Loader2,
  Upload,
  FileText,
  X,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Sparkles,
  BarChart2,
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

type Candidate = {
  id: string;
  title: string;
  description: string;
  year: number;
  owner: string;
  category: string;
};

type Match = Candidate & { similarity: number };

const SAMPLE_DB: Candidate[] = [
  {
    id: "T001",
    title: "Hệ thống gợi ý phim sử dụng học sâu",
    description:
      "Xây dựng hệ thống gợi ý nội dung dựa trên mạng nơ-ron, so sánh với CF truyền thống, đánh giá trên tập MovieLens.",
    year: 2023,
    owner: "Nguyễn Văn A",
    category: "AI",
  },
  {
    id: "T002",
    title: "Nhận dạng cảm xúc từ giọng nói",
    description:
      "Trích xuất đặc trưng MFCC, sử dụng CNN và LSTM để phân loại cảm xúc tiếng Việt.",
    year: 2022,
    owner: "Trần Thị B",
    category: "AI",
  },
  {
    id: "T003",
    title: "Phân tích hành vi người dùng trong thương mại điện tử",
    description:
      "Thu thập log truy cập, khai phá chuỗi hành vi và dự đoán xác suất mua hàng.",
    year: 2021,
    owner: "Lê Văn C",
    category: "Data",
  },
  {
    id: "T004",
    title: "Hệ thống phát hiện tin giả tiếng Việt",
    description:
      "Tiền xử lý văn bản, fine-tune PhoBERT và RoBERTa cho bài toán phân loại tin giả.",
    year: 2024,
    owner: "Phạm D",
    category: "NLP",
  },
  {
    id: "T005",
    title: "Ứng dụng thị giác máy tính đếm người trong siêu thị",
    description:
      "Áp dụng YOLOv8 và DeepSORT đếm người theo thời gian thực, tối ưu trên GPU.",
    year: 2024,
    owner: "Hoàng E",
    category: "CV",
  },
  {
    id: "T006",
    title: "Chatbot tư vấn tuyển sinh",
    description:
      "Triển khai chatbot dựa trên RAG, tích hợp tìm kiếm vector và dữ liệu FAQ trường.",
    year: 2023,
    owner: "Võ F",
    category: "NLP",
  },
  {
    id: "T007",
    title: "Dự báo nhu cầu taxi theo thời gian",
    description:
      "Sử dụng ARIMA, Prophet và LSTM để dự báo chuỗi thời gian nhu cầu di chuyển.",
    year: 2022,
    owner: "Đặng G",
    category: "Data",
  },
];

function tokenize(v: string) {
  return v
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function jaccard(a: string[], b: string[]) {
  const sa = new Set(a);
  const sb = new Set(b);
  const inter = [...sa].filter((x) => sb.has(x)).length;
  const uni = new Set([...a, ...b]).size;
  return uni === 0 ? 0 : inter / uni;
}

function scoreTopic(inputTitle: string, inputDesc: string, c: Candidate) {
  const t1 = tokenize(inputTitle);
  const d1 = tokenize(inputDesc);
  const t2 = tokenize(c.title);
  const d2 = tokenize(c.description);
  const sTitle = jaccard(t1, t2);
  const sDesc = jaccard(d1, d2);
  const s = Math.max(0, Math.min(1, sTitle * 0.65 + sDesc * 0.35));
  return Math.round(s * 100);
}

function levelFromScore(s: number) {
  if (s >= 80)
    return {
      level: "Cao",
      color: "text-red-600",
      bg: "bg-red-50",
      ring: "#ef4444",
    };
  if (s >= 60)
    return {
      level: "Trung bình",
      color: "text-amber-600",
      bg: "bg-amber-50",
      ring: "#f59e0b",
    };
  if (s >= 40)
    return {
      level: "Thấp",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "#10b981",
    };
  return {
    level: "Rất thấp",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "#10b981",
  };
}

function formatBytes(b: number) {
  if (b === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(b) / Math.log(k));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function TopicDuplicateCheckerPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [threshold, setThreshold] = useState(60);
  const [results, setResults] = useState<Match[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Vui lòng nhập tên đề tài";
    if (!desc.trim()) e.desc = "Vui lòng nhập mô tả/tóm tắt";
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
    if (f.size > 20 * 1024 * 1024) return "Tối đa 20MB";
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

  const filtered = useMemo(() => {
    if (!results) return null;
    return results.filter((r) => r.similarity >= threshold);
  }, [results, threshold]);

  const topScore = useMemo(() => {
    if (!results || results.length === 0) return 0;
    return Math.max(...results.map((r) => r.similarity));
  }, [results]);

  const onCheck = async () => {
    if (!validate()) {
      toast.error("Vui lòng điền đủ thông tin bắt buộc");
      return;
    }
    setIsChecking(true);
    setResults(null);
    const id = toast.loading("AI đang phân tích trùng lặp…");
    setTimeout(() => {
      const scored = SAMPLE_DB.map((c) => ({
        ...c,
        similarity: scoreTopic(title, desc, c),
      }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 6);
      setResults(scored);
      setIsChecking(false);
      toast.success("Phân tích hoàn tất", { id });
    }, 1200);
  };

  const onCopyReport = async () => {
    if (!results) return;
    const lines = results
      .map(
        (r, i) =>
          `${i + 1}. ${r.title} (${r.year}) — ${r.owner} • ${r.similarity}%`,
      )
      .join("\n");
    const txt = `Báo cáo kiểm tra trùng lặp đề tài\nĐề tài: ${title}\nNgưỡng: ${threshold}%\nKết quả:\n${lines}`;
    try {
      await navigator.clipboard.writeText(txt);
      toast.success("Đã sao chép báo cáo");
    } catch {
      toast.error("Không thể sao chép");
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
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                AI Check Duplicate đề tài
              </h2>
              <p className="text-xs text-white/70">
                Phát hiện trùng lặp và gợi ý cải thiện
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white">
              Bản thử nghiệm
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Nhập thông tin"
            desc="Điền tiêu đề và mô tả ngắn cho đề tài."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Tên đề tài" required error={errors.title}>
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Ví dụ: Hệ thống phát hiện tin giả tiếng Việt"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>
              <Field label="Ngưỡng cảnh báo" hint={`${threshold}%`}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full accent-neutral-900"
                  />
                  <div className="w-12 text-right text-sm font-semibold">
                    {threshold}%
                  </div>
                </div>
              </Field>
              <div className="md:col-span-2">
                <Field label="Mô tả ngắn" required error={errors.desc}>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
                    placeholder="Tóm tắt mục tiêu, phương pháp dự kiến, phạm vi…"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </Field>
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium">Tài liệu tham chiếu</label>
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
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setTitle("");
                  setDesc("");
                  setErrors({});
                  setDocFiles([]);
                  setResults(null);
                }}
              >
                Làm mới
              </Button>
              {/* <Button
                onClick={onCheck}
                disabled={isChecking}
                className="min-w-36"
              >
                {isChecking ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang kiểm tra…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Kiểm tra trùng lặp
                  </span>
                )}
              </Button> */}
            </div>
          </SectionCard>

          <SectionCard
            title="Kết quả chi tiết"
            desc="Danh sách đề tài tương tự cùng điểm tương đồng."
          >
            {isChecking ? (
              <div className="space-y-3">
                <div className="h-8 w-40 animate-pulse rounded-lg bg-neutral-200" />
                <div className="h-28 animate-pulse rounded-xl bg-neutral-100" />
                <div className="h-28 animate-pulse rounded-xl bg-neutral-100" />
                <div className="h-28 animate-pulse rounded-xl bg-neutral-100" />
              </div>
            ) : results ? (
              <div className="space-y-3">
                {filtered && filtered.length > 0 ? (
                  filtered.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-start justify-between rounded-xl border p-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge className="rounded-full bg-neutral-100 text-[10px]">
                            #{r.id}
                          </Badge>
                          <span className="line-clamp-2 text-sm font-semibold">
                            {r.title}
                          </span>
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs text-neutral-600">
                          {r.description}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                          <span>{r.owner}</span>
                          <span>•</span>
                          <span>{r.year}</span>
                          <span>•</span>
                          <span>{r.category}</span>
                        </div>
                      </div>
                      <div className="ml-4 w-28 shrink-0 text-right">
                        <div className="text-xs text-neutral-500">
                          Similarity
                        </div>
                        <div className="text-lg font-bold">{r.similarity}%</div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-200">
                          <div
                            className="h-full rounded-full bg-neutral-900"
                            style={{ width: `${r.similarity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border p-4 text-sm text-neutral-600">
                    Không có đề tài nào vượt ngưỡng
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={onCopyReport}
                    className="inline-flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Sao chép báo cáo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border p-4 text-sm text-neutral-600">
                Chưa có kết quả. Hãy điền thông tin và bấm Kiểm tra trùng lặp.
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            title="Đánh giá tổng quan"
            desc="Mức độ rủi ro trùng lặp của đề tài hiện tại."
            icon={<BarChart2 className="h-4 w-4" />}
          >
            <div className="flex items-center gap-4">
              <div
                className="grid h-24 w-24 place-items-center rounded-full bg-neutral-100"
                style={{
                  background: `conic-gradient(${levelFromScore(topScore).ring} ${topScore * 3.6}deg, #e5e7eb 0)`,
                }}
              >
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center">
                  <div className="text-xl font-bold">{topScore}%</div>
                  <div className="text-[10px] text-neutral-500">Cao nhất</div>
                </div>
              </div>
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 ${levelFromScore(topScore).bg}`}
                >
                  {topScore >= 60 ? (
                    <AlertTriangle
                      className={`h-4 w-4 ${levelFromScore(topScore).color}`}
                    />
                  ) : (
                    <ShieldCheck
                      className={`h-4 w-4 ${levelFromScore(topScore).color}`}
                    />
                  )}
                  <span
                    className={`text-sm font-semibold ${levelFromScore(topScore).color}`}
                  >
                    {levelFromScore(topScore).level}
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-600">
                  Điểm cao nhất trong các đề tài tương tự. Điều chỉnh ngưỡng để
                  lọc kết quả hiển thị.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Gợi ý cải thiện"
            desc="Một số mẹo để giảm trùng lặp."
          >
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>
                Nhấn mạnh khác biệt: điều chỉnh phạm vi, dữ liệu, hoặc phương
                pháp để tạo điểm mới.
              </li>
              <li>
                Đổi cách diễn đạt tiêu đề, tránh trùng cụm từ thông dụng với các
                đề tài phổ biến.
              </li>
              <li>
                Bổ sung ràng buộc đánh giá hoặc bộ dữ liệu độc quyền để tăng
                tính độc đáo.
              </li>
              <li>
                Đính kèm đề cương chi tiết để AI có thêm ngữ cảnh khi so khớp.
              </li>
            </ul>
            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
              <Sparkles className="h-3.5 w-3.5" />
              Gợi ý được sinh tự động dựa trên xu hướng đề tài gần đây.
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
              Bạn có muốn sử dụng gợi ý này.
            </div>
            <Button
              onClick={onCheck}
              disabled={isChecking}
              className="min-w-36"
            >
              {isChecking ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang kiểm tra…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Xác nhận
                </span>
              )}
            </Button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

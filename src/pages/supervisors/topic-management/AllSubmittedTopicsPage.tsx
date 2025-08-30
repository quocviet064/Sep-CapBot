// src/pages/topics/AllSubmittedTopicsPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  BookOpen,
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Archive,
  Users,
  CalendarDays,
  Tag,
  Layers,
  LayoutGrid,
  Rows,
  ArrowLeft,
  ArrowRight,
  Eye,
  Download,
  ArrowUpAZ,
  Clock,
} from "lucide-react";

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

type Topic = {
  id: number;
  title: string;
  description: string;
  category: "AI" | "NLP" | "Data" | "CV" | "IoT" | "Web";
  semester: string;
  owner: string;
  status: "Approved" | "Pending" | "Rejected" | "Archived";
  submittedAt: string;
  maxStudents: number;
  registered: number;
};

const FAKE_TOPICS: Topic[] = [
  {
    id: 101,
    title: "Hệ thống phát hiện tin giả tiếng Việt",
    description:
      "Fine-tune PhoBERT, xây dựng pipeline phân loại với dữ liệu báo chí.",
    category: "NLP",
    semester: "HK1 2024-2025",
    owner: "Nguyễn Văn A",
    status: "Approved",
    submittedAt: "2024-09-15",
    maxStudents: 5,
    registered: 5,
  },
  {
    id: 102,
    title: "Ứng dụng thị giác máy tính đếm người theo thời gian thực",
    description: "YOLOv8 + DeepSORT, tối ưu hóa tốc độ inference.",
    category: "CV",
    semester: "HK1 2024-2025",
    owner: "Trần Thị B",
    status: "Pending",
    submittedAt: "2024-10-02",
    maxStudents: 4,
    registered: 3,
  },
  {
    id: 103,
    title: "Hệ thống gợi ý phim sử dụng học sâu",
    description:
      "So sánh Matrix Factorization và Deep Learning trên MovieLens.",
    category: "AI",
    semester: "HK2 2023-2024",
    owner: "Lê Văn C",
    status: "Approved",
    submittedAt: "2024-03-12",
    maxStudents: 5,
    registered: 4,
  },
  {
    id: 104,
    title: "Dự báo nhu cầu taxi theo thời gian",
    description: "ARIMA, Prophet, LSTM trên dữ liệu chuỗi thời gian thành phố.",
    category: "Data",
    semester: "HK1 2023-2024",
    owner: "Phạm D",
    status: "Rejected",
    submittedAt: "2023-10-03",
    maxStudents: 3,
    registered: 0,
  },
  {
    id: 105,
    title: "Giám sát môi trường IoT bằng cảm biến đa điểm",
    description:
      "Thiết kế mạng cảm biến, truyền dữ liệu về gateway và dashboard.",
    category: "IoT",
    semester: "HK2 2024-2025",
    owner: "Hoàng E",
    status: "Pending",
    submittedAt: "2025-02-18",
    maxStudents: 6,
    registered: 2,
  },
  {
    id: 106,
    title: "Chatbot tư vấn tuyển sinh dùng RAG",
    description: "Kết hợp vector search và LLM để trả lời câu hỏi nhập học.",
    category: "NLP",
    semester: "HK2 2023-2024",
    owner: "Võ F",
    status: "Approved",
    submittedAt: "2024-05-28",
    maxStudents: 4,
    registered: 4,
  },
  {
    id: 107,
    title: "Nhận dạng cảm xúc giọng nói tiếng Việt",
    description: "MFCC + CNN/LSTM cho tác vụ SER tiếng Việt.",
    category: "AI",
    semester: "HK1 2024-2025",
    owner: "Đặng G",
    status: "Archived",
    submittedAt: "2024-11-21",
    maxStudents: 3,
    registered: 1,
  },
  {
    id: 108,
    title: "Hệ thống theo dõi sản phẩm bằng RFID",
    description: "Thiết kế giải pháp truy vết hàng hóa trong kho.",
    category: "IoT",
    semester: "HK1 2024-2025",
    owner: "Đỗ H",
    status: "Approved",
    submittedAt: "2024-09-02",
    maxStudents: 5,
    registered: 5,
  },
  {
    id: 109,
    title: "Phân tích hành vi người dùng trên trang thương mại điện tử",
    description: "Event tracking, funnel analysis, RFM segmentation.",
    category: "Data",
    semester: "HK2 2023-2024",
    owner: "Hà I",
    status: "Pending",
    submittedAt: "2024-04-01",
    maxStudents: 5,
    registered: 2,
  },
  {
    id: 110,
    title: "Nền tảng web học lập trình tương tác",
    description: "Xây dựng trình chấm tự động và sandbox an toàn.",
    category: "Web",
    semester: "HK1 2024-2025",
    owner: "Bùi K",
    status: "Approved",
    submittedAt: "2024-10-11",
    maxStudents: 6,
    registered: 6,
  },
  {
    id: 111,
    title: "Tối ưu hóa đường đi robot tự hành trong kho",
    description: "A*, D* Lite, heuristic search với ràng buộc va chạm.",
    category: "AI",
    semester: "HK2 2024-2025",
    owner: "Lý L",
    status: "Pending",
    submittedAt: "2025-01-06",
    maxStudents: 5,
    registered: 1,
  },
  {
    id: 112,
    title: "Nhận dạng biển số xe thời gian thực",
    description: "OCR + tracking, tối ưu cho camera giao thông.",
    category: "CV",
    semester: "HK2 2023-2024",
    owner: "Mai M",
    status: "Rejected",
    submittedAt: "2024-02-20",
    maxStudents: 4,
    registered: 0,
  },
  {
    id: 113,
    title: "Phân loại chủ đề bài báo tiếng Việt",
    description: "Sử dụng transformers và phân cụm hỗ trợ.",
    category: "NLP",
    semester: "HK1 2023-2024",
    owner: "Ngô N",
    status: "Archived",
    submittedAt: "2023-09-05",
    maxStudents: 5,
    registered: 3,
  },
  {
    id: 114,
    title: "Dự báo tồn kho bằng mô hình chuỗi thời gian",
    description: "Kết hợp SARIMA và XGBoost, đánh giá lỗi MAPE.",
    category: "Data",
    semester: "HK1 2024-2025",
    owner: "Phan O",
    status: "Approved",
    submittedAt: "2024-09-25",
    maxStudents: 4,
    registered: 4,
  },
  {
    id: 115,
    title: "Phát hiện bất thường mạng bằng học máy",
    description: "Isolation Forest và Autoencoder cho dữ liệu lưu lượng.",
    category: "AI",
    semester: "HK2 2024-2025",
    owner: "Quách P",
    status: "Pending",
    submittedAt: "2025-03-03",
    maxStudents: 5,
    registered: 2,
  },
];

const STATUS_META: Record<
  Topic["status"],
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  Approved: {
    label: "Đã duyệt",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Pending: {
    label: "Chờ duyệt",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Rejected: {
    label: "Từ chối",
    icon: <XCircle className="h-3.5 w-3.5" />,
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  Archived: {
    label: "Lưu trữ",
    icon: <Archive className="h-3.5 w-3.5" />,
    badgeClass: "bg-neutral-100 text-neutral-700 border-neutral-200",
  },
};

const CATEGORIES = ["AI", "NLP", "Data", "CV", "IoT", "Web"] as const;
const SEMESTERS = [
  "HK1 2024-2025",
  "HK2 2024-2025",
  "HK2 2023-2024",
  "HK1 2023-2024",
] as const;

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AllSubmittedTopicsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Topic["status"]>("all");
  const [category, setCategory] = useState<"all" | (typeof CATEGORIES)[number]>(
    "all",
  );
  const [semester, setSemester] = useState<"all" | (typeof SEMESTERS)[number]>(
    "all",
  );
  const [sort, setSort] = useState<
    "newest" | "oldest" | "title" | "registered"
  >("newest");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    let data = [...FAKE_TOPICS];
    if (q.trim()) {
      const s = q.toLowerCase();
      data = data.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s) ||
          t.owner.toLowerCase().includes(s),
      );
    }
    if (status !== "all") data = data.filter((t) => t.status === status);
    if (category !== "all") data = data.filter((t) => t.category === category);
    if (semester !== "all") data = data.filter((t) => t.semester === semester);
    switch (sort) {
      case "oldest":
        data.sort(
          (a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt),
        );
        break;
      case "title":
        data.sort((a, b) => a.title.localeCompare(b.title, "vi"));
        break;
      case "registered":
        data.sort(
          (a, b) => b.registered / b.maxStudents - a.registered / a.maxStudents,
        );
        break;
      default:
        data.sort(
          (a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt),
        );
    }
    return data;
  }, [q, status, category, semester, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const stats = useMemo(() => {
    const total = FAKE_TOPICS.length;
    const approved = FAKE_TOPICS.filter((t) => t.status === "Approved").length;
    const pending = FAKE_TOPICS.filter((t) => t.status === "Pending").length;
    const rejected = FAKE_TOPICS.filter((t) => t.status === "Rejected").length;
    return { total, approved, pending, rejected };
  }, []);

  const exportCSV = () => {
    const rows = [
      [
        "ID",
        "Tiêu đề",
        "Mô tả",
        "Danh mục",
        "Kỳ học",
        "Người tạo",
        "Trạng thái",
        "Nộp lúc",
        "SV/Max",
      ].join(","),
      ...filtered.map((t) =>
        [
          t.id,
          `"${t.title.replace(/"/g, '""')}"`,
          `"${t.description.replace(/"/g, '""')}"`,
          t.category,
          t.semester,
          t.owner,
          STATUS_META[t.status].label,
          formatDate(t.submittedAt),
          `${t.registered}/${t.maxStudents}`,
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "topics_submitted.csv";
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
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Tất cả đề tài đã nộp</h2>
              <p className="text-xs text-white/70">
                Quản lý, lọc và xuất danh sách đề tài trong hệ thống
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white">
              Tổng {stats.total}
            </Badge>
            <Badge className="rounded-full bg-emerald-50/20 px-2 py-0.5 text-[11px] text-white/90">
              Đã duyệt {stats.approved}
            </Badge>
            <Badge className="rounded-full bg-amber-50/20 px-2 py-0.5 text-[11px] text-white/90">
              Chờ duyệt {stats.pending}
            </Badge>
            <Badge className="rounded-full bg-red-50/20 px-2 py-0.5 text-[11px] text-white/90">
              Từ chối {stats.rejected}
            </Badge>
          </div>
        </div>
      </div>

      <SectionCard
        title="Bộ lọc & thao tác"
        icon={<Filter className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <div className="col-span-2 flex items-center rounded-xl border bg-white px-3">
            <Search className="h-4 w-4 opacity-60" />
            <input
              className="h-9 w-full bg-transparent px-2 text-sm outline-none"
              placeholder="Tìm theo tiêu đề, mô tả hoặc người tạo…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="justify-between rounded-xl px-3 py-2 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <Tag className="h-4 w-4 opacity-70" />
                  {status === "all" ? "Trạng thái" : STATUS_META[status].label}
                </span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-xl">
              <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["all", "Approved", "Pending", "Rejected", "Archived"].map(
                (s) => (
                  <DropdownMenuItem
                    key={s}
                    className="cursor-pointer text-sm"
                    onClick={() => {
                      setStatus(s as any);
                      setPage(1);
                    }}
                  >
                    {s === "all"
                      ? "Tất cả"
                      : STATUS_META[s as Topic["status"]].label}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="justify-between rounded-xl px-3 py-2 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <Layers className="h-4 w-4 opacity-70" />
                  {category === "all" ? "Danh mục" : category}
                </span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-xl">
              <DropdownMenuLabel>Danh mục</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["all", ...CATEGORIES].map((c) => (
                <DropdownMenuItem
                  key={c}
                  className="cursor-pointer text-sm"
                  onClick={() => {
                    setCategory(c as any);
                    setPage(1);
                  }}
                >
                  {c === "all" ? "Tất cả" : c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="justify-between rounded-xl px-3 py-2 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 opacity-70" />
                  {semester === "all" ? "Kỳ học" : semester}
                </span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-xl">
              <DropdownMenuLabel>Kỳ học</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["all", ...SEMESTERS].map((s) => (
                <DropdownMenuItem
                  key={s}
                  className="cursor-pointer text-sm"
                  onClick={() => {
                    setSemester(s as any);
                    setPage(1);
                  }}
                >
                  {s === "all" ? "Tất cả" : s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="justify-between rounded-xl px-3 py-2 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowUpAZ className="h-4 w-4 opacity-70" />
                  {sort === "newest"
                    ? "Mới nhất"
                    : sort === "oldest"
                      ? "Cũ nhất"
                      : sort === "registered"
                        ? "SV đăng ký nhiều"
                        : "Tên A-Z"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-xl">
              <DropdownMenuLabel>Sắp xếp</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                { key: "newest", label: "Mới nhất" },
                { key: "oldest", label: "Cũ nhất" },
                { key: "title", label: "Tên A-Z" },
                { key: "registered", label: "SV đăng ký nhiều" },
              ].map((o) => (
                <DropdownMenuItem
                  key={o.key}
                  className="cursor-pointer text-sm"
                  onClick={() => setSort(o.key as any)}
                >
                  {o.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            Hiển thị {pageData.length} trong tổng {filtered.length} kết quả
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setView("grid")}
              disabled={view === "grid"}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setView("table")}
              disabled={view === "table"}
            >
              <Rows className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={exportCSV}
            >
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
          </div>
        </div>
      </SectionCard>

      {view === "grid" ? (
        <SectionCard
          title="Danh sách đề tài"
          desc="Dạng lưới giúp xem nhanh thông tin chính."
        >
          {pageData.length === 0 ? (
            <div className="rounded-xl border p-4 text-sm text-neutral-600">
              Không có đề tài phù hợp bộ lọc.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pageData.map((t) => {
                const meta = STATUS_META[t.status];
                const p = Math.round(
                  (t.registered / Math.max(1, t.maxStudents)) * 100,
                );
                return (
                  <div
                    key={t.id}
                    className="group rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <Badge
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${meta.badgeClass}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(t.submittedAt)}
                      </span>
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm font-semibold">
                      {t.title}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-neutral-600">
                      {t.description}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border p-2">
                        <div className="text-neutral-500">Danh mục</div>
                        <div className="font-medium">{t.category}</div>
                      </div>
                      <div className="rounded-lg border p-2">
                        <div className="text-neutral-500">Kỳ học</div>
                        <div className="font-medium">{t.semester}</div>
                      </div>
                      <div className="rounded-lg border p-2">
                        <div className="text-neutral-500">Người tạo</div>
                        <div className="font-medium">{t.owner}</div>
                      </div>
                      <div className="rounded-lg border p-2">
                        <div className="text-neutral-500">SV đăng ký</div>
                        <div className="inline-flex items-center gap-1 font-medium">
                          <Users className="h-3.5 w-3.5" />
                          {t.registered}/{t.maxStudents}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-neutral-900 transition-all"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => navigate(`/topics/${t.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      ) : (
        <SectionCard title="Danh sách đề tài" desc="Dạng bảng chi tiết.">
          {pageData.length === 0 ? (
            <div className="rounded-xl border p-4 text-sm text-neutral-600">
              Không có đề tài phù hợp bộ lọc.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr className="text-xs">
                    <th className="px-3 py-2 text-left font-medium text-neutral-600">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-600">
                      Tiêu đề
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-600">
                      Danh mục
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-600">
                      Kỳ học
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-600">
                      Người tạo
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-600">
                      Trạng thái
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-600">
                      Nộp lúc
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-neutral-600">
                      SV/Max
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-neutral-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {pageData.map((t) => {
                    const meta = STATUS_META[t.status];
                    return (
                      <tr key={t.id} className="text-sm">
                        <td className="px-3 py-2 text-neutral-600">{t.id}</td>
                        <td className="px-3 py-2">
                          <div className="line-clamp-1 font-medium">
                            {t.title}
                          </div>
                          <div className="line-clamp-1 text-xs text-neutral-500">
                            {t.description}
                          </div>
                        </td>
                        <td className="px-3 py-2">{t.category}</td>
                        <td className="px-3 py-2">{t.semester}</td>
                        <td className="px-3 py-2">{t.owner}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${meta.badgeClass}`}
                          >
                            {meta.icon}
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {formatDate(t.submittedAt)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-neutral-500" />
                            {t.registered}/{t.maxStudents}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => navigate(`/topics/${t.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      <div className="flex items-center justify-between rounded-2xl border bg-white/70 px-3 py-2 shadow-sm">
        <div className="text-xs text-neutral-500">
          Trang {page}/{totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trước
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sau
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

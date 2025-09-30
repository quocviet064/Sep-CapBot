import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  generatePath,
} from "react-router-dom";
import { toast } from "sonner";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Download,
  Asterisk,
  Loader2,
} from "lucide-react";
import LoadingPage from "@/pages/loading-page";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import { Label } from "@/components/globals/atoms/label";
import { useCategories } from "@/hooks/useCategory";
import VersionTabs from "./TopicVersionTabs";
import {
  getTopicDetail,
  type TopicDetailResponse,
} from "@/services/topicService";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import { useUpdateTopic } from "@/hooks/useTopic";
import { formatDateTime } from "@/utils/formatter";

type Snapshot = {
  eN_Title?: string;
  vN_title?: string;
  abbreviation?: string;
  problem?: string;
  context?: string;
  content?: string;
  description?: string;
  objectives?: string;
  categoryId?: number;
  semesterId?: number;
  maxStudents?: number;
  categoryName?: string;
  semesterName?: string;
  fileToken?: string | null;
  topicId?: number;
  __fromSuggestion?: boolean;
};

type AxiosErrorLike = {
  response?: { data?: { detail?: unknown } };
  message?: string;
};

const MIN_SAVE_MS = 1200;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

export default function MyTopicReadonlyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { state } = useLocation() as { state?: { formSnapshot?: Snapshot } };
  const { mutateAsync: updateTopic } = useUpdateTopic();
  const [isUpdating, setIsUpdating] = useState(false);

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
  const [snapshotNames, setSnapshotNames] = useState<{
    categoryName?: string;
    semesterName?: string;
  }>({});

  useEffect(() => {
    const s = state?.formSnapshot;
    if (!s) return;
    setENTitle(s.eN_Title || "");
    setVNTitle(s.vN_title || "");
    setAbbreviation(s.abbreviation || "");
    setProblem(s.problem || "");
    setContext(s.context || "");
    setContent(s.content || "");
    setDescription(s.description || "");
    setObjectives(s.objectives || "");
    setCategoryId(s.categoryId ?? 0);
    setMaxStudents(s.maxStudents ?? 1);
    setSnapshotNames({
      categoryName: s.categoryName,
      semesterName: s.semesterName,
    });
  }, [state?.formSnapshot]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const detail = await getTopicDetail(Number(id));
        setData(detail);
        if (!state?.formSnapshot) {
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
          setSnapshotNames({
            categoryName: detail.categoryName,
            semesterName: detail.semesterName,
          });
        }
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "Không tải được chi tiết đề tài",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id, state?.formSnapshot]);

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
  const errors: Record<string, string> = {};

  const handleConfirmApply = async () => {
    if (!data) return;

    if (data.hasSubmitted) {
      toast.error("Đề tài đã nộp, không thể lưu chỉnh sửa.");
      return;
    }

    const requiredOk =
      eN_Title.trim() &&
      vN_title.trim() &&
      abbreviation.trim() &&
      problem.trim() &&
      context.trim() &&
      content.trim() &&
      description.trim() &&
      objectives.trim() &&
      Number(categoryId) > 0 &&
      Number(maxStudents) > 0;

    if (!requiredOk) {
      toast.error("Thiếu trường bắt buộc. Vui lòng quay lại trang chỉnh sửa.");
      return;
    }

    setIsUpdating(true);
    const tId = toast.loading("Đang áp dụng gợi ý...");

    const started = Date.now();
    try {
      await updateTopic({
        id: data.id,
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
      });

      const elapsed = Date.now() - started;
      if (elapsed < MIN_SAVE_MS) await sleep(MIN_SAVE_MS - elapsed);

      toast.success("Lưu thay đổi thành công", { id: tId });
      navigate(generatePath("/topics/my/:id", { id: String(data.id) }), {
        replace: true,
      });
    } catch (e: unknown) {
      const err = e as AxiosErrorLike | Error | unknown;
      const detail =
        (typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as AxiosErrorLike).response?.data?.detail !==
            "undefined" &&
          (err as AxiosErrorLike).response?.data?.detail) ||
        (typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message?: string }).message === "string" &&
          (err as { message?: string }).message) ||
        "Không thể lưu thay đổi. Vui lòng thử lại.";
      const elapsed = Date.now() - started;
      if (elapsed < MIN_SAVE_MS) await sleep(MIN_SAVE_MS - elapsed);
      toast.error(
        typeof detail === "string" ? detail : JSON.stringify(detail),
        {
          id: tId,
        },
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <LoadingPage />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p className="text-sm">Không tìm thấy đề tài.</p>;

  const categoryName =
    snapshotNames.categoryName ||
    categories?.find((c) => c.id === categoryId)?.name ||
    data.categoryName ||
    "—";
  const semesterName = snapshotNames.semesterName || data.semesterName || "—";

  return (
    <div className="space-y-4">
      {isUpdating && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-white/60 backdrop-blur-sm">
          <div className="w-[340px] rounded-2xl border bg-white p-5 shadow-xl ring-1 ring-black/5">
            <div className="mb-3 flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-700" />
              <div className="text-sm font-semibold text-neutral-800">
                Đang lưu thay đổi
              </div>
            </div>
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full w-1/3 animate-[loadingbar_1.1s_ease-in-out_infinite] rounded-full bg-neutral-300" />
            </div>
            <div className="text-[12px] text-neutral-500">
              Vui lòng đợi trong giây lát…
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes loadingbar{0%{transform:translateX(-100%)}50%{transform:translateX(50%)}100%{transform:translateX(200%)}}`}</style>

      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Chi tiết chỉnh sửa</h2>
              <p className="text-xs text-white/70">
                Xem và chỉnh sửa thông tin đề tài đồ án
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <>
                <Field label="Title (EN)" required error={errors.eN_Title}>
                  <input
                    value={eN_Title}
                    disabled
                    readOnly
                    className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                  />
                </Field>
                <Field label="Tiêu đề (VN)" required error={errors.vN_title}>
                  <input
                    value={vN_title}
                    disabled
                    readOnly
                    className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                  />
                </Field>
                <Field label="Viết tắt" required error={errors.abbreviation}>
                  <textarea
                    value={abbreviation}
                    disabled
                    readOnly
                    className="min-h-[90px] w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                  />
                </Field>
                <Field label="Vấn đề" required error={errors.problem}>
                  <textarea
                    value={problem}
                    disabled
                    readOnly
                    className="min-h-[90px] w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                  />
                </Field>
                <Field label="Bối cảnh" required error={errors.context}>
                  <textarea
                    value={context}
                    disabled
                    readOnly
                    className="min-h-[90px] w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                  />
                </Field>
                <Field label="Nội dung" required error={errors.content}>
                  <textarea
                    value={content}
                    disabled
                    readOnly
                    className="min-h-[90px] w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                  />
                </Field>
                <Field label="Mô tả" required error={errors.description}>
                  <textarea
                    value={description}
                    disabled
                    readOnly
                    className="min-h-[90px] w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                  />
                </Field>
                <Field label="Mục tiêu" required error={errors.objectives}>
                  <textarea
                    value={objectives}
                    disabled
                    readOnly
                    className="min-h-[90px] w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                  />
                </Field>
                <Field label="Danh mục" required error={errors.categoryId}>
                  <select
                    value={categoryId || ""}
                    disabled
                    className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
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
                    disabled
                    readOnly
                    className="w-full rounded-xl border bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                  />
                </Field>
              </>
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
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Tóm tắt" desc="Xem nhanh các thông tin đã chọn.">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Danh mục</span>
                  <span className="font-medium">{categoryName}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Học kỳ</span>
                  <span className="font-medium">{semesterName}</span>
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
              disabled={isUpdating}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleConfirmApply}
              disabled={isUpdating}
              className="inline-flex min-w-44 items-center gap-2"
              aria-busy={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Xác nhận chỉnh sửa"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/admin/evaluation/EvaluationCriteriaDetailPage.tsx
import { useEffect, useMemo, useState, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  Target,
  Percent,
  Info,
  CalendarClock,
  User2,
  Scale,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/globals/atoms/button";
import { Badge } from "@/components/globals/atoms/badge";
import LoadingPage from "@/pages/loading-page";
import { useCriteriaDetail } from "@/hooks/useEvaluationCriteria";
import { formatDateTime } from "@/utils/formatter";
import EvaluationCriteriaEditDialog from "./EvaluationCriteriaEditDialog";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-right shadow-sm">
      <div className="mb-0.5 flex items-center justify-end gap-1 text-[10px] tracking-wide text-white/70 uppercase">
        {icon ?? null}
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-white/80 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur",
        className || "",
      ].join(" ")}
    >
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-12 items-start gap-3 py-2">
      <div className="col-span-4 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-neutral-500 uppercase sm:col-span-3">
        {icon ? <span className="text-neutral-400">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div
        className={[
          "col-span-8 text-sm sm:col-span-9",
          mono ? "font-mono" : "",
        ].join(" ")}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

export default function EvaluationCriteriaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useCriteriaDetail(id);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const statusBadge = useMemo(
    () => (
      <Badge
        className={
          data?.isActive
            ? "bg-emerald-600 text-white"
            : "bg-neutral-300 text-neutral-800"
        }
      >
        {data?.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
    [data?.isActive],
  );

  if (isLoading) return <LoadingPage />;

  if (!data)
    return (
      <div className="rounded-2xl border bg-yellow-50 p-4 text-sm text-yellow-900">
        Không tìm thấy tiêu chí.
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Chi tiết tiêu chí</h2>
                <p className="text-xs text-white/70">
                  #{data.id} • {data.name}
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <StatCard
                label="Trạng thái"
                value={data.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
              />
              <StatCard
                label="Điểm tối đa"
                value={data.maxScore}
                icon={<Target className="h-3.5 w-3.5" />}
              />
              <StatCard
                label="Trọng số"
                value={data.weight}
                icon={<Percent className="h-3.5 w-3.5" />}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:hidden">
            <StatCard
              label="Trạng thái"
              value={data.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
            />
            <StatCard label="Điểm tối đa" value={data.maxScore} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section title="Thông tin" className="lg:col-span-2">
          <Row
            label="Tên tiêu chí"
            value={<span className="font-medium">{data.name}</span>}
            icon={<Info className="h-3.5 w-3.5" />}
          />
          <Row
            label="Mô tả"
            value={
              <div className="whitespace-pre-line">
                {data.description || "—"}
              </div>
            }
            icon={<BookOpen className="h-3.5 w-3.5" />}
          />
          <div className="my-2 border-t" />
          <Row
            label="Điểm tối đa"
            value={<span className="font-medium">{data.maxScore}</span>}
            icon={<Target className="h-3.5 w-3.5" />}
            mono
          />
          <Row
            label="Trọng số"
            value={<span className="font-medium">{data.weight}</span>}
            icon={<Scale className="h-3.5 w-3.5" />}
            mono
          />
          <Row label="Trạng thái" value={statusBadge} />
        </Section>

        <Section title="Hệ thống">
          <Row
            label="Ngày tạo"
            value={formatDateTime(data.createdAt)}
            icon={<CalendarClock className="h-3.5 w-3.5" />}
            mono
          />
          <Row
            label="Người tạo"
            value={data.createdBy || "—"}
            icon={<User2 className="h-3.5 w-3.5" />}
          />
          <Row
            label="Sửa lần cuối"
            value={
              data.lastModifiedAt &&
              data.lastModifiedAt !== "0001-01-01T00:00:00"
                ? formatDateTime(data.lastModifiedAt)
                : "—"
            }
            icon={<CalendarClock className="h-3.5 w-3.5" />}
            mono
          />
          <Row
            label="Người sửa cuối"
            value={data.lastModifiedBy || "—"}
            icon={<User2 className="h-3.5 w-3.5" />}
          />
        </Section>
      </div>

      <div className="sticky bottom-3 z-30">
        <div className="mx-auto flex max-w-5xl items-center rounded-2xl border bg-white/70 px-4 py-2 shadow-lg backdrop-blur">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <Button
            onClick={() => setOpenEdit(true)}
            className="mr-3 ml-auto inline-flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" /> Chỉnh sửa
          </Button>
        </div>
      </div>

      {openEdit && (
        <Suspense fallback={null}>
          <EvaluationCriteriaEditDialog
            isOpen={openEdit}
            onClose={() => setOpenEdit(false)}
            initial={{
              id: data.id,
              name: data.name,
              description: data.description || "",
              maxScore: data.maxScore,
              weight: data.weight,
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

// TopicAnalysisWithFilters.tsx
import {
  ChevronDown,
  CalendarDays,
  FolderOpen,
  Filter,
  List,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/globals/atoms/dropdown-menu";

export type TopicStats = {
  pending: number;
  approved: number;
  rejecting: number;
  total: number;
};

export type SimpleOption = { id: number; name: string };

export type StatusValue =
  | "all"
  | "Pending"
  | "UnderReview"
  | "Duplicate"
  | "RevisionRequired"
  | "EscalatedToModerator"
  | "Approved"
  | "Rejected";

export type StatusOption = { value: StatusValue; label: string };

type StatusCountMap = Partial<Record<Exclude<StatusValue, "all">, number>>;

type Props = {
  data: TopicStats;
  semesters: SimpleOption[];
  categories: SimpleOption[];
  statusOptions?: StatusOption[];
  selectedSemesterId?: number;
  selectedCategoryId?: number;
  selectedStatus?: StatusValue;
  onSelectSemester: (semesterId?: number) => void;
  onSelectCategory: (categoryId?: number) => void;
  onSelectStatus: (status: StatusValue) => void;
  statusCountMap?: StatusCountMap;
};

const defaultStatusOptions: StatusOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "Pending", label: "Pending" },
  { value: "UnderReview", label: "UnderReview" },
  { value: "Duplicate", label: "Duplicate" },
  { value: "RevisionRequired", label: "RevisionRequired" },
  { value: "EscalatedToModerator", label: "EscalatedToModerator" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

function KpiCard({
  active,
  icon,
  title,
  value,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  title: string;
  value: string | number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative overflow-hidden rounded-xl p-3.5 text-left transition",
        "bg-white ring-1 ring-slate-200 hover:-translate-y-[1px] hover:shadow-lg",
        active ? "ring-2 ring-slate-900" : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-300/35 to-sky-300/35 blur-2xl" />
      <div className="flex items-center justify-between">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
          {icon}
        </div>
        <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-medium text-slate-900/70 ring-1 ring-slate-900/10">
          KPI
        </span>
      </div>
      <div className="mt-2 text-[13px] text-slate-500">{title}</div>
      <div className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
        {value}
      </div>
    </button>
  );
}

function SelectCard({
  icon,
  title,
  subtitle,
  children,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={[
            "group relative w-full overflow-hidden rounded-xl p-3.5 text-left transition",
            "bg-white ring-1 ring-slate-200 hover:-translate-y-[1px] hover:shadow-lg",
            active ? "ring-2 ring-slate-900" : "",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-violet-300/30 to-fuchsia-300/30 blur-2xl" />
          <div className="flex items-center justify-between">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              {icon}
            </div>
            <ChevronDown size={16} className="opacity-70" />
          </div>
          <div className="mt-2 text-[13px] text-slate-500">{title}</div>
          <div className="mt-0.5 line-clamp-1 text-[15px] font-semibold text-slate-900">
            {subtitle}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TopicAnalysisWithFilters({
  data,
  semesters,
  categories,
  statusOptions = defaultStatusOptions,
  selectedSemesterId,
  selectedCategoryId,
  selectedStatus = "all",
  onSelectSemester,
  onSelectCategory,
  onSelectStatus,
  statusCountMap,
}: Props) {
  const semesterLabel =
    semesters.find((s) => s.id === selectedSemesterId)?.name || "Tất cả";
  const categoryLabel =
    categories.find((c) => c.id === selectedCategoryId)?.name || "Tất cả";
  const statusLabel =
    statusOptions.find((s) => s.value === selectedStatus)?.label || "Tất cả";

  const totalForCurrentStatus =
    selectedStatus === "all"
      ? data.total
      : (statusCountMap?.[selectedStatus as Exclude<StatusValue, "all">] ?? 0);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        active={
          selectedStatus === "all" && !selectedSemesterId && !selectedCategoryId
        }
        icon={<List size={18} />}
        title="Tất cả đề tài"
        value={fmt(totalForCurrentStatus)}
        onClick={() => {
          onSelectSemester(undefined);
          onSelectCategory(undefined);
          onSelectStatus("all");
        }}
      />

      <SelectCard
        active={!!selectedSemesterId}
        icon={<CalendarDays size={18} />}
        title="Học kỳ"
        subtitle={semesterLabel}
      >
        <DropdownMenuItem onClick={() => onSelectSemester(undefined)}>
          <div className="flex w-full items-center justify-between">
            <span>Tất cả</span>
            {!selectedSemesterId && <Check size={16} />}
          </div>
        </DropdownMenuItem>
        {semesters.map((s) => (
          <DropdownMenuItem key={s.id} onClick={() => onSelectSemester(s.id)}>
            <div className="flex w-full items-center justify-between">
              <span className="truncate">{s.name}</span>
              {selectedSemesterId === s.id && <Check size={16} />}
            </div>
          </DropdownMenuItem>
        ))}
      </SelectCard>

      <SelectCard
        active={!!selectedCategoryId}
        icon={<FolderOpen size={18} />}
        title="Danh mục"
        subtitle={categoryLabel}
      >
        <DropdownMenuItem onClick={() => onSelectCategory(undefined)}>
          <div className="flex w-full items-center justify-between">
            <span>Tất cả</span>
            {!selectedCategoryId && <Check size={16} />}
          </div>
        </DropdownMenuItem>
        {categories.map((c) => (
          <DropdownMenuItem key={c.id} onClick={() => onSelectCategory(c.id)}>
            <div className="flex w-full items-center justify-between">
              <span className="truncate">{c.name}</span>
              {selectedCategoryId === c.id && <Check size={16} />}
            </div>
          </DropdownMenuItem>
        ))}
      </SelectCard>

      <SelectCard
        active={selectedStatus !== "all"}
        icon={<Filter size={18} />}
        title="Trạng thái"
        subtitle={statusLabel}
      >
        {statusOptions.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onSelectStatus(opt.value)}
          >
            <div className="flex w-full items-center justify-between">
              <span>{opt.label}</span>
              {selectedStatus === opt.value && <Check size={16} />}
            </div>
          </DropdownMenuItem>
        ))}
      </SelectCard>
    </div>
  );
}

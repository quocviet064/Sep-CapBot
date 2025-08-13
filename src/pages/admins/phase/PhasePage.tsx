import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/globals/atoms/button";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { createPhaseColumns } from "./columnsPhases";
import { usePhases } from "@/hooks/usePhase";
import type { PhaseListItem } from "@/services/phaseService";
import PhaseDetailDialog from "./phase-detail-dialog";
import PhaseCreateDialog from "./phase-create-dialog";

const DEFAULT_VISIBILITY = {
  id: true,
  name: true,
  phaseTypeName: true,
  semesterName: true,
  startDate: true,
  endDate: true,
  submissionDeadline: true,
};

export default function PhasePage() {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>("");
  const [semesterId, setSemesterId] = useState<number | undefined>(undefined);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const { data, isLoading, error } = usePhases(
    semesterId,
    pageNumber,
    pageSize,
    keyword || undefined,
    undefined,
  );

  const items: PhaseListItem[] = useMemo(
    () => data?.listObjects ?? [],
    [data?.listObjects],
  );
  const totalPages = data?.totalPages ?? 1;
  const totalRecord = data?.paging?.totalRecord ?? 0;

  const columns = useMemo(
    () =>
      createPhaseColumns({
        onCopyId: () => toast.success("Đã sao chép mã giai đoạn"),
        onViewDetail: (id) => {
          setSelectedId(id);
          setOpenDetail(true);
        },
      }),
    [],
  );

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Giai đoạn</h2>
              <p className="text-xs text-white/70">
                Danh sách giai đoạn có phân trang, lọc theo học kỳ
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-right">
              <div className="text-[10px] tracking-wide text-white/70 uppercase">
                Tổng bản ghi
              </div>
              <div className="text-sm font-semibold">{totalRecord}</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-right">
              <div className="text-[10px] tracking-wide text-white/70 uppercase">
                Số trang
              </div>
              <div className="text-sm font-semibold">{totalPages}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 rounded-2xl border bg-white/70 p-3 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
            <Search className="h-4 w-4 opacity-60" />
            <input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPageNumber(1);
              }}
              placeholder="Tìm giai đoạn..."
              className="h-6 w-[220px] bg-transparent text-sm outline-none"
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
            <Filter className="h-4 w-4 opacity-60" />
            <input
              type="number"
              value={semesterId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setSemesterId(val === "" ? undefined : Number(val));
                setPageNumber(1);
              }}
              placeholder="SemesterId (tuỳ chọn)"
              className="h-6 w-[160px] bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Hiển thị</span>
          <select
            className="rounded-xl border bg-white px-3 py-2 text-sm outline-none"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageNumber(1);
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} dòng
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={() => {
              setKeyword("");
              setSemesterId(undefined);
              setPageNumber(1);
              setPageSize(10);
            }}
          >
            Đặt lại
          </Button>

          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo giai đoạn
          </Button>
        </div>
      </div>

      <div className="min-h-[520px] rounded-2xl border bg-white/70 px-4 py-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Danh sách giai đoạn</h3>

        <DataTable
          data={items}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={keyword}
          setSearch={setKeyword}
          placeholder="Tìm kiếm giai đoạn..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={totalPages}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>

      <PhaseDetailDialog
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        phaseId={selectedId}
      />
      <PhaseCreateDialog
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
      />
    </div>
  );
}

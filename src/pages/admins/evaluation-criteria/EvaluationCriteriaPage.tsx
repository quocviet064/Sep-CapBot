import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/globals/atoms/button";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import type { EvaluationCriteriaDTO } from "@/services/evaluationCriteriaService";
import {
  useActiveEvaluationCriteria,
  useDeleteEvaluationCriteria,
} from "@/hooks/useEvaluationCriteria";
import { createEvaluationCriteriaColumns } from "./columnsEvaluationCriteria";
import EvaluationCriteriaDetailDialog from "./evaluation-criteria-detail-dialog";
import EvaluationCriteriaCreateDialog from "./evaluation-criteria-create-dialog";

const DEFAULT_VISIBILITY = {
  id: false,
  name: true,
  maxScore: true,
  weight: true,
  description: true,
  createdAt: true,
  updatedAt: true,
};

export default function AdminEvaluationCriteriaPage() {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>("");
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const { data, isLoading, error } = useActiveEvaluationCriteria();
  const deleteMut = useDeleteEvaluationCriteria();

  const filtered: EvaluationCriteriaDTO[] = useMemo(() => {
    const list = data ?? [];
    if (!keyword.trim()) return list;
    const k = keyword.toLowerCase();
    return list.filter((i) => {
      const idMatch = String(i.id).toLowerCase().includes(k);
      const nameMatch = i.name.toLowerCase().includes(k);
      const descMatch = (i.description?.toLowerCase() || "").includes(k);
      return idMatch || nameMatch || descMatch;
    });
  }, [data, keyword]);

  const totalRecord = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecord / pageSize));
  const pagedItems = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageNumber, pageSize]);

  const columns = useMemo(
    () =>
      createEvaluationCriteriaColumns({
        onViewDetail: (id) => {
          setSelectedId(String(id));
          setOpenDetail(true);
        },
        onEdit: (item: EvaluationCriteriaDTO) => {
          setSelectedId(String(item.id));
          setOpenDetail(true);
        },
        onDelete: (id) => {
          const ok = window.confirm(
            "Bạn có chắc muốn xóa tiêu chí đánh giá này?",
          );
          if (!ok) return;
          deleteMut.mutate(id, {
            onSuccess: () => {
              if (selectedId === String(id)) {
                setOpenDetail(false);
                setSelectedId(null);
              }
            },
          });
        },
      }),
    [deleteMut, selectedId],
  );

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (pageNumber > totalPages) setPageNumber(totalPages);
  }, [pageNumber, totalPages]);

  if (isLoading) return <LoadingPage />;

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
              <h2 className="text-lg font-semibold">Tiêu chí đánh giá</h2>
              <p className="text-xs text-white/70">
                Danh sách tiêu chí (đang hoạt động)
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
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo tiêu chí
          </Button>
        </div>
      </div>

      <div className="min-h-[520px] rounded-2xl border bg-white/70 px-4 py-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Danh sách tiêu chí</h3>
        <DataTable
          data={pagedItems}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={keyword}
          setSearch={setKeyword}
          placeholder="Tìm kiếm tiêu chí..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={totalPages}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>

      <EvaluationCriteriaDetailDialog
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        criteriaId={selectedId}
      />
      <EvaluationCriteriaCreateDialog
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
      />
    </div>
  );
}

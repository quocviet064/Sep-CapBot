// src/pages/admin/evaluation/AdminEvaluationCriteriaPage.tsx
import { useEffect, useMemo, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/globals/atoms/button";
import { BookOpen, Plus, Loader2 } from "lucide-react";
import { DataTable } from "@/components/globals/atoms/data-table";
import { createCriteriaColumns } from "./columnsEvaluationCriteria";
import { useCriteria } from "@/hooks/useEvaluationCriteria";
import EvaluationCriteriaCreateDialog from "./EvaluationCriteriaCreateDialog";

const DEFAULT_VISIBILITY = {
  id: true,
  name: true,
  description: true,
  maxScore: true,
  weight: true,
  isActive: true,
  createdAt: true,
};

export default function AdminEvaluationCriteriaPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  const navigate = useNavigate();

  const { data, isLoading, error } = useCriteria({
    PageNumber: pageNumber,
    PageSize: pageSize,
    Keyword: keyword.trim() ? keyword.trim() : undefined,
  });

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const list = data?.listObjects ?? [];
  const totalPages = data?.totalPages ?? 1;

  const columns = useMemo(
    () =>
      createCriteriaColumns({
        onCopyId: () => toast.success("Đã sao chép mã tiêu chí"),
        onViewDetail: (id) => navigate(`/admin/evaluation/criteria/${id}`),
      }),
    [navigate],
  );

  useEffect(() => {
    setPageNumber(1);
  }, [pageSize, keyword]);

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
              <p className="text-xs text-white/70">Danh sách tiêu chí</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-right">
              <div className="text-[10px] tracking-wide text-white/70 uppercase">
                Tổng bản ghi
              </div>
              <div className="text-sm font-semibold">
                {data?.paging.totalRecord ?? 0}
              </div>
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
          <Button onClick={() => setOpenCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo tiêu chí
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm tiêu chí..."
            className="w-72 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60"
          />
        </div>
      </div>

      <div className="min-h-[520px] rounded-2xl border bg-white/70 px-4 py-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Danh sách tiêu chí</h3>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-white/60">
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải dữ liệu...
              </div>
            </div>
          )}
          <DataTable
            data={list}
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
      </div>

      {openCreate && (
        <Suspense fallback={null}>
          <EvaluationCriteriaCreateDialog
            isOpen={openCreate}
            onClose={() => setOpenCreate(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

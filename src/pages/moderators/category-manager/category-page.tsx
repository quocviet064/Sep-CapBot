import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/globals/atoms/button";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { useCategories } from "@/hooks/useCategory";
import CategoryDetailDialog from "./category-detail-dialog";
import CategoryCreateDialog from "./CategoryCreateDialog";
import { createColumns } from "./columns";
import type { CategoryType } from "@/schemas/categorySchema";

const DEFAULT_VISIBILITY = {
  id: false,
};

export default function ModeratorCategoryPage() {
  const { data, isLoading, error, refetch } = useCategories();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [openCreate, setOpenCreate] = useState<boolean>(false);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const filtered: CategoryType[] = useMemo(() => {
    const list = data ?? [];
    const k = keyword.trim().toLowerCase();
    if (!k) return list;
    return list.filter((i) => {
      const idMatch = String(i.id).toLowerCase().includes(k);
      const nameMatch = i.name?.toLowerCase().includes(k);
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

  useEffect(() => {
    if (pageNumber > totalPages) setPageNumber(totalPages);
  }, [pageNumber, totalPages]);

  const columns = useMemo(
    () =>
      createColumns({
        onViewDetail: (id) => {
          setSelectedId(id);
          setOpenDetail(true);
        },
      }),
    [],
  );

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Danh mục đề tài</h2>
              <p className="text-xs text-white/70">
                Quản lý danh mục và số lượng đề tài
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
          <Button onClick={() => setOpenCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo danh mục
          </Button>
        </div>
      </div>

      <div className="min-h-[520px] rounded-2xl border bg-white/70 px-4 py-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Danh sách</h3>
        <DataTable
          data={pagedItems}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={keyword}
          setSearch={setKeyword}
          placeholder="Tìm kiếm tên hoặc mô tả..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={totalPages}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>

      <CategoryDetailDialog
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        categoryId={selectedId}
        onUpdate={refetch}
      />
      <CategoryCreateDialog
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={refetch}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Search, Plus } from "lucide-react";
import { Button } from "@/components/globals/atoms/button";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { createPhaseTypeColumns } from "./columnsPhaseTypes";
import { usePhaseTypes, useCreatePhaseType } from "@/hooks/usePhaseType";
import type { PhaseType } from "@/schemas/phaseTypeSchema";
import PhaseTypeDetailDialog from "./phase-type-detail-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { Label } from "@/components/globals/atoms/label";

const DEFAULT_VISIBILITY = {
  id: true,
  name: true,
  description: true,
};

export default function PhaseTypePage() {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>("");

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  const { data, isLoading, error } = usePhaseTypes(
    pageNumber,
    pageSize,
    keyword || undefined,
    undefined,
  );

  const { mutate: createMutate, isPending: isCreating } = useCreatePhaseType();

  const items: PhaseType[] = useMemo(
    () => data?.listObjects ?? [],
    [data?.listObjects],
  );
  const totalPages = data?.totalPages ?? 1;
  const totalRecord = data?.paging?.totalRecord ?? 0;

  const columns = useMemo(
    () =>
      createPhaseTypeColumns({
        onCopyId: () => toast.success("Đã sao chép mã loại giai đoạn"),
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

  const handleCreate = () => {
    if (!createName.trim()) {
      toast.error("Tên loại giai đoạn là bắt buộc");
      return;
    }
    createMutate(
      {
        name: createName.trim(),
        description: createDescription.trim() || null,
      },
      {
        onSuccess: () => {
          setCreateName("");
          setCreateDescription("");
          setOpenCreate(false);

          setPageNumber(1);
        },
      },
    );
  };

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
              <h2 className="text-lg font-semibold">Loại giai đoạn</h2>
              <p className="text-xs text-white/70">
                Danh sách tất cả loại giai đoạn đang hoạt động
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
              placeholder="Tìm loại giai đoạn..."
              className="h-6 w-[220px] bg-transparent text-sm outline-none"
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
              setPageNumber(1);
              setPageSize(10);
            }}
          >
            Đặt lại
          </Button>

          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo loại giai đoạn
          </Button>
        </div>
      </div>

      <div className="min-h-[520px] rounded-2xl border bg-white/70 px-4 py-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">
          Danh sách loại giai đoạn
        </h3>

        <DataTable
          data={items}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={keyword}
          setSearch={setKeyword}
          placeholder="Tìm kiếm loại giai đoạn..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={totalPages}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>

      <PhaseTypeDetailDialog
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        phaseTypeId={selectedId}
      />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="min-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tạo loại giai đoạn</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo loại giai đoạn mới.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Tên loại giai đoạn *
              </Label>
              <input
                className="w-full rounded-sm border px-4 py-2 text-sm"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Nhập tên"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Mô tả</Label>
              <textarea
                className="w-full rounded-sm border px-4 py-2 text-sm"
                rows={3}
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Nhập mô tả (không bắt buộc)"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpenCreate(false);
              }}
              disabled={isCreating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !createName.trim()}
            >
              {isCreating ? "Đang tạo..." : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

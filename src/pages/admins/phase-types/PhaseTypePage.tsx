import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Plus, Loader2, Tag } from "lucide-react";
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
  DialogTitle,
} from "@/components/globals/atoms/dialog";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-white/80 shadow-sm ring-1 ring-black/5 backdrop-blur">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
function Row({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid grid-cols-[200px,1fr] items-center gap-4 py-3 md:grid-cols-[220px,1fr] lg:grid-cols-[240px,1fr]">
      <div className="min-w-0">
        <div
          className="text-[11px] font-semibold tracking-wide whitespace-nowrap text-neutral-500 uppercase"
          title={label}
        >
          {label}
        </div>
        {hint && <p className="mt-1 text-[11px] text-neutral-500">{hint}</p>}
      </div>
      <div className="min-w-0 overflow-hidden whitespace-nowrap">
        {children}
      </div>
    </div>
  );
}
function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border px-3.5 py-2.5 text-sm",
        "border-neutral-200 bg-white shadow-inner outline-none",
        "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60",
        props.className || "",
      ].join(" ")}
    />
  );
}
function FieldTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-xl border px-3.5 py-2.5 text-sm",
        "border-neutral-200 bg-white shadow-inner outline-none",
        "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60",
        props.className || "",
      ].join(" ")}
    />
  );
}

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
        <DialogContent className="min-w-[600px] overflow-hidden p-0">
          <div className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-violet-600" />
            <div
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(1200px 400px at -10% -40%, rgba(255,255,255,.35), transparent 60%), radial-gradient(900px 300px at 110% -30%, rgba(255,255,255,.25), transparent 60%)",
              }}
            />
            <div className="flex items-center justify-between px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-[18px] font-semibold">
                    Tạo loại giai đoạn
                  </DialogTitle>
                  <DialogDescription className="text-[12px] text-white/80">
                    Nhập thông tin để tạo loại giai đoạn mới.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 bg-neutral-50 px-6 py-6">
            <Section title="Thông tin bắt buộc">
              <Row label="Tên loại giai đoạn *">
                <FieldInput
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Nhập tên loại giai đoạn"
                  maxLength={200}
                />
              </Row>
              <div className="border-t" />
              <Row label="Mô tả" hint="Tối đa ~500 ký tự">
                <div className="break-words whitespace-normal">
                  <FieldTextarea
                    rows={4}
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="Nhập mô tả (không bắt buộc)"
                  />
                </div>
              </Row>
            </Section>
          </div>

          <DialogFooter className="sticky bottom-0 z-10 border-t bg-white/85 px-6 py-4 backdrop-blur">
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenCreate(false)}
                disabled={isCreating}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !createName.trim()}
                className="gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Tạo
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

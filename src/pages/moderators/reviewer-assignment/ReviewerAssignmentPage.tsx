import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { Button } from "@/components/globals/atoms/button";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { createReviewerAssignmentColumns } from "./columnsReviewerAssignments";
import { useSubmissions } from "@/hooks/useSubmission";
import type { SubmissionType } from "@/services/submissionService";
import { useBulkAssignReviewers } from "@/hooks/useReviewerAssignment";
import ReviewerPickerDialog from "./ReviewerPickerDialog";
import SubmissionDetailDialog from "./SubmissionDetailDialog";

const DEFAULT_VISIBILITY = {
  submittedByName: true,
  submissionRound: true,
  submittedAt: true,
};

export default function ReviewerAssignmentPage() {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>("");

  const { data, isLoading, error } = useSubmissions({
    PageNumber: pageNumber,
    PageSize: pageSize,
    Keyword: keyword || undefined,
  });

  const [openAssign, setOpenAssign] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | number | undefined
  >(undefined);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const bulkMut = useBulkAssignReviewers();

  const items: SubmissionType[] = useMemo(
    () => data?.listObjects ?? [],
    [data?.listObjects],
  );
  const totalPages = data?.totalPages ?? 1;

  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((key) => rowSelection[key])
        .map((key) => items[Number(key)]?.id)
        .filter(Boolean) as (string | number)[],
    [rowSelection, items],
  );

  const columns = useMemo(
    () =>
      createReviewerAssignmentColumns({
        onAssign: (id) => {
          setSelectedSubmissionId(id);
          setOpenAssign(true);
        },
        onViewDetail: (id) => {
          setSelectedSubmissionId(id);
          setOpenDetail(true);
        },
      }),
    [],
  );

  useEffect(() => {
    if (error) toast.error("Không tải được submissions");
  }, [error]);

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Phân công Reviewer</h2>
              <p className="text-xs text-white/70">
                Danh sách submissions và phân công reviewer
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 rounded-2xl border bg-white/70 p-3 shadow-sm md:flex-row md:items-center">
        <Button
          onClick={() => {
            if (selectedIds.length === 0) {
              toast.info("Vui lòng chọn ít nhất 1 submission.");
              return;
            }
            setSelectedSubmissionId(selectedIds[0]);
            setOpenAssign(true);
          }}
          disabled={bulkMut.isPending}
        >
          {bulkMut.isPending
            ? "Đang phân công..."
            : `Phân công đã chọn (${selectedIds.length})`}
        </Button>
      </div>

      <div className="min-h-[520px] rounded-2xl border bg-white/70 px-4 py-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Danh sách submissions</h3>

        <DataTable<SubmissionType, unknown>
          data={items}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={keyword}
          setSearch={setKeyword}
          placeholder="Tìm kiếm submission..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={totalPages}
          limit={pageSize}
          setLimit={setPageSize}
          selectedRowIds={rowSelection}
          onSelectedRowIdsChange={setRowSelection}
        />
      </div>

      <ReviewerPickerDialog
        isOpen={openAssign}
        onClose={() => {
          setOpenAssign(false);
          setSelectedSubmissionId(undefined);
        }}
        submissionId={selectedSubmissionId}
        onConfirm={async ({ reviewerIds, assignmentType }) => {
          try {
            if (!reviewerIds.length) return;
            const assignments = selectedIds.length
              ? selectedIds.flatMap((sid) =>
                  reviewerIds.map((rid) => ({
                    submissionId: sid,
                    reviewerId: rid,
                    assignmentType,
                  })),
                )
              : reviewerIds.map((rid) => ({
                  submissionId: selectedSubmissionId!,
                  reviewerId: rid,
                  assignmentType,
                }));
            await bulkMut.mutateAsync({ assignments });
            toast.success("Phân công thành công");
          } catch (e: unknown) {
            const message =
              e instanceof Error ? e.message : "Phân công thất bại";
            toast.error(message);
          } finally {
            setOpenAssign(false);
            setSelectedSubmissionId(undefined);
            setRowSelection({});
          }
        }}
      />

      <SubmissionDetailDialog
        isOpen={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setSelectedSubmissionId(undefined);
        }}
        submission={items.find((s) => s.id === selectedSubmissionId)}
      />
    </div>
  );
}

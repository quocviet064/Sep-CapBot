import { useMemo, useState } from "react";
import { DataTable } from "@/components/globals/atoms/data-table";
import { Button } from "@/components/globals/atoms/button";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import { Input } from "@/components/globals/atoms/input";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import LoadingPage from "@/pages/loading-page";
import ReviewerPickerDialog from "./ReviewerPickerDialog";
import { useBulkAssignReviewers } from "@/hooks/useReviewerAssignment";
import { toast } from "sonner";
import { Eye } from "lucide-react";

import { type SubmissionType } from "@/services/submissionService";
import { useSubmissions } from "@/hooks/useSubmission";
import SubmissionDetailDialog from "./SubmissionDetailDialog";

const DEFAULT_VISIBILITY = {
  submittedByName: true,
  submissionRound: true,
  submittedAt: true,
};

export default function ReviewerAssignmentIndex() {
  // Server-side paging + search
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  const { data, isLoading, error } = useSubmissions({
    PageNumber: pageNumber,
    PageSize: pageSize,
    Keyword: search || undefined,
  });

  // Selection theo submission
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<(string | number)[]>([]);

  // Dialog assign
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogSubmissionId, setDialogSubmissionId] = useState<string | number | undefined>(undefined);

  // Dialog detail
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailSubmissionId, setDetailSubmissionId] = useState<string | number | undefined>(undefined);

  // Bulk mutation
  const bulkMut = useBulkAssignReviewers();

  const submissions: SubmissionType[] = data?.listObjects ?? [];

  // Open dialog per-row
  const openRowDialog = (submissionId: string | number) => {
    setDialogSubmissionId(submissionId);
    setIsDialogOpen(true);
  };

  // Open dialog bulk
  const openBulkDialog = () => {
    if (selectedSubmissionIds.length === 0) {
      toast.info("Vui lòng chọn ít nhất 1 submission.");
      return;
    }
    setDialogSubmissionId(selectedSubmissionIds[0]);
    setIsDialogOpen(true);
  };

  // Open detail dialog
  const openDetailDialog = (submissionId: string | number) => {
    setDetailSubmissionId(submissionId);
    setIsDetailOpen(true);
  };

  // Xác nhận → bulk assign
  const handleConfirmAssign = async ({
    reviewerIds,
    assignmentType,
  }: {
    reviewerIds: (string | number)[];
    assignmentType: number;
  }) => {
    if (reviewerIds.length === 0) return;

    try {
      let assignments: {
        submissionId: string | number;
        reviewerId: string | number;
        assignmentType: number;
      }[] = [];

      if (selectedSubmissionIds.length === 0 && dialogSubmissionId != null) {
        // Per-row: nhiều reviewer cho 1 submission
        assignments = reviewerIds.map((rid) => ({
          submissionId: dialogSubmissionId,
          reviewerId: rid,
          assignmentType,
        }));
      } else {
        // Bulk: nhiều reviewer × nhiều submission
        assignments = selectedSubmissionIds.flatMap((sid) =>
          reviewerIds.map((rid) => ({
            submissionId: sid,
            reviewerId: rid,
            assignmentType,
          }))
        );
      }

      await bulkMut.mutateAsync({ assignments });
      toast.success("Phân công thành công");
    } catch (e: any) {
      toast.error(e?.message || "Phân công thất bại");
    } finally {
      setIsDialogOpen(false);
      setDialogSubmissionId(undefined);
      setSelectedSubmissionIds([]);
    }
  };

  // Cột bảng submissions — map đúng với payload BE
  const columns = useMemo(() => {
    return [
      {
        id: "select",
        header: ({ table }: any) => {
          const pageRows = table.getRowModel().rows;
          const pageIds: string[] = pageRows.map((r: any) => String(r.original.id));
          const selectedKeys = selectedSubmissionIds.map(String);
          const allChecked = pageIds.every((id) => selectedKeys.includes(id));
          const someChecked = !allChecked && pageIds.some((id) => selectedKeys.includes(id));

          return (
            <Checkbox
              checked={allChecked || (someChecked && "indeterminate")}
              onCheckedChange={(v) => {
                if (v) {
                  const merged = Array.from(new Set([...selectedKeys, ...pageIds]));
                  setSelectedSubmissionIds(merged);
                } else {
                  const pageSet = new Set(pageIds);
                  setSelectedSubmissionIds((prev) => prev.filter((id) => !pageSet.has(String(id))));
                }
              }}
              aria-label="Select all on page"
              className="mb-2"
            />
          );
        },
        cell: ({ row }: any) => {
          const idStr = String(row.original.id);
          const checked = selectedSubmissionIds.map(String).includes(idStr);
          return (
            <Checkbox
              checked={checked}
              onCheckedChange={(v) =>
                setSelectedSubmissionIds((prev) =>
                  v
                    ? Array.from(new Set([...prev.map(String), idStr]))
                    : prev.filter((x) => String(x) !== idStr)
                )
              }
              aria-label="Select row"
              className="mb-2"
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
        meta: { title: "Submission" },
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="Submission" />,
      },
      {
        id: "submittedByName",
        meta: { title: "Supervisor" },
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="Supervisor" />,
        cell: ({ row }: any) => {
          const name = row.original.submittedByName as string | undefined;
          const uid = row.original.submittedBy as string | number | undefined;
          return name ? `${name}${uid ? ` (#${uid})` : ""}` : uid ? `#${uid}` : "--";
        },
      },
      {
        id: "submissionRound",
        meta: { title: "Round" },
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="Round" />,
        cell: ({ row }: any) => row.original.submissionRound ?? 1,
      },
      {
        id: "submittedAt",
        meta: { title: "Submitted at" },
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="Submitted at" />,
        cell: ({ row }: any) => <DataTableDate date={row.original.submittedAt} />,
      },
      {
        id: "actions",
        header: () => <span className="flex items-center justify-center">Thao tác</span>,
        cell: ({ row }: any) => {
          const submission: SubmissionType = row.original;
          return (
            <div className="flex justify-center gap-2">
              <Button size="sm" onClick={() => openRowDialog(submission.id as any)}>
                Phân công
              </Button>

              {/* Nút xem chi tiết (Eye) */}
              <Button
                size="icon"
                variant="ghost"
                title="Xem chi tiết"
                aria-label="Xem chi tiết"
                onClick={() => openDetailDialog(submission.id as any)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ];
  }, [selectedSubmissionIds]);

  if (isLoading) return <LoadingPage />;
  if (error) return <div className="p-6 text-red-600">Lỗi tải danh sách submission</div>;

  return (
    <div className="space-y-4 p-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px]">
          <label htmlFor="submissionKeyword" className="block text-sm mb-1">
            Tìm kiếm submission
          </label>
          <Input
            id="submissionKeyword"
            placeholder="Nhập từ khoá..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={openBulkDialog}
            disabled={selectedSubmissionIds.length === 0 || bulkMut.isPending}
          >
            {bulkMut.isPending
              ? "Đang phân công..."
              : `Phân công đã chọn (${selectedSubmissionIds.length})`}
          </Button>
        </div>
      </div>

      {/* Bảng submissions */}
      <DataTable<SubmissionType, unknown>
        data={submissions}
        columns={columns as any}
        visibility={DEFAULT_VISIBILITY}
        search={search}
        setSearch={setSearch}
        placeholder="Tìm kiếm submission..."
        page={pageNumber}
        setPage={setPageNumber}
        totalPages={data?.totalPages || 1}
        limit={pageSize}
        setLimit={setPageSize}
      />

      {/* Popup chọn reviewer — truyền submissionId */}
      <ReviewerPickerDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setDialogSubmissionId(undefined);
        }}
        submissionId={dialogSubmissionId}
        onConfirm={handleConfirmAssign}
      />

      {/* Popup chi tiết submission */}
      <SubmissionDetailDialog
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailSubmissionId(undefined);
        }}
        submissionId={detailSubmissionId}
      />
    </div>
  );
}

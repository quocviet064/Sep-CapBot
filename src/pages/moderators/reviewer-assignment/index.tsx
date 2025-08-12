// src/pages/moderators/reviewer-assignment/index.tsx
import { useMemo, useState } from "react";
import { DataTable } from "@/components/globals/atoms/data-table";
import { Button } from "@/components/globals/atoms/button";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import LoadingPage from "@/pages/loading-page";
import { useTopics } from "@/hooks/useTopic";
import { TopicType } from "@/schemas/topicSchema";
import ReviewerPickerDialog from "./ReviewerPickerDialog";
import { useBulkAssignReviewers } from "@/hooks/useReviewerAssignment";
import { toast } from "sonner";

const DEFAULT_VISIBILITY = {
  // Ẩn/bật cột theo nhu cầu
  description: false,
  objectives: false,
  semesterId: false,
  categoryId: false,
  supervisorId: false,
  updatedAt: false,
  createdAt: true,
};

export default function ReviewerAssignmentIndex() {
  // Paging + search cho bảng topic
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  // Lấy danh sách đề tài (tùy backend có filter "đã nộp" thì thêm param)
  const { data, isLoading, error } = useTopics("", "", pageNumber, pageSize, search);

  // State chọn nhiều topic
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);

  // Dialog chọn reviewer
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // Nếu set topicId => per-row; nếu undefined => bulk (nhiều topic)
  const [dialogTopicId, setDialogTopicId] = useState<number | undefined>(undefined);

  // Bulk mutation (gửi dạng { assignments: AssignReviewerDTO[] })
  const bulkMut = useBulkAssignReviewers();

  // Mở dialog phân công theo từng dòng
  const openRowDialog = (topicId: number | string) => {
    setDialogTopicId(Number(topicId));
    setIsDialogOpen(true);
  };

  // Mở dialog bulk (nhiều topic)
  const openBulkDialog = () => {
    if (selectedTopicIds.length === 0) {
      toast.info("Vui lòng chọn ít nhất 1 đề tài.");
      return;
    }
    // Chọn submissionId đại diện để load reviewer gợi ý trong Dialog
    setDialogTopicId(selectedTopicIds[0]);
    setIsDialogOpen(true);
  };

  // Xác nhận từ Dialog: gửi bulk
  const handleConfirmAssign = ({
    reviewerIds,
    assignmentType,
  }: {
    reviewerIds: number[];
    assignmentType: number;
  }) => {
    if (reviewerIds.length === 0) return;

    // Tạo mảng assignments theo cấu trúc BE: AssignReviewerDTO[]
    let assignments: {
      submissionId: number;
      reviewerId: number;
      assignmentType: number;
    }[] = [];

    if (dialogTopicId) {
      // Per-row: nhiều reviewer cho 1 topic
      assignments = reviewerIds.map((rid) => ({
        submissionId: Number(dialogTopicId),
        reviewerId: rid,
        assignmentType,
      }));
    } else if (selectedTopicIds.length > 0) {
      // Bulk: nhiều reviewer cho nhiều topic
      assignments = selectedTopicIds.flatMap((sid) =>
        reviewerIds.map((rid) => ({
          submissionId: Number(sid),
          reviewerId: rid,
          assignmentType,
        })),
      );
    }

    bulkMut.mutate(
      { assignments },
      {
        onSettled: () => {
          setIsDialogOpen(false);
          setDialogTopicId(undefined);
          setSelectedTopicIds([]);
        },
      },
    );
  };

  // Bảng columns
  const columns = useMemo(() => {
    return [
      // Cột checkbox chọn từng hàng + "select all on page"
      {
        id: "select",
        header: ({ table }: any) => {
          const pageRows = table.getRowModel().rows;
          const pageIds = pageRows.map((r: any) => Number(r.original.id));
          const allChecked = pageIds.every((id: number) => selectedTopicIds.includes(id));
          const someChecked =
            !allChecked && pageIds.some((id: number) => selectedTopicIds.includes(id));

          return (
            <Checkbox
              checked={allChecked || (someChecked && "indeterminate")}
              onCheckedChange={(v) => {
                if (v) {
                  // add tất cả id trên trang vào selection
                  const merged = Array.from(new Set([...selectedTopicIds, ...pageIds]));
                  setSelectedTopicIds(merged);
                } else {
                  // bỏ tất cả id của trang khỏi selection
                  setSelectedTopicIds((prev) => prev.filter((id) => !pageIds.includes(id)));
                }
              }}
              aria-label="Select all on page"
              className="mb-2"
            />
          );
        },
        cell: ({ row }: any) => {
          const id = Number(row.original.id);
          const checked = selectedTopicIds.includes(id);
          return (
            <Checkbox
              checked={checked}
              onCheckedChange={(v) =>
                setSelectedTopicIds((prev) => (v ? [...prev, id] : prev.filter((x) => x !== id)))
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
        meta: { title: "Mã đề tài" },
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Mã đề tài" />
        ),
      },
      {
        accessorKey: "title",
        meta: { title: "Đề tài" },
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Đề tài" />
        ),
      },
      {
        accessorKey: "supervisorName",
        meta: { title: "Giảng viên" },
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Giảng viên" />
        ),
      },
      {
        accessorKey: "createdAt",
        meta: { title: "Ngày tạo" },
        header: ({ column }: any) => (
          <DataTableColumnHeader column={column} title="Ngày tạo" />
        ),
        cell: ({ row }: any) => <DataTableDate date={row.original.createdAt} />,
      },
      {
        id: "actions",
        header: () => <span className="flex items-center justify-center">Thao tác</span>,
        cell: ({ row }: any) => {
          const t: TopicType = row.original;
          return (
            <div className="flex justify-center">
              <Button size="sm" onClick={() => openRowDialog(t.id as unknown as number)}>
                Phân công
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ];
  }, [selectedTopicIds]);

  if (isLoading) return <LoadingPage />;
  if (error) return <div className="p-6 text-red-600">Lỗi tải danh sách đề tài</div>;

  const topics = data?.listObjects || [];

  return (
    <div className="space-y-3 p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Đề tài đã nộp</div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={openBulkDialog}
            disabled={selectedTopicIds.length === 0 || bulkMut.isPending}
          >
            {bulkMut.isPending
              ? "Đang phân công..."
              : `Phân công đã chọn (${selectedTopicIds.length})`}
          </Button>
        </div>
      </div>

      {/* Bảng đề tài */}
      <DataTable<TopicType, unknown>
        data={topics}
        columns={columns as any}
        visibility={DEFAULT_VISIBILITY}
        search={search}
        setSearch={setSearch}
        placeholder="Tìm kiếm đề tài, giảng viên..."
        page={pageNumber}
        setPage={setPageNumber}
        totalPages={data?.totalPages || 1}
        limit={pageSize}
        setLimit={setPageSize}
      />

      {/* Popup chọn reviewer:
         - Per-row: truyền dialogTopicId
         - Bulk: truyền submissionId đại diện = dialogTopicId (topic đầu tiên) để load reviewer gợi ý
      */}
      <ReviewerPickerDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setDialogTopicId(undefined);
        }}
        submissionId={dialogTopicId}
        onConfirm={handleConfirmAssign}
      />
    </div>
  );
}

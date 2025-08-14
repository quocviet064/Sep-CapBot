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
  description: false,
  objectives: false,
  semesterId: false,
  categoryId: false,
  supervisorId: false,
  updatedAt: false,
  createdAt: true,
};

export default function ReviewerAssignmentIndex() {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  const { data, isLoading, error } = useTopics("", "", pageNumber, pageSize, search);

  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogTopicId, setDialogTopicId] = useState<number | undefined>(undefined);

  const bulkMut = useBulkAssignReviewers();

  const openRowDialog = (topicId: number | string) => {
    setDialogTopicId(Number(topicId));
    setIsDialogOpen(true);
  };

  const openBulkDialog = () => {
    if (selectedTopicIds.length === 0) {
      toast.info("Vui lòng chọn ít nhất 1 đề tài.");
      return;
    }
    // Chọn submissionId đại diện để load reviewer gợi ý 
    setDialogTopicId(selectedTopicIds[0]);
    setIsDialogOpen(true);
  };

  const handleConfirmAssign = ({
    reviewerIds,
    assignmentType,
  }: {
    reviewerIds: number[];
    assignmentType: number;
  }) => {
    if (reviewerIds.length === 0) return;

    let assignments: {
      submissionId: number;
      reviewerId: number;
      assignmentType: number;
    }[] = [];

    if (dialogTopicId) {
      assignments = reviewerIds.map((rid) => ({
        submissionId: Number(dialogTopicId),
        reviewerId: rid,
        assignmentType,
      }));
    } else if (selectedTopicIds.length > 0) {
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

  const columns = useMemo(() => {
    return [
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
                  const merged = Array.from(new Set([...selectedTopicIds, ...pageIds]));
                  setSelectedTopicIds(merged);
                } else {
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

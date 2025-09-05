import { useMemo } from "react";
import { DataTable } from "@/components/globals/atoms/data-table";
import type { SubmissionListItem } from "@/services/submissionService";
import {
  createSubmissionColumns,
  type SubmissionMode,
  type SubmissionColumnHandlers,
} from "@/pages/moderators/submissions/columns";

type Props = {
  mode: SubmissionMode; // "assign" | "approve"
  rows: SubmissionListItem[];
  totalPages: number;

  // paging
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;

  // search
  search: string;
  setSearch: (s: string) => void;

  // actions
  onViewDetail: SubmissionColumnHandlers["onViewDetail"];
  onAssignReviewer?: SubmissionColumnHandlers["onAssignReviewer"];

  // UI
  placeholder?: string;
  className?: string;
};

const DEFAULT_VISIBILITY = {
  id: true,
  submittedByName: true,
  submissionRound: true,
  submittedAt: true,
} as const;

export default function SubmissionTable({
  mode,
  rows,
  totalPages,
  page,
  setPage,
  pageSize,
  setPageSize,
  search,
  setSearch,
  onViewDetail,
  onAssignReviewer,
  placeholder = "Tìm theo mã / người nộp / vòng nộp...",
  className,
}: Props) {
  const columns = useMemo(
    () =>
      createSubmissionColumns(mode, {
        onViewDetail,
        onAssignReviewer,
      }),
    [mode, onViewDetail, onAssignReviewer]
  );

  return (
    <div className={className}>
      <DataTable<SubmissionListItem, unknown>
        data={rows}
        columns={columns as any}
        visibility={DEFAULT_VISIBILITY as any}
        search={search}
        setSearch={(v: string) => {
          setSearch(v);
          // Khi đổi search, quay về trang 1
          if (page !== 1) setPage(1);
        }}
        placeholder={placeholder}
        page={page}
        setPage={setPage}
        totalPages={Math.max(1, totalPages ?? 1)}
        limit={pageSize}
        setLimit={setPageSize}
      />
    </div>
  );
}

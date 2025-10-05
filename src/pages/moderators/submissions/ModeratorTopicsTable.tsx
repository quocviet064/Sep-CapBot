import { useMemo } from "react";
import { DataTable } from "@/components/globals/atoms/data-table";
import createModeratorTopicColumns, { type ModeratorColumnActions } from "./ColumnsModeratorTopics";
import type { TopicListItem } from "@/services/topicService";

type Props = {
  rows: TopicListItem[];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  totalPages: number;
  totalRecords?: number;
  loadingTopicId?: number | null;
  handlers: ModeratorColumnActions;
  minTableWidth?: number;
  visibility?: Record<string, boolean>;
};

const DEFAULT_VISIBILITY = {
  id: false,
};

export default function ModeratorTopicsTable(props: Readonly<Props>) {
  const {
    rows,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    handlers,
    minTableWidth = 1600,
    visibility = {},
  } = props;

  const columns = useMemo(() => createModeratorTopicColumns(handlers), [handlers]);

  const mergedVisibility = useMemo(() => ({ ...DEFAULT_VISIBILITY, ...visibility }), [visibility]);

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: `${minTableWidth}px` }}>
        <DataTable
          data={rows}
          columns={columns}
          visibility={mergedVisibility}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>
    </div>
  );
}

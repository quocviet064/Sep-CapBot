// src/pages/moderators/reviewer-assignment/assignments.tsx
import { useState, useEffect, KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import LoadingPage from "@/pages/loading-page";
import { Input } from "@/components/globals/atoms/input";
import { Button } from "@/components/globals/atoms/button";
import { DataTable } from "@/components/globals/atoms/data-table";
import {
  useAssignmentsBySubmission,
  useCancelAssignment,
  useUpdateAssignmentStatus,
} from "@/hooks/useReviewerAssignment";
import { AssignmentStatus } from "@/services/reviewerAssignmentService";

export default function CurrentAssignmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = searchParams.get("submissionId") || "";

  const [inputValue, setInputValue] = useState(paramId);
  useEffect(() => {
    setInputValue(paramId);
  }, [paramId]);

  const onSearch = () => {
    const id = inputValue.trim();
    if (id) setSearchParams({ submissionId: id });
    else setSearchParams({});
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  const { data: assignments, isLoading } = useAssignmentsBySubmission(
    paramId || undefined
  );
  const cancelMut = useCancelAssignment();
  const updateMut = useUpdateAssignmentStatus();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  if (isLoading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Current Assignments</h1>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Submission ID"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKey}
        />
        <Button onClick={onSearch}>Load</Button>
      </div>

      {!paramId && (
        <p className="text-gray-500">
          Nhập Submission ID để xem các assignment hiện tại
        </p>
      )}

      {paramId && (
        <>
          <Input
            placeholder="Tìm kiếm assignment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <DataTable
            data={assignments || []}
            columns={[
              { accessorKey: "id", header: "ID Assign" },
              { accessorKey: "reviewerId", header: "Reviewer ID" },
              { accessorKey: "status", header: "Status" },
              {
                id: "action",
                header: "Thao tác",
                cell: ({ row }) => (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        updateMut.mutate({
                          assignmentId: row.original.id,
                          status:
                            (row.original.status as number) +
                            1 as AssignmentStatus,
                        })
                      }
                    >
                      Tiến bước
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => cancelMut.mutate(row.original.id)}
                    >
                      Hủy
                    </Button>
                  </div>
                ),
              },
            ]}
            visibility={{}}
            search={search}
            setSearch={setSearch}
            page={page}
            setPage={setPage}
            totalPages={Math.ceil((assignments?.length ?? 0) / limit)}
            limit={limit}
            setLimit={setLimit}
          />
        </>
      )}
    </div>
  );
}

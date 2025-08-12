// src/pages/moderators/reviewer-assignment/available.tsx
import { useState, useEffect, KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import LoadingPage from "@/pages/loading-page";
import { Input } from "@/components/globals/atoms/input";
import { Button } from "@/components/globals/atoms/button";
import { DataTable } from "@/components/globals/atoms/data-table";
import {
  useAvailableReviewers,
  useAssignReviewer,
} from "@/hooks/useReviewerAssignment";

export default function AvailableReviewersPage() {
  // 1) Lấy submissionId từ URL ?submissionId=
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = searchParams.get("submissionId") || "";

  // 2) Controlled input, khởi tạo từ paramId
  const [inputValue, setInputValue] = useState(paramId);
  useEffect(() => {
    setInputValue(paramId);
  }, [paramId]);

  // 3) Search/update URL
  const onSearch = () => {
    const id = inputValue.trim();
    if (id) setSearchParams({ submissionId: id });
    else setSearchParams({});
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  // 4) Query & mutation
  const { data: reviewers, isLoading } = useAvailableReviewers(
    paramId || undefined
  );
  const assignMut = useAssignReviewer();

  // 5) Table state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  if (isLoading) return <LoadingPage />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Available Reviewers</h1>

      {/* Submission ID input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Submission ID"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKey}
        />
        <Button onClick={onSearch}>Load</Button>
      </div>

      {/* Nếu chưa có ID */}
      {!paramId && (
        <p className="text-gray-500">
          Nhập Submission ID để xem reviewers khả dụng
        </p>
      )}

      {paramId && (
        <>
          {/* Search reviewer */}
          <Input
            placeholder="Tìm kiếm reviewer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* DataTable */}
          <DataTable
            data={reviewers || []}
            columns={[
              { accessorKey: "id", header: "ID Reviewer" },
              { accessorKey: "userName", header: "Tên" },
              { accessorKey: "currentAssignments", header: "Đang review" },
              {
                id: "action",
                header: "Thao tác",
                cell: ({ row }) => (
                  <Button
                    size="sm"
                    onClick={() =>
                      assignMut.mutate({
                        submissionId: Number(paramId),
                        reviewerId: row.original.id,
                        assignmentType: 1,
                      })
                    }
                  >
                    Assign
                  </Button>
                ),
              },
            ]}
            visibility={{}}
            search={search}
            setSearch={setSearch}
            page={page}
            setPage={setPage}
            totalPages={Math.ceil((reviewers?.length ?? 0) / limit)}
            limit={limit}
            setLimit={setLimit}
          />
        </>
      )}
    </div>
  );
}

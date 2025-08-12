import { useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { useSemesters } from "@/hooks/useSemester";
import { createColumns } from "./columns";
import SemesterDetailDialog from "./SemesterDetailDialog";
import SemesterCreateDialog from "./SemesterCreateDialog";

const DEFAULT_VISIBILITY = {
  id: false,
};

export default function ModeratorSemesterPage() {
  const { data: semesters, isLoading, error, refetch } = useSemesters();

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  const handleViewDetail = (id: string) => {
    setSelectedSemesterId(id);
    setDetailOpen(true);
  };

  const columns = createColumns({ onViewDetail: handleViewDetail });

  return (
    <div className="space-y-2">
      <div className="min-h-[600px] space-y-4 rounded-2xl border px-4 py-4">
        <h2 className="text-xl font-bold">Quản lý học kỳ</h2>

        <div>
          <Button variant="default" onClick={() => setCreateOpen(true)}>
            + Tạo học kỳ
          </Button>
        </div>

        <DataTable
          data={semesters ?? []}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={searchTerm}
          setSearch={setSearchTerm}
          placeholder="Tìm kiếm tên học kỳ..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={1}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>

      <SemesterCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={refetch}
      />

      <SemesterDetailDialog
        isOpen={isDetailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedSemesterId(null);
        }}
        semesterId={selectedSemesterId}
        onUpdate={refetch}
      />
    </div>
  );
}

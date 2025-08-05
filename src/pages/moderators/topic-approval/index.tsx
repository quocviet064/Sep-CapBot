import { useState } from "react";

import { createColumns } from "./columns";
import { DataTable } from "@/components/globals/atoms/data-table";
import { useTopics } from "@/hooks/useTopic";
import LoadingPage from "@/pages/loading-page";

const DEFAULT_VISIBILITY = {
  id: false,
  categoryId: false,
  supervisorId: false,
  supervisor: false,
  semesterId: false,
  createdAt: false,
  updatedAt: false,
};

function Index() {
  const [semesterId, setSemesterId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    data: topicsData,
    isLoading,
    error,
  } = useTopics(semesterId, categoryId, pageNumber, pageSize, searchTerm);

  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);

  const handleViewDetail = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedBooking(null);
  };

  const columns = createColumns({ onViewDetail: handleViewDetail });

  if (isLoading) return <LoadingPage />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="space-y-2">
      <DataTable
        data={topicsData?.listObjects || []}
        columns={columns}
        visibility={DEFAULT_VISIBILITY}
        search={searchTerm}
        setSearch={setSearchTerm}
        placeholder="Tìm kiếm người dùng hoặc chuyên viên..."
        page={pageNumber}
        setPage={setPageNumber}
        totalPages={topicsData?.totalPages || 1}
        limit={pageSize}
        setLimit={setPageSize}
      />

      {/* <TopicDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
        topicId={selectedBooking}
      /> */}
    </div>
  );
}

export default Index;

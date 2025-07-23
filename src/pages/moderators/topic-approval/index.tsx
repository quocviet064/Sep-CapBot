import { useState } from "react";

import { topicDataEx } from "@/constants/data/topic";
import { createColumns } from "./columns";
import { DataTable } from "@/components/globals/atoms/data-table";
import TopicDetailDialog from "./TopicDetailDialog";
import TopicAnalysis from "./TopicAnalysis";

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
  const bookingsData = topicDataEx;

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  return (
    <div className="space-y-2">
      <TopicAnalysis />
      <div>
        <DataTable
          data={bookingsData}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={searchTerm}
          setSearch={setSearchTerm}
          placeholder="Tìm kiếm người dùng hoặc chuyên viên..."
          page={page}
          setPage={setPage}
          totalPages={Math.ceil(bookingsData.length / limit)}
          limit={limit}
          setLimit={setLimit}
        />

        <TopicDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={handleCloseDetailDialog}
          topicId={selectedBooking}
        />
      </div>
    </div>
  );
}

export default Index;

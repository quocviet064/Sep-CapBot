import { useState } from "react";
import { DataTable } from "@/components/globals/atoms/data-table";
import { useTopics } from "@/hooks/useTopic";
import LoadingPage from "@/pages/loading-page";
import { createColumns } from "./columnsTopic";
import { getTopicDetail, TopicDetailResponse } from "@/services/topicService";
import TopicDetailDialog from "./TopicDetailDialog";

const DEFAULT_VISIBILITY = {
  id: false,
  categoryId: false,
  supervisorId: false,
  supervisor: false,
  semesterId: false,
  createdAt: false,
  updatedAt: false,
};

function TopicPage() {
  const [semesterId] = useState<string>("");
  const [categoryId] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    data: topicsData,
    isLoading,
    error,
  } = useTopics(semesterId, categoryId, pageNumber, pageSize, searchTerm);

  const [selectedTopic, setSelectedTopic] =
    useState<TopicDetailResponse | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);

  const handleViewDetail = async (topicId: string) => {
    try {
      const topicDetail = await getTopicDetail(Number(topicId));
      setSelectedTopic(topicDetail);
      setIsDetailDialogOpen(true);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đề tài:", err);
    }
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedTopic(null);
  };

  const columns = createColumns({ onViewDetail: handleViewDetail });

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="space-y-4">
      <div className="min-h=[600px] rounded-2xl border px-4 py-4">
        <h2 className="text-xl font-bold">Danh sách đề tài</h2>
        <DataTable
          data={(topicsData?.listObjects || []).filter(
            (topic) => topic.isApproved === true,
          )}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={searchTerm}
          setSearch={setSearchTerm}
          placeholder="Tìm kiếm đề tài hoặc giảng viên..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={topicsData?.totalPages || 1}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>

      <TopicDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
        data={selectedTopic}
      />
    </div>
  );
}

export default TopicPage;

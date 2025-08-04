import { useState } from "react";
import { useMyTopics } from "@/hooks/useMyTopics";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import {
  getTopicDetail,
  TopicDetailResponse,
} from "@/services/topicDetailService";
import TopicDetailDialog from "./TopicDetailDialog";
import { createMyTopicColumns } from "./columnsMyTopics";

const DEFAULT_VISIBILITY = {
  id: false,
  title: true,
  supervisorName: true,
  categoryName: true,
  semesterName: true,
  isApproved: true,
  isLegacy: true,
  maxStudents: true,
  createdAt: true,
};

function MyTopicPage() {
  const [semesterId, setSemesterId] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    data: myTopicsData,
    isLoading,
    error,
  } = useMyTopics(
    semesterId,
    categoryId,
    pageNumber,
    pageSize,
    searchTerm,
    undefined,
  );

  // Chi tiết đề tài
  const [selectedTopic, setSelectedTopic] =
    useState<TopicDetailResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const handleViewDetail = async (topicId: string) => {
    try {
      const topicDetail = await getTopicDetail(Number(topicId));
      setSelectedTopic(topicDetail);
      setIsDetailOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseDetailDialog = () => {
    setIsDetailOpen(false);
    setSelectedTopic(null);
  };

  const columns = createMyTopicColumns({ onViewDetail: handleViewDetail });

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="space-y-4">
      <div className="min-h-[600px] rounded-2xl border px-4 py-4">
      <h2 className="text-xl font-bold">Danh sách đề tài của tôi</h2>

      <DataTable
        data={myTopicsData?.listObjects || []}
        columns={columns}
        visibility={DEFAULT_VISIBILITY}
        search={searchTerm}
        setSearch={setSearchTerm}
        placeholder="Tìm kiếm đề tài..."
        page={pageNumber}
        setPage={setPageNumber}
        totalPages={myTopicsData?.totalPages || 1}
        limit={pageSize}
        setLimit={setPageSize}
      />
      </div>

      <TopicDetailDialog
        isOpen={isDetailOpen}
        onClose={handleCloseDetailDialog}
        data={selectedTopic}
      />
    </div>
  );
}

export default MyTopicPage;

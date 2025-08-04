import { useState } from "react";
import { useMyTopics } from "@/hooks/useMyTopics";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import {
  getTopicDetail,
  TopicDetailResponse,
} from "@/services/topicDetailService";
import { createMyTopicColumns } from "./columnsMyTopics";
import TopicAnalysis from "@/pages/moderators/topic-approval/TopicAnalysis";
import MyTopicDetailDialog from "./myTopicDetailDialog";

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
  const [semesterId] = useState<number>(1);
  const [categoryId] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [filterStatus, setFilterStatus] = useState<
    "all" | "approved" | "pending" | "rejecting"
  >("all");

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

  const [selectedTopic, setSelectedTopic] =
    useState<TopicDetailResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const handleViewDetail = async (topicId: string) => {
    try {
      const topicDetail = await getTopicDetail(Number(topicId));
      setSelectedTopic(topicDetail);
      setIsDetailOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đề tài:", err);
    }
  };

  const handleCloseDetailDialog = () => {
    setIsDetailOpen(false);
    setSelectedTopic(null);
  };

  const columns = createMyTopicColumns({ onViewDetail: handleViewDetail });

  const filteredData =
    myTopicsData?.listObjects.filter((topic) => {
      if (filterStatus === "approved") return topic.isApproved === true;
      if (filterStatus === "pending") return topic.isApproved === false;
      if (filterStatus === "rejecting") return false;
      return true;
    }) || [];

  const stats = {
    approved:
      myTopicsData?.listObjects.filter((t) => t.isApproved)?.length || 0,
    pending:
      myTopicsData?.listObjects.filter((t) => t.isApproved === false)?.length ||
      0,
    rejecting: 0,
    total: myTopicsData?.listObjects.length || 0,
  };

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="space-y-4">
      <div className="min-h-[600px] rounded-2xl border px-4 py-4">
        <h2 className="mb-4 text-xl font-bold">Danh sách đề tài của tôi</h2>

        <TopicAnalysis data={stats} onFilterClick={setFilterStatus} />

        <DataTable
          data={filteredData}
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

      <MyTopicDetailDialog
        isOpen={isDetailOpen}
        onClose={handleCloseDetailDialog}
        data={selectedTopic}
      />
    </div>
  );
}

export default MyTopicPage;

// MyTopicPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ thêm
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { createMyTopicColumns } from "./columnsMyTopics";
import TopicAnalysis from "@/pages/moderators/topic-approval/TopicAnalysis";
// ❌ remove: import MyTopicDetailDialog from "./myTopicDetailDialog";
import { fetchAllMyTopics } from "@/hooks/useTopic";
import { TopicType } from "@/schemas/topicSchema";

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

  // ❌ remove: selectedTopic / isDetailOpen
  const [allTopics, setAllTopics] = useState<TopicType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const navigate = useNavigate(); // ⬅️ thêm

  const handleViewDetail = async (topicId: string) => {
    // Chuyển sang trang chi tiết
    navigate(`/topics/my/${topicId}`);
  };

  const columns = createMyTopicColumns({ onViewDetail: handleViewDetail });

  const [stats, setStats] = useState({
    approved: 0,
    pending: 0,
    rejecting: 0,
    total: 0,
  });

  useEffect(() => {
    const loadAllTopics = async () => {
      try {
        setIsLoading(true);
        const all = await fetchAllMyTopics(semesterId, categoryId, searchTerm);
        setAllTopics(all);

        const approved = all.filter((t) => t.isApproved === true).length;
        const pending = all.filter((t) => t.isApproved === false).length;
        const rejecting = all.filter((t) => t.currentStatus === 2).length;
        const total = all.length;
        setStats({ approved, pending, rejecting, total });
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    loadAllTopics();
  }, [semesterId, categoryId, searchTerm]);

  useEffect(() => {
    setPageNumber(1);
  }, [filterStatus]);

  const topicsAfterFilter =
    filterStatus === "approved"
      ? allTopics.filter((t) => t.isApproved === true)
      : filterStatus === "pending"
        ? allTopics.filter((t) => t.isApproved === false)
        : filterStatus === "rejecting"
          ? allTopics.filter((t) => t.currentStatus === 2)
          : allTopics;

  const filteredData = topicsAfterFilter.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize,
  );

  const totalFilteredPages = Math.ceil(topicsAfterFilter.length / pageSize);

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
          totalPages={totalFilteredPages}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>
    </div>
  );
}

export default MyTopicPage;

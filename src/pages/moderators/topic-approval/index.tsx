import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { useTopics } from "@/hooks/useTopic";
import TopicDetailDialog from "./TopicDetailDialog";
import { createColumns } from "./columns";

const DEFAULT_VISIBILITY = {
  id: false,
  categoryId: false,
  supervisorId: false,
  supervisorName: false,
  semesterId: false,
  semesterName: false,
  maxStudents: false,
  isApproved: false,
  createdAt: false,
  lastModifiedAt: false,
};

export default function TopicApprovalPage() {
  const [semesterId, setSemesterId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: topicsData, isLoading, error } = useTopics(
    semesterId,
    categoryId,
    pageNumber,
    pageSize,
    searchTerm
  );

  // Detail modal
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleViewDetail = (topicId: string) => {
    setSelectedTopicId(topicId);
    setIsDetailOpen(true);
  };

  const handleAssignReviewer = (topicId: string) => {
  navigate(`/moderators/reviewer-assignment?submissionId=${topicId}`);
};

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedTopicId(null);
  };

  const columns = createColumns({
    onViewDetail: handleViewDetail,
    onAssignReviewer: handleAssignReviewer,
  });

  if (isLoading) return <LoadingPage />;
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>;

  return (
    <div className="space-y-4 p-4">
      <DataTable
        data={topicsData?.listObjects || []}
        columns={columns}
        visibility={DEFAULT_VISIBILITY}
        search={searchTerm}
        setSearch={setSearchTerm}
        page={pageNumber}
        setPage={setPageNumber}
        totalPages={topicsData?.totalPages || 1}
        limit={pageSize}
        setLimit={setPageSize}
      />

      {selectedTopicId && (
        <TopicDetailDialog
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          topicId={selectedTopicId}
        />
      )}
    </div>
  );
}

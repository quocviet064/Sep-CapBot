import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusSquare } from "lucide-react";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { useTopics } from "@/hooks/useTopic";
import { createColumns } from "./columns";
import type { TopicType } from "@/schemas/topicSchema";

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

  const navigate = useNavigate();

  const handleViewDetail = (topicId: string) => {
    navigate(`/moderators/topic-approval/${topicId}`);
  };

  const handleAssignReviewer = (topic: TopicType) => {
    navigate(
      `/moderators/reviewer-assignment?submissionId=${String(topic.id)}`,
    );
  };

  const columns = createColumns({
    onViewDetail: handleViewDetail,
    onAssignReviewer: handleAssignReviewer,
  });

  if (isLoading) return <LoadingPage />;
  if (error)
    return <div className="p-4 text-red-600">Error: {error.message}</div>;

  const totalPages = topicsData?.totalPages || 1;
  const totalCurrent = topicsData?.listObjects?.length || 0;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <PlusSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Duyệt đề tài</h2>
              <p className="text-xs text-white/70">
                Danh sách đề tài chờ xử lý / đã duyệt
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-right">
              <div className="text-[10px] tracking-wide text-white/70 uppercase">
                Tổng trang
              </div>
              <div className="text-sm font-semibold">{totalPages}</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-right">
              <div className="text-[10px] tracking-wide text-white/70 uppercase">
                Bản ghi trang hiện tại
              </div>
              <div className="text-sm font-semibold">{totalCurrent}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[520px] rounded-2xl border bg-white/70 px-4 py-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Danh sách đề tài</h3>
        <DataTable
          data={topicsData?.listObjects || []}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={searchTerm}
          setSearch={setSearchTerm}
          placeholder="Tìm kiếm đề tài..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={totalPages}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>
    </div>
  );
}

// MyTopicPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { createMyTopicColumns } from "./columnsMyTopics";
import TopicAnalysis from "@/pages/moderators/topic-approval/TopicAnalysis";
import { fetchAllMyTopics, useMyTopics } from "@/hooks/useTopic";

const DEFAULT_VISIBILITY = {
  id: false,
  eN_Title: true,
  vN_title: true,
  abbreviation: true,
  supervisorName: true,
  categoryName: true,
  semesterName: true,
  description: true,
  problem: false,
  context: false,
  content: true,
  maxStudents: false,
  currentStatus: true,
  currentVersionNumber: false,
  isApproved: true,
  isLegacy: true,
  createdAt: true,
};

function MyTopicPage() {
  const [semesterId] = useState<number | undefined>(undefined);
  const [categoryId] = useState<number | undefined>(undefined);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "approved" | "pending" | "rejecting"
  >("all");

  const navigate = useNavigate();
  const columns = useMemo(
    () =>
      createMyTopicColumns({
        onViewDetail: (id) => navigate(`/topics/my/${id}`),
      }),
    [navigate],
  );

  const { data, isLoading, error } = useMyTopics(
    semesterId,
    categoryId,
    pageNumber,
    pageSize,
    searchTerm.trim() ? searchTerm.trim() : undefined,
    undefined,
  );

  const [stats, setStats] = useState({
    approved: 0,
    pending: 0,
    rejecting: 0,
    total: 0,
  });

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        const all = await fetchAllMyTopics(
          semesterId,
          categoryId,
          searchTerm.trim() ? searchTerm.trim() : undefined,
        );
        if (!mounted) return;
        const approved = all.filter((t) => t.isApproved === true).length;
        const pending = all.filter(
          (t) => t.isApproved === false || t.isApproved === null,
        ).length;
        const rejecting = all.filter((t) =>
          String(t.currentStatus).toLowerCase().includes("reject"),
        ).length;
        setStats({ approved, pending, rejecting, total: all.length });
      } catch (err) {
        console.error(err);
      }
    };
    loadStats();
    return () => {
      mounted = false;
    };
  }, [semesterId, categoryId, searchTerm]);

  useEffect(() => {
    setPageNumber(1);
  }, [pageSize, searchTerm, filterStatus, semesterId, categoryId]);

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  const serverPage = data?.listObjects ?? [];
  const totalPagesFromServer = data?.totalPages ?? 1;

  const pageAfterStatusFilter =
    filterStatus === "approved"
      ? serverPage.filter((t) => t.isApproved === true)
      : filterStatus === "pending"
        ? serverPage.filter(
            (t) => t.isApproved === false || t.isApproved === null,
          )
        : filterStatus === "rejecting"
          ? serverPage.filter((t) =>
              String(t.currentStatus).toLowerCase().includes("reject"),
            )
          : serverPage;

  return (
    <div className="space-y-4">
      <div className="min-h-[600px] rounded-2xl border px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Danh sách đề tài của tôi</h2>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm đề tài..."
            className="w-80 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60"
          />
        </div>

        <TopicAnalysis data={stats} onFilterClick={setFilterStatus} />

        <DataTable
          data={pageAfterStatusFilter}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={totalPagesFromServer}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>
    </div>
  );
}

export default MyTopicPage;

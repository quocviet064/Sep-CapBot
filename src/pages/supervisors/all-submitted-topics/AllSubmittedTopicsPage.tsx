import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import TopicAnalysis from "@/pages/moderators/topic-approval/TopicAnalysis";
import { fetchAllMyTopics, useMyTopics } from "@/hooks/useTopic";
import { createMyTopicColumns } from "./ColumnsAllSubmittedTopics";
import type { TopicListItem } from "@/services/topicService";

const DEFAULT_VISIBILITY = {
  id: false,
  eN_Title: true,
  vN_title: true,
  abbreviation: false,
  supervisorName: true,
  categoryName: true,
  semesterName: true,
  description: true,
  problem: false,
  context: false,
  content: true,
  maxStudents: false,
  hasSubmitted: false,
  currentVersionStatus: true,
  latestSubmissionStatus: true,
  latestSubmittedAt: true,
  currentVersionNumber: false,
  isApproved: true,
  isLegacy: false,
  createdAt: false,
};

type StatusValue = string | number | null | undefined;
type TopicLike = TopicListItem & {
  currentVersionStatus?: StatusValue;
  latestSubmissionStatus?: StatusValue;
};

const lc = (v?: StatusValue) => (v ?? "").toString().toLowerCase();

const isApprovedTopic = (t: TopicLike) =>
  t.isApproved === true ||
  lc(t.currentVersionStatus) === "approved" ||
  lc(t.latestSubmissionStatus) === "approved" ||
  lc(t.currentStatus) === "approved";

const isRejectedTopic = (t: TopicLike) => {
  const s = `${lc(t.currentVersionStatus)} ${lc(t.latestSubmissionStatus)} ${lc(t.currentStatus)}`;
  return s.includes("reject") || s.includes("rejected") || s.includes("denied");
};

function AllSubmittedTopicPage() {
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
        onViewDetail: (id) => navigate(`/submitted/topics/${id}`),
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
        const submitted = all.filter((t) => t.hasSubmitted === true);
        const approved = submitted.filter(isApprovedTopic).length;
        const rejecting = submitted.filter(isRejectedTopic).length;
        const pending = submitted.filter(
          (t) => !isApprovedTopic(t) && !isRejectedTopic(t),
        ).length;
        setStats({ approved, pending, rejecting, total: submitted.length });
      } catch (e) {
        console.error("loadStats error", e);
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

  const serverPage: TopicListItem[] = data?.listObjects ?? [];

  const submittedFirst = useMemo(
    () => serverPage.filter((t) => t.hasSubmitted === true),
    [serverPage],
  );

  const pageAfterStatusFilter = useMemo(() => {
    if (filterStatus === "approved")
      return submittedFirst.filter(isApprovedTopic);
    if (filterStatus === "pending")
      return submittedFirst.filter(
        (t) => !isApprovedTopic(t) && !isRejectedTopic(t),
      );
    if (filterStatus === "rejecting")
      return submittedFirst.filter(isRejectedTopic);
    return submittedFirst;
  }, [submittedFirst, filterStatus]);

  const totalPagesLocal = Math.max(
    1,
    Math.ceil(pageAfterStatusFilter.length / pageSize),
  );

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="space-y-4">
      <div className="min-h[600px] rounded-2xl border px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Danh sách đề tài đã nộp</h2>
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
          totalPages={totalPagesLocal}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>
    </div>
  );
}

export default AllSubmittedTopicPage;

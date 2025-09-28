// AllSubmittedTopicPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { fetchAllMyTopics } from "@/hooks/useTopic";
import { createMyTopicColumns } from "./ColumnsAllSubmittedTopics";
import type { TopicListItem } from "@/services/topicService";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import TopicAnalysisWithFilters, {
  StatusValue,
} from "./TopicAnalysisWithFilters";

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

function AllSubmittedTopicPage() {
  const [semesterId, setSemesterId] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<StatusValue>("all");
  const [allTopics, setAllTopics] = useState<TopicListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const navigate = useNavigate();
  const columns = useMemo(
    () =>
      createMyTopicColumns({
        onViewDetail: (id) => navigate(`/submitted/topics/${id}`),
      }),
    [navigate],
  );

  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      try {
        setLoading(true);
        setLoadErr(null);
        const all = await fetchAllMyTopics(
          undefined,
          undefined,
          searchTerm.trim() ? searchTerm.trim() : undefined,
        );
        if (!mounted) return;
        setAllTopics(all);
      } catch (e: unknown) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : String(e);
        setLoadErr(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadAll();
    return () => {
      mounted = false;
    };
  }, [searchTerm]);

  const semesterOptions = useMemo(() => {
    const names = Array.from(
      new Set((allTopics || []).map((t) => t.semesterName).filter(Boolean)),
    );
    return names.map((name, idx) => ({ id: idx + 1, name }));
  }, [allTopics]);

  const categoryOptions = useMemo(() => {
    const names = Array.from(
      new Set((allTopics || []).map((t) => t.categoryName).filter(Boolean)),
    );
    return names.map((name, idx) => ({ id: idx + 1, name }));
  }, [allTopics]);

  const selectedSemesterName = useMemo(() => {
    if (semesterId == null) return undefined;
    return semesterOptions.find((o) => o.id === semesterId)?.name;
  }, [semesterId, semesterOptions]);

  const selectedCategoryName = useMemo(() => {
    if (categoryId == null) return undefined;
    return categoryOptions.find((o) => o.id === categoryId)?.name;
  }, [categoryId, categoryOptions]);

  const listAfterSC = useMemo(() => {
    let list = allTopics.slice();
    if (selectedSemesterName) {
      list = list.filter((t) => t.semesterName === selectedSemesterName);
    }
    if (selectedCategoryName) {
      list = list.filter((t) => t.categoryName === selectedCategoryName);
    }
    return list;
  }, [allTopics, selectedSemesterName, selectedCategoryName]);

  const submittedList = useMemo(
    () => listAfterSC.filter((t) => t.hasSubmitted === true),
    [listAfterSC],
  );

  const normalizeStatus = (s: unknown): Exclude<StatusValue, "all"> => {
    const v = String(s ?? "")
      .trim()
      .toLowerCase();
    if (v === "approved") return "Approved";
    if (v === "rejected") return "Rejected";
    if (v === "underreview" || v === "under_review" || v === "under review")
      return "UnderReview";
    if (v === "duplicate") return "Duplicate";
    if (v === "revisionrequired" || v === "revision_required")
      return "RevisionRequired";
    if (v === "escalatedtomoderator" || v === "escalated_to_moderator")
      return "EscalatedToModerator";
    return "Pending";
  };

  const statusCountMap = useMemo(() => {
    const map: Record<Exclude<StatusValue, "all">, number> = {
      Pending: 0,
      UnderReview: 0,
      Duplicate: 0,
      RevisionRequired: 0,
      EscalatedToModerator: 0,
      Approved: 0,
      Rejected: 0,
    };
    submittedList.forEach((t) => {
      const key = normalizeStatus(t.latestSubmissionStatus);
      map[key] += 1;
    });
    return map;
  }, [submittedList]);

  const stats = useMemo(() => {
    const total = submittedList.length;
    const approved = statusCountMap.Approved;
    const rejecting = statusCountMap.Rejected;
    const pending = total - approved - rejecting;
    return { approved, pending, rejecting, total };
  }, [submittedList.length, statusCountMap]);

  useEffect(() => {
    setPageNumber(1);
  }, [pageSize, searchTerm, filterStatus, semesterId, categoryId]);

  const filteredByStatus = useMemo(() => {
    if (filterStatus === "all") return submittedList;
    return submittedList.filter(
      (t) => normalizeStatus(t.latestSubmissionStatus) === filterStatus,
    );
  }, [submittedList, filterStatus]);

  const totalPagesLocal = Math.max(
    1,
    Math.ceil(filteredByStatus.length / pageSize),
  );
  const currentPageData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    return filteredByStatus.slice(start, end);
  }, [filteredByStatus, pageNumber, pageSize]);

  if (loading) return <LoadingPage />;
  if (loadErr)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200/60 bg-red-50/70 px-6 py-4 text-red-700 shadow-sm">
          Lỗi: {loadErr}
        </div>
      </div>
    );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(37,99,235,0.18),transparent_60%),radial-gradient(40%_30%_at_90%_10%,rgba(14,165,233,0.14),transparent_60%),radial-gradient(30%_25%_at_10%_20%,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="absolute inset-0 [background-size:25px_25px] opacity-[0.06] [background:linear-gradient(0deg,transparent_24px,rgba(2,6,23,0.08)_25px),linear-gradient(90deg,transparent_24px,rgba(2,6,23,0.08)_25px)]" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h2 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <span className="inline-grid place-items-center rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 p-2 text-white shadow-sm ring-1 ring-white/10">
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-500 bg-clip-text text-transparent">
              Danh sách đề tài đã nộp
            </span>
          </h2>
          <p className="text-sm text-slate-500">
            Lọc theo trạng thái, học kỳ, danh mục hoặc tìm kiếm bằng từ khóa
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-[0_10px_40px_-20px_rgba(2,6,23,0.25)] backdrop-blur"
      >
        <div className="pointer-events-none absolute -top-14 -right-14 h-56 w-56 rounded-full bg-gradient-to-br from-blue-300/25 to-cyan-300/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-gradient-to-tr from-indigo-300/20 to-sky-300/20 blur-2xl" />

        <div className="mb-6 flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Đề tài của tôi
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Lọc theo trạng thái, học kỳ, danh mục hoặc tìm kiếm bằng từ khóa
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm đề tài..."
              className="w-80 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60"
            />
          </div>
        </div>

        <TopicAnalysisWithFilters
          data={stats}
          semesters={semesterOptions}
          categories={categoryOptions}
          selectedSemesterId={semesterId}
          selectedCategoryId={categoryId}
          selectedStatus={filterStatus}
          onSelectSemester={(id) => setSemesterId(id)}
          onSelectCategory={(id) => setCategoryId(id)}
          onSelectStatus={(s) => {
            if (s === "all") {
              setSemesterId(undefined);
              setCategoryId(undefined);
            }
            setFilterStatus(s);
          }}
          statusCountMap={statusCountMap}
        />

        <div className="mt-6">
          <DataTable
            data={currentPageData}
            columns={columns}
            visibility={DEFAULT_VISIBILITY}
            page={pageNumber}
            setPage={setPageNumber}
            totalPages={totalPagesLocal}
            limit={pageSize}
            setLimit={setPageSize}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default AllSubmittedTopicPage;

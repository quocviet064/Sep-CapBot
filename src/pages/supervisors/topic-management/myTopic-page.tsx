import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { createMyTopicColumns } from "./columnsMyTopics";
import TopicAnalysis from "../TopicAnalysis";
import { fetchAllMyTopics, useMyTopics } from "@/hooks/useTopic";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

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
  currentStatus: true,
  currentVersionNumber: false,
  isApproved: true,
  isLegacy: false,
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
      } catch (e: unknown) {
        void e;
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
  if (error)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200/60 bg-red-50/70 px-6 py-4 text-red-700 shadow-sm">
          Lỗi: {error.message}
        </div>
      </div>
    );

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
              Danh sách đề tài của tôi
            </span>
          </h2>
          <p className="text-sm text-slate-500">
            Xem, lọc trạng thái và tra cứu nhanh các đề tài của bạn
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
              Lọc theo trạng thái hoặc tìm kiếm bằng từ khóa
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

        <TopicAnalysis data={stats} onFilterClick={setFilterStatus} />

        <div className="mt-6">
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
      </motion.div>
    </div>
  );
}

export default MyTopicPage;

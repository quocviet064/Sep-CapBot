import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";

import { fetchAllTopics, type TopicListItem } from "@/services/topicService";
import { createTopicListColumns } from "./ColumnsTopicList";
import TopicFiltersAllTopics, { SimpleOption } from "./TopicFiltersAllTopics";

const DEFAULT_VISIBILITY = {
  id: false,
  eN_Title: true,
  vN_title: true,
  abbreviation: false,
  supervisorName: true,
  categoryName: true,
  semesterName: true,
  description: false,
  problem: false,
  context: false,
  content: true,
  maxStudents: false,
  hasSubmitted: false,
  currentVersionStatus: true,
  latestSubmissionStatus: true,
  latestSubmittedAt: true,
  currentVersionNumber: true,
  isApproved: true,
  isLegacy: false,
  createdAt: false,
  createdBy: true,
};

const isSubmissionApproved = (t: TopicListItem) =>
  (t.latestSubmissionStatus ?? "").toString().toLowerCase() === "approved";

type TopicWithCreator = TopicListItem & {
  createdByName?: string | null;
  createdBy?: string | null;
  supervisorName?: string | null;
};

const creatorNameOf = (t: TopicWithCreator) =>
  (t.createdByName ?? t.createdBy ?? t.supervisorName ?? "").toString();

export default function TopicsListApprovedPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [approvedList, setApprovedList] = useState<TopicListItem[]>([]);
  const [semesterId, setSemesterId] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [creatorId, setCreatorId] = useState<number | undefined>(undefined);

  const navigate = useNavigate();
  const columns = useMemo(
    () =>
      createTopicListColumns({
        onViewDetail: (id) =>
          navigate(`/supervisors/topics/all-topics-list/topics/${id}`),
      }),
    [navigate],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadErr(null);
        const first = await fetchAllTopics(
          undefined,
          undefined,
          1,
          100,
          searchTerm.trim() ? searchTerm.trim() : undefined,
        );
        const all: TopicListItem[] = [...(first.listObjects ?? [])];
        for (let p = 2; p <= (first.totalPages ?? 1); p++) {
          const res = await fetchAllTopics(
            undefined,
            undefined,
            p,
            100,
            searchTerm.trim() ? searchTerm.trim() : undefined,
          );
          if (Array.isArray(res.listObjects) && res.listObjects.length) {
            all.push(...res.listObjects);
          }
        }
        if (!mounted) return;
        setApprovedList(all.filter(isSubmissionApproved));
        setPageNumber(1);
      } catch (e) {
        setLoadErr(
          e instanceof Error ? e.message : "Không thể tải danh sách chủ đề",
        );
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [searchTerm]);

  const semesterOptions: SimpleOption[] = useMemo(() => {
    const names = Array.from(
      new Set((approvedList || []).map((t) => t.semesterName).filter(Boolean)),
    );
    return names.map((name, idx) => ({ id: idx + 1, name: name as string }));
  }, [approvedList]);

  const categoryOptions: SimpleOption[] = useMemo(() => {
    const names = Array.from(
      new Set((approvedList || []).map((t) => t.categoryName).filter(Boolean)),
    );
    return names.map((name, idx) => ({ id: idx + 1, name: name as string }));
  }, [approvedList]);

  const creatorOptions: SimpleOption[] = useMemo(() => {
    const names = Array.from(
      new Set(
        (approvedList || [])
          .map((t) => creatorNameOf(t as TopicWithCreator))
          .filter((x) => typeof x === "string" && x.trim().length > 0),
      ),
    );
    return names.map((name, idx) => ({ id: idx + 1, name }));
  }, [approvedList]);

  const selectedSemesterName = useMemo(() => {
    if (semesterId == null) return undefined;
    return semesterOptions.find((o) => o.id === semesterId)?.name;
  }, [semesterId, semesterOptions]);

  const selectedCategoryName = useMemo(() => {
    if (categoryId == null) return undefined;
    return categoryOptions.find((o) => o.id === categoryId)?.name;
  }, [categoryId, categoryOptions]);

  const selectedCreatorName = useMemo(() => {
    if (creatorId == null) return undefined;
    return creatorOptions.find((o) => o.id === creatorId)?.name;
  }, [creatorId, creatorOptions]);

  const filteredList = useMemo(() => {
    let list = approvedList.slice();
    if (selectedSemesterName) {
      list = list.filter((t) => t.semesterName === selectedSemesterName);
    }
    if (selectedCategoryName) {
      list = list.filter((t) => t.categoryName === selectedCategoryName);
    }
    if (selectedCreatorName) {
      list = list.filter(
        (t) => creatorNameOf(t as TopicWithCreator) === selectedCreatorName,
      );
    }
    return list;
  }, [
    approvedList,
    selectedSemesterName,
    selectedCategoryName,
    selectedCreatorName,
  ]);

  useEffect(() => {
    setPageNumber(1);
  }, [pageSize, searchTerm, semesterId, categoryId, creatorId]);

  const totalPagesLocal = Math.max(
    1,
    Math.ceil(filteredList.length / pageSize),
  );
  const currentPageData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    return filteredList.slice(start, end);
  }, [filteredList, pageNumber, pageSize]);

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
              Danh sách chủ đề trong hệ thống
            </span>
          </h2>
          <p className="text-sm text-slate-500">Tất cả đề tài đã duyệt</p>
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
              Kho lưu trữ đề tài
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Tìm kiếm theo từ khóa (áp dụng trước khi lọc)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm chủ đề..."
              className="w-80 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60"
            />
          </div>
        </div>

        <TopicFiltersAllTopics
          total={approvedList.length}
          semesters={semesterOptions}
          categories={categoryOptions}
          creators={creatorOptions}
          selectedSemesterId={semesterId}
          selectedCategoryId={categoryId}
          selectedCreatorId={creatorId}
          onSelectSemester={(id) => setSemesterId(id)}
          onSelectCategory={(id) => setCategoryId(id)}
          onSelectCreator={(id) => setCreatorId(id)}
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

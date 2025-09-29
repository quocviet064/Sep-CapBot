import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import TopicSubmittedTable from "./TopicSubmittedTable";
import { useTopics } from "@/hooks/useTopic";
import type { TopicListItem } from "@/services/topicService";
import { getTopicDetail, type TopicDetailResponse } from "@/services/topicService";
import { toast } from "sonner";

export default function SubmittedTopicsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string | "">("");
  const [statusFilter, setStatusFilter] = useState<string | "">("");

  // loadingTopicId: id của topic đang fetch detail -> dùng để disable nút View tương ứng
  const [loadingTopicId, setLoadingTopicId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, refetch, isFetching } = useTopics(
    undefined,
    undefined,
    page,
    pageSize,
    debouncedSearch || undefined,
    undefined,
  );

  const topics = Array.isArray(data?.listObjects) ? data!.listObjects : [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const t of topics) {
      if (t.categoryName) set.add(t.categoryName);
    }
    return Array.from(set).sort();
  }, [topics]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    for (const t of topics) {
      if (t.latestSubmissionStatus) set.add(t.latestSubmissionStatus);
    }
    return Array.from(set).sort();
  }, [topics]);

  const filtered = useMemo<TopicListItem[]>(() => {
    return topics
      .filter((t) => !!t.hasSubmitted)
      .filter((t) => (categoryFilter ? t.categoryName === categoryFilter : true))
      .filter((t) => (statusFilter ? (t.latestSubmissionStatus ?? "") === statusFilter : true))
      .filter((t) => {
        if (!debouncedSearch) return true;
        const kw = debouncedSearch.toLowerCase();
        return (
          (t.abbreviation ?? "").toLowerCase().includes(kw) ||
          (t.eN_Title ?? "").toLowerCase().includes(kw) ||
          (t.vN_title ?? "").toLowerCase().includes(kw) ||
          (t.supervisorName ?? "").toLowerCase().includes(kw)
        );
      });
  }, [topics, debouncedSearch, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const totalRecords = data?.paging?.totalRecord ?? null;

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch {
      /* ignore */
    }
  };

  // NEW: when user clicks View on a topic -> fetch topic detail via react-query and navigate to latest submission if exists
  const handleViewSubmission = async (topic: TopicListItem) => {
    setLoadingTopicId(topic.id);
    try {
      // TanStack Query v4 fetchQuery syntax (object) with typing
      const detail = await qc.fetchQuery<TopicDetailResponse>({
        queryKey: ["topicDetail", topic.id],
        queryFn: () => getTopicDetail(topic.id),
      });

      // ensure cache has this data (fetchQuery already sets it)
      qc.setQueryData<TopicDetailResponse>(["topicDetail", topic.id], detail);

      const subs = Array.isArray(detail?.submissions) ? detail.submissions.slice() : [];
      if (subs.length > 0) {
        // pick latest by submittedAt (fall back to array order)
        subs.sort((a, b) => {
          const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return tb - ta;
        });
        const latest = subs[0];
        navigate(`/moderators/submissions/${latest.id}`, { state: { topicId: topic.id, topicDetail: detail } });
      } else {
        // fallback to topic detail page
        navigate(`/topics/${topic.id}`, { state: { topicDetail: detail } });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Không thể lấy chi tiết đề tài");
    } finally {
      setLoadingTopicId(null);
    }
  };

  return (
    <div className="w-full px-4 py-4">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold">Topics đã nộp</h1>
          <div className="text-sm text-slate-500" id="totalInfo">
            {isFetching
              ? "Đang tải…"
              : totalRecords != null
              ? `${totalRecords} kết quả • Trang ${page} / ${totalPages}`
              : "Đang tải…"}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-2 rounded-md bg-teal-500 text-white text-sm"
            id="refreshBtn"
            onClick={handleRefresh}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md mt-4 p-4 w-full overflow-x-auto">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <input
            id="search"
            type="search"
            placeholder="Tìm theo mã / tiêu đề / GVHD..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (page !== 1) setPage(1);
            }}
            className="px-3 py-2 rounded-md border border-slate-200 min-w-[220px] text-sm"
          />

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value ?? "");
              setPage(1);
            }}
            className="px-3 py-2 rounded-md border border-slate-200 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value ?? "");
              setPage(1);
            }}
            className="px-3 py-2 rounded-md border border-slate-200 text-sm"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              const v = Number(e.target.value) || 10;
              setPageSize(v);
              setPage(1);
            }}
            className="px-3 py-2 rounded-md border border-slate-200 text-sm"
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
          </select>

          <div className="ml-auto text-sm text-slate-500" id="statusNote">
            {isFetching ? "Đang cập nhật..." : "Sẵn sàng"}
          </div>
        </div>

        <TopicSubmittedTable
          rows={filtered}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          onViewSubmission={handleViewSubmission}
          loadingTopicId={loadingTopicId}
        />

        <div className="flex items-center gap-3 mt-3">
          <button
            id="prevBtn"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>

          <div className="text-sm text-slate-500" id="pageInfo">
            {page} / {totalPages}
          </div>

          <button
            id="nextBtn"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-3 text-sm text-slate-500">Đang tải dữ liệu...</div>
      )}
    </div>
  );
}

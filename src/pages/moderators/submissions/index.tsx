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

  const [loadingTopicId, setLoadingTopicId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // PASS filters to useTopics (server-side). If your useTopics signature differs adjust params.
  const { data, isLoading, refetch, isFetching } = useTopics(
    undefined,
    undefined,
    page,
    pageSize,
    debouncedSearch || undefined,
    undefined,
    categoryFilter || undefined,
    statusFilter || undefined
  );

  const topics = data?.listObjects ?? [];

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

  // If you're using server-side filtering/paging, filtered = topics (server already filtered).
  // Otherwise, keep client-side filtering here.
  const filtered = useMemo<TopicListItem[]>(() => {
    return topics.filter((t) => !!t.hasSubmitted);
  }, [topics]);

  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const totalRecords = data?.paging?.totalRecord ?? null;

  // clamp page if totalPages decreased
  useEffect(() => {
    if (!data) return;
    const tp = Math.max(1, data.totalPages ?? 1);
    setPage((p) => Math.min(p, tp));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.totalPages]);

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch {
      /* ignore */
    }
  };

  /**
   * handleViewSubmission:
   * - fetch topic detail
   * - if topic.currentVersionStatus === "Submitted", prefer submissions that have topicVersionId (these are version-submissions)
   * - pick newest submission among matching set (by submittedAt)
   * - navigate to submission detail route and include state { topicId, topicDetail, submissionId, topicVersionId? }
   *
   * This allows the detail page to detect state.topicVersionId and load topic version data instead of main topic when needed.
   */
  const handleViewSubmission = async (topic: TopicListItem) => {
    setLoadingTopicId(topic.id);
    try {
      const detail = await qc.fetchQuery<TopicDetailResponse>({
        queryKey: ["topicDetail", topic.id],
        queryFn: () => getTopicDetail(topic.id),
        staleTime: 1000 * 60 * 5,
      });

      qc.setQueryData<TopicDetailResponse>(["topicDetail", topic.id], detail);

      const subs = Array.isArray(detail?.submissions) ? detail.submissions.slice() : [];
      if (subs.length === 0) {
        // no submissions -> go to topic page
        navigate(`/topics/${topic.id}`, { state: { topicDetail: detail } });
        return;
      }

      // Prefer version-submissions when:
      // 1) topic.currentVersionStatus indicates a submitted version, OR
      // 2) there exists any submission with topicVersionId (fallback rule)
      const topicCurVerStatus = (topic as any)?.currentVersionStatus ?? detail?.currentVersionStatus;
      const curVerSubmitted = typeof topicCurVerStatus === "string" && topicCurVerStatus.trim().toLowerCase().includes("submitted");

      let candidates = subs;
      if (curVerSubmitted) {
        const withVersion = subs.filter((s) => s.topicVersionId !== null && s.topicVersionId !== undefined);
        if (withVersion.length > 0) {
          candidates = withVersion;
        }
      } else {
        // If currentVersionStatus not set but there are submissions that reference topicVersionId,
        // it's safer to prefer those (covers edge cases where list doesn't show currentVersionStatus).
        const withVersionAny = subs.filter((s) => s.topicVersionId !== null && s.topicVersionId !== undefined);
        if (withVersionAny.length > 0) {
          candidates = withVersionAny;
        }
      }

      // pick latest by submittedAt (fall back to assigned timestamps if needed)
      candidates.sort((a, b) => {
        const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return tb - ta;
      });
      const latest = candidates[0];

      const navState: any = { topicId: topic.id, topicDetail: detail, submissionId: latest.id };
      if (latest.topicVersionId !== null && latest.topicVersionId !== undefined) {
        navState.topicVersionId = latest.topicVersionId;
      }

      navigate(`/moderators/submissions/${latest.id}`, { state: navState });
    } catch (err: any) {
      const msg = err?.message ?? (typeof err === "string" ? err : JSON.stringify(err)) ?? "Không thể lấy chi tiết đề tài";
      toast.error(msg);
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
            disabled={isFetching}
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
          totalRecords={totalRecords ?? undefined}
          onViewSubmission={handleViewSubmission}
          loadingTopicId={loadingTopicId}
        />

        <div className="flex items-center gap-3 mt-3">
          <button
            id="prevBtn"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isFetching}
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
            disabled={page >= totalPages || isFetching}
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

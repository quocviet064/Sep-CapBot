import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import ModeratorTopicsTable from "./ModeratorTopicsTable";
import { useTopics } from "@/hooks/useTopic";
import { getTopicDetail } from "@/services/topicService";
import type { TopicListItem, TopicDetailResponse } from "@/services/topicService";

import TopicAnalysisWithFilters, { type StatusValue } from "@/pages/supervisors/all-submitted-topics/TopicAnalysisWithFilters";

export default function SubmittedTopicsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [semesterFilter, setSemesterFilter] = useState<string>("");
  const [loadingTopicId, setLoadingTopicId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching } = useTopics(
    undefined,
    undefined,
    1, 
    1000, 
    debouncedSearch || undefined,
  );

  const topicsFromServer: TopicListItem[] = data?.listObjects ?? [];
  const optionsSource = topicsFromServer;

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const t of optionsSource) {
      if (t.categoryName) set.add(String(t.categoryName));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [optionsSource]);

  const semesters = useMemo(() => {
    const set = new Set<string>();
    for (const t of optionsSource) {
      if (t.semesterName) set.add(String(t.semesterName));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [optionsSource]);

  // Show topics that have submissions
  const submittedTopics = useMemo(
    () => topicsFromServer.filter((t) => !!t.hasSubmitted),
    [topicsFromServer],
  );

  const filteredList = useMemo(() => {
    let list = submittedTopics.slice();

    if (categoryFilter) {
      list = list.filter(
        (t) => String(t.categoryName ?? "").toLowerCase() === categoryFilter.toLowerCase(),
      );
    }
    if (semesterFilter) {
      list = list.filter(
        (t) => String(t.semesterName ?? "").toLowerCase() === semesterFilter.toLowerCase(),
      );
    }
    if (statusFilter) {
      const filterNorm = String(statusFilter).trim().toLowerCase();
      list = list.filter((t) => {
        const s = String(t.latestSubmissionStatus ?? "").trim().toLowerCase();
        if (
          filterNorm === "approved" ||
          filterNorm === "rejected" ||
          filterNorm === "pending" ||
          filterNorm === "underreview" ||
          filterNorm === "duplicate" ||
          filterNorm === "revisionrequired" ||
          filterNorm === "escalatedtomoderator"
        ) {
          return s.includes(filterNorm.replace(/_/g, ""));
        }
        return s === filterNorm;
      });
    }

    return list;
  }, [submittedTopics, categoryFilter, semesterFilter, statusFilter]);

  const totalRecords = filteredList.length;
  const totalPagesLocal = Math.max(1, Math.ceil(totalRecords / pageSize));

  useEffect(() => {
    if (page > totalPagesLocal) setPage(totalPagesLocal);
  }, [totalPagesLocal]);

  const currentPageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, page, pageSize]);

  const normalizeStatus = (s: unknown) => {
    const v =
      typeof s === "object" && s !== null
        ? ""
        : String(s ?? "").trim().toLowerCase();
    if (v === "approved") return "Approved";
    if (v === "rejected") return "Rejected";
    if (v === "underreview" || v === "under_review" || v === "under review") return "UnderReview";
    if (v === "duplicate") return "Duplicate";
    if (v === "revisionrequired" || v === "revision_required") return "RevisionRequired";
    if (v === "escalatedtomoderator" || v === "escalated_to_moderator") return "EscalatedToModerator";
    return "Pending";
  };

  const statusCountMap = useMemo(() => {
    const map: Record<string, number> = {
      Pending: 0,
      UnderReview: 0,
      Duplicate: 0,
      RevisionRequired: 0,
      EscalatedToModerator: 0,
      Approved: 0,
      Rejected: 0,
    };
    for (const t of filteredList) {
      const k = normalizeStatus(t.latestSubmissionStatus);
      map[k] = (map[k] || 0) + 1;
    }
    return map;
  }, [filteredList]);

  const stats = useMemo(() => {
    const total = filteredList.length;
    const approved = statusCountMap.Approved ?? 0;
    const rejecting = statusCountMap.Rejected ?? 0;
    const pending = Math.max(0, total - approved - rejecting);
    return { approved, pending, rejecting, total };
  }, [filteredList.length, statusCountMap]);

  const handleViewSubmission = async (topic: TopicListItem) => {
    setLoadingTopicId(topic.id);
    try {
      const detail = await qc.fetchQuery<TopicDetailResponse>({
        queryKey: ["topicDetail", topic.id],
        queryFn: () => getTopicDetail(topic.id),
        staleTime: 1000 * 60 * 5,
      });

      qc.setQueryData<TopicDetailResponse>(["topicDetail", topic.id], detail);

      const subs = Array.isArray((detail as any)?.submissions) ? (detail as any).submissions.slice() : [];
      if (subs.length === 0) {
        navigate(`/topics/${topic.id}`, { state: { topicDetail: detail } });
        return;
      }
      // find latest submission that is submitted 
      const topicCurVerStatus =
        (topic as any)?.currentVersionStatus ??
        (detail as any)?.currentVersionStatus ??
        (detail as any)?.currentVersion?.status;
      const curVerSubmitted =
        typeof topicCurVerStatus === "string" && topicCurVerStatus.trim().toLowerCase().includes("submitted");

      let candidates = subs;
      if (curVerSubmitted) {
        const withVersion = subs.filter((s: any) => (s as any).topicVersionId != null);
        if (withVersion.length > 0) candidates = withVersion;
      } else {
        const withVersionAny = subs.filter((s: any) => (s as any).topicVersionId != null);
        if (withVersionAny.length > 0) candidates = withVersionAny;
      }

      candidates.sort((a: any, b: any) => {
        const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : ((a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0);
        const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : ((b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0);
        return tb - ta;
      });

      const latest = candidates[0];
      const navState: any = { topicId: topic.id, topicDetail: detail, submissionId: latest.id };
      if ((latest as any).topicVersionId != null) navState.topicVersionId = (latest as any).topicVersionId;
      navigate(`/moderators/submissions/${latest.id}`, { state: navState });
    } catch (err: any) {
      const msg =
        err?.message ?? (typeof err === "string" ? err : JSON.stringify(err)) ?? "Không thể lấy chi tiết đề tài";
      toast.error(msg);
    } finally {
      setLoadingTopicId(null);
    }
  };
  const semesterOptions = useMemo(() => semesters.map((s, idx) => ({ id: idx + 1, name: s })), [semesters]);
  const categoryOptions = useMemo(() => categories.map((c, idx) => ({ id: idx + 1, name: c })), [categories]);

  const selectedSemesterId = useMemo<number | undefined>(() => {
    if (!semesterFilter) return undefined;
    return semesterOptions.find((o) => o.name === semesterFilter)?.id;
  }, [semesterFilter, semesterOptions]);

  const selectedCategoryId = useMemo<number | undefined>(() => {
    if (!categoryFilter) return undefined;
    return categoryOptions.find((o) => o.name === categoryFilter)?.id;
  }, [categoryFilter, categoryOptions]);

  const onSelectSemester = (id?: number) => {
    if (!id) {
      setSemesterFilter("");
    } else {
      const name = semesterOptions.find((s) => s.id === id)?.name ?? "";
      setSemesterFilter(name);
    }
    setPage(1);
  };

  const onSelectCategory = (id?: number) => {
    if (!id) {
      setCategoryFilter("");
    } else {
      const name = categoryOptions.find((c) => c.id === id)?.name ?? "";
      setCategoryFilter(name);
    }
    setPage(1);
  };

  const onSelectStatus = (s: StatusValue) => {
    if (s === "all") {
      setStatusFilter("");
    } else {
      setStatusFilter(s);
    }
    setPage(1);
  };

  const handlers = {
    onViewSubmission: (topicId: number, preferredSubmissionId?: number) => {
      const topic = filteredList.find((t) => t.id === topicId);
      if (!topic) {
        toast.error("Topic not found");
        return;
      }
      if (preferredSubmissionId) {
        navigate(`/moderators/submissions/${preferredSubmissionId}`, {
          state: { topicId, submissionId: preferredSubmissionId },
        });
        return;
      }
      handleViewSubmission(topic);
    },
    onOpenAssignments: (topicId: number) => toast(`Open assignments for topic ${topicId}`),
    onOpenFinalDecision: (topicId: number) => toast(`Open final decision dialog for topic ${topicId}`),
  };

  return (
    <div className="w-full px-4 py-6 space-y-4">
      <div className="bg-white border border-slate-200 rounded-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Topics đã nộp</h1>
            <div className="text-sm text-slate-500">
              {isFetching ? "Đang tải…" : `${totalRecords ?? 0} kết quả • Trang ${page} / ${totalPagesLocal}`}
            </div>
          </div>
          <input
            id="search"
            type="search"
            placeholder="Tìm theo mã / tiêu đề / GVHD..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-md border border-slate-200 min-w-[220px] text-sm"
          />
        </div>

        <div className="mb-6">
          <TopicAnalysisWithFilters
            data={stats}
            semesters={semesterOptions}
            categories={categoryOptions}
            selectedSemesterId={selectedSemesterId}
            selectedCategoryId={selectedCategoryId}
            selectedStatus={(statusFilter as StatusValue) ?? "all"}
            onSelectSemester={onSelectSemester}
            onSelectCategory={onSelectCategory}
            onSelectStatus={onSelectStatus}
            statusCountMap={statusCountMap as any}
          />
        </div>

        <ModeratorTopicsTable
          rows={currentPageData}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          totalPages={totalPagesLocal}
          totalRecords={totalRecords ?? undefined}
          loadingTopicId={loadingTopicId}
          handlers={handlers}
        />
      </div>

      {isLoading && <div className="mt-3 text-sm text-slate-500">Đang tải dữ liệu...</div>}
    </div>
  );
}

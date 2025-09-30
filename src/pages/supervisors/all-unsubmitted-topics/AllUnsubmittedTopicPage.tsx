import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { fetchAllMyTopics } from "@/hooks/useTopic";
import type { TopicListItem } from "@/services/topicService";
import { createMyUnsubmittedTopicColumns } from "./ColumnsAllUnsubmittedTopics";
import SubmitTopicDialog from "./SubmitTopicDialog";

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
  hasSubmitted: true,
  currentVersionStatus: false,
  latestSubmissionStatus: false,
  latestSubmittedAt: false,
  currentVersionNumber: false,
  isApproved: false,
  isLegacy: false,
  createdAt: true,
};

function AllUnsubmittedTopicPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navType = useNavigationType();
  const navigate = useNavigate();

  const semesterIdParam = searchParams.get("semesterId");
  const semesterNameParam = (searchParams.get("semesterName") || "")
    .trim()
    .toLowerCase();
  const semesterId = semesterIdParam ? Number(semesterIdParam) : undefined;

  const phaseIdParam = searchParams.get("phaseId");
  const phaseNameParam = searchParams.get("phaseName") || undefined;
  const phaseIdDefault = phaseIdParam ? Number(phaseIdParam) : undefined;

  const phaseDisplay = useMemo(() => {
    if (phaseNameParam && phaseIdDefault)
      return `${phaseNameParam} #${phaseIdDefault}`;
    if (phaseNameParam) return phaseNameParam;
    if (phaseIdDefault) return `#${phaseIdDefault}`;
    return undefined;
  }, [phaseNameParam, phaseIdDefault]);

  const [categoryId] = useState<number | undefined>(undefined);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [openSubmit, setOpenSubmit] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<TopicListItem | null>(null);

  const columns = useMemo(
    () =>
      createMyUnsubmittedTopicColumns({
        onViewDetail: (id) => {
          const qs = new URLSearchParams();
          if (phaseIdDefault) qs.set("phaseId", String(phaseIdDefault));
          if (phaseNameParam) qs.set("phaseName", phaseNameParam);
          navigate(`/unsubmitted/topics/${id}?${qs.toString()}`);
        },
        onRequestSubmit: (topic) => {
          setCurrentTopic(topic);
          setOpenSubmit(true);
        },
      }),
    [navigate, phaseIdDefault, phaseNameParam],
  );

  const {
    data: allTopics = [],
    isLoading,
    error,
    refetch,
  } = useQuery<TopicListItem[], Error>({
    queryKey: ["my-topics-all", semesterId, categoryId, searchTerm],
    queryFn: () => fetchAllMyTopics(semesterId, categoryId, searchTerm),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setPageNumber(1);
  }, [pageSize, searchTerm, semesterId, categoryId]);

  useEffect(() => {
    if (navType === "POP") refetch();
  }, [location.key, navType, refetch]);

  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  const pageUnsubmitted = useMemo(() => {
    let base = allTopics.filter(
      (t) => !t.hasSubmitted || t.latestSubmissionStatus === "RevisionRequired",
    );
    if (semesterNameParam) {
      base = base.filter(
        (t) =>
          (t.semesterName || "").trim().toLowerCase() === semesterNameParam,
      );
    }
    return base;
  }, [allTopics, semesterNameParam]);

  const totalPagesLocal = Math.max(
    1,
    Math.ceil(pageUnsubmitted.length / pageSize),
  );

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <>
      <div className="space-y-4">
        <div className="min-h-[600px] rounded-2xl border px-4 py-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              Danh sách đề tài chưa nộp / cần sửa
              {phaseDisplay && (
                <span className="ml-2 inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-2 py-0.5 text-sm font-semibold text-white shadow-sm">
                  {phaseDisplay}
                </span>
              )}
            </h2>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm đề tài..."
              className="w-80 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200/60"
            />
          </div>

          <DataTable
            data={pageUnsubmitted}
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

      <SubmitTopicDialog
        isOpen={openSubmit}
        onClose={() => setOpenSubmit(false)}
        topic={currentTopic}
        defaultPhaseId={phaseIdDefault}
        defaultPhaseName={phaseNameParam}
        onSuccess={async () => {
          await refetch();
          setOpenSubmit(false);
        }}
      />
    </>
  );
}

export default AllUnsubmittedTopicPage;

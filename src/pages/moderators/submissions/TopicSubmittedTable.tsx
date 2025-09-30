import type { TopicListItem } from "@/services/topicService";

type Props = {
  rows: TopicListItem[];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  totalPages: number;
  onViewSubmission: (topic: TopicListItem) => void;
  loadingTopicId?: number | null; 
};

function statusColorClass(status?: string) {
  if (!status) return "bg-slate-100 text-slate-700";
  const s = status.toLowerCase();
  if (s.includes("under") || s.includes("pending")) return "bg-yellow-100 text-yellow-800";
  if (s.includes("approved")) return "bg-green-100 text-green-800";
  if (s.includes("rejected")) return "bg-red-100 text-red-800";
  if (s.includes("duplicate")) return "bg-purple-100 text-purple-800";
  if (s.includes("revision") || s.includes("revisionrequired")) return "bg-orange-100 text-orange-800";
  if (s.includes("escalated")) return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

export default function TopicSubmittedTable({
  rows,
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  onViewSubmission,
  loadingTopicId = null,
}: Props) {
  if (!rows || rows.length === 0) {
    return <div className="p-4 text-slate-500">Không có topic đã nộp</div>;
  }

  return (
    <div id="tableWrap" className="w-full overflow-x-auto">
      <table className="w-full min-w-full" style={{ borderCollapse: "collapse", tableLayout: "auto" }}>
        <thead>
          <tr>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">ID</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">Tiêu đề</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">Mã</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">Category</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">Semester</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">GVHD</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">Status</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">Nộp lúc</th>
            <th className="text-center p-3 bg-slate-50 text-sm font-semibold border-b">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const isLoading = loadingTopicId === r.id;
            return (
              <tr key={String(r.id)} className="hover:bg-slate-50">
                <td className="p-3 align-top text-sm whitespace-nowrap">#{r.id}</td>

                {/* Title */}
                <td className="p-3 align-top text-sm max-w-[420px]">
                  <div className="font-medium text-sm">{r.eN_Title ?? "—"}</div>
                  <div className="text-xs text-slate-500 mt-1">{r.vN_title ?? "—"}</div>
                </td>

                <td className="p-3 align-top text-sm whitespace-nowrap">{r.abbreviation ?? "—"}</td>

                <td className="p-3 align-top text-sm whitespace-nowrap">{r.categoryName ?? "—"}</td>

                <td className="p-3 align-top text-sm whitespace-nowrap">{r.semesterName ?? "—"}</td>

                <td className="p-3 align-top text-sm">{r.supervisorName ?? "—"}</td>

                <td className="p-3 align-top text-sm whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass(
                      r.latestSubmissionStatus,
                    )}`}
                  >
                    {r.latestSubmissionStatus ?? "—"}
                  </span>
                </td>

                <td className="p-3 align-top text-sm whitespace-nowrap">
                  {r.latestSubmittedAt ? new Date(r.latestSubmittedAt).toLocaleString() : "—"}
                </td>

                <td className="p-3 align-top text-sm text-center">
                  <button
                    aria-label={isLoading ? `Loading topic ${r.id}` : `View topic ${r.id}`}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-sm ${
                      isLoading ? "opacity-60 cursor-wait" : "hover:bg-slate-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLoading) onViewSubmission(r);
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>View</span>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

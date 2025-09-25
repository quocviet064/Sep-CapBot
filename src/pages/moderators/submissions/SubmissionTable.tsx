// src/pages/moderators/submissions/SubmissionTable.tsx
import React from "react";
import type { SubmissionListItem } from "@/services/submissionService";

type Props = {
  rows: SubmissionListItem[];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  totalPages: number;
  onViewDetail: (row: SubmissionListItem) => void;
};

export default function SubmissionTable({
  rows,
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  onViewDetail,
}: Props) {
  if (!rows || rows.length === 0) {
    return <div className="p-4 text-slate-500">Không có submission</div>;
  }

  return (
    // wrapper ensures horizontal scroll available
    <div id="tableWrap" className="w-full overflow-x-auto">
      <table
        className="w-full min-w-full"
        style={{ borderCollapse: "collapse", tableLayout: "auto" }}
      >
        <thead>
          <tr>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">ID</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">Topic</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">Submitted by</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">Round</th>
            <th className="text-left p-3 bg-slate-50 text-sm font-semibold border-b">Submitted at</th>
            <th className="text-center p-3 bg-slate-50 text-sm font-semibold border-b">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)} className="hover:bg-slate-50">
              <td className="p-3 align-top text-sm whitespace-nowrap">#{r.id}</td>
              <td className="p-3 align-top text-sm">{r.topicTitle ?? "—"}</td>
              <td className="p-3 align-top text-sm">{r.submittedByName ?? "—"}</td>
              <td className="p-3 align-top text-sm whitespace-nowrap">{r.submissionRound ?? "—"}</td>
              <td className="p-3 align-top text-sm whitespace-nowrap">
                {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}
              </td>
              <td className="p-3 align-top text-sm text-center">
                <button
                  className="px-3 py-1 rounded-md border text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail(r);
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

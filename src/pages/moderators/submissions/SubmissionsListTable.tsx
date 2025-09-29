import type { SubmissionDTO } from "@/services/topicService";

type Props = {
  submissions: SubmissionDTO[];
  onView: (submissionId: number) => void;
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

export default function SubmissionsListTable({ submissions, onView }: Props) {
  if (!Array.isArray(submissions) || submissions.length === 0) {
    return <div className="text-sm text-slate-500">Không có submission nào.</div>;
  }

  const sorted = submissions.slice().sort((a, b) => {
    const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return tb - ta;
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500">
            <th className="p-2">ID</th>
            <th className="p-2">Round</th>
            <th className="p-2">Submitted by</th>
            <th className="p-2">Status</th>
            <th className="p-2">Submitted at</th>
            <th className="p-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr key={s.id} className="border-t hover:bg-slate-50">
              <td className="p-2 align-top">#{s.id}</td>
              <td className="p-2 align-top">{s.submissionRound}</td>
              <td className="p-2 align-top">{s.submittedByName ?? s.submittedBy}</td>
              <td className="p-2 align-top">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass(s.status)}`}>
                  {s.status}
                </span>
              </td>
              <td className="p-2 align-top whitespace-nowrap">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}</td>
              <td className="p-2 align-top text-center">
                <button
                  className="px-3 py-1 rounded-md border text-sm"
                  onClick={() => onView(s.id)}
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

import React from "react";
import { statusColorClass } from "@/utils/statusColorClass";

type Props = {
  submissionDetail?: any;
  topicDetail?: any;
};

export default function TopicSubmissionDetail({ submissionDetail, topicDetail }: Props) {
  if (!submissionDetail && !topicDetail) {
    return <div className="text-slate-500 text-sm">Không có thông tin để hiển thị</div>;
  }

  return (
    <div className="bg-white border rounded-md p-4 w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Topic</div>
          <div className="text-xl font-bold mt-1 truncate">
            {topicDetail?.enTitle ?? topicDetail?.vnTitle ?? submissionDetail?.topicTitle ?? "—"}
          </div>
          <div className="text-sm text-slate-600 mt-2 line-clamp-3">
            {topicDetail?.description ?? submissionDetail?.additionalNotes ?? "—"}
          </div>

          {/* tags */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(topicDetail?.tags ?? []).slice(0, 6).map((t: string, i: number) => (
              <span
                key={i}
                className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-[#ecfeff] text-[#0ea5a0] border"
              >
                {t}
              </span>
            ))}
            {Array.isArray(topicDetail?.tags) && topicDetail.tags.length > 6 && (
              <span className="text-xs text-slate-500">+{topicDetail.tags.length - 6} more</span>
            )}
          </div>

          {/* keywords */}
          {(topicDetail?.keywords || topicDetail?.keywordsList) && (
            <div className="mt-3 text-xs text-slate-500">
              <strong>Keywords:</strong>{" "}
              {topicDetail.keywords ?? topicDetail.keywordsList?.join?.(", ") ?? ""}
            </div>
          )}
        </div>

        <div className="text-sm text-right min-w-[180px]">
          <div className="mb-2">
            <div
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                statusColorClass(submissionDetail?.status ?? topicDetail?.latestSubmissionStatus ?? "")
              }`}
            >
              {submissionDetail?.status ?? topicDetail?.latestSubmissionStatus ?? "—"}
            </div>
          </div>

          <div className="text-xs text-slate-500">Max students</div>
          <div className="font-medium mb-2">{topicDetail?.maxStudents ?? "—"}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
        <div>
          <div className="text-xs text-slate-500">Category</div>
          <div className="font-medium">{topicDetail?.categoryName ?? "—"}</div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Semester</div>
          <div className="font-medium">{topicDetail?.semesterName ?? "—"}</div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Supervisor</div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-sm">
              {(topicDetail?.supervisorName ?? "U")
                .split(" ")
                .map((p: string) => p[0]?.toUpperCase())
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <div className="font-medium">{topicDetail?.supervisorName ?? "—"}</div>
              <div className="text-xs text-slate-500">{topicDetail?.supervisorEmail ?? ""}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Document</div>
          <div className="font-medium">
            {submissionDetail?.documentUrl || topicDetail?.documentUrl ? (
              <a
                href={submissionDetail?.documentUrl ?? topicDetail?.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 underline"
              >
                Download document
              </a>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      {/* Extra: Additional notes */}
      {submissionDetail?.additionalNotes && (
        <div className="mt-4">
          <div className="text-xs text-slate-500">Additional Notes</div>
          <div className="text-sm">{submissionDetail.additionalNotes}</div>
        </div>
      )}
    </div>
  );
}

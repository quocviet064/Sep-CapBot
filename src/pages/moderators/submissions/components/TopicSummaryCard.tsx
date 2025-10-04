import React from "react";
import type { TopicDetailResponse } from "@/services/topicService";

export interface TopicSummaryCardProps {
  topicDetail?: TopicDetailResponse;
  displayedTopic?: TopicDetailResponse;
}

function statusColorClass(status?: string) {
  if (!status) return "bg-slate-100 text-slate-700";
  const s = status.toLowerCase();
  if (s.includes("under") || s.includes("pending")) return "bg-yellow-100 text-yellow-800";
  if (s.includes("approved")) return "bg-green-100 text-green-800";
  if (s.includes("rejected")) return "bg-red-100 text-red-800";
  if (s.includes("duplicate")) return "bg-purple-100 text-purple-800";
  if (s.includes("revision")) return "bg-orange-100 text-orange-800";
  if (s.includes("escalated")) return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

function mergeTopicData(topicDetail?: any) {
  if (!topicDetail) return null;
  const topicVersion =
    topicDetail?.topicVersion ?? topicDetail?.currentVersion ?? null;
  const baseTopic = topicDetail?.topic ?? topicDetail;

  if (!topicVersion) return baseTopic;

  const merged: Record<string, any> = { ...baseTopic };
  for (const key in topicVersion) {
    if (topicVersion[key] !== null && topicVersion[key] !== undefined) {
      merged[key] = topicVersion[key];
    }
  }

  return merged;
}

const TopicSummaryCard: React.FC<TopicSummaryCardProps> = ({ topicDetail }) => {
  if (!topicDetail)
    return <div className="text-sm text-slate-500">Không có thông tin đề tài</div>;

  const displayedTopic = mergeTopicData(topicDetail);

  return (
    <div className="bg-white border rounded-md p-4 w-full shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* LEFT SIDE */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-600">Đề tài</div>
          <div className="text-xl font-bold mt-1 truncate">
            {displayedTopic?.eN_Title ?? displayedTopic?.vN_title ?? "—"}
          </div>

          <div className="text-sm text-slate-600 mt-2 line-clamp-3">
            {displayedTopic?.description ?? displayedTopic?.content ?? "—"}
          </div>

          {displayedTopic?.objectives && (
            <div className="mt-3 text-sm text-slate-600">
              <strong>Mục tiêu:</strong> {displayedTopic.objectives}
            </div>
          )}

          {displayedTopic?.problem && (
            <div className="mt-3 text-sm text-slate-600">
              <strong>Vấn đề:</strong> {displayedTopic.problem}
            </div>
          )}

          {displayedTopic?.context && (
            <div className="mt-3 text-sm text-slate-600">
              <strong>Bối cảnh:</strong> {displayedTopic.context}
            </div>
          )}

          {displayedTopic?.methodology && (
            <div className="mt-3 text-sm text-slate-600">
              <strong>Phương pháp:</strong> {displayedTopic.methodology}
            </div>
          )}

          {displayedTopic?.expectedOutcomes && (
            <div className="mt-3 text-sm text-slate-600">
              <strong>Kết quả mong đợi:</strong> {displayedTopic.expectedOutcomes}
            </div>
          )}

          {displayedTopic?.requirements && (
            <div className="mt-3 text-sm text-slate-600">
              <strong>Yêu cầu:</strong> {displayedTopic.requirements}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="text-sm text-right min-w-[180px]">
          <div className="mb-2">
            <div
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass(
                topicDetail?.status ?? topicDetail?.latestSubmissionStatus ?? ""
              )}`}
            >
              {topicDetail?.status ?? topicDetail?.latestSubmissionStatus ?? "—"}
            </div>
          </div>

          <div className="text-xs text-slate-500">Số lượng sinh viên tối đa</div>
          <div className="font-medium mb-2">{displayedTopic?.maxStudents ?? "—"}</div>
        </div>
      </div>

      {/* EXTRA INFO */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
        <div>
          <div className="text-xs text-slate-500">Danh mục</div>
          <div className="font-medium">{displayedTopic?.categoryName ?? "—"}</div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Kỳ học</div>
          <div className="font-medium">{displayedTopic?.semesterName ?? "—"}</div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Giảng viên hướng dẫn</div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-sm">
              {((displayedTopic?.supervisorName ?? "U") as string)
                .split(" ")
                .map((p) => p[0]?.toUpperCase())
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <div className="font-medium">{displayedTopic?.supervisorName ?? "—"}</div>
              <div className="text-xs text-slate-500">{displayedTopic?.supervisorEmail ?? ""}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Tài liệu</div>
          {displayedTopic?.documentUrl ? (
            <a
              href={displayedTopic.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 underline"
            >
              Tải xuống
            </a>
          ) : (
            <div className="font-medium">—</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicSummaryCard;

// src/pages/reviewers/assigned-topics/detail/index.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSubmissionDetail } from "@/services/submissionService";
import LoadingPage from "@/pages/loading-page";

export default function ReviewerAssignedDetail() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["submissionDetail", submissionId],
    queryFn: () => getSubmissionDetail(submissionId!),
    enabled: !!submissionId,
  });

  if (isLoading) return <LoadingPage />;
  if (error) return <div className="p-6 text-red-600">Lỗi tải chi tiết</div>;
  if (!data) return <div className="p-6">Không có dữ liệu</div>;

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-sm"
      >
        ← Quay lại
      </button>

      <h2 className="text-xl font-semibold">Chi tiết Submission</h2>

      <div className="space-y-2">
        <p><strong>Tiêu đề:</strong> {data.title}</p>
        <p><strong>Giảng viên:</strong> {data.lecturerName ?? "--"}</p>
        <p><strong>File nộp:</strong> 
          {data.fileUrl ? (
            <a href={data.fileUrl} target="_blank" className="text-blue-600 underline">Xem file</a>
          ) : " --"}
        </p>
        <p><strong>Ghi chú:</strong> {data.note ?? "--"}</p>
      </div>
    </div>
  );
}

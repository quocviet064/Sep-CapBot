import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import TopicSummaryCard from "@/components/.../TopicSummaryCard"; // chỉnh path
import LoadingPage from "@/pages/loading-page";

import { useSubmissionDetail } from "@/hooks/useSubmission"; // nếu có
import { getTopicDetail } from "@/services/topicService";
import type { TopicDetailResponse } from "@/services/topicService";

export default function ReviewPage() {
  // expected route: /reviewers/evaluate-topics/review?assignmentId=...&reviewId=...
  const { search } = useLocation();
  const qc = useQueryClient();

  // parse query params
  const params = new URLSearchParams(search);
  const submissionIdParam = params.get("submissionId") || params.get("submission") || params.get("submissionId");
  const submissionId = submissionIdParam ? Number(submissionIdParam) : undefined;

  // alternatively sometimes we have assignmentId -> need to fetch assignment then get submissionId/topicId
  const assignmentIdParam = params.get("assignmentId");
  const assignmentId = assignmentIdParam ? Number(assignmentIdParam) : undefined;

  // if you have a hook to fetch submission detail by submissionId:
  const { data: submissionShort, isLoading: loadingSubmission } = useSubmissionDetail(submissionId);

  const [topicDetail, setTopicDetail] = useState<TopicDetailResponse | undefined>(undefined);
  const [loadingTopic, setLoadingTopic] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoadingTopic(true);

        // priority: if submissionShort contains topicId use it
        const topicId =
          (submissionShort as any)?.topicId ??
          (submissionShort as any)?.topic?.id ??
          (submissionShort as any)?.topicId ??
          undefined;

        if (!topicId && assignmentId) {
          // if you only have assignmentId, try to fetch assignment -> then topicId
          // assume you have endpoint /hooks/useAssignment or service getAssignment
          // fallback: try to read cached topic via query key or skip
        }

        if (!topicId) {
          // nothing to show
          setTopicDetail(undefined);
          return;
        }

        // use react-query fetchQuery to reuse cache
        const detail = await qc.fetchQuery<TopicDetailResponse>({
          queryKey: ["topicDetail", topicId],
          queryFn: () => getTopicDetail(topicId),
          staleTime: 1000 * 60 * 5,
        });

        if (!mounted) return;
        setTopicDetail(detail);
      } catch (err: any) {
        console.error("Cannot load topic detail for review page", err);
        toast.error("Không thể tải thông tin đề tài");
      } finally {
        if (mounted) setLoadingTopic(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [qc, submissionShort, assignmentId, submissionId]);

  if (loadingSubmission || loadingTopic) return <LoadingPage />;

  return (
    <div className="w-full px-4 py-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT: Topic summary (2/3 width) */}
        <div className="md:col-span-2 space-y-4">
          <TopicSummaryCard topicDetail={topicDetail} />
        </div>

        {/* RIGHT: Review area (1/3 width) */}
        <aside className="space-y-4">
          {/* Put your existing review UI here: score input, rubric, submit button, attachments... */}
          <div className="bg-white border rounded-md p-4">
            <h3 className="font-semibold mb-3">Phiên đánh giá</h3>
            {/* Example placeholders (thay bằng component đánh giá hiện tại) */}
            <div className="text-sm text-slate-600 mb-3">
              Thông tin đánh giá — form / rubric sẽ hiển thị ở đây.
            </div>
            {/* Example actions */}
            <div className="flex flex-col gap-2">
              <button className="px-3 py-2 rounded bg-indigo-600 text-white">Bắt đầu/Chỉnh sửa đánh giá</button>
              <button className="px-3 py-2 rounded border">Xem rubric</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

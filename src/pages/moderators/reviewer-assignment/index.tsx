// src/pages/moderators/reviewer-assignment/index.tsx
import { useNavigate } from "react-router-dom";
import { useAvailableReviewers, useAssignmentsBySubmission } from "@/hooks/useReviewerAssignment";
import LoadingPage from "@/pages/loading-page";
import { Button } from "@/components/globals/atoms/button";
import { Users, List } from "lucide-react";

export default function ReviewerOverviewPage() {
  const navigate = useNavigate();

  // Nếu muốn dùng một submission cụ thể, bạn có thể bỏ paramId
  // const [searchParams] = useSearchParams();
  // const submissionId = searchParams.get("submissionId") ?? "";

  // 1) Lấy toàn bộ assignments (hiển thị số tổng)
  const { data: assigns, isLoading: loadingAssigns } = useAssignmentsBySubmission(
    /* submissionId? nếu overview toàn global thì pass undefined */
    undefined
  );
  // 2) Lấy danh sách available reviewers
  const { data: reviewers, isLoading: loadingReviewers } = useAvailableReviewers(
    /* tương tự pass undefined để lấy global hết */
    undefined
  );

  if (loadingAssigns || loadingReviewers) return <LoadingPage />;

  const totalAssignments = assigns?.length ?? 0;
  const totalReviewers = reviewers?.length ?? 0;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Tổng quan phân công phản biện</h1>

      {/* Quick Links */}
      <div className="space-x-4">
        <Button onClick={() => navigate("/moderators/reviewer-assignment/available")}>
          Phân công reviewer
        </Button>
        <Button onClick={() => navigate("/moderators/reviewer-assignment/assignments")}>
          Theo dõi phân công
        </Button>
      </div>
    </div>
  );
}

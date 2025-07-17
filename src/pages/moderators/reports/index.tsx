import EvaluationStatus from "./EvaluationStatus";
import ReviewerPerformance from "./ReviewerPerformance";
import TopicByPhase from "./TopicByPhase";

export default function ReportsPage() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Thống kê & báo cáo</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        <TopicByPhase />
        <EvaluationStatus />
        <ReviewerPerformance />
      </div>
    </div>
  );
}

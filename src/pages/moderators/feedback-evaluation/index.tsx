import ApproveNewVersion from "./ApproveNewVersion";
import Suggestions from "./Suggestions";
import HistoryTimeline from "./HistoryTimeline";

export default function FeedbackEvaluationPage() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Phản hồi & đánh giá</h2>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 16 }}>
          <ApproveNewVersion />
          <Suggestions />
        </div>
        <div style={{ flex: 1 }}>
          <HistoryTimeline />
        </div>
      </div>
    </div>
  );
}

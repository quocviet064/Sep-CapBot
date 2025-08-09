import ApproveNewVersion from "./ApproveNewVersion";
import HistoryTimeline from "./HistoryTimeline";
import Suggestions from "./Suggestions";

export default function FeedbackEvaluationPage() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Feedback & Evaluation</h2>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 2 }}>
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

import React from "react";
import EvaluationStatus from "./EvaluationStatus";
import ReviewerPerformance from "./ReviewerPerformance";
import TopicByPhase from "./TopicByPhase";

export default function ReportsPage() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Reports & KPI</h2>
      <EvaluationStatus />
      <ReviewerPerformance />
      <TopicByPhase />
    </div>
  );
}

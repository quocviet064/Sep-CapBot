import React from "react";
import { Card, Tag, Progress } from "antd";
import { topics } from "../mock/topics";

export default function PendingStatusCard() {
  const pending = topics.filter(t => t.status === "PENDING");
  const percent = (pending.length / topics.length) * 100;
  return (
    <Card title="Pending Topics" style={{ minWidth: 240 }}>
      <Tag color={pending.length > 3 ? "orange" : "green"}>{pending.length} Pending</Tag>
      <Progress percent={Math.round(percent)} size="small" />
      <div style={{ color: "#999", marginTop: 8 }}>Out of {topics.length} total topics</div>
    </Card>
  );
}

// src/pages/moderators/reports/TopicByPhase.tsx
import React from "react";
import { Table, Card } from "antd";
import type { ColumnsType } from "antd/es/table";

interface PhaseCount {
  phase: string;
  count: number;
}

const mockData: PhaseCount[] = [
  { phase: "Phase 1", count: 40 },
  { phase: "Phase 2", count: 50 },
  { phase: "Phase 3", count: 30 },
];

const columns: ColumnsType<PhaseCount> = [
  { title: "Phase", dataIndex: "phase", key: "phase" },
  { title: "Number of Topics", dataIndex: "count", key: "count" },
];

export default function TopicByPhase() {
  return (
    <Card title="Topics by Phase" size="small">
      <Table
        rowKey="phase"
        columns={columns}
        dataSource={mockData}
        pagination={false}
        size="small"
      />
    </Card>
  );
}

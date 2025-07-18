import React from "react";
import { Table, Card } from "antd";
import type { ColumnsType } from "antd/es/table";

interface Round {
  id: string;
  phase: string;
  round: number;
  deadline: string;
}

const mockRounds: Round[] = [
  { id: "R1", phase: "Registration", round: 1, deadline: "2024-01-20" },
  { id: "R2", phase: "Submission",   round: 1, deadline: "2024-02-28" },
];

const columns: ColumnsType<Round> = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Phase", dataIndex: "phase", key: "phase" },
  { title: "Round #", dataIndex: "round", key: "round" },
  { title: "Deadline", dataIndex: "deadline", key: "deadline" },
];

export default function Rounds() {
  return (
    <Card title="Submission Rounds" size="small">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={mockRounds}
        pagination={false}
        size="small"
      />
    </Card>
  );
}

import React from "react";
import { Table, Card } from "antd";
import type { ColumnsType } from "antd/es/table";

interface Phase {
  id: string;
  semester: string;
  name: string;
  startDate: string;
  endDate: string;
}

const mockPhases: Phase[] = [
  {
    id: "P1",
    semester: "Spring 2024",
    name: "Registration",
    startDate: "2024-01-10",
    endDate: "2024-01-20",
  },
  {
    id: "P2",
    semester: "Spring 2024",
    name: "Submission",
    startDate: "2024-02-01",
    endDate: "2024-02-28",
  },
];

const columns: ColumnsType<Phase> = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Semester", dataIndex: "semester", key: "semester" },
  { title: "Phase Name", dataIndex: "name", key: "name" },
  { title: "Start", dataIndex: "startDate", key: "startDate" },
  { title: "End", dataIndex: "endDate", key: "endDate" },
];

export default function Phases() {
  return (
    <Card title="Phases" size="small">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={mockPhases}
        pagination={false}
        size="small"
      />
    </Card>
  );
}

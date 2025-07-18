import React from "react";
import { Table, Card } from "antd";
import type { ColumnsType } from "antd/es/table";

interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const mockSemesters: Semester[] = [
  { id: "S1", name: "Spring 2024", startDate: "2024-01-10", endDate: "2024-05-15" },
  { id: "S2", name: "Fall 2024",   startDate: "2024-08-20", endDate: "2024-12-30" },
];

const columns: ColumnsType<Semester> = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Semester", dataIndex: "name", key: "name" },
  { title: "Start Date", dataIndex: "startDate", key: "startDate" },
  { title: "End Date", dataIndex: "endDate", key: "endDate" },
];

export default function SemesterList() {
  return (
    <Card title="Semester List" size="small">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={mockSemesters}
        pagination={false}
        size="small"
      />
    </Card>
  );
}

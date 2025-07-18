import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { topics } from "@/mock/topics";

interface Topic {
  id: string;
  title: string;
  supervisorId: string;
  status: string;
}

const columns: ColumnsType<Topic> = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Title", dataIndex: "title", key: "title" },
  { title: "Supervisor", dataIndex: "supervisorId", key: "supervisorId" },
  { title: "Status", dataIndex: "status", key: "status", render: s => <Tag>{s}</Tag> },
];

export default function SupervisorSent() {
  const data = topics.filter(t => t.status === "DRAFT" || t.status === "SUPERVISOR_SENT");
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      pagination={false}
      size="small"
    />
  );
}

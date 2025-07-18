import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { topics } from "@/mock/topics";

interface Topic {
  id: string;
  title: string;
  assignedReviewers: string[];
  status: string;
}

const columns: ColumnsType<Topic> = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Title", dataIndex: "title", key: "title" },
  {
    title: "Reviewers",
    dataIndex: "assignedReviewers",
    key: "assignedReviewers",
    render: (arr: string[]) => arr.map((r: string) => <Tag key={r}>{r}</Tag>),
  },
  { title: "Status", dataIndex: "status", key: "status", render: s => <Tag>{s}</Tag> },
];

export default function AssignedTopics() {
  const data = topics.filter(t => t.status === "ASSIGNED");
  return <Table rowKey="id" columns={columns} dataSource={data} pagination={false} size="small" />;
}

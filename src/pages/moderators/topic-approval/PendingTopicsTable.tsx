import { Table, Tag, Button, Space } from "antd";
import { topics } from "../../../mock/topics";

const statusColor = {
  PENDING: "default",
  ASSIGNED: "blue",
  UNDER_REVIEW: "purple",
  READY_DECISION: "gold",
  APPROVED: "green",
  REJECTED: "red"
};

const columns = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title"
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => <Tag color={statusColor[status] || "gray"}>{status}</Tag>
  },
  {
    title: "Phase",
    dataIndex: "phase",
    key: "phase"
  },
  {
    title: "Supervisor",
    dataIndex: "supervisorId",
    key: "supervisorId"
  },
  {
    title: "Students",
    dataIndex: "studentCount",
    key: "studentCount"
  },
  {
    title: "Reviewers",
    dataIndex: "assignedReviewers",
    key: "assignedReviewers",
    render: arr => (
      <Space>{arr.length ? arr.map(r => <Tag key={r}>{r}</Tag>) : <Tag color="gray">None</Tag>}</Space>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space>
        {record.status === "PENDING" && (
          <Button type="primary" size="small">Assign Reviewer</Button>
        )}
        {record.status === "UNDER_REVIEW" && (
          <Button size="small">View Progress</Button>
        )}
        {record.status === "READY_DECISION" && (
          <Button type="dashed" size="small">Approve / Reject</Button>
        )}
      </Space>
    )
  }
];

export default function PendingTopicsTable() {
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={topics}
      pagination={false}
      bordered
      style={{ margin: 24 }}
    />
  );
}

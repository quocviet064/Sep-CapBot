import { Table, Button, Space, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

interface Version {
  id: string;
  date: string;
  changes: string;
}

const mockVersions: Version[] = [
  { id: "v1", date: "2024-07-10", changes: "Initial draft" },
  { id: "v2", date: "2024-07-15", changes: "Added methodology" },
  { id: "v3", date: "2024-07-18", changes: "Fixed typos & updated abstract" },
];

const columns: ColumnsType<Version> = [
  { title: "Version", dataIndex: "id", key: "id" },
  { title: "Date", dataIndex: "date", key: "date" },
  { title: "Changes", dataIndex: "changes", key: "changes" },
  {
    title: "Action",
    key: "action",
    render: (_t, record) => (
      <Space>
        <Button type="primary" size="small">Approve</Button>
        <Button size="small">Request Edit</Button>
      </Space>
    ),
  },
];

export default function ApproveNewVersion() {
  return (
    <div>
      <Typography.Title level={4}>Approve New Versions</Typography.Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={mockVersions}
        pagination={false}
        size="small"
      />
    </div>
  );
}

import { Table, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { topics } from "@/mock/topics";
import { useNavigate } from "react-router-dom";

interface Topic {
  id: string;
  title: string;
  supervisorId: string;
  status: string;
}

export default function PendingTopics() {
  const navigate = useNavigate();
  const data = topics.filter(t => t.status === "PENDING");
  const columns: ColumnsType<Topic> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Supervisor", dataIndex: "supervisorId", key: "supervisorId" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => navigate(`supervisor-sent/${record.id}`)}>
            Detail
          </Button>
          <Button size="small" onClick={() => navigate(`pending/${record.id}/assign`)}>
            Assign
          </Button>
        </Space>
      ),
    },
  ];
  return <Table rowKey="id" columns={columns} dataSource={data} pagination={false} size="small" />;
}

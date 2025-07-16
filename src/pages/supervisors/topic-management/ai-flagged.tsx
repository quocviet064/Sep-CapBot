import { Table, Input, Tag, Button, Space, Card } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

type Topic = {
  id: string;
  title: string;
  studentName: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  aiFlagged: boolean; // ⚠️ cảnh báo AI
};

const mockTopics: Topic[] = [
  {
    id: "TP001",
    title: "AI hỗ trợ phân loại tài liệu học thuật",
    studentName: "Nguyễn Văn A",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-15",
    aiFlagged: true,
  },
  {
    id: "TP002",
    title: "Hệ thống quản lý điểm danh bằng khuôn mặt",
    studentName: "Trần Thị B",
    category: "Computer Vision",
    status: "approved",
    createdAt: "2025-07-10",
    aiFlagged: false,
  },
  {
    id: "TP003",
    title: "Tối ưu hóa thuật toán phân cụm dữ liệu",
    studentName: "Lê Văn C",
    category: "Data Mining",
    status: "rejected",
    createdAt: "2025-07-12",
    aiFlagged: true,
  },
];

export default function AIFlaggedTopicsPage() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const flaggedTopics = mockTopics.filter(
    (topic) =>
      topic.aiFlagged &&
      topic.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: "Mã",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên đề tài",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Sinh viên",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: Topic["status"]) => {
        const color =
          status === "approved"
            ? "green"
            : status === "rejected"
              ? "red"
              : "gold";
        const label =
          status === "approved"
            ? "Đã duyệt"
            : status === "pending"
              ? "Chờ duyệt"
              : "Từ chối";
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Cảnh báo AI",
      dataIndex: "aiFlagged",
      key: "aiFlagged",
      render: () => <Tag color="volcano">⚠️ AI cảnh báo</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: Topic) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/topics/${record.id}`)}>
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="⚠️ Đề tài bị cảnh báo AI">
        <Search
          placeholder="Tìm kiếm tên đề tài..."
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }}
        />
        <Table
          columns={columns}
          dataSource={flaggedTopics}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}

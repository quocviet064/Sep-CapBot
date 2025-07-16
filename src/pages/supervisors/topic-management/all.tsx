import { Table, Input, Tag, Button, Card } from "antd";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

type Topic = {
  id: string;
  title: string;
  studentName: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const mockTopics: Topic[] = [
  {
    id: "TP001",
    title: "AI hỗ trợ phân loại tài liệu học thuật",
    studentName: "Nguyễn Văn A",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-15",
  },
  {
    id: "TP002",
    title: "Hệ thống quản lý điểm danh bằng khuôn mặt",
    studentName: "Trần Thị B",
    category: "Computer Vision",
    status: "approved",
    createdAt: "2025-07-10",
  },
];

export default function AllTopicsPage() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const filteredTopics = mockTopics.filter((topic) =>
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
        let color = "";
        let label = "";
        switch (status) {
          case "approved":
            color = "green";
            label = "Đã duyệt";
            break;
          case "rejected":
            color = "red";
            label = "Từ chối";
            break;
          default:
            color = "gold";
            label = "Chờ duyệt";
        }
        return <Tag color={color}>{label}</Tag>;
      },
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
        <Button onClick={() => navigate(`/topics/${record.id}`)}>Xem</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="📚 Tất cả đề tài">
        <Search
          placeholder="Tìm kiếm tên đề tài..."
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchText(e.target.value)
          }
          style={{ marginBottom: 16, maxWidth: 400 }}
        />
        <Table
          columns={columns}
          dataSource={filteredTopics}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}

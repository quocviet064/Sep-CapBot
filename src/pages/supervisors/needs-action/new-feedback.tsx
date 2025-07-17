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
  lastFeedback: string;
  hasNewFeedback: boolean;
};

const mockTopics: Topic[] = [
  {
    id: "TP004",
    title: "Đề tài 4 về NLP",
    studentName: "Đặng Thị D",
    category: "Cyber Security",
    status: "approved",
    createdAt: "2025-07-22",
    lastFeedback: "2025-07-16",
    hasNewFeedback: false,
  },
  {
    id: "TP005",
    title: "Đề tài 5 về Web",
    studentName: "Hoàng Văn E",
    category: "Cyber Security",
    status: "approved",
    createdAt: "2025-07-08",
    lastFeedback: "2025-07-23",
    hasNewFeedback: false,
  },
  {
    id: "TP006",
    title: "Đề tài 6 về Web",
    studentName: "Trần Thị F",
    category: "Data Mining",
    status: "pending",
    createdAt: "2025-07-21",
    lastFeedback: "2025-07-17",
    hasNewFeedback: false,
  },
  {
    id: "TP007",
    title: "Đề tài 7 về Cyber Security",
    studentName: "Trần Thị G",
    category: "HealthTech",
    status: "approved",
    createdAt: "2025-07-25",
    lastFeedback: "2025-07-27",
    hasNewFeedback: false,
  },
  {
    id: "TP008",
    title: "Đề tài 8 về HealthTech",
    studentName: "Phạm Minh H",
    category: "Cyber Security",
    status: "rejected",
    createdAt: "2025-07-25",
    lastFeedback: "2025-08-09",
    hasNewFeedback: true,
  },
  {
    id: "TP009",
    title: "Đề tài 9 về Data Mining",
    studentName: "Phạm Minh I",
    category: "Web",
    status: "approved",
    createdAt: "2025-07-21",
    lastFeedback: "2025-08-08",
    hasNewFeedback: true,
  },
  {
    id: "TP010",
    title: "Đề tài 10 về Web",
    studentName: "Vũ Văn J",
    category: "Data Mining",
    status: "rejected",
    createdAt: "2025-07-15",
    lastFeedback: "2025-07-11",
    hasNewFeedback: false,
  },
  {
    id: "TP011",
    title: "Đề tài 11 về NLP",
    studentName: "Đoàn Thị K",
    category: "Data Mining",
    status: "pending",
    createdAt: "2025-07-27",
    lastFeedback: "2025-08-06",
    hasNewFeedback: true,
  },
  {
    id: "TP012",
    title: "Đề tài 12 về HealthTech",
    studentName: "Bùi Thị L",
    category: "Web",
    status: "approved",
    createdAt: "2025-07-06",
    lastFeedback: "2025-07-16",
    hasNewFeedback: true,
  },
  {
    id: "TP013",
    title: "Đề tài 13 về Web",
    studentName: "Bùi Thị M",
    category: "Data Mining",
    status: "approved",
    createdAt: "2025-07-26",
    lastFeedback: "2025-07-27",
    hasNewFeedback: true,
  },
  {
    id: "TP014",
    title: "Đề tài 14 về Computer Vision",
    studentName: "Tạ Văn N",
    category: "Computer Vision",
    status: "approved",
    createdAt: "2025-07-21",
    lastFeedback: "2025-08-07",
    hasNewFeedback: true,
  },
  {
    id: "TP015",
    title: "Đề tài 15 về Web",
    studentName: "Lê Văn O",
    category: "Cyber Security",
    status: "rejected",
    createdAt: "2025-07-25",
    lastFeedback: "2025-07-12",
    hasNewFeedback: false,
  },
  {
    id: "TP016",
    title: "Đề tài 16 về Cyber Security",
    studentName: "Lê Văn P",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-14",
    lastFeedback: "2025-08-03",
    hasNewFeedback: true,
  },
  // ... (tiếp tục nếu cần thêm)
];

export default function NewFeedbackPage() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const filteredTopics = mockTopics.filter(
    (topic) =>
      topic.hasNewFeedback &&
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
            : status === "pending"
              ? "gold"
              : "red";
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
      title: "Phản hồi gần nhất",
      dataIndex: "lastFeedback",
      key: "lastFeedback",
      render: (date: string) => <Tag color="blue">{date}</Tag>,
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
      <Card title="💬 Đề tài có phản hồi mới">
        <Search
          placeholder="Tìm kiếm tên đề tài..."
          onChange={(e) => setSearchText(e.target.value)}
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

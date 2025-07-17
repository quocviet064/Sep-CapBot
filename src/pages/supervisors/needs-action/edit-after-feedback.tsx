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
  needEditAfterFeedback: boolean;
};

const mockTopics: Topic[] = [
  {
    id: "TP004",
    title: "Đề tài 4 về Web",
    studentName: "Đặng Thị D",
    category: "Data Mining",
    status: "rejected",
    createdAt: "2025-07-02",
    lastFeedback: "2025-07-12",
    needEditAfterFeedback: false,
  },
  {
    id: "TP005",
    title: "Đề tài 5 về HealthTech",
    studentName: "Phạm Minh E",
    category: "Computer Vision",
    status: "rejected",
    createdAt: "2025-07-17",
    lastFeedback: "2025-07-25",
    needEditAfterFeedback: false,
  },
  {
    id: "TP006",
    title: "Đề tài 6 về NLP",
    studentName: "Trần Thị F",
    category: "NLP",
    status: "pending",
    createdAt: "2025-07-19",
    lastFeedback: "2025-07-13",
    needEditAfterFeedback: false,
  },
  {
    id: "TP007",
    title: "Đề tài 7 về Web",
    studentName: "Trần Thị G",
    category: "HealthTech",
    status: "pending",
    createdAt: "2025-07-09",
    lastFeedback: "2025-07-23",
    needEditAfterFeedback: false,
  },
  {
    id: "TP008",
    title: "Đề tài 8 về Computer Vision",
    studentName: "Hoàng Văn H",
    category: "AI",
    status: "rejected",
    createdAt: "2025-07-02",
    lastFeedback: "2025-07-11",
    needEditAfterFeedback: true,
  },
  {
    id: "TP009",
    title: "Đề tài 9 về HealthTech",
    studentName: "Hoàng Văn I",
    category: "HealthTech",
    status: "approved",
    createdAt: "2025-07-21",
    lastFeedback: "2025-07-29",
    needEditAfterFeedback: true,
  },
  {
    id: "TP010",
    title: "Đề tài 10 về NLP",
    studentName: "Đặng Thị J",
    category: "AI",
    status: "approved",
    createdAt: "2025-07-05",
    lastFeedback: "2025-07-25",
    needEditAfterFeedback: false,
  },
  {
    id: "TP011",
    title: "Đề tài 11 về NLP",
    studentName: "Nguyễn Văn K",
    category: "Computer Vision",
    status: "approved",
    createdAt: "2025-07-12",
    lastFeedback: "2025-07-27",
    needEditAfterFeedback: false,
  },
  {
    id: "TP012",
    title: "Đề tài 12 về Web",
    studentName: "Nguyễn Văn L",
    category: "HealthTech",
    status: "rejected",
    createdAt: "2025-07-19",
    lastFeedback: "2025-07-24",
    needEditAfterFeedback: false,
  },
  {
    id: "TP013",
    title: "Đề tài 13 về Computer Vision",
    studentName: "Phạm Minh M",
    category: "NLP",
    status: "rejected",
    createdAt: "2025-07-05",
    lastFeedback: "2025-07-30",
    needEditAfterFeedback: true,
  },
  {
    id: "TP014",
    title: "Đề tài 14 về Data Mining",
    studentName: "Trần Thị N",
    category: "Computer Vision",
    status: "rejected",
    createdAt: "2025-07-04",
    lastFeedback: "2025-07-28",
    needEditAfterFeedback: true,
  },
  {
    id: "TP015",
    title: "Đề tài 15 về Data Mining",
    studentName: "Trần Thị O",
    category: "Data Mining",
    status: "pending",
    createdAt: "2025-07-14",
    lastFeedback: "2025-07-20",
    needEditAfterFeedback: true,
  },
  {
    id: "TP016",
    title: "Đề tài 16 về HealthTech",
    studentName: "Trần Thị P",
    category: "NLP",
    status: "rejected",
    createdAt: "2025-07-17",
    lastFeedback: "2025-07-22",
    needEditAfterFeedback: true,
  },
  {
    id: "TP017",
    title: "Đề tài 17 về AI",
    studentName: "Hoàng Văn Q",
    category: "Computer Vision",
    status: "pending",
    createdAt: "2025-07-04",
    lastFeedback: "2025-07-28",
    needEditAfterFeedback: true,
  },
  {
    id: "TP018",
    title: "Đề tài 18 về AI",
    studentName: "Trần Thị R",
    category: "NLP",
    status: "approved",
    createdAt: "2025-07-05",
    lastFeedback: "2025-07-29",
    needEditAfterFeedback: false,
  },
  {
    id: "TP019",
    title: "Đề tài 19 về Computer Vision",
    studentName: "Trần Thị S",
    category: "Data Mining",
    status: "rejected",
    createdAt: "2025-07-21",
    lastFeedback: "2025-07-19",
    needEditAfterFeedback: true,
  },
  {
    id: "TP020",
    title: "Đề tài 20 về AI",
    studentName: "Hoàng Văn T",
    category: "HealthTech",
    status: "rejected",
    createdAt: "2025-07-13",
    lastFeedback: "2025-07-12",
    needEditAfterFeedback: false,
  },
];

export default function EditAfterFeedbackPage() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const filteredTopics = mockTopics.filter(
    (topic) =>
      topic.needEditAfterFeedback &&
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
            : status === "rejected"
              ? "Từ chối"
              : "Chờ duyệt";
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
          <Button
            type="link"
            onClick={() => navigate(`/topics/${record.id}/edit`)}
          >
            Chỉnh sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="🛠️ Đề tài cần chỉnh sửa sau phản hồi">
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

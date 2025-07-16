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
  {
    id: "TP003",
    title: "Ứng dụng nhận diện biển số xe",
    studentName: "Lê Văn C",
    category: "AI",
    status: "approved",
    createdAt: "2025-07-12",
  },
  {
    id: "TP004",
    title: "Chatbot tư vấn tâm lý học đường",
    studentName: "Phạm Minh D",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-11",
  },
  {
    id: "TP005",
    title: "Phân tích cảm xúc người dùng qua bình luận",
    studentName: "Lê Thị E",
    category: "NLP",
    status: "approved",
    createdAt: "2025-07-09",
  },
  {
    id: "TP006",
    title: "Tối ưu hóa mô hình học sâu với PyTorch",
    studentName: "Nguyễn Thành F",
    category: "Machine Learning",
    status: "rejected",
    createdAt: "2025-07-08",
  },
  {
    id: "TP007",
    title: "Dự đoán điểm rớt môn bằng dữ liệu quá khứ",
    studentName: "Trần Văn G",
    category: "Data Mining",
    status: "pending",
    createdAt: "2025-07-07",
  },
  {
    id: "TP008",
    title: "Tự động phát hiện lỗi chính tả trong văn bản",
    studentName: "Đỗ Thị H",
    category: "NLP",
    status: "approved",
    createdAt: "2025-07-06",
  },
  {
    id: "TP009",
    title: "Ứng dụng AI trong phân loại đơn hàng",
    studentName: "Vũ Minh I",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-05",
  },
  {
    id: "TP010",
    title: "Xây dựng hệ thống chatbot học tiếng Anh",
    studentName: "Nguyễn Văn J",
    category: "NLP",
    status: "rejected",
    createdAt: "2025-07-04",
  },
  {
    id: "TP011",
    title: "Phân tích thời gian phản hồi của hệ thống",
    studentName: "Phan Thị K",
    category: "Performance",
    status: "approved",
    createdAt: "2025-07-03",
  },
  {
    id: "TP012",
    title: "Xây dựng hệ thống lưu trữ dữ liệu phi tập trung",
    studentName: "Trương Văn L",
    category: "Blockchain",
    status: "pending",
    createdAt: "2025-07-02",
  },
  {
    id: "TP013",
    title: "Phát hiện mã độc qua hành vi sử dụng",
    studentName: "Hoàng Thị M",
    category: "Cyber Security",
    status: "approved",
    createdAt: "2025-07-01",
  },
  {
    id: "TP014",
    title: "Phân tích giọng nói để nhận diện cảm xúc",
    studentName: "Đoàn Văn N",
    category: "AI",
    status: "rejected",
    createdAt: "2025-06-30",
  },
  {
    id: "TP015",
    title: "Xây dựng ứng dụng web quản lý ngân sách cá nhân",
    studentName: "Phạm Văn O",
    category: "Web",
    status: "approved",
    createdAt: "2025-06-29",
  },
  {
    id: "TP016",
    title: "Tối ưu hóa mô hình phân loại văn bản",
    studentName: "Ngô Thị P",
    category: "NLP",
    status: "pending",
    createdAt: "2025-06-28",
  },
  {
    id: "TP017",
    title: "Ứng dụng AI trong kiểm tra bài thi tự luận",
    studentName: "Trần Thị Q",
    category: "AI",
    status: "approved",
    createdAt: "2025-06-27",
  },
  {
    id: "TP018",
    title: "Phân tích hành vi mua sắm người dùng",
    studentName: "Đặng Văn R",
    category: "Data Science",
    status: "pending",
    createdAt: "2025-06-26",
  },
  {
    id: "TP019",
    title: "Xây dựng công cụ tóm tắt văn bản tự động",
    studentName: "Lê Thị S",
    category: "NLP",
    status: "rejected",
    createdAt: "2025-06-25",
  },
  {
    id: "TP020",
    title: "Phát hiện lừa đảo qua giao dịch tài chính",
    studentName: "Nguyễn Văn T",
    category: "Finance AI",
    status: "approved",
    createdAt: "2025-06-24",
  },
];

export default function ApprovedTopicsPage() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const approvedTopics = mockTopics.filter(
    (topic) =>
      topic.status === "approved" &&
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
      render: () => <Tag color="green">Đã duyệt</Tag>,
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
      <Card title="✅ Đề tài đã được duyệt">
        <Search
          placeholder="Tìm kiếm tên đề tài..."
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }}
        />
        <Table
          columns={columns}
          dataSource={approvedTopics}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}

import { Table, Input, Tag, Button, Space, Card } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Search } = Input;

type Topic = {
  id: string;
  title: string;
  studentName: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  responseDeadline: string; // deadline phản hồi
};

const mockTopics: Topic[] = [
  {
    id: "TP001",
    title: "AI phân loại tài liệu học thuật",
    studentName: "Nguyễn Văn A",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-10",
    responseDeadline: "2025-07-20",
  },
  {
    id: "TP002",
    title: "Nhận diện khuôn mặt điểm danh",
    studentName: "Trần Thị B",
    category: "Computer Vision",
    status: "pending",
    createdAt: "2025-07-01",
    responseDeadline: "2025-07-17",
  },
  {
    id: "TP003",
    title: "Tối ưu phân cụm dữ liệu",
    studentName: "Lê Văn C",
    category: "Data Mining",
    status: "approved",
    createdAt: "2025-07-01",
    responseDeadline: "2025-07-25",
  },
  {
    id: "TP004",
    title: "Hệ thống chatbot học tiếng Anh",
    studentName: "Phạm Văn D",
    category: "NLP",
    status: "approved",
    createdAt: "2025-07-02",
    responseDeadline: "2025-07-18",
  },
  {
    id: "TP005",
    title: "Phân tích bình luận sản phẩm",
    studentName: "Lê Thị E",
    category: "NLP",
    status: "pending",
    createdAt: "2025-07-03",
    responseDeadline: "2025-07-21",
  },
  {
    id: "TP006",
    title: "Phát hiện gian lận trong thi cử",
    studentName: "Trần Văn F",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-04",
    responseDeadline: "2025-07-23",
  },
  {
    id: "TP007",
    title: "Hệ thống cảnh báo sớm thiên tai",
    studentName: "Nguyễn Văn G",
    category: "Data Science",
    status: "approved",
    createdAt: "2025-07-05",
    responseDeadline: "2025-07-26",
  },
  {
    id: "TP008",
    title: "Chẩn đoán bệnh từ ảnh X-ray",
    studentName: "Phạm Thị H",
    category: "Computer Vision",
    status: "pending",
    createdAt: "2025-07-06",
    responseDeadline: "2025-07-22",
  },
  {
    id: "TP009",
    title: "Ứng dụng blockchain trong lưu trữ",
    studentName: "Lê Văn I",
    category: "Blockchain",
    status: "rejected",
    createdAt: "2025-07-07",
    responseDeadline: "2025-07-30",
  },
  {
    id: "TP010",
    title: "Phân loại rác thải bằng hình ảnh",
    studentName: "Đỗ Thị K",
    category: "AI",
    status: "approved",
    createdAt: "2025-07-08",
    responseDeadline: "2025-07-25",
  },
  {
    id: "TP011",
    title: "Hệ thống quản lý điểm danh thông minh",
    studentName: "Ngô Minh L",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-09",
    responseDeadline: "2025-07-21",
  },
  {
    id: "TP012",
    title: "Tối ưu hóa truy vấn trong cơ sở dữ liệu",
    studentName: "Trần Thị M",
    category: "Database",
    status: "approved",
    createdAt: "2025-07-10",
    responseDeadline: "2025-07-29",
  },
  {
    id: "TP013",
    title: "Nhận diện cảm xúc qua giọng nói",
    studentName: "Vũ Văn N",
    category: "NLP",
    status: "pending",
    createdAt: "2025-07-11",
    responseDeadline: "2025-07-27",
  },
  {
    id: "TP014",
    title: "Xây dựng hệ thống quản lý tiệm sách",
    studentName: "Phạm Văn O",
    category: "Web",
    status: "approved",
    createdAt: "2025-07-12",
    responseDeadline: "2025-07-30",
  },
  {
    id: "TP015",
    title: "Dự đoán hành vi người dùng thương mại điện tử",
    studentName: "Đoàn Thị P",
    category: "Data Science",
    status: "pending",
    createdAt: "2025-07-13",
    responseDeadline: "2025-07-29",
  },
  {
    id: "TP016",
    title: "Phân tích chất lượng không khí đô thị",
    studentName: "Nguyễn Văn Q",
    category: "IoT",
    status: "rejected",
    createdAt: "2025-07-14",
    responseDeadline: "2025-07-28",
  },
  {
    id: "TP017",
    title: "Phát hiện nội dung độc hại trên mạng xã hội",
    studentName: "Lê Thị R",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-15",
    responseDeadline: "2025-07-25",
  },
  {
    id: "TP018",
    title: "Hệ thống nhắc nhở lịch trình thông minh",
    studentName: "Hoàng Văn S",
    category: "Mobile",
    status: "approved",
    createdAt: "2025-07-16",
    responseDeadline: "2025-07-27",
  },
  {
    id: "TP019",
    title: "Ứng dụng AI trong quản lý sức khỏe",
    studentName: "Đặng Thị T",
    category: "HealthTech",
    status: "pending",
    createdAt: "2025-07-17",
    responseDeadline: "2025-07-26",
  },
  {
    id: "TP020",
    title: "Tự động hóa quá trình tuyển dụng nhân sự",
    studentName: "Nguyễn Văn U",
    category: "AI",
    status: "approved",
    createdAt: "2025-07-18",
    responseDeadline: "2025-07-30",
  },
  {
    id: "TP021",
    title: "Phát hiện tin giả bằng học sâu",
    studentName: "Phan Văn V",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-18",
    responseDeadline: "2025-07-26",
  },
  {
    id: "TP022",
    title: "Chuyển đổi giọng nói theo thời gian thực",
    studentName: "Lê Thị W",
    category: "NLP",
    status: "approved",
    createdAt: "2025-07-19",
    responseDeadline: "2025-07-30",
  },
  {
    id: "TP023",
    title: "Xây dựng hệ thống blog cá nhân",
    studentName: "Trần Văn X",
    category: "Web",
    status: "pending",
    createdAt: "2025-07-20",
    responseDeadline: "2025-07-29",
  },
  {
    id: "TP024",
    title: "Hệ thống hỗ trợ học lập trình cho sinh viên",
    studentName: "Ngô Thị Y",
    category: "EdTech",
    status: "approved",
    createdAt: "2025-07-21",
    responseDeadline: "2025-07-30",
  },
  {
    id: "TP025",
    title: "Tối ưu thời gian phản hồi trong microservices",
    studentName: "Vũ Văn Z",
    category: "Backend",
    status: "pending",
    createdAt: "2025-07-21",
    responseDeadline: "2025-07-27",
  },
  {
    id: "TP026",
    title: "Phân tích hành vi tiêu dùng theo mùa",
    studentName: "Nguyễn Văn AB",
    category: "Data Science",
    status: "approved",
    createdAt: "2025-07-22",
    responseDeadline: "2025-07-30",
  },
  {
    id: "TP027",
    title: "Ứng dụng nhận diện biển số xe",
    studentName: "Đặng Thị AC",
    category: "Computer Vision",
    status: "rejected",
    createdAt: "2025-07-23",
    responseDeadline: "2025-07-28",
  },
  {
    id: "TP028",
    title: "Tự động hóa phân loại email",
    studentName: "Trần Văn AD",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-24",
    responseDeadline: "2025-07-29",
  },
  {
    id: "TP029",
    title: "Dự đoán doanh thu cửa hàng",
    studentName: "Phạm Thị AE",
    category: "Finance",
    status: "approved",
    createdAt: "2025-07-25",
    responseDeadline: "2025-07-30",
  },
  {
    id: "TP030",
    title: "Tối ưu thuật toán tìm đường đi ngắn nhất",
    studentName: "Lê Văn AF",
    category: "Algorithm",
    status: "pending",
    createdAt: "2025-07-26",
    responseDeadline: "2025-07-30",
  },
];

export default function DeadlineComingPage() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const today = dayjs();
  const deadlineThreshold = today.add(3, "day"); // Sắp tới hạn trong vòng 3 ngày

  const filteredTopics = mockTopics.filter(
    (topic) =>
      topic.status === "pending" &&
      dayjs(topic.responseDeadline).isBefore(deadlineThreshold) &&
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
      render: () => <Tag color="gold">Chờ duyệt</Tag>,
    },
    {
      title: "Deadline phản hồi",
      dataIndex: "responseDeadline",
      key: "responseDeadline",
      render: (date: string) => {
        const isNear = dayjs(date).diff(today, "day") <= 3;
        return (
          <Tag color={isNear ? "volcano" : "blue"}>
            {dayjs(date).format("DD/MM/YYYY")}
          </Tag>
        );
      },
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
      <Card title="⏰ Đề tài sắp tới hạn phản hồi">
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

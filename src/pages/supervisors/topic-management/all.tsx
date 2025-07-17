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
  {
    id: "TP003",
    title: "Tối ưu hóa thuật toán phân cụm dữ liệu",
    studentName: "Lê Văn C",
    category: "Data Mining",
    status: "rejected",
    createdAt: "2025-07-12",
  },
  {
    id: "TP004",
    title: "Ứng dụng chatbot trong tư vấn sức khỏe",
    studentName: "Phạm Minh D",
    category: "AI",
    status: "approved",
    createdAt: "2025-07-08",
  },
  {
    id: "TP005",
    title: "Xây dựng hệ thống đề xuất phim",
    studentName: "Hoàng Thị E",
    category: "Machine Learning",
    status: "pending",
    createdAt: "2025-07-09",
  },
  {
    id: "TP006",
    title: "Nhận diện khuôn mặt thời gian thực",
    studentName: "Đặng Văn F",
    category: "Computer Vision",
    status: "approved",
    createdAt: "2025-07-06",
  },
  {
    id: "TP007",
    title: "Phân tích cảm xúc từ bài đăng mạng xã hội",
    studentName: "Lý Thị G",
    category: "NLP",
    status: "pending",
    createdAt: "2025-07-04",
  },
  {
    id: "TP008",
    title: "Hệ thống giám sát học sinh bằng AI",
    studentName: "Trịnh Công H",
    category: "AI",
    status: "rejected",
    createdAt: "2025-07-05",
  },
  {
    id: "TP009",
    title: "Xây dựng website học từ vựng thông minh",
    studentName: "Phan Minh I",
    category: "Web",
    status: "approved",
    createdAt: "2025-07-01",
  },
  {
    id: "TP010",
    title: "Tự động phát hiện gian lận trong thi cử",
    studentName: "Trần Văn J",
    category: "AI",
    status: "pending",
    createdAt: "2025-07-03",
  },
  {
    id: "TP011",
    title: "Dự đoán thời gian hoàn thành dự án phần mềm",
    studentName: "Nguyễn Văn K",
    category: "Data Science",
    status: "approved",
    createdAt: "2025-06-28",
  },
  {
    id: "TP012",
    title: "Tối ưu hệ thống truy xuất tài liệu y tế",
    studentName: "Bùi Thị L",
    category: "HealthTech",
    status: "pending",
    createdAt: "2025-06-30",
  },
  {
    id: "TP013",
    title: "Xây dựng hệ thống đánh giá năng lực sinh viên",
    studentName: "Đoàn Văn M",
    category: "EdTech",
    status: "approved",
    createdAt: "2025-06-25",
  },
  {
    id: "TP014",
    title: "Phân tích tín hiệu EEG phục vụ chẩn đoán",
    studentName: "Tạ Thị N",
    category: "Biomedical",
    status: "rejected",
    createdAt: "2025-06-20",
  },
  {
    id: "TP015",
    title: "Dự báo tỉ giá ngoại tệ bằng học sâu",
    studentName: "Trịnh Văn O",
    category: "Finance",
    status: "pending",
    createdAt: "2025-06-18",
  },
  {
    id: "TP016",
    title: "Quản lý tài liệu số bằng blockchain",
    studentName: "Hoàng Minh P",
    category: "Blockchain",
    status: "approved",
    createdAt: "2025-06-15",
  },
  {
    id: "TP017",
    title: "Chatbot học tiếng Anh cho trẻ em",
    studentName: "Phạm Thị Q",
    category: "NLP",
    status: "pending",
    createdAt: "2025-06-13",
  },
  {
    id: "TP018",
    title: "Hệ thống báo cáo tự động trong doanh nghiệp",
    studentName: "Võ Văn R",
    category: "Business Intelligence",
    status: "approved",
    createdAt: "2025-06-10",
  },
  {
    id: "TP019",
    title: "Chẩn đoán bệnh từ hình ảnh X-ray",
    studentName: "Nguyễn Thị S",
    category: "AI",
    status: "rejected",
    createdAt: "2025-06-07",
  },
  {
    id: "TP020",
    title: "Phát hiện mã độc qua hành vi người dùng",
    studentName: "Đặng Văn T",
    category: "Cyber Security",
    status: "pending",
    createdAt: "2025-06-04",
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

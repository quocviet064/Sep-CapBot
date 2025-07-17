import { Table, Tag, Typography, Card } from "antd";
import { useState } from "react";

const { Title, Paragraph } = Typography;

type Topic = {
  id: string;
  title: string;
  studentName: string;
  category: string;
  status: string;
  createdAt: string;
  aiRejected: boolean;
  reason: string;
};

const mockTopics: Topic[] = [
  {
    id: "TP001",
    title: "Phân tích văn bản sử dụng NLP",
    studentName: "Nguyễn Văn A",
    category: "NLP",
    status: "rejected",
    createdAt: "2025-07-10",
    aiRejected: true,
    reason: "Trùng lặp với đề tài trước đó",
  },
  {
    id: "TP002",
    title: "Hệ thống nhận diện biển số xe",
    studentName: "Trần Thị B",
    category: "Computer Vision",
    status: "rejected",
    createdAt: "2025-07-12",
    aiRejected: true,
    reason: "Sử dụng nội dung do AI tạo ra quá mức cho phép",
  },
  {
    id: "TP003",
    title: "Ứng dụng AI trong chẩn đoán bệnh",
    studentName: "Lê Văn C",
    category: "HealthTech",
    status: "rejected",
    createdAt: "2025-07-08",
    aiRejected: true,
    reason: "Không tuân thủ định dạng mẫu",
  },
  {
    id: "TP004",
    title: "Đề tài ảo hóa hệ điều hành",
    studentName: "Phạm Minh D",
    category: "System",
    status: "approved",
    createdAt: "2025-07-05",
    aiRejected: false,
    reason: "",
  },
  {
    id: "TP005",
    title: "Phân tích hành vi mua sắm bằng AI",
    studentName: "Nguyễn Thị E",
    category: "AI",
    status: "rejected",
    createdAt: "2025-07-11",
    aiRejected: true,
    reason: "Thiếu nguồn tham khảo rõ ràng",
  },
  {
    id: "TP006",
    title: "Ứng dụng học sâu trong y tế",
    studentName: "Trần Văn F",
    category: "HealthTech",
    status: "rejected",
    createdAt: "2025-07-15",
    aiRejected: true,
    reason: "Giống đến 85% một đề tài trước đó",
  },
  {
    id: "TP007",
    title: "Tối ưu hóa thuật toán tìm kiếm",
    studentName: "Phạm Thị G",
    category: "Algorithm",
    status: "rejected",
    createdAt: "2025-07-09",
    aiRejected: true,
    reason: "Vi phạm quy tắc chuẩn hóa tài liệu",
  },
  {
    id: "TP008",
    title: "Chatbot hỗ trợ chăm sóc khách hàng",
    studentName: "Đặng Minh H",
    category: "NLP",
    status: "approved",
    createdAt: "2025-07-02",
    aiRejected: false,
    reason: "",
  },
  {
    id: "TP009",
    title: "Phân tích dữ liệu IoT với AI",
    studentName: "Nguyễn Văn I",
    category: "IoT",
    status: "rejected",
    createdAt: "2025-07-07",
    aiRejected: true,
    reason: "Thiếu nội dung phân tích chi tiết",
  },
  {
    id: "TP010",
    title: "Ứng dụng AI trong phân tích tài chính",
    studentName: "Lê Thị J",
    category: "Finance",
    status: "rejected",
    createdAt: "2025-07-14",
    aiRejected: true,
    reason: "Sử dụng nội dung AI không được kiểm duyệt",
  },
  {
    id: "TP011",
    title: "Xây dựng hệ thống dự báo nhu cầu",
    studentName: "Vũ Văn K",
    category: "Data Mining",
    status: "approved",
    createdAt: "2025-07-03",
    aiRejected: false,
    reason: "",
  },
  {
    id: "TP012",
    title: "Ứng dụng AI trong bảo mật mạng",
    studentName: "Phạm Thị L",
    category: "Cyber Security",
    status: "rejected",
    createdAt: "2025-07-06",
    aiRejected: true,
    reason: "Không đúng yêu cầu mô tả chi tiết",
  },
  {
    id: "TP013",
    title: "Hệ thống khuyến nghị sản phẩm",
    studentName: "Đoàn Minh M",
    category: "AI",
    status: "rejected",
    createdAt: "2025-07-13",
    aiRejected: true,
    reason: "Sử dụng nội dung bị nghi ngờ sinh bởi AI",
  },
  {
    id: "TP014",
    title: "Ứng dụng blockchain trong quản lý",
    studentName: "Nguyễn Thị N",
    category: "Blockchain",
    status: "approved",
    createdAt: "2025-07-04",
    aiRejected: false,
    reason: "",
  },
  {
    id: "TP015",
    title: "Nhận diện khuôn mặt trong an ninh",
    studentName: "Hoàng Văn O",
    category: "Computer Vision",
    status: "rejected",
    createdAt: "2025-07-16",
    aiRejected: true,
    reason: "Không đạt yêu cầu tính độc lập",
  },
  {
    id: "TP016",
    title: "Ứng dụng AI trong giáo dục",
    studentName: "Phạm Minh P",
    category: "EdTech",
    status: "rejected",
    createdAt: "2025-07-08",
    aiRejected: true,
    reason: "Không có quy trình kiểm chứng dữ liệu",
  },
  {
    id: "TP017",
    title: "Phân tích cảm xúc từ văn bản",
    studentName: "Nguyễn Văn Q",
    category: "NLP",
    status: "rejected",
    createdAt: "2025-07-12",
    aiRejected: true,
    reason: "Không cung cấp bằng chứng huấn luyện dữ liệu",
  },
  {
    id: "TP018",
    title: "Tối ưu hóa hệ thống lưu trữ",
    studentName: "Trần Thị R",
    category: "System",
    status: "approved",
    createdAt: "2025-07-01",
    aiRejected: false,
    reason: "",
  },
  {
    id: "TP019",
    title: "Ứng dụng AI trong logistic",
    studentName: "Lê Văn S",
    category: "Logistics",
    status: "rejected",
    createdAt: "2025-07-11",
    aiRejected: true,
    reason: "Vi phạm yêu cầu định dạng tài liệu",
  },
  {
    id: "TP020",
    title: "Phân tích hành vi người dùng",
    studentName: "Phạm Thị T",
    category: "Data Mining",
    status: "rejected",
    createdAt: "2025-07-15",
    aiRejected: true,
    reason: "Nội dung bị trùng lặp nhiều với tài liệu mẫu",
  },
];

export default function RejectedByAIPage() {
  const [data] = useState(mockTopics.filter((t) => t.aiRejected));

  const columns = [
    {
      title: "Mã đề tài",
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
      render: (status: string) => (
        <Tag color={status === "rejected" ? "red" : "green"}>
          {status === "rejected" ? "Từ chối" : "Khác"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Lý do AI từ chối",
      dataIndex: "reason",
      key: "reason",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered>
        <Title level={3}>Trang: Từ chối bởi AI</Title>
        <Paragraph>
          Đây là danh sách các đề tài bị hệ thống AI tự động từ chối dựa trên
          các lý do như trùng lặp, dùng nội dung AI quá nhiều hoặc không đúng
          mẫu.
        </Paragraph>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}

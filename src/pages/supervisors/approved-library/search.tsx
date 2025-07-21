import { useState } from "react";
import { Input, Table } from "antd";

interface Topic {
  id: string;
  title: string;
  studentName: string;
  field: string;
  createdAt: string;
}

const mockLibraryTopics: Topic[] = [
  {
    id: "TP001",
    title: "AI hỗ trợ phân loại tài liệu",
    studentName: "Nguyễn Văn A",
    field: "AI",
    createdAt: "2025-07-01",
  },
  {
    id: "TP002",
    title: "Hệ thống điểm danh bằng nhận diện khuôn mặt",
    studentName: "Trần Thị B",
    field: "Computer Vision",
    createdAt: "2025-07-03",
  },
  {
    id: "TP003",
    title: "Phân tích dữ liệu y tế",
    studentName: "Lê Văn C",
    field: "HealthTech",
    createdAt: "2025-07-05",
  },
  {
    id: "TP004",
    title: "Blockchain trong lưu trữ học thuật",
    studentName: "Phạm Minh D",
    field: "Blockchain",
    createdAt: "2025-07-08",
  },
  {
    id: "TP005",
    title: "Tối ưu quảng cáo bằng AI",
    studentName: "Hoàng Thị E",
    field: "Marketing",
    createdAt: "2025-07-09",
  },
  {
    id: "TP006",
    title: "Ứng dụng chatbot trong tư vấn tuyển sinh",
    studentName: "Ngô Văn F",
    field: "AI",
    createdAt: "2025-07-10",
  },
  {
    id: "TP007",
    title: "Phân tích cảm xúc khách hàng trên mạng xã hội",
    studentName: "Đỗ Thị G",
    field: "NLP",
    createdAt: "2025-07-11",
  },
  {
    id: "TP008",
    title: "Hệ thống cảnh báo ngập lụt bằng IoT",
    studentName: "Vũ Văn H",
    field: "IoT",
    createdAt: "2025-07-12",
  },
  {
    id: "TP009",
    title: "Dự báo thời tiết bằng mạng nơ-ron",
    studentName: "Lý Thị I",
    field: "AI",
    createdAt: "2025-07-13",
  },
  {
    id: "TP010",
    title: "Ứng dụng Deep Learning trong phân loại hình ảnh y khoa",
    studentName: "Trịnh Văn J",
    field: "HealthTech",
    createdAt: "2025-07-14",
  },
  {
    id: "TP011",
    title: "Tối ưu hóa đường đi cho xe giao hàng",
    studentName: "Cao Thị K",
    field: "Logistics",
    createdAt: "2025-07-15",
  },
  {
    id: "TP012",
    title: "Hệ thống phát hiện gian lận giao dịch tài chính",
    studentName: "Tăng Văn L",
    field: "Finance",
    createdAt: "2025-07-16",
  },
  {
    id: "TP013",
    title: "Trợ lý ảo hỗ trợ học tập cá nhân hóa",
    studentName: "Bùi Thị M",
    field: "AI in Education",
    createdAt: "2025-07-17",
  },
  {
    id: "TP014",
    title: "Chuyển đổi văn bản thành giọng nói cho người khiếm thị",
    studentName: "Lâm Văn N",
    field: "Assistive Tech",
    createdAt: "2025-07-18",
  },
  {
    id: "TP015",
    title: "Phân tích hành vi tiêu dùng từ dữ liệu POS",
    studentName: "Mai Thị O",
    field: "Retail Analytics",
    createdAt: "2025-07-19",
  },
  {
    id: "TP016",
    title: "Quản lý tài nguyên điện bằng AI",
    studentName: "Lê Văn P",
    field: "EnergyTech",
    createdAt: "2025-07-20",
  },
  {
    id: "TP017",
    title: "Hệ thống hỗ trợ pháp lý thông minh",
    studentName: "Phạm Thị Q",
    field: "LegalTech",
    createdAt: "2025-07-21",
  },
  {
    id: "TP018",
    title: "Tự động hóa đánh giá chất lượng sản phẩm",
    studentName: "Nguyễn Văn R",
    field: "Manufacturing",
    createdAt: "2025-07-22",
  },
  {
    id: "TP019",
    title: "Ứng dụng học máy trong quản lý tồn kho",
    studentName: "Đặng Thị S",
    field: "Supply Chain",
    createdAt: "2025-07-23",
  },
  {
    id: "TP020",
    title: "Phát hiện tin giả trên mạng xã hội",
    studentName: "Trần Văn T",
    field: "Cybersecurity",
    createdAt: "2025-07-24",
  },
];

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
    title: "Lĩnh vực",
    dataIndex: "field",
    key: "field",
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
  },
];

export default function SearchLibraryPage() {
  const [searchText, setSearchText] = useState("");
  const filteredData = mockLibraryTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchText.toLowerCase()) ||
      topic.studentName.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div>
      <h2>Trang: Tìm kiếm đề tài</h2>
      <Input.Search
        placeholder="Tìm theo tên đề tài hoặc tên sinh viên"
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 400, marginBottom: 16 }}
        allowClear
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}

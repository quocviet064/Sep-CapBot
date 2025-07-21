import { Table } from "antd";

interface EnterpriseTopic {
  id: string;
  title: string;
  companyName: string;
  field: string;
  createdAt: string;
  isPublic: boolean;
  tags: string[];
}

const mockEnterpriseTopics: EnterpriseTopic[] = [
  {
    id: "EN001",
    title: "Tối ưu chuỗi cung ứng bằng AI",
    companyName: "Công ty ABC Logistics",
    field: "Logistics",
    createdAt: "2025-07-01",
    isPublic: true,
    tags: ["AI", "Supply Chain"],
  },
  {
    id: "EN002",
    title: "Phân tích dữ liệu khách hàng",
    companyName: "Công ty XYZ Retail",
    field: "Marketing",
    createdAt: "2025-07-02",
    isPublic: true,
    tags: ["Data Analytics", "CRM"],
  },
  {
    id: "EN003",
    title: "Hệ thống nhận diện sản phẩm lỗi",
    companyName: "Công ty DEF Tech",
    field: "Quality Control",
    createdAt: "2025-07-03",
    isPublic: true,
    tags: ["Computer Vision", "AI"],
  },
  {
    id: "EN004",
    title: "Tự động hóa xử lý hóa đơn",
    companyName: "FinTech JSC",
    field: "Tài chính",
    createdAt: "2025-07-04",
    isPublic: false,
    tags: ["OCR", "Automation"],
  },
  {
    id: "EN005",
    title: "Phân tích cảm xúc khách hàng trên mạng xã hội",
    companyName: "SocialBuzz",
    field: "Social Media",
    createdAt: "2025-07-05",
    isPublic: true,
    tags: ["Sentiment Analysis", "NLP"],
  },
  {
    id: "EN006",
    title: "Ứng dụng AI trong tuyển dụng nhân sự",
    companyName: "HRTech",
    field: "Human Resources",
    createdAt: "2025-07-06",
    isPublic: true,
    tags: ["AI", "Recruitment"],
  },
  {
    id: "EN007",
    title: "Giám sát hoạt động máy móc bằng IoT",
    companyName: "Industry 4.0 Inc.",
    field: "IoT",
    createdAt: "2025-07-07",
    isPublic: true,
    tags: ["IoT", "Monitoring"],
  },
  {
    id: "EN008",
    title: "Chấm công bằng nhận diện khuôn mặt",
    companyName: "FaceTime Solutions",
    field: "AI",
    createdAt: "2025-07-08",
    isPublic: false,
    tags: ["Facial Recognition", "HR"],
  },
  {
    id: "EN009",
    title: "Hệ thống gợi ý sản phẩm cá nhân hóa",
    companyName: "EcomPro",
    field: "E-Commerce",
    createdAt: "2025-07-09",
    isPublic: true,
    tags: ["Recommender", "AI"],
  },
  {
    id: "EN010",
    title: "Phân tích hành vi mua sắm",
    companyName: "RetailData",
    field: "Marketing",
    createdAt: "2025-07-10",
    isPublic: true,
    tags: ["Analytics", "Customer Behavior"],
  },
  {
    id: "EN011",
    title: "Tối ưu hóa quy trình vận hành",
    companyName: "LeanOps Ltd.",
    field: "Operations",
    createdAt: "2025-07-11",
    isPublic: true,
    tags: ["Optimization", "ERP"],
  },
  {
    id: "EN012",
    title: "Ứng dụng chatbot hỗ trợ khách hàng",
    companyName: "ChatBotify",
    field: "Customer Service",
    createdAt: "2025-07-12",
    isPublic: true,
    tags: ["Chatbot", "NLP"],
  },
  {
    id: "EN013",
    title: "Phát hiện gian lận trong giao dịch tài chính",
    companyName: "SafePay",
    field: "Finance",
    createdAt: "2025-07-13",
    isPublic: false,
    tags: ["Fraud Detection", "AI"],
  },
  {
    id: "EN014",
    title: "Dự đoán nhu cầu thị trường",
    companyName: "MarketTrend",
    field: "Market Research",
    createdAt: "2025-07-14",
    isPublic: true,
    tags: ["Forecasting", "Big Data"],
  },
  {
    id: "EN015",
    title: "Hệ thống định danh khách hàng",
    companyName: "IDTech",
    field: "Security",
    createdAt: "2025-07-15",
    isPublic: true,
    tags: ["Biometrics", "AI"],
  },
  {
    id: "EN016",
    title: "Quản lý năng lượng trong nhà máy",
    companyName: "GreenFactory",
    field: "Energy",
    createdAt: "2025-07-16",
    isPublic: true,
    tags: ["IoT", "Monitoring"],
  },
  {
    id: "EN017",
    title: "Ứng dụng blockchain quản lý hợp đồng",
    companyName: "SmartContracts Co.",
    field: "Blockchain",
    createdAt: "2025-07-17",
    isPublic: false,
    tags: ["Blockchain", "LegalTech"],
  },
  {
    id: "EN018",
    title: "Tự động hóa trả lời email khách hàng",
    companyName: "AutoReply Inc.",
    field: "Customer Service",
    createdAt: "2025-07-18",
    isPublic: true,
    tags: ["Email Bot", "NLP"],
  },
  {
    id: "EN019",
    title: "Phân tích dữ liệu cảm biến công nghiệp",
    companyName: "SensorX",
    field: "Industrial AI",
    createdAt: "2025-07-19",
    isPublic: true,
    tags: ["Sensor Data", "Anomaly Detection"],
  },
  {
    id: "EN020",
    title: "Dự đoán biến động thị trường chứng khoán",
    companyName: "StockAI",
    field: "Finance",
    createdAt: "2025-07-20",
    isPublic: true,
    tags: ["Stock Prediction", "Machine Learning"],
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
    title: "Công ty",
    dataIndex: "companyName",
    key: "companyName",
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
  {
    title: "Công khai",
    dataIndex: "isPublic",
    key: "isPublic",
    render: (value: boolean) => (value ? "✔️" : "❌"),
  },
  {
    title: "Tags",
    dataIndex: "tags",
    key: "tags",
    render: (tags: string[]) => tags.join(", "),
  },
];

export default function EnterpriseTrackLibraryPage() {
  return (
    <div>
      <h2>Trang: Kho đề tài Doanh nghiệp</h2>
      <Table
        columns={columns}
        dataSource={mockEnterpriseTopics}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}

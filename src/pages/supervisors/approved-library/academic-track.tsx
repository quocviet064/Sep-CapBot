import { Card, Table, Typography, Tag } from "antd";
import { useState } from "react";

const { Title, Paragraph } = Typography;

type AcademicTopic = {
  id: string;
  title: string;
  studentName: string;
  field: string;
  createdAt: string;
  isPublic: boolean;
  tags: string[];
};

const mockAcademicTopics: AcademicTopic[] = [
  {
    id: "AC001",
    title: "Đề tài học thuật 1",
    studentName: "Phạm Minh A",
    field: "Ngôn ngữ học",
    createdAt: "2025-07-01",
    isPublic: true,
    tags: ["EduTech", "Assessment"],
  },
  {
    id: "AC002",
    title: "Đề tài học thuật 2",
    studentName: "Bùi Thị B",
    field: "Ngôn ngữ học",
    createdAt: "2025-07-06",
    isPublic: false,
    tags: ["HealthTech", "Big Data"],
  },
  {
    id: "AC003",
    title: "Đề tài học thuật 3",
    studentName: "Hoàng Văn C",
    field: "Giáo dục",
    createdAt: "2025-07-15",
    isPublic: false,
    tags: ["Finance", "Predictive"],
  },
  {
    id: "AC004",
    title: "Đề tài học thuật 4",
    studentName: "Trần Thị D",
    field: "Khoa học máy tính",
    createdAt: "2025-07-06",
    isPublic: false,
    tags: ["HealthTech", "Big Data"],
  },
  {
    id: "AC005",
    title: "Đề tài học thuật 5",
    studentName: "Trần Thị E",
    field: "Xã hội học",
    createdAt: "2025-07-12",
    isPublic: true,
    tags: ["Finance", "Predictive"],
  },
  {
    id: "AC006",
    title: "Đề tài học thuật 6",
    studentName: "Đặng Thị F",
    field: "Blockchain",
    createdAt: "2025-07-06",
    isPublic: false,
    tags: ["HealthTech", "Big Data"],
  },
  {
    id: "AC007",
    title: "Đề tài học thuật 7",
    studentName: "Đặng Thị G",
    field: "Ngôn ngữ học",
    createdAt: "2025-07-02",
    isPublic: true,
    tags: ["AI", "Recommender"],
  },
  {
    id: "AC008",
    title: "Đề tài học thuật 8",
    studentName: "Nguyễn Văn H",
    field: "Y sinh học",
    createdAt: "2025-07-17",
    isPublic: true,
    tags: ["Blockchain", "Lưu trữ"],
  },
  {
    id: "AC009",
    title: "Đề tài học thuật 9",
    studentName: "Ngô Đức I",
    field: "Tài chính",
    createdAt: "2025-07-08",
    isPublic: true,
    tags: ["Enviro", "Analysis"],
  },
  {
    id: "AC010",
    title: "Đề tài học thuật 10",
    studentName: "Lê Văn J",
    field: "Môi trường",
    createdAt: "2025-07-15",
    isPublic: false,
    tags: ["Security", "Access"],
  },
  {
    id: "AC011",
    title: "Đề tài học thuật 11",
    studentName: "Ngô Đức K",
    field: "Blockchain",
    createdAt: "2025-07-15",
    isPublic: true,
    tags: ["Finance", "Predictive"],
  },
  {
    id: "AC012",
    title: "Đề tài học thuật 12",
    studentName: "Lê Văn L",
    field: "Ngôn ngữ học",
    createdAt: "2025-07-01",
    isPublic: true,
    tags: ["AI", "Recommender"],
  },
  {
    id: "AC013",
    title: "Đề tài học thuật 13",
    studentName: "Lê Văn M",
    field: "Khoa học máy tính",
    createdAt: "2025-07-01",
    isPublic: false,
    tags: ["Finance", "Predictive"],
  },
  {
    id: "AC014",
    title: "Đề tài học thuật 14",
    studentName: "Phạm Minh N",
    field: "Khoa học máy tính",
    createdAt: "2025-07-03",
    isPublic: false,
    tags: ["Finance", "Predictive"],
  },
  {
    id: "AC015",
    title: "Đề tài học thuật 15",
    studentName: "Vũ Thị O",
    field: "Giáo dục",
    createdAt: "2025-07-03",
    isPublic: true,
    tags: ["DataViz", "Python"],
  },
  {
    id: "AC016",
    title: "Đề tài học thuật 16",
    studentName: "Phạm Minh P",
    field: "Giáo dục",
    createdAt: "2025-07-10",
    isPublic: false,
    tags: ["Society", "Survey"],
  },
  {
    id: "AC017",
    title: "Đề tài học thuật 17",
    studentName: "Lê Văn Q",
    field: "Blockchain",
    createdAt: "2025-07-11",
    isPublic: false,
    tags: ["NLP", "Pháp luật"],
  },
  {
    id: "AC018",
    title: "Đề tài học thuật 18",
    studentName: "Hoàng Văn R",
    field: "Blockchain",
    createdAt: "2025-07-04",
    isPublic: false,
    tags: ["Society", "Survey"],
  },
  {
    id: "AC019",
    title: "Đề tài học thuật 19",
    studentName: "Đặng Thị S",
    field: "Xã hội học",
    createdAt: "2025-07-08",
    isPublic: true,
    tags: ["Finance", "Predictive"],
  },
  {
    id: "AC020",
    title: "Đề tài học thuật 20",
    studentName: "Ngô Đức T",
    field: "Blockchain",
    createdAt: "2025-07-15",
    isPublic: true,
    tags: ["EduTech", "Assessment"],
  },
];

export default function AcademicTrackLibraryPage() {
  const [data] = useState(mockAcademicTopics);

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
      title: "Trạng thái",
      dataIndex: "isPublic",
      key: "isPublic",
      render: (isPublic: boolean) =>
        isPublic ? (
          <Tag color="green">Công khai</Tag>
        ) : (
          <Tag color="volcano">Riêng tư</Tag>
        ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags: string[]) => tags.map((tag) => <Tag key={tag}>{tag}</Tag>),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={3}>Trang: Kho đề tài Học thuật</Title>
        <Paragraph>
          Danh sách các đề tài học thuật đã được phân loại theo lĩnh vực. Một số
          đề tài có thể được đánh dấu là công khai để tham khảo.
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

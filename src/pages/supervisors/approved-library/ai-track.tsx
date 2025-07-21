import { Table, Tag } from "antd";

interface AITopic {
  id: string;
  title: string;
  studentName: string;
  field: string;
  createdAt: string;
  isPublic: boolean;
  tags: string[];
}

const mockAITopics: AITopic[] = [
  {
    id: "AI001",
    title: "Đề tài AI số 1",
    studentName: "Đoàn Văn A",
    field: "Autonomous Vehicles",
    createdAt: "2025-07-16",
    isPublic: true,
    tags: ["Robotics", "Pathfinding"],
  },
  {
    id: "AI002",
    title: "Đề tài AI số 2",
    studentName: "Lê Văn B",
    field: "AI in Agriculture",
    createdAt: "2025-07-12",
    isPublic: true,
    tags: ["Deep Learning", "Big Data"],
  },
  {
    id: "AI003",
    title: "Đề tài AI số 3",
    studentName: "Hoàng Thị C",
    field: "AI in Psychology",
    createdAt: "2025-07-01",
    isPublic: false,
    tags: ["Data Mining", "Visualization"],
  },
  {
    id: "AI004",
    title: "Đề tài AI số 4",
    studentName: "Nguyễn Văn D",
    field: "AI in Psychology",
    createdAt: "2025-07-21",
    isPublic: true,
    tags: ["Self-driving", "Sensor Fusion"],
  },
  {
    id: "AI005",
    title: "Đề tài AI số 5",
    studentName: "Nguyễn Văn E",
    field: "AI in Education",
    createdAt: "2025-07-04",
    isPublic: true,
    tags: ["Data Mining", "Visualization"],
  },
  {
    id: "AI006",
    title: "Đề tài AI số 6",
    studentName: "Ngô Thị F",
    field: "AI in Robotics",
    createdAt: "2025-07-13",
    isPublic: false,
    tags: ["Deep Learning", "Big Data"],
  },
  {
    id: "AI007",
    title: "Đề tài AI số 7",
    studentName: "Bùi Thị G",
    field: "AI in Finance",
    createdAt: "2025-07-02",
    isPublic: true,
    tags: ["Self-driving", "Sensor Fusion"],
  },
  {
    id: "AI008",
    title: "Đề tài AI số 8",
    studentName: "Phạm Minh H",
    field: "AI in Robotics",
    createdAt: "2025-07-21",
    isPublic: true,
    tags: ["Data Mining", "Visualization"],
  },
  {
    id: "AI009",
    title: "Đề tài AI số 9",
    studentName: "Lê Văn I",
    field: "AI in Education",
    createdAt: "2025-07-18",
    isPublic: false,
    tags: ["Emotion Detection", "Computer Vision"],
  },
  {
    id: "AI010",
    title: "Đề tài AI số 10",
    studentName: "Vũ Minh J",
    field: "AI in Finance",
    createdAt: "2025-07-05",
    isPublic: true,
    tags: ["Emotion Detection", "Computer Vision"],
  },
  {
    id: "AI011",
    title: "Đề tài AI số 11",
    studentName: "Lê Văn K",
    field: "AI in Healthcare",
    createdAt: "2025-07-15",
    isPublic: true,
    tags: ["Deep Learning", "Big Data"],
  },
  {
    id: "AI012",
    title: "Đề tài AI số 12",
    studentName: "Trần Thị L",
    field: "AI in Robotics",
    createdAt: "2025-07-14",
    isPublic: false,
    tags: ["Emotion Detection", "Computer Vision"],
  },
  {
    id: "AI013",
    title: "Đề tài AI số 13",
    studentName: "Đoàn Văn M",
    field: "Autonomous Vehicles",
    createdAt: "2025-07-16",
    isPublic: true,
    tags: ["Crop Prediction", "Drones"],
  },
  {
    id: "AI014",
    title: "Đề tài AI số 14",
    studentName: "Trần Thị N",
    field: "AI in Education",
    createdAt: "2025-07-02",
    isPublic: true,
    tags: ["AI", "NLP"],
  },
  {
    id: "AI015",
    title: "Đề tài AI số 15",
    studentName: "Hoàng Thị O",
    field: "AI in Marketing",
    createdAt: "2025-07-11",
    isPublic: true,
    tags: ["Emotion Detection", "Computer Vision"],
  },
  {
    id: "AI016",
    title: "Đề tài AI số 16",
    studentName: "Ngô Thị P",
    field: "Autonomous Vehicles",
    createdAt: "2025-07-17",
    isPublic: true,
    tags: ["Diagnostics", "Medical Imaging"],
  },
  {
    id: "AI017",
    title: "Đề tài AI số 17",
    studentName: "Đoàn Văn Q",
    field: "AI in Finance",
    createdAt: "2025-07-17",
    isPublic: true,
    tags: ["Diagnostics", "Medical Imaging"],
  },
  {
    id: "AI018",
    title: "Đề tài AI số 18",
    studentName: "Ngô Thị R",
    field: "AI in Healthcare",
    createdAt: "2025-07-10",
    isPublic: false,
    tags: ["Fraud Detection", "Risk Analysis"],
  },
  {
    id: "AI019",
    title: "Đề tài AI số 19",
    studentName: "Nguyễn Văn S",
    field: "Autonomous Vehicles",
    createdAt: "2025-07-07",
    isPublic: false,
    tags: ["Crop Prediction", "Drones"],
  },
  {
    id: "AI020",
    title: "Đề tài AI số 20",
    studentName: "Ngô Thị T",
    field: "Autonomous Vehicles",
    createdAt: "2025-07-18",
    isPublic: true,
    tags: ["Recommendation", "Targeting"],
  },
];

export default function AITrackLibraryPage() {
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
      title: "Công khai",
      dataIndex: "isPublic",
      key: "isPublic",
      render: (value: boolean) => (value ? "✅" : "❌"),
    },
    {
      title: "Tags",
      key: "tags",
      dataIndex: "tags",
      render: (tags: string[]) => (
        <>
          {tags.map((tag) => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  return (
    <>
      <h2>Trang: Kho đề tài AI</h2>
      <Table
        dataSource={mockAITopics}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </>
  );
}

import { Table, Card } from "antd";
import type { ColumnsType } from "antd/es/table";

interface ReviewerPerf {
  name: string;
  reviews: number;
  avgScore: number;
}

const mockPerf: ReviewerPerf[] = [
  { name: "Dr. Alice", reviews: 20, avgScore: 8.5 },
  { name: "Mr. Bob", reviews: 18, avgScore: 7.9 },
  { name: "Ms. Carol", reviews: 15, avgScore: 8.2 },
];

const columns: ColumnsType<ReviewerPerf> = [
  { title: "Reviewer", dataIndex: "name", key: "name" },
  { title: "Reviews", dataIndex: "reviews", key: "reviews" },
  { title: "Avg. Score", dataIndex: "avgScore", key: "avgScore" },
];

export default function ReviewerPerformance() {
  return (
    <Card title="Reviewer Performance" size="small" style={{ marginTop: 16 }}>
      <Table
        rowKey="name"
        columns={columns}
        dataSource={mockPerf}
        pagination={false}
        size="small"
      />
    </Card>
  );
}

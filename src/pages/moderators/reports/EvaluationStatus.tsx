import { Card, Statistic, Row, Col } from "antd";

const stats = {
  total: 120,
  approved: 80,
  pending: 30,
  rejected: 10,
};

export default function EvaluationStatus() {
  return (
    <Card title="Evaluation Status" size="small">
      <Row gutter={16}>
        <Col span={6}>
          <Statistic title="Total" value={stats.total} />
        </Col>
        <Col span={6}>
          <Statistic title="Approved" value={stats.approved} valueStyle={{ color: "#52c41a" }} />
        </Col>
        <Col span={6}>
          <Statistic title="Pending" value={stats.pending} />
        </Col>
        <Col span={6}>
          <Statistic title="Rejected" value={stats.rejected} valueStyle={{ color: "#ff4d4f" }} />
        </Col>
      </Row>
    </Card>
  );
}

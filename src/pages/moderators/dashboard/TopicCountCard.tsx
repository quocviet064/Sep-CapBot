import { Card, Statistic } from "antd";
import { topics } from "../../../mock/topics";

export default function TopicCountCard() {
  return (
    <Card title="Total Topics" style={{ minWidth: 180 }}>
      <Statistic value={topics.length} suffix="topics" />
    </Card>
  );
}

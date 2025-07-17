import { Card, List, Tag } from "antd";
import { topics } from "../../../mock/topics";

export default function WarningTopicsCard() {
  // Giả lập: những topic UNDER_REVIEW > 5 ngày thì warning
  const now = Date.now();
  const warnings = topics.filter(
    t =>
      t.status === "UNDER_REVIEW" &&
      now - new Date(t.createdAt).getTime() > 5 * 24 * 3600 * 1000
  );
  return (
    <Card title="Warning Topics" style={{ minWidth: 260 }}>
      <List
        size="small"
        dataSource={warnings}
        locale={{ emptyText: "No warning 🎉" }}
        renderItem={item => (
          <List.Item>
            <span>{item.title}</span>
            <Tag color="red" style={{ marginLeft: 12 }}>Overdue</Tag>
          </List.Item>
        )}
      />
    </Card>
  );
}

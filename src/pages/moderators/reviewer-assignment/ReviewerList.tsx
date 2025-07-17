import { List, Progress, Tag } from "antd";
import { reviewers } from "../../../mock/reviewers";

export default function ReviewerList() {
  return (
    <List
      header={<b>Reviewer Workload</b>}
      bordered
      dataSource={reviewers}
      renderItem={r => (
        <List.Item>
          <span style={{ minWidth: 100 }}>{r.name}</span>
          <Progress
            percent={Math.round((r.load / 20) * 100)}
            size="small"
            style={{ width: 100, margin: "0 16px" }}
            status={r.load >= 20 ? "exception" : "active"}
          />
          <Tag color={r.load >= 20 ? "red" : "blue"}>
            {r.load}/20 topics
          </Tag>
        </List.Item>
      )}
    />
  );
}

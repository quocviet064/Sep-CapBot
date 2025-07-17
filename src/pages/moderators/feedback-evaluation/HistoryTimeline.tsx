import { Timeline, Card } from "antd";

const logs = [
  { time: "2024-07-10 14:03", action: "Assigned reviewer R01" },
  { time: "2024-07-11 09:20", action: "Reviewer accepted" },
  { time: "2024-07-15 15:55", action: "Review submitted" },
  { time: "2024-07-16 11:00", action: "Moderator approved topic" }
];

export default function HistoryTimeline() {
  return (
    <Card title="Audit Log" style={{ minWidth: 250 }}>
      <Timeline>
        {logs.map((log, i) => (
          <Timeline.Item key={i}>
            <b>{log.action}</b>
            <div style={{ color: "#888" }}>{log.time}</div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
}

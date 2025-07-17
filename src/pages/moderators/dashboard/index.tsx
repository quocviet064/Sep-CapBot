import TopicCountCard from "./TopicCountCard";
import PendingStatusCard from "./PendingStatusCard";
import WarningTopicsCard from "./WarningTopicsCard";

export default function Dashboard() {
  return (
    <div style={{ padding: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
      <TopicCountCard />
      <PendingStatusCard />
      <WarningTopicsCard />
    </div>
  );
}

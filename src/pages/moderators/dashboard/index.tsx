import React from "react";
import PendingStatusCard from "./PendingStatusCard";
import TopicCountCard from "./TopicCountCard";
import WarningTopicsCard from "./WarningTopicsCard";

export default function Dashboard() {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <TopicCountCard />
      <PendingStatusCard />
      <WarningTopicsCard />
    </div>
  );
}

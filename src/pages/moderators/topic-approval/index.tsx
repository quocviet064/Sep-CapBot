import React from "react";
import PendingTopicsTable from "./PendingTopicsTable";
import RequestEditModal from "./RequestEditModal";
import TopicDetail from "./TopicDetail";

export default function TopicApprovalPage() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Pending Topics for Approval</h2>
      <PendingTopicsTable />
      {/* Khi click 1 dòng, hiện TopicDetail (hoặc modal), ví dụ: */}
      {/* <TopicDetail topicId="T001" /> */}
      <RequestEditModal />
    </div>
  );
}

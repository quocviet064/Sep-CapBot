import ReviewerList from "./ReviewerList";
import AssignDrawer from "./AssignDrawer";

export default function ReviewerAssignmentPage() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Phân công phản biện</h2>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <ReviewerList />
        </div>
        <div style={{ flex: 1 }}>
          <AssignDrawer />
        </div>
      </div>
    </div>
  );
}

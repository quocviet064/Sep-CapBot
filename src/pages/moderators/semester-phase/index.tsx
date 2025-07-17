import SemesterList from "./SemesterList";
import Phases from "./Phases";
import Rounds from "./Rounds";

export default function SemesterPhasePage() {
  return (
    <div style={{ padding: 16, display: "flex", gap: 24 }}>
      <div style={{ flex: 1 }}>
        <h2>Danh sách Học kỳ</h2>
        <SemesterList />
      </div>
      <div style={{ flex: 1 }}>
        <h2>Phase trong kỳ</h2>
        <Phases />
      </div>
      <div style={{ flex: 1 }}>
        <h2>Vòng nộp bài</h2>
        <Rounds />
      </div>
    </div>
  );
}

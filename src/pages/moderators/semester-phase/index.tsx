import { Tabs } from "antd";
import { Outlet, useNavigate, useParams } from "react-router-dom";

const tabItems = [
  { key: "semester-list", label: "Danh sách học kỳ" },
  { key: "phases",         label: "Phase trong học kỳ" },
  { key: "rounds",         label: "Round & thời gian" },
];

export default function SemesterPhasePage() {
  const navigate = useNavigate();
  const params = useParams<{ "*": string }>();
  const activeKey = params["*"] || "semester-list";

  return (
    <>
      <h2>Quản lý Học kỳ & Phase</h2>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => navigate(key)}
        items={tabItems.map((t) => ({ key: t.key, label: t.label }))}
      />
      <Outlet />
    </>
  );
}

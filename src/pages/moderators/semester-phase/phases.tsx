import { Card, Alert } from "antd";

export default function Phases() {
  return (
    <Card title="Phases" style={{ margin: 16 }}>
      <Alert
        message="Tính năng Phases chưa khả dụng"
        description="Backend chưa cung cấp API quản lý Phases."
        type="info"
        showIcon
      />
    </Card>
  );
}

import { Card, Alert } from "antd";

export default function Rounds() {
  return (
    <Card title="Submission Rounds" style={{ margin: 16 }}>
      <Alert
        message="Tính năng Rounds chưa khả dụng"
        description="Backend chưa cung cấp API quản lý Rounds."
        type="info"
        showIcon
      />
    </Card>
  );
}

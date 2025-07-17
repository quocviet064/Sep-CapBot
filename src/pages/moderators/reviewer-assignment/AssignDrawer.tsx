import { useState } from "react";
import { Drawer, Button, Select, Space, Progress, message } from "antd";
import { reviewers } from "../../../mock/reviewers";

export default function AssignDrawer() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary">Assign Reviewer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width={350}
        title="Assign Reviewer"
      >
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Select reviewers"
          value={selected}
          onChange={setSelected}
        >
          {reviewers.map(r => (
            <Select.Option key={r.id} value={r.id} disabled={r.load >= 20}>
              <Space>
                {r.name}
                <Progress percent={Math.round((r.load / 20) * 100)} size="small" style={{ width: 60 }} />
              </Space>
            </Select.Option>
          ))}
        </Select>
        <Button
          type="primary"
          block
          style={{ marginTop: 16 }}
          disabled={!selected.length}
          onClick={() => {
            message.success(`Assigned to: ${selected.join(", ")}`);
            setOpen(false);
            setSelected([]);
          }}
        >
          Confirm Assign
        </Button>
      </Drawer>
    </>
  );
}

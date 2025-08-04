import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  Table,
  Spin,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
} from "antd";
import moment from "moment";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllSemesters,
  deleteSemester,
  createSemester,
  updateSemester,
  SemesterDTO,
  CreateSemesterDTO,
  UpdateSemesterDTO,
} from "@/services/semesterService";

export default function SemesterList() {
  const [form] = Form.useForm();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SemesterDTO | null>(null);
  const qc = useQueryClient();

  // Fetch list
  const { data, isLoading, error } = useQuery<SemesterDTO[], Error>({
    queryKey: ["semesters"],
    queryFn: async () => {
      const res = await getAllSemesters();
      if (!res.data.success) throw new Error(res.data.message || "Failed to fetch semesters");
      return res.data.data;
    },
  });

  const delMutation = useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      const res = await deleteSemester(id);
      if (!res.data.success) throw new Error(res.data.message || "Delete failed");
    },
    onSuccess: () => {
      message.success("Xóa học kỳ thành công");
      qc.invalidateQueries({ queryKey: ["semesters"] });
    },
    onError: (err) => {
      message.error(`Xóa thất bại: ${err.message}`);
    },
  });

  // Modalcreate
  const handleOpenCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  // Modal edit
  const handleOpenEdit = (sem: SemesterDTO) => {
    setEditing(sem);
    form.setFieldsValue({
      name: sem.name,
      startDate: moment(sem.startDate),
      endDate: moment(sem.endDate),
    });
    setModalOpen(true);
  };

  // Handle form submit for create/update
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const dto = {
      name: values.name,
      startDate: values.startDate.format("YYYY-MM-DD"),
      endDate: values.endDate.format("YYYY-MM-DD"),
    } as CreateSemesterDTO;

    try {
      if (editing) {
        await updateSemester({ id: editing.id, ...dto } as UpdateSemesterDTO);
        message.success("Cập nhật thành công");
      } else {
        await createSemester(dto);
        message.success("Tạo mới thành công");
      }
      form.resetFields();
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["semesters"] });
    } catch (err: any) {
      message.error(err.message || "Lỗi");
    }
  };

  if (isLoading) return <Spin />;
  if (error) return <div>Error: {error.message}</div>;

  const semesters = data || [];

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleOpenCreate}
        style={{ marginBottom: 16 }}
      >
        Tạo học kỳ mới
      </Button>

      <Modal
        title={editing ? "Sửa học kỳ" : "Tạo học kỳ mới"}
        open={isModalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên học kỳ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Table<SemesterDTO>
        rowKey="id"
        dataSource={semesters}
        columns={[
          { title: "ID", dataIndex: "id", key: "id" },
          { title: "Tên học kỳ", dataIndex: "name", key: "name" },
          { title: "Bắt đầu", dataIndex: "startDate", key: "startDate" },
          { title: "Kết thúc", dataIndex: "endDate", key: "endDate" },
          {
            title: "Action",
            key: "action",
            render: (_: any, record: SemesterDTO) => (
              <Space>
                <Button size="small" onClick={() => handleOpenEdit(record)}>
                  Sửa
                </Button>
                <Popconfirm
                  title="Xác nhận xóa?"
                  onConfirm={() => delMutation.mutate(record.id)}
                >
                  <Button danger size="small">
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        pagination={false}
        size="small"
      />
    </>
  );
}

import { useState } from "react";
import { Button, Table, Modal, Form, Input, Space, Popconfirm, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchCategoryById,
} from "@/services/categoryService";

export default function CategoryManager() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();

  // Lấy list
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchAllCategories,
  });

  // Tạo + update
  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (editing) {
        await updateCategory({ id: editing.id, ...values });
      } else {
        await createCategory(values);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
      form.resetFields();
    },
  });

  // Xóa
  const delMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      message.success("Xoá thành công");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Mở modal tạo mới
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  // Mở modal sửa
  const openEdit = async (record: any) => {
    // Nếu muốn lấy chi tiết thì gọi API fetchCategoryById(record.id), ở đây có thể chỉ dùng record luôn.
    setEditing(record);
    form.setFieldsValue({ name: record.name, description: record.description });
    setOpen(true);
  };

  // Submit form
  const handleOk = async () => {
    const values = await form.validateFields();
    mutation.mutate(values);
  };

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ marginBottom: 16 }}>
        Thêm danh mục
      </Button>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data || []}
        columns={[
          { title: "ID", dataIndex: "id", key: "id", width: 80 },
          { title: "Tên danh mục", dataIndex: "name", key: "name" },
          { title: "Mô tả", dataIndex: "description", key: "description" },
          {
            title: "Thao tác",
            key: "actions",
            render: (_: any, record: any) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>
                  Sửa
                </Button>
                <Popconfirm title="Xác nhận xoá?" onConfirm={() => delMutation.mutate(record.id)}>
                  <Button danger size="small">
                    Xoá
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      {/* Modal create/edit */}
      <Modal
        title={editing ? "Sửa danh mục" : "Thêm danh mục"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleOk}
        okText={editing ? "Cập nhật" : "Tạo mới"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: "Bắt buộc" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

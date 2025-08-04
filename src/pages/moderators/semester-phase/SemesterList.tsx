import { useState } from "react";
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
  Card,
  Row,
  Col,
} from "antd";
import moment from "moment";
import { Moment } from "moment";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllSemesters,
  getSemesterDetail,
  deleteSemester,
  createSemester,
  updateSemester,
  SemesterDTO,
  CreateSemesterDTO,
  UpdateSemesterDTO,
} from "@/services/semesterService";

function DateCell({
  semesterId,
  type,
}: {
  semesterId: number;
  type: "start" | "end";
}) {
  const { data, isLoading, isError } = useQuery<SemesterDTO, Error>({
    queryKey: ["semesterDetail", semesterId],
    queryFn: async () => {
      const res = await getSemesterDetail(semesterId);
      if (!res.data.success) throw new Error(res.data.message || "Error");
      return res.data.data;
    },
    staleTime: 60_000,
  });

  if (isLoading) return <Spin size="small" />;
  if (isError || !data) return <span>—</span>;

  const dateStr = type === "start" ? data.startDate : data.endDate;
  return <span>{moment(dateStr).format("DD/MM/YYYY")}</span>;
}

export default function SemesterList() {
  const [form] = Form.useForm();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SemesterDTO | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  // Get list
  const { data, isLoading, error } = useQuery<SemesterDTO[], Error>({
    queryKey: ["semesters"],
    queryFn: async () => {
      const res = await getAllSemesters();
      if (!res.data.success)
        throw new Error(res.data.message || "Failed to fetch");
      return res.data.data;
    },
  });

  // Delete
  const delMutation = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const res = await deleteSemester(id);
      if (!res.data.success)
        throw new Error(res.data.message || "Delete failed");
    },
    onSuccess: () => {
      message.success("Xóa học kỳ thành công");
      qc.invalidateQueries({ queryKey: ["semesters"] });
    },
    onError: (err) => message.error(`Xóa thất bại: ${err.message}`),
  });

  const all = data || [];
  const filtered = search
    ? all.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    : all;
  const total = filtered.length;
  const list = filtered.slice((page - 1) * limit, page * limit);

  // Mở modal create
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };
  // Mở modal edit
  const openEdit = async (sem: SemesterDTO) => {
  try {
    const res = await getSemesterDetail(sem.id);
    if (!res.data.success) {
      message.error("Không lấy được thông tin chi tiết");
      return;
    }
    const detail = res.data.data;
    setEditing(detail);

    form.setFieldsValue({
      name: detail.name,
      startDate: moment(detail.startDate) as Moment,
      endDate: moment(detail.endDate) as Moment,
    });

    setModalOpen(true);
  } catch (err: any) {
    message.error(err.message || "Có lỗi khi tải thông tin");
  }
};

  // Submit create/update
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
      setModalOpen(false);
      form.resetFields();
      qc.invalidateQueries({ queryKey: ["semesters"] });
    } catch (err: any) {
      message.error(err.message || "Lỗi");
    }
  };

  if (isLoading) return <Spin />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Card
      style={{
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Tạo học kỳ mới
          </Button>
        </Col>
        <Col>
          <Input.Search
            placeholder="Tìm kiếm học kỳ..."
            allowClear
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            style={{ width: 240 }}
          />
        </Col>
      </Row>

      <Table<SemesterDTO>
        rowKey="id"
        dataSource={list}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          onChange: (p, sz) => {
            setPage(p);
            setLimit(sz!);
          },
        }}
        size="middle"
        columns={[
          { title: "ID", dataIndex: "id", key: "id", width: 60 },
          {
            title: "Tên học kỳ",
            dataIndex: "name",
            key: "name",
            ellipsis: true,
          },
          {
            title: "Ngày bắt đầu",
            key: "startDate",
            render: (_: any, rec: SemesterDTO) => (
              <DateCell semesterId={rec.id} type="start" />
            ),
          },
          {
            title: "Ngày kết thúc",
            key: "endDate",
            render: (_: any, rec: SemesterDTO) => (
              <DateCell semesterId={rec.id} type="end" />
            ),
          },
          {
            title: "Thao tác",
            key: "action",
            align: "center",
            width: 140,
            render: (_: any, rec: SemesterDTO) => (
              <Space>
                <Button size="small" onClick={() => openEdit(rec)}>
                  Sửa
                </Button>
                <Popconfirm
                  title="Xác nhận xóa?"
                  onConfirm={() => delMutation.mutate(rec.id)}
                >
                  <Button danger size="small">
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Sửa học kỳ" : "Tạo học kỳ"}
        open={isModalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên học kỳ"
            rules={[{ required: true, message: "Vui lòng nhập tên học kỳ" }]}
          >
            <Input placeholder="Ví dụ: Học kỳ 1" />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Chọn ngày kết thúc" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

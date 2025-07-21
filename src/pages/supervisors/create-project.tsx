import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  message,
  Typography,
  Divider,
  Row,
  Col,
  Card,
  Space,
  Tag,
} from "antd";
import moment from "moment";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CreateTopicFormValues {
  title: string;
  studentName: string;
  field: string;
  createdAt: moment.Moment;
  tags?: string[];
  description?: string;
  objective?: string;
  expectedResult?: string;
  toolset?: string;
  referenceLinks?: string[];
  collaborators?: string;
}

const fieldOptions = [
  "AI",
  "Computer Vision",
  "HealthTech",
  "Blockchain",
  "NLP",
  "Finance",
  "Marketing",
  "IoT",
  "Education",
  "Cybersecurity",
];

const tagSuggestions = [
  "deep learning",
  "object detection",
  "data analysis",
  "ethereum",
  "chatbot",
  "security",
  "realtime",
  "edge computing",
  "sentiment",
  "recommendation",
  "anomaly",
  "pattern",
  "language",
  "automation",
  "analytics",
];

export default function CreateProjectPage() {
  const [form] = Form.useForm<CreateTopicFormValues>();

  const onFinish = (values: CreateTopicFormValues) => {
    console.log("Submitted:", values);
    message.success("Đề tài mới đã được tạo thành công!");
    form.resetFields();
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 32 }}>
      <Typography>
        <Title level={2}>Trang: Tạo đề tài mới</Title>
        <Paragraph>
          Vui lòng nhập đầy đủ các thông tin liên quan đến đề tài nghiên cứu.
          Mục tiêu là đảm bảo đề tài rõ ràng, đúng lĩnh vực, có mục tiêu và kết
          quả kỳ vọng cụ thể.
        </Paragraph>
      </Typography>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ tags: [], createdAt: moment() }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="title"
              label="Tên đề tài"
              rules={[{ required: true, message: "Vui lòng nhập tên đề tài" }]}
            >
              <Input placeholder="Nhập tên đề tài" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="studentName"
              label="Tên sinh viên thực hiện"
              rules={[
                { required: true, message: "Vui lòng nhập tên sinh viên" },
              ]}
            >
              <Input placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="field"
              label="Lĩnh vực"
              rules={[{ required: true, message: "Vui lòng chọn lĩnh vực" }]}
            >
              <Select placeholder="Chọn lĩnh vực">
                {fieldOptions.map((field) => (
                  <Option key={field} value={field}>
                    {field}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="createdAt"
              label="Ngày tạo đề tài"
              rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="tags" label="Từ khóa liên quan (tags)">
          <Select mode="tags" placeholder="Thêm từ khóa gợi ý">
            {tagSuggestions.map((tag) => (
              <Option key={tag}>{tag}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Mô tả đề tài">
          <TextArea
            rows={4}
            placeholder="Mô tả tổng quan về đề tài, phạm vi nghiên cứu và ý nghĩa thực tiễn..."
          />
        </Form.Item>

        <Form.Item name="objective" label="Mục tiêu nghiên cứu">
          <TextArea
            rows={3}
            placeholder="Nêu rõ mục tiêu cụ thể mà đề tài hướng tới..."
          />
        </Form.Item>

        <Form.Item name="expectedResult" label="Kết quả kỳ vọng">
          <TextArea
            rows={3}
            placeholder="Hệ thống gì? Phân tích gì? Tăng độ chính xác ra sao?..."
          />
        </Form.Item>

        <Form.Item name="toolset" label="Công cụ và công nghệ sử dụng">
          <Input placeholder="VD: Python, TensorFlow, Docker..." />
        </Form.Item>

        <Form.Item
          name="referenceLinks"
          label="Tài liệu tham khảo (liệt kê link)"
        >
          <Select
            mode="tags"
            placeholder="Nhập hoặc dán link từng nguồn tham khảo"
          />
        </Form.Item>

        <Form.Item name="collaborators" label="Thành viên cộng tác (nếu có)">
          <Input placeholder="Nhập tên các cộng tác viên nếu có" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Tạo đề tài
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <Card title="Gợi ý khi viết mô tả và mục tiêu" bordered={false}>
        <Space direction="vertical">
          <Tag color="blue">Cụ thể và đo lường được</Tag>
          <Tag color="green">Có ứng dụng thực tiễn</Tag>
          <Tag color="purple">Đúng lĩnh vực đào tạo</Tag>
          <Tag color="orange">Không trùng lặp với đề tài cũ</Tag>
        </Space>
      </Card>
    </div>
  );
}

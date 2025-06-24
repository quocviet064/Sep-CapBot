import {
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  CalendarDays,
  FileSearch,
  FileText,
  FolderSearch,
  LockKeyhole,
  MessageSquareDiff,
  Settings,
  Settings2,
  SlidersHorizontal,
  SquareTerminal,
  Upload,
  Users,
} from "lucide-react";

export const siteSupervisor = [
  {
    title: "Quản lý đề tài",
    url: "#",
    icon: SquareTerminal,
    isActive: false,
    items: [
      {
        title: "Tất cả đề tài",
        url: "/home",
      },
      {
        title: "Đang chờ duyệt",
        url: "/contact",
      },
      {
        title: "Đã được duyệt",
        url: "#",
      },
      {
        title: "Bị từ chối",
        url: "#",
      },
      {
        title: "Bị cảnh báo AI",
        url: "#",
      },
    ],
  },
  {
    title: "Tạo đề tài mới",
    url: "/create-project",
    icon: Bot,
  },
  {
    title: "Đề tài cần được xử lý",
    url: "#",
    icon: BookOpen,
    items: [
      {
        title: "Cần chỉnh sửa sau phản hồi",
        url: "#",
      },
      {
        title: "Từ chối bởi AI",
        url: "#",
      },
      {
        title: "Sắp tới hạn phản hồi",
        url: "#",
      },
      {
        title: "Có phản hồi mới",
        url: "#",
      },
    ],
  },
  {
    title: "Kho đề tài được duyệt",
    url: "#",
    icon: Settings2,
    items: [
      {
        title: "Hướng nghiên cứu AI",
        url: "#",
      },
      {
        title: "Hướng doanh nghiệp",
        url: "#",
      },
      {
        title: "Hướng học thuật",
        url: "#",
      },
      {
        title: "Tìm kiếm đề tài",
        url: "#",
      },
    ],
  },
];

export const siteAdmin = [
  {
    title: "Tổng quan hệ thống",
    url: "#",
    icon: SquareTerminal,
    isActive: false,
    items: [
      { title: "Số lượng đề tài theo kỳ", url: "#" },
      { title: "Tình trạng AI check", url: "#" },
      { title: "Đề tài có cảnh báo", url: "#" },
      { title: "Giảng viên chưa hoạt động", url: "#" },
    ],
  },
  {
    title: "Quản lý học kỳ & giai đoạn",
    url: "#",
    icon: CalendarDays,
    isActive: false,
    items: [
      { title: "Học kỳ (Semester)", url: "#" },
      { title: "Phase trong học kỳ", url: "#" },
      { title: "Phase Type", url: "#" },
      { title: "Submission Round", url: "#" },
    ],
  },
  {
    title: "Quản lý đề tài & phiên bản",
    url: "#",
    icon: FileText,
    isActive: false,
    items: [
      { title: "Tất cả đề tài", url: "#" },
      { title: "Đề tài mới gửi", url: "#" },
      { title: "Đề tài bị AI cảnh báo", url: "#" },
      { title: "Phiên bản đề tài", url: "#" },
    ],
  },
  {
    title: "Import đề tài cũ",
    url: "#",
    icon: Upload,
    isActive: false,
    items: [
      { title: "Upload file đề tài", url: "#" },
      { title: "Gắn metadata & legacy", url: "#" },
      { title: "Đánh dấu đã được duyệt", url: "#" },
      { title: "Cho phép AI học", url: "#" },
    ],
  },
  {
    title: "Tiêu chí đánh giá",
    url: "#",
    icon: SlidersHorizontal,
    isActive: false,
    items: [
      { title: "Bộ tiêu chí theo PhaseType", url: "#" },
      { title: "Cấu hình trọng số & điểm", url: "#" },
      { title: "Mẫu phiếu review", url: "#" },
    ],
  },
  {
    title: "Quản lý giảng viên",
    url: "#",
    icon: Users,
    isActive: false,
    items: [
      { title: "Danh sách Lecturer", url: "#" },
      { title: "Gán kỹ năng", url: "#" },
      { title: "Gán / thu hồi vai trò", url: "#" },
      { title: "Vô hiệu hóa tài khoản", url: "#" },
    ],
  },
  {
    title: "Cấu hình AI",
    url: "#",
    icon: Brain,
    isActive: false,
    items: [
      { title: "Ngưỡng trùng lặp", url: "#" },
      { title: "Ngưỡng điểm AI chấm", url: "#" },
      { title: "Kết quả AI đánh giá", url: "#" },
      { title: "Tinh chỉnh mô hình", url: "#" },
    ],
  },
  {
    title: "Phân quyền truy cập",
    url: "#",
    icon: LockKeyhole,
    isActive: false,
    items: [
      { title: "Quyền xem kho đề tài", url: "#" },
      { title: "Ẩn danh vai trò review", url: "#" },
      { title: "Truy cập đặc biệt", url: "#" },
    ],
  },
  {
    title: "Thống kê & báo cáo",
    url: "#",
    icon: BarChart3,
    isActive: false,
    items: [
      { title: "Tổng hợp đề tài", url: "#" },
      { title: "Lịch sử phản hồi", url: "#" },
      { title: "Hiệu suất giảng viên", url: "#" },
      { title: "Xuất báo cáo", url: "#" },
    ],
  },
  {
    title: "Cấu hình hệ thống",
    url: "#",
    icon: Settings,
    isActive: false,
    items: [
      { title: "Logo & tên hệ thống", url: "#" },
      { title: "Cấu hình thời gian", url: "#" },
      { title: "Cấu hình môi trường", url: "#" },
    ],
  },
];
export const siteModerator = [
  {
    title: "Tổng quan hệ thống",
    url: "#",
    icon: SquareTerminal,
    isActive: false,
    items: [
      { title: "Số lượng đề tài theo kỳ", url: "#" },
      { title: "Tình trạng đề tài chờ duyệt", url: "#" },
      { title: "Đề tài có cảnh báo", url: "#" },
    ],
  },
  {
    title: "Quản lý học kỳ & Phase",
    url: "#",
    icon: CalendarDays,
    isActive: false,
    items: [
      { title: "Danh sách học kỳ", url: "#" },
      { title: "Phase trong học kỳ", url: "#" },
      { title: "Round & thời gian", url: "#" },
    ],
  },
  {
    title: "Xét duyệt đề tài",
    url: "#",
    icon: FileText,
    isActive: false,
    items: [
      { title: "Đề tài chờ xét duyệt", url: "#" },
      { title: "Chi tiết đề tài", url: "#" },
      { title: "Gửi phản hồi / yêu cầu chỉnh sửa", url: "#" },
    ],
  },
  {
    title: "Phân công phản biện",
    url: "#",
    icon: Users,
    isActive: false,
    items: [
      { title: "Gán Reviewer cho đề tài", url: "#" },
      { title: "Theo dõi tiến độ đánh giá", url: "#" },
    ],
  },
  {
    title: "Phản hồi & đánh giá",
    url: "#",
    icon: MessageSquareDiff,
    isActive: false,
    items: [
      { title: "Lịch sử phản hồi", url: "#" },
      { title: "Xem đề xuất chỉnh sửa", url: "#" },
      { title: "Duyệt lại phiên bản mới", url: "#" },
    ],
  },
  {
    title: "Thống kê & báo cáo",
    url: "#",
    icon: BarChart3,
    isActive: false,
    items: [
      { title: "Số lượng đề tài theo Phase", url: "#" },
      { title: "Tình trạng đánh giá", url: "#" },
      { title: "Hiệu suất Reviewer", url: "#" },
    ],
  },
];

export const siteReviewer = [
  {
    title: "Tổng quan hệ thống",
    url: "#",
    icon: SquareTerminal,
    isActive: false,
    items: [
      { title: "Số lượng đề tài được giao", url: "#" },
      { title: "Tiến độ đánh giá", url: "#" },
      { title: "Tình trạng phản hồi", url: "#" },
    ],
  },
  {
    title: "Đề tài được phân công",
    url: "#",
    icon: FileSearch,
    isActive: false,
    items: [
      { title: "Danh sách đề tài", url: "#" },
      { title: "Xem chi tiết nội dung", url: "#" },
      { title: "Ghi chú nội bộ", url: "#" },
    ],
  },
  {
    title: "Đánh giá đề tài",
    url: "#",
    icon: FileText,
    isActive: false,
    items: [
      { title: "Chấm điểm theo tiêu chí", url: "#" },
      { title: "Thêm nhận xét từng đoạn", url: "#" },
      { title: "Tải file phản biện", url: "#" },
    ],
  },
  {
    title: "Lịch sử phản hồi",
    url: "#",
    icon: MessageSquareDiff,
    isActive: false,
    items: [
      { title: "Xem đề tài đã phản hồi", url: "#" },
      { title: "Theo dõi chỉnh sửa sau phản biện", url: "#" },
    ],
  },
  {
    title: "Kho lưu trữ đề tài",
    url: "#",
    icon: FolderSearch,
    isActive: false,
    items: [
      { title: "Xem đề tài đã duyệt", url: "#" },
      { title: "Tra cứu nội dung liên quan", url: "#" },
    ],
  },
  {
    title: "Thống kê đánh giá",
    url: "#",
    icon: BarChart3,
    isActive: false,
    items: [
      { title: "Số lượt đánh giá đã hoàn thành", url: "#" },
      { title: "Đề tài có cảnh báo", url: "#" },
      { title: "Tổng hợp điểm trung bình", url: "#" },
    ],
  },
];

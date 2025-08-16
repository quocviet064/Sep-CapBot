import {
  AlignEndHorizontal,
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  CalendarSearch,
  FileSearch,
  FileText,
  FolderSearch,
  LockKeyhole,
  MessageSquareDiff,
  Settings,
  SlidersHorizontal,
  SquareTerminal,
  Users,
  FolderKanban,
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
        url: "/supervisors/topics/topic-page",
      },
      {
        title: "Tất cả đề tài của tôi",
        url: "/supervisors/topics/myTopic-page",
      },
      {
        title: "Tất cả đề tài đã nộp",
        url: "/supervisors/submissions/SubmissionPage",
      },
    ],
  },
  {
    title: "Tạo đề tài mới",
    url: "/create-project",
    icon: Bot,
  },
  {
    title: "Tạo và Nộp đề tài",
    url: "/supervisors/submission-topic/semesters/semesters-page",
    icon: Bot,
  },
  {
    title: "Kì học",
    url: "/supervisors/semester",
    icon: CalendarSearch,
  },
  {
    title: "Danh mục đề tài",
    url: "/supervisors/category",
    icon: AlignEndHorizontal,
  },
  {
    title: "Đề tài cần được xử lý",
    url: "#",
    icon: BookOpen,
    items: [
      {
        title: "Cần chỉnh sửa sau phản hồi",
        url: "/supervisors/needs-action/edit-after-feedback",
      },
      {
        title: "Từ chối bởi AI",
        url: "/supervisors/needs-action/rejected-by-ai",
      },
      {
        title: "Sắp tới hạn phản hồi",
        url: "/supervisors/needs-action/deadline-coming",
      },
      {
        title: "Có phản hồi mới",
        url: "/supervisors/needs-action/new-feedback",
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
      { title: "Số lượng đề tài theo kỳ", url: "/admins/dashboard/overview" },
      { title: "Tình trạng AI check", url: "/admins/dashboard/status-ai" },
      { title: "Đề tài có cảnh báo", url: "/admins/dashboard/warning-topics" },
      {
        title: "Giảng viên chưa hoạt động",
        url: "/admins/dashboard/inactive-supervisors",
      },
    ],
  },
  {
    title: "Quản lý học kỳ & giai đoạn",
    url: "#",
    icon: CalendarDays,
    isActive: false,
    items: [
      {
        title: "Học kỳ (Semester)",
        url: "/admins/semester-management/semesters",
      },

      { title: "Phase Type", url: "/admins/phase-types/PhaseTypePage" },
      { title: "Phase", url: "/admins/phase/PhasePage" },
    ],
  },
  {
    title: "Quản lý đề tài & phiên bản",
    url: "#",
    icon: FileText,
    isActive: false,
    items: [
      { title: "Tất cả đề tài", url: "/admins/topics-management/all-topics" },
      {
        title: "Đề tài mới gửi",
        url: "/admins/topics-management/new-submitted",
      },
      {
        title: "Đề tài bị AI cảnh báo",
        url: "/admins/topics-management/ai-flagged",
      },
      { title: "Phiên bản đề tài", url: "/admins/topics-management/versions" },
    ],
  },
  {
    title: "Tiêu chí đánh giá",
    url: "#",
    icon: SlidersHorizontal,
    isActive: false,
    items: [
      {
        title: "Bộ tiêu chí theo PhaseType",
        url: "/admins/evaluation-criteria/by-phase-type",
      },
      {
        title: "Cấu hình trọng số & điểm",
        url: "/admins/evaluation-criteria/weights",
      },
      {
        title: "Mẫu phiếu review",
        url: "/admins/evaluation-criteria/review-template",
      },
    ],
  },
  {
    title: "Quản lý giảng viên",
    url: "#",
    icon: Users,
    isActive: false,
    items: [
      { title: "Danh sách Lecturer", url: "/admins/lecturer-management/list" },
      {
        title: "Gán kỹ năng",
        url: "/admins/lecturer-management/assign-skills",
      },
      {
        title: "Gán / thu hồi vai trò",
        url: "/admins/lecturer-management/assign-roles",
      },
      {
        title: "Vô hiệu hóa tài khoản",
        url: "/admins/lecturer-management/deactivate",
      },
    ],
  },
  {
    title: "Phân quyền truy cập",
    url: "#",
    icon: LockKeyhole,
    isActive: false,
    items: [
      {
        title: "Quyền xem kho đề tài",
        url: "/admins/access-control/topic-visibility",
      },
      {
        title: "Ẩn danh vai trò review",
        url: "/admins/access-control/anonymous-review",
      },
      {
        title: "Truy cập đặc biệt",
        url: "/admins/access-control/special-access",
      },
    ],
  },
  {
    title: "Thống kê & báo cáo",
    url: "#",
    icon: BarChart3,
    isActive: false,
    items: [
      { title: "Tổng hợp đề tài", url: "/admins/reports/summary" },
      { title: "Lịch sử phản hồi", url: "/admins/reports/feedback-history" },
      {
        title: "Hiệu suất giảng viên",
        url: "/admins/reports/supervisor-performance",
      },
      { title: "Xuất báo cáo", url: "/admins/reports/export" },
    ],
  },
  {
    title: "Cấu hình hệ thống",
    url: "#",
    icon: Settings,
    isActive: false,
    items: [
      { title: "Logo & tên hệ thống", url: "/admins/system-settings/branding" },
      { title: "Cấu hình thời gian", url: "/admins/system-settings/timing" },
      {
        title: "Cấu hình môi trường",
        url: "/admins/system-settings/environment",
      },
    ],
  },
];

export const siteModerator = [
  {
    title: "Tổng quan hệ thống",
    url: "/moderators/dashboard",
    icon: SquareTerminal,
  },
  {
    title: "Quản lý học kỳ & Phase",
    url: "/moderators/semester-phase",
    icon: CalendarDays,
  },
  {
    title: "Quản lý danh mục đề tài",
    url: "/moderators/category-manager/category-page",
    icon: FolderKanban,
  },
  {
    title: "Xét duyệt đề tài",
    url: "/moderators/topic-approval",
    icon: FileText,
  },
  {
    title: "Phân công phản biện",
    url: "#",
    icon: Users,
    isActive: false,
    items: [
      {
        title: "Tổng quan phân công",
        url: "/moderators/reviewer-assignment",
      },
      {
        title: "Theo dõi phân công",
        url: "/moderators/reviewer-assignment/assignments",
      },
    ],
  },
  {
    title: "Phản hồi & đánh giá",
    url: "/moderators/feedback-evaluation",
    icon: MessageSquareDiff,
  },
  {
    title: "Thống kê & báo cáo",
    url: "/moderators/reports",
    icon: BarChart3,
  },
];

export const siteReviewer = [
  {
    title: "Tổng quan hệ thống",
    url: "/reviewers/dashboard/assigned-count",
    icon: SquareTerminal,
    isActive: false,
    items: [
      {
        title: "Số lượng đề tài được giao",
        url: "/reviewers/dashboard/assigned-count",
      },
      { title: "Tiến độ đánh giá", url: "/reviewers/dashboard/progress" },
      {
        title: "Tình trạng phản hồi",
        url: "/reviewers/dashboard/feedback-status",
      },
    ],
  },
  {
    title: "Đề tài được phân công",
    url: "/reviewers/assigned-topics/list",
    icon: FileSearch,
    isActive: false,
    items: [
      { title: "Danh sách đề tài", url: "/reviewers/assigned-topics/list" },
      {
        title: "Xem chi tiết nội dung",
        url: "/reviewers/assigned-topics/detail",
      },
      {
        title: "Ghi chú nội bộ",
        url: "/reviewers/assigned-topics/internal-notes",
      },
    ],
  },
  {
    title: "Đánh giá đề tài",
    url: "/reviewers/evaluate-topics/score",
    icon: FileText,
    isActive: false,
    items: [
      {
        title: "Chấm điểm theo tiêu chí",
        url: "/reviewers/evaluate-topics/score",
      },
      {
        title: "Thêm nhận xét từng đoạn",
        url: "/reviewers/evaluate-topics/paragraph-comments",
      },
      {
        title: "Tải file phản biện",
        url: "/reviewers/evaluate-topics/upload-review-file",
      },
    ],
  },
  {
    title: "Lịch sử phản hồi",
    url: "/reviewers/feedback-history/responded-topics",
    icon: MessageSquareDiff,
    isActive: false,
    items: [
      {
        title: "Xem đề tài đã phản hồi",
        url: "/reviewers/feedback-history/responded-topics",
      },
      {
        title: "Theo dõi chỉnh sửa sau phản biện",
        url: "/reviewers/feedback-history/post-review-tracking",
      },
    ],
  },
  {
    title: "Kho lưu trữ đề tài",
    url: "/reviewers/topic-archive/approved-topics",
    icon: FolderSearch,
    isActive: false,
    items: [
      {
        title: "Xem đề tài đã duyệt",
        url: "/reviewers/topic-archive/approved-topics",
      },
      {
        title: "Tra cứu nội dung liên quan",
        url: "/reviewers/topic-archive/search-related",
      },
    ],
  },
  {
    title: "Thống kê đánh giá",
    url: "/reviewers/evaluation-stats/completed",
    icon: BarChart3,
    isActive: false,
    items: [
      {
        title: "Số lượt đánh giá đã hoàn thành",
        url: "/reviewers/evaluation-stats/completed",
      },
      {
        title: "Đề tài có cảnh báo",
        url: "/reviewers/evaluation-stats/warnings",
      },
      {
        title: "Tổng hợp điểm trung bình",
        url: "/reviewers/evaluation-stats/average-score",
      },
    ],
  },
];

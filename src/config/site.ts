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
        url: "/supervisors/topics/all",
      },
      {
        title: "Đang chờ duyệt",
        url: "/supervisors/topics/pending",
      },
      {
        title: "Đã được duyệt",
        url: "/supervisors/topics/approved",
      },
      {
        title: "Bị từ chối",
        url: "/supervisors/topics/rejected",
      },
      {
        title: "Bị cảnh báo AI",
        url: "/supervisors/topics/ai-flagged",
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
  {
    title: "Kho đề tài được duyệt",
    url: "#",
    icon: Settings2,
    items: [
      {
        title: "Hướng nghiên cứu AI",
        url: "/supervisors/approved-library/ai",
      },
      {
        title: "Hướng doanh nghiệp",
        url: "/supervisors/approved-library/enterprise",
      },
      {
        title: "Hướng học thuật",
        url: "/supervisors/approved-library/academic",
      },
      {
        title: "Tìm kiếm đề tài",
        url: "/supervisors/approved-library/search",
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
      {
        title: "Phase trong học kỳ",
        url: "/admins/semester-management/phases",
      },
      { title: "Phase Type", url: "/admins/semester-management/phase-types" },
      {
        title: "Submission Round",
        url: "/admins/semester-management/submission-rounds",
      },
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
    title: "Import đề tài cũ",
    url: "#",
    icon: Upload,
    isActive: false,
    items: [
      { title: "Upload file đề tài", url: "/admins/legacy-import/upload" },
      { title: "Gắn metadata & legacy", url: "/admins/legacy-import/metadata" },
      {
        title: "Đánh dấu đã được duyệt",
        url: "/admins/legacy-import/mark-approved",
      },
      { title: "Cho phép AI học", url: "/admins/legacy-import/ai-train" },
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
    title: "Cấu hình AI",
    url: "#",
    icon: Brain,
    isActive: false,
    items: [
      {
        title: "Ngưỡng trùng lặp",
        url: "/admins/ai-config/similarity-threshold",
      },
      {
        title: "Ngưỡng điểm AI chấm",
        url: "/admins/ai-config/score-threshold",
      },
      { title: "Kết quả AI đánh giá", url: "/admins/ai-config/results" },
      { title: "Tinh chỉnh mô hình", url: "/admins/ai-config/tuning" },
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
    url: "/moderators/dashboard/topic-count",
    icon: SquareTerminal,
    isActive: false,
    items: [
      {
        title: "Số lượng đề tài theo kỳ",
        url: "/moderators/dashboard/topic-count",
      },
      {
        title: "Tình trạng đề tài chờ duyệt",
        url: "/moderators/dashboard/pending-status",
      },
      {
        title: "Đề tài có cảnh báo",
        url: "/moderators/dashboard/warning-topics",
      },
    ],
  },
  {
    title: "Quản lý học kỳ & Phase",
    url: "/moderators/semester-phase/semester-list",
    icon: CalendarDays,
    isActive: false,
    items: [
      {
        title: "Danh sách học kỳ",
        url: "/moderators/semester-phase/semester-list",
      },
      { title: "Phase trong học kỳ", url: "/moderators/semester-phase/phases" },
      { title: "Round & thời gian", url: "/moderators/semester-phase/rounds" },
    ],
  },
  {
    title: "Xét duyệt đề tài",
    url: "/moderators/topic-approval/pending-topics",
    icon: FileText,
    isActive: false,
    items: [
      {
        title: "Đề tài chờ xét duyệt",
        url: "/moderators/topic-approval/pending-topics",
      },
      {
        title: "Chi tiết đề tài",
        url: "/moderators/topic-approval/topic-detail",
      },
      {
        title: "Gửi phản hồi / yêu cầu chỉnh sửa",
        url: "/moderators/topic-approval/request-edit",
      },
    ],
  },
  {
    title: "Phân công phản biện",
    url: "/moderators/reviewer-assignment/assign-reviewers",
    icon: Users,
    isActive: false,
    items: [
      {
        title: "Gán Reviewer cho đề tài",
        url: "/moderators/reviewer-assignment/assign-reviewers",
      },
      {
        title: "Theo dõi tiến độ đánh giá",
        url: "/moderators/reviewer-assignment/progress-tracking",
      },
    ],
  },
  {
    title: "Phản hồi & đánh giá",
    url: "/moderators/feedback-evaluation/history",
    icon: MessageSquareDiff,
    isActive: false,
    items: [
      {
        title: "Lịch sử phản hồi",
        url: "/moderators/feedback-evaluation/history",
      },
      {
        title: "Xem đề xuất chỉnh sửa",
        url: "/moderators/feedback-evaluation/suggestions",
      },
      {
        title: "Duyệt lại phiên bản mới",
        url: "/moderators/feedback-evaluation/approve-new-version",
      },
    ],
  },
  {
    title: "Thống kê & báo cáo",
    url: "/moderators/reports/topic-by-phase",
    icon: BarChart3,
    isActive: false,
    items: [
      {
        title: "Số lượng đề tài theo Phase",
        url: "/moderators/reports/topic-by-phase",
      },
      {
        title: "Tình trạng đánh giá",
        url: "/moderators/reports/evaluation-status",
      },
      {
        title: "Hiệu suất Reviewer",
        url: "/moderators/reports/reviewer-performance",
      },
    ],
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

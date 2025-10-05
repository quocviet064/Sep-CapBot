import {
  BarChart3,
  Bot,
  CalendarDays,
  CalendarSearch,
  FileSearch,
  FileText,
  FolderSearch,
  MessageSquareDiff,
  SquareTerminal,
  FolderKanban,
} from "lucide-react";

export const siteSupervisor = [
  {
    title: "Dashboard",
    url: "/supervisors/dashboard",
    icon: Bot,
  },
  {
    title: "Tạo đề tài và gợi ý AI",
    url: "/supervisors/topics/ai-agent",
    icon: Bot,
  },
  {
    title: "Nộp đề tài",
    url: "/supervisors/submission-topic/semesters/semesters-page",
    icon: Bot,
  },
  {
    title: "Quản lý đề tài",
    url: "#",
    icon: SquareTerminal,
    isActive: false,
    items: [
      {
        title: "Hệ thống kho đề tài",
        url: "/supervisors/topics/all-topics-list",
      },
      {
        title: "Tất cả đề tài của tôi",
        url: "/supervisors/topics/myTopic-page",
      },
      {
        title: "Tất cả đề tài đã nộp",
        url: "/supervisors/all-submitted-topics/AllSubmittedTopicsPage",
      },
    ],
  },
  // {
  //   title: "Tạo đề tài mới",
  //   url: "/supervisors/topics/create-new",
  //   icon: Bot,
  // },

  {
    title: "Thông tin học kỳ và tiêu chí",
    url: "/supervisors/semester",
    icon: CalendarSearch,
  },
  // {
  //   title: "Danh mục đề tài",
  //   url: "/supervisors/category",
  //   icon: AlignEndHorizontal,
  // },
];

export const siteAdmin = [
  {
    title: "Tổng quan hệ thống",
    url: "#",
    icon: SquareTerminal,
    isActive: false,
    items: [
      { title: "Dashboard", url: "/admins/admin-dashboard" },
      { title: "Tất cả đề tài", url: "/supervisors/topics/all-topics-list" },
    ],
  },
  {
    title: "Quản lý học kỳ & giai đoạn",
    url: "#",
    icon: CalendarDays,
    isActive: false,
    items: [
      {
        title: "Học kỳ",
        url: "/admins/semester-management/SemesterPage",
      },

      { title: "Giai đoạn", url: "/admins/phase-types/PhaseTypePage" },
      { title: "Loại giai đoạn", url: "/admins/phase/PhasePage" },
    ],
  },
  {
    title: "Bộ tiêu chí",
    url: "/admins/evaluation-criteria/EvaluationCriteriaPage",
    icon: Bot,
  },
  {
    title: "Loại đề tài",
    url: "/admins/category-topic/CategoryPage",
    icon: Bot,
  },
  {
    title: "Quản lí tài khoản",
    url: "/admins/auth-management/account-provision",
    icon: Bot,
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
    title: "Bộ tiêu chí",
    url: "/admins/evaluation-criteria/EvaluationCriteriaPage",
    icon: Bot,
  },
  {
    title: "Quản lý danh mục đề tài",
    url: "/moderators/category-manager/category-page",
    icon: FolderKanban,
  },
  { title: "Submissions", url: "/moderators/submissions", icon: FileText },
];

export const siteReviewer = [
  {
    title: "Tổng quan hệ thống",
    url: "/reviewers/dashboard",
    icon: SquareTerminal,
  },
  {
    title: "Đề tài được phân công",
    url: "#",
    icon: FileSearch,
    isActive: false,
    items: [
      { title: "Danh sách", url: "/reviewers/assigned-topics/list" },
      { title: "Xem chi tiết", url: "/reviewers/assigned-topics/detail" },
    ],
  },
  {
    title: "Lịch sử phản hồi",
    url: "/reviewers/feedback-history",
    icon: MessageSquareDiff,
  },
  {
    title: "Kho lưu trữ đề tài",
    url: "/reviewers/topic-archive",
    icon: FolderSearch,
  },
  {
    title: "Thống kê đánh giá",
    url: "/reviewers/evaluation-stats",
    icon: BarChart3,
  },
];

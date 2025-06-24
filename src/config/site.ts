import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";

export const siteSupervisor = [
  {
    title: "Quản lý đề tài",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
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
    isActive: true,
    items: [
      {
        title: "Số lượng đề tài theo kỳ",
        url: "#",
      },
      {
        title: "Tình trạng",
        url: "#",
      },
      {
        title: "Đề tài có cảnh báo",
        url: "#",
      },
    ],
  },
  {
    title: "Quản lý học kỳ",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "Số lượng đề tài theo kỳ",
        url: "#",
      },
      {
        title: "Tình trạng",
        url: "#",
      },
      {
        title: "Đề tài có cảnh báo",
        url: "#",
      },
    ],
  },
];

export const siteModerator = [
  {
    title: "Tổng quan hệ thống",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "Số lượng đề tài theo kỳ",
        url: "#",
      },
      {
        title: "Tình trạng",
        url: "#",
      },
      {
        title: "Đề tài có cảnh báo",
        url: "#",
      },
    ],
  },
  {
    title: "Quản lý học kỳ",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "Số lượng đề tài theo kỳ",
        url: "#",
      },
      {
        title: "Tình trạng",
        url: "#",
      },
      {
        title: "Đề tài có cảnh báo",
        url: "#",
      },
    ],
  },
];

export const siteReviewer = [
  {
    title: "Tổng quan hệ thống",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "Số lượng đề tài theo kỳ",
        url: "#",
      },
      {
        title: "Tình trạng",
        url: "#",
      },
      {
        title: "Đề tài có cảnh báo",
        url: "#",
      },
    ],
  },
  {
    title: "Quản lý học kỳ",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "Số lượng đề tài theo kỳ",
        url: "#",
      },
      {
        title: "Tình trạng",
        url: "#",
      },
      {
        title: "Đề tài có cảnh báo",
        url: "#",
      },
    ],
  },
];

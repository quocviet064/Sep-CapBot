import { Outlet } from "react-router-dom";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../atoms/sidebar";
import { AppSidebar } from "../organisms/sidebar";

export default function LectureLayout() {
  return (
    <SidebarProvider >
      <AppSidebar />
      <SidebarInset >
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center px-4">
            <SidebarTrigger />
            <span className="font-medium">
              Hệ thống hỗ trợ quản lý đề tài đồ án tốt nghiệp
            </span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

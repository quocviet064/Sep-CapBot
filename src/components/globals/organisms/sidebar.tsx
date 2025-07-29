"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "../atoms/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  siteAdmin,
  siteModerator,
  siteReviewer,
  siteSupervisor,
} from "@/config/site";
import { useAuth } from "@/contexts/AuthContext";

const userData = {
  name: "viet",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const navItems =
    user?.role === "Administrator"
      ? siteAdmin
      : user?.role === "Moderator"
        ? siteModerator
        : user?.role === "Supervisor"
          ? siteSupervisor
          : siteReviewer;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

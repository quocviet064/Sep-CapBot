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
import { NavSecondary } from "./nav-footer";
import { LogOut } from "lucide-react";

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

  const navSecondary = [
    {
      title: "Logout",
      url: "/login",
      icon: LogOut,
    },
  ];
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarFooter className="bg-primary">
        <NavUser user={userData} />
      </SidebarFooter>

      <SidebarContent className="bg-primary text-white">
        <NavMain items={navItems} />
      </SidebarContent>

      <NavSecondary items={navSecondary} />

      <SidebarRail />
    </Sidebar>
  );
}

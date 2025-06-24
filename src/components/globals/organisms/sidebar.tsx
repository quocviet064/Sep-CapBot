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

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [auth] = React.useState<
    "supervisor" | "admin" | "moderator" | "reviewer"
  >("admin");

  const navItems =
    auth === "admin"
      ? siteAdmin
      : auth === "moderator"
        ? siteModerator
        : auth === "supervisor"
          ? siteSupervisor
          : siteReviewer;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

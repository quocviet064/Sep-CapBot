"use client";

import * as React from "react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

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
import { useMyProfile } from "@/hooks/useUserProfile";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import { safeSrc } from "@/utils/safeSrc";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const { data: myProfile, isLoading } = useMyProfile();
  const navigate = useNavigate();

  const navItems =
    user?.role === "Administrator"
      ? siteAdmin
      : user?.role === "Moderator"
        ? siteModerator
        : user?.role === "Supervisor"
          ? siteSupervisor
          : siteReviewer;

  const navUser = useMemo(() => {
    const fallbackName =
      user?.unique_name ||
      (user?.email ? user.email.split("@")[0] : "Người dùng");

    const name = myProfile?.fullName || fallbackName;
    const email = user?.email || "—";

    const rawAvatar = myProfile?.avatar || "";
    const normalized = rawAvatar ? normalizeAssetUrl(rawAvatar) : "";
    const avatar =
      safeSrc(normalized) ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        name,
      )}`;

    return { name, email, avatar };
  }, [myProfile, user]);

  const navSecondary = [
    {
      title: "Logout",
      url: "/login",
      icon: LogOut,
      onClick: () => {
        logout();
        navigate("/login", { replace: true });
      },
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarFooter className="bg-primary p-0">
        <Link
          to="/profile/MyProfilePage"
          className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="Xem hồ sơ cá nhân"
        >
          <div className="hover:bg-primary/90 cursor-pointer transition-colors">
            {isLoading ? (
              <div className="w-full p-4 text-sm opacity-70">
                Đang tải hồ sơ…
              </div>
            ) : (
              <NavUser user={navUser} />
            )}
          </div>
        </Link>
      </SidebarFooter>

      <SidebarContent className="bg-primary text-white">
        <NavMain items={navItems} />
      </SidebarContent>

      <NavSecondary items={navSecondary as any} />
      <SidebarRail />
    </Sidebar>
  );
}

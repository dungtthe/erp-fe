"use client";

import { ClipboardList, Factory, GalleryVerticalEnd, Home, Package, Receipt, ShoppingCart, Users } from "lucide-react";

import * as React from "react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { NavSidebar } from "@/my-components/layout/sidebar/nav_sidebar";
import { NavUser } from "@/my-components/layout/sidebar/nav_user";
import { TeamSwitcher } from "@/my-components/layout/sidebar/team_switcher";

const data = {
  user: {
    name: "Victoria",
    email: "victoria@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "ERP Solutions",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  nav_sidebar: [
    {
      label: "Dashboard",
      items: [{ name: "Tổng quan", url: "/dashboard", icon: Home }],
    },
    {
      label: "Quản lý đơn hàng",
      items: [
        { name: "Đơn hàng", url: "/orders", icon: ShoppingCart },
        { name: "Sản phẩm", url: "/products", icon: Package },
        { name: "Khách hàng", url: "/customers", icon: Users },
        { name: "Lệnh sản xuất", url: "/manufacturing-orders", icon: Factory },
        { name: "Đơn đặt hàng", url: "/purchase-orders", icon: ClipboardList },
        { name: "Hóa đơn mua hàng", url: "/purchase-invoices", icon: Receipt },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {data.nav_sidebar.map((nav_group) => (
          <NavSidebar key={nav_group.label} nav_group_label={nav_group.label} nav_items={nav_group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

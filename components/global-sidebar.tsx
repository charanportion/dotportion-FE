"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchProjects } from "@/lib/redux/slices/projectsSlice";
import { useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Home, Folder } from "lucide-react";
import { fetchDashboardData } from "@/lib/redux/slices/dashboardSlice";

const getNavigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: `/dashboard`,
  },
  {
    title: "Projects",
    icon: Folder,
    href: `/projects`,
  },
];

export default function GlobalSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const isInProjectRoute = /^\/projects\/[^\/]+(\/.*)?$/.test(pathname);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDashboardData());
      dispatch(fetchProjects());
    }
  }, [isAuthenticated, dispatch]);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path);

  if (isInProjectRoute) return null;

  return (
    <Sidebar
      collapsible="icon"
      side="left"
      className=" bg-neutal-100 text-black border-none"
    >
      <SidebarHeader className="py-4 h-12 bg-neutal-100 ">
        <div className="flex items-center justify-start">
          {isCollapsed ? (
            <div className="w-4 h-4 bg-black rounded flex items-center justify-center">
              <Image
                src="/logo-dark.png"
                alt="logo"
                width={150}
                height={150}
                // className="w-10 h-10"
              />
            </div>
          ) : (
            <div className="flex items-center justify-start w-full h-4">
              <Image
                src="/logo-dark.png"
                alt="logo"
                width={150}
                height={150}
                // className="w-10 h-10"
              />
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-neutal-100 border-r border-sidebar-border">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {getNavigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={toggleSidebar}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-300 shadow-md hover:shadow-lg transition-shadow"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-gray-600" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-600" />
          )}
        </button>
      </div>
    </Sidebar>
  );
}

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
import {
  fetchProjects,
  loadSelectedProjectFromStorage,
} from "@/lib/redux/slices/projectsSlice";
import { loadSelectedWorkflowFromStorage } from "@/lib/redux/slices/workflowsSlice";
import { useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Database,
  GitBranch,
  Key,
  Settings,
  TableProperties,
} from "lucide-react";

const getNavigationItems = (projectId: string) => [
  {
    title: "Dashboard",
    icon: Home,
    href: `/projects/${projectId}/dashboard`,
  },
  {
    title: "Logs",
    icon: FileText,
    href: `/projects/${projectId}/logs`,
  },
  {
    title: "Database",
    icon: Database,
    href: `/projects/${projectId}/database`,
  },
  {
    title: "Schema",
    icon: TableProperties,
    href: `/projects/${projectId}/schema`,
  },
  {
    title: "Workflows",
    icon: GitBranch,
    href: `/projects/${projectId}/workflows`,
  },
  {
    title: "Secrets",
    icon: Key,
    href: `/projects/${projectId}/secrets`,
  },
  {
    title: "Settings",
    icon: Settings,
    href: `/projects/${projectId}/settings`,
  },
  {
    title: "API Docs",
    icon: FileText,
    href: `/projects/${projectId}/docs`,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { selectedProject, isLoading } = useSelector(
    (state: RootState) => state.projects
  );

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  // Get navigation items based on selected project
  const navigationItems = selectedProject
    ? getNavigationItems(selectedProject._id)
    : [];

  // Load projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadSelectedProjectFromStorage());
      dispatch(loadSelectedWorkflowFromStorage());
      dispatch(fetchProjects());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Sidebar
      collapsible="icon"
      side="left"
      className=" bg-neutal-100 text-black border-none"
    >
      <SidebarHeader className="py-4 h-12 bg-neutal-100 ">
        <Link href={"/dashboard"} className="flex items-center justify-start">
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
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-neutral-100 border-r border-sidebar-border">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {selectedProject ? (
                navigationItems.map((item) => (
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
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  {isLoading ? "Loading..." : "No project selected"}
                </div>
              )}
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

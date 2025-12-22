"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Folder,
  PanelLeftDashed,
  ChartColumn,
  Database,
  FileText,
  GitBranch,
  Home,
  Key,
  Settings,
  TableProperties,
  Logs,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import {
  fetchProjects,
  loadSelectedProjectFromStorage,
} from "@/lib/redux/slices/projectsSlice";
import { loadSelectedWorkflowFromStorage } from "@/lib/redux/slices/workflowsSlice";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "../app/globals.css";
import { userApi } from "@/lib/api/user";

const getUserScopedTourKey = (
  baseKey: "tour_done_sidebar_main" | "tour_done_sidebar_project",
  userId: string
) => `${baseKey}_${userId}`;

// Main navigation items (Dashboard and Projects)
const getMainNavigationItems = [
  {
    title: "Projects",
    icon: Folder,
    href: `/projects`,
    description:
      "View and manage all your projects, including workflows, secrets, schemas, and documentation.",
  },
  {
    title: "Analytics",
    icon: ChartColumn,
    href: `/dashboard`,
    description:
      "Access detailed analytics about your usage, API calls, errors, and performance trends.",
  },
];

// Project-specific navigation items
const getProjectNavigationItems = (projectId: string) => [
  {
    title: "Dashboard",
    icon: Home,
    href: `/projects/${projectId}/dashboard`,
    description:
      "View an overview of your project's API performance, usage, success rates, and workflow activity.",
  },
  {
    title: "Workflows",
    icon: GitBranch,
    href: `/projects/${projectId}/workflows`,
    description:
      "Create, manage, and deploy workflows that define your API logic and automation flows.",
  },
  {
    title: "Secrets",
    icon: Key,
    href: `/projects/${projectId}/secrets`,
    description:
      "Securely store and manage API keys, credentials, and environment secrets for your workflows.",
  },
  {
    title: "Schema",
    icon: TableProperties,
    href: `/projects/${projectId}/schema`,
    description:
      "Visually design and manage your project's schema structure, entities, relationships, and data models.",
  },
  {
    title: "Database",
    icon: Database,
    href: `/projects/${projectId}/database`,
    description:
      "Browse, query, and manage records in your project’s generated database collections.",
  },
  {
    title: "Logs",
    icon: Logs,
    href: `/projects/${projectId}/logs`,
    description:
      "Monitor all API execution logs, workflow runs, errors, timestamps, and request details.",
  },
  {
    title: "API Docs",
    icon: FileText,
    href: `/projects/${projectId}/docs`,
    description:
      "Access auto-generated API documentation, endpoints, schemas, and workflow-generated API routes.",
  },

  {
    title: "Project Settings",
    icon: Settings,
    href: `/projects/${projectId}/settings`,
    description:
      "Configure project-level settings including environment variables, deployment options, and metadata.",
  },
];

type SidebarMode = "expanded" | "collapsed" | "hover";

export default function SidebarNew() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const { selectedProject, isLoading } = useSelector(
    (state: RootState) => state.projects
  );

  const userId = user?._id;
  console.log(userId);

  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar_mode");
      return (saved as SidebarMode) || "expanded";
    }
    return "expanded";
  });

  const [isHovering, setIsHovering] = useState(false);

  const [toursSynced, setToursSynced] = useState(false);

  // Check if we're in a project route
  const isInProjectRoute = /^\/projects\/[^\/]+(\/.*)?$/.test(pathname);

  // Extract project ID from URL
  const pathSegments = pathname.split("/").filter(Boolean);
  const projectIdFromUrl =
    isInProjectRoute && pathSegments.length >= 2 ? pathSegments[1] : null;

  // Load projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadSelectedProjectFromStorage());
      dispatch(loadSelectedWorkflowFromStorage());
      dispatch(fetchProjects());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    async function syncTours() {
      try {
        if (!isAuthenticated || !userId) return;

        const res = await userApi.getTours();
        const tours = res.tours || {};

        if (tours.sidebarMain === true) {
          localStorage.setItem(
            getUserScopedTourKey("tour_done_sidebar_main", userId),
            "true"
          );
        }
        if (tours.sidebarProject === true) {
          localStorage.setItem(
            getUserScopedTourKey("tour_done_sidebar_project", userId),
            "true"
          );
        }
      } catch (err) {
        console.warn("Failed to sync tours:", err);
      } finally {
        setToursSynced(true);
      }
    }
    setToursSynced(false);
    syncTours();
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (sidebarMode === "expanded") {
      setOpen(true);
    } else if (sidebarMode === "collapsed") {
      setOpen(false);
    } else if (sidebarMode === "hover") {
      setOpen(isHovering);
    }
  }, [sidebarMode, isHovering, setOpen]);

  const dashboardSteps = useMemo<DriveStep[]>(
    () =>
      getMainNavigationItems.map<DriveStep>((item) => ({
        element: `.tour-${item.title.toLowerCase().replace(/\s+/g, "-")}`,
        popover: {
          title: item.title,
          description: item.description,
          side: "right",
          align: "center",
        },
      })),
    []
  );

  const projectSteps: DriveStep[] = useMemo(() => {
    if (!projectIdFromUrl) return [];

    return getProjectNavigationItems(projectIdFromUrl).map<DriveStep>(
      (item) => ({
        element: `.tour-${item.title.toLowerCase().replace(/\s+/g, "-")}`,
        popover: {
          title: item.title,
          description: item.description,
          side: "right",
          align: "center",
        },
      })
    );
  }, [projectIdFromUrl]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    if (sidebarMode !== "expanded") return;

    if (!toursSynced) return;

    const baseKey = isInProjectRoute
      ? "tour_done_sidebar_project"
      : "tour_done_sidebar_main";

    const tourKey = getUserScopedTourKey(baseKey, userId);

    // Prevent re-running the tour
    if (localStorage.getItem(tourKey) === "true") return;

    const steps = isInProjectRoute ? projectSteps : dashboardSteps;

    // Avoid running when elements are missing
    const allExist = steps.every((step) => {
      if (typeof step.element === "string") {
        return document.querySelector(step.element);
      }
      return false;
    });
    if (!allExist) return;

    const tour = driver({
      showProgress: true,
      steps,
      onDestroyed: async () => {
        try {
          localStorage.setItem(tourKey, "true");

          await userApi.updateTourStatus({
            tourKey:
              baseKey === "tour_done_sidebar_project"
                ? "sidebarProject"
                : "sidebarMain",
            completed: true,
          });
        } catch (err) {
          console.warn("Failed to update tour:", err);
        }
      },
    });

    setTimeout(() => tour.drive(), 200);
  }, [
    isAuthenticated,
    userId,
    isInProjectRoute,
    dashboardSteps,
    projectSteps,
    sidebarMode,
    toursSynced,
  ]);

  const handleModeChange = (value: SidebarMode) => {
    setSidebarMode(value);
    localStorage.setItem("sidebar_mode", value);
  };

  const handleMouseEnter = () => {
    if (sidebarMode === "hover") {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (sidebarMode === "hover") {
      setIsHovering(false);
    }
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path);

  const collapsibleMode = sidebarMode === "expanded" ? "icon" : "icon";
  const shouldShowTooltip =
    sidebarMode === "collapsed" || (sidebarMode === "hover" && !isHovering);

  // Determine which navigation items to show
  const navigationItems =
    isInProjectRoute && projectIdFromUrl
      ? getProjectNavigationItems(projectIdFromUrl)
      : getMainNavigationItems;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative h-full shrink-0 bg-neutral-50"
      data-hover-mode={sidebarMode === "hover"}
      data-hovering={isHovering}
      style={
        {
          "--sidebar-width": "210px",
        } as React.CSSProperties
      }
    >
      <Sidebar
        collapsible={collapsibleMode}
        side="left"
        className="bg-background text-black border-r border-border h-full pt-2"
        style={{ top: "2.5rem", height: "calc(100svh - 2rem)" }}
      >
        <SidebarContent className="p-0">
          <SidebarGroup className="p-2">
            <SidebarGroupContent>
              <SidebarMenu>
                {isInProjectRoute ? (
                  // Show project navigation or loading state
                  selectedProject && projectIdFromUrl ? (
                    navigationItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.href)}
                          tooltip={shouldShowTooltip ? item.title : undefined}
                          className={`
                            tour-${item.title
                              .toLowerCase()
                              .replace(/\s+/g, "-")} 
                            text-sm py-2 px-2.5 h-9 ${
                              isActive(item.href)
                                ? "bg-neutral-200 text-neutral-900 font-medium"
                                : "text-neutral-600"
                            }`}
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
                  )
                ) : (
                  // Show main navigation
                  navigationItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={shouldShowTooltip ? item.title : undefined}
                        className={`tour-${item.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")} 
                          text-sm py-2 px-2.5 h-9 ${
                            isActive(item.href)
                              ? "bg-neutral-200 text-neutral-900 font-medium"
                              : "text-neutral-600"
                          }`}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto">
          <Select value={sidebarMode} onValueChange={handleModeChange}>
            <SelectPrimitive.SelectTrigger
              asChild
              className="p-2 w-fit hover:bg-neutral-200 bg-transparent transition-all duration-200 rounded-md"
            >
              <Button variant={"ghost"} className="p-0 outline-0 ring-0">
                <PanelLeftDashed className="size-4 text-neutral-500 hover:text-neutral-700" />
              </Button>
            </SelectPrimitive.SelectTrigger>
            <SelectContent className="p-0 shadow-none">
              <SelectGroup className="p-0">
                <SelectLabel className="text-xs px-2 py-1.5">
                  Sidebar Control
                </SelectLabel>
                <Separator />
                <SelectItem value="expanded" className="text-xs">
                  Expanded
                </SelectItem>
                <SelectItem value="collapsed" className="text-xs">
                  Collapsed
                </SelectItem>
                <SelectItem value="hover" className="text-xs">
                  Expand on Hover
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </SidebarFooter>
      </Sidebar>

      <style jsx global>{`
        [data-hover-mode="true"][data-hovering="true"]
          [data-slot="sidebar-container"] {
          z-index: 40;
          width: var(--sidebar-width) !important;
        }

        [data-hover-mode="true"][data-hovering="true"]
          [data-slot="sidebar-inner"] {
          width: var(--sidebar-width) !important;
        }

        [data-hover-mode="true"] [data-slot="sidebar-gap"] {
          width: var(--sidebar-width-icon) !important;
        }

        [data-hover-mode="true"] [data-slot="sidebar-container"] {
          transition: width 0.2s ease-in-out;
        }

        [data-hover-mode="true"] [data-slot="sidebar-inner"] {
          transition: width 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}

"use client";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronsUpDown,
  Bell,
  BookOpen,
  // User,
  Settings,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  //   SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { selectProject } from "@/lib/redux/slices/projectsSlice";
import { selectWorkflow } from "@/lib/redux/slices/workflowsSlice";
import { logout } from "@/lib/redux/slices/authSlice";
import { databaseApi } from "@/lib/api/database";

import { CreateProjectDialog } from "@/components/project-dialogs/create-project-dialog";

export default function AppTopbar() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, selectedProject } = useSelector(
    (state: RootState) => state.projects
  );
  const { workflows, selectedWorkflow } = useSelector(
    (state: RootState) => state.workflows
  );
  const { isCreating } = useSelector((state: RootState) => state.projects);

  // Database state
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  // Extract path parameters
  const pathSegments = pathname.split("/").filter(Boolean);
  const isDatabasePage = pathSegments.includes("database");
  const secretId =
    isDatabasePage && pathSegments.length >= 4 ? pathSegments[3] : "";
  const currentCollection =
    isDatabasePage && pathSegments.length >= 5 ? pathSegments[4] : "";
  const isPlatform =
    secretId === "platform" || searchParams.get("type") === "platform";

  // Fetch collections when on database pages
  useEffect(() => {
    if (isDatabasePage && secretId) {
      const fetchCollections = async () => {
        try {
          let data: string[];

          if (isPlatform) {
            // Call platform API
            if (!user?.name || !selectedProject?._id) {
              // Don't log error, just wait for user/project to load
              return;
            }
            data = await databaseApi.getPlatformCollections(
              user.name,
              selectedProject._id
            );
          } else {
            // Call external database API
            data = await databaseApi.getCollections(secretId);
          }

          setCollections(data);
          // Set current collection if we're on a collection page
          if (currentCollection && data.includes(currentCollection)) {
            setSelectedCollection(currentCollection);
          }
        } catch (error) {
          console.error("Failed to fetch collections:", error);
        }
      };
      fetchCollections();
    }
  }, [
    isDatabasePage,
    secretId,
    currentCollection,
    isPlatform,
    user,
    selectedProject,
  ]);

  const handleProjectSelect = (project: typeof selectedProject) => {
    if (project) {
      dispatch(selectProject(project));

      // Navigate to the same page but with the new project ID
      const pathSegments = pathname.split("/");
      if (pathSegments.length >= 3 && pathSegments[1] === "projects") {
        // Replace the project ID in the URL
        pathSegments[2] = project._id;
        const newPath = pathSegments.join("/");
        router.push(newPath);
      }
    }
  };

  const handleWorkflowSelect = (workflowId: string) => {
    const workflow = workflows.find((w) => w._id === workflowId);
    if (workflow) {
      dispatch(selectWorkflow(workflow));

      // Navigate to the workflow editor
      if (selectedProject) {
        router.push(
          `/projects/${selectedProject._id}/workflows/${workflow._id}`
        );
      }
    }
  };

  const handleCollectionSelect = (collectionName: string) => {
    if (selectedProject && secretId) {
      setSelectedCollection(collectionName);
      const queryString = isPlatform ? "?type=platform" : "";
      router.push(
        `/projects/${selectedProject._id}/database/${secretId}/${collectionName}${queryString}`
      );
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // Generate breadcrumb based on current path
  const generateBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    if (segments.length === 0 || segments[0] === "dashboard") {
      breadcrumbs.push("Dashboard");
    } else {
      breadcrumbs.push(
        segments[0].charAt(0).toUpperCase() + segments[0].slice(1)
      );
    }

    // Add database-specific breadcrumbs
    if (isDatabasePage) {
      breadcrumbs.push("Database");
      if (segments.length >= 4) {
        breadcrumbs.push("Collections");
        if (segments.length >= 5) {
          breadcrumbs.push(segments[4]); // Collection name
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumb();
  const isWorkflowsPage = pathname.includes("/workflows");

  return (
    <header className="h-12 border-b border-gray-200 bg-neutal-50 px-6 flex items-center justify-between">
      {/* Left side - Breadcrumb and Project Selector */}
      <div className="flex items-center gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Select
                value={selectedProject?._id || ""}
                onValueChange={(value) => {
                  const project = projects.find((p) => p._id === value);
                  if (project) {
                    handleProjectSelect(project);
                  }
                }}
              >
                <SelectPrimitive.SelectTrigger
                  aria-label="Select project"
                  asChild
                >
                  <Button
                    variant="ghost"
                    className="focus-visible:bg-accent text-foreground bg-transparent h-8 p-1.5 focus-visible:ring-0"
                  >
                    <SelectValue placeholder="Select project" />

                    <ChevronsUpDown
                      size={14}
                      className="text-muted-foreground/80"
                    />
                  </Button>
                </SelectPrimitive.SelectTrigger>
                <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      <div className="flex items-center gap-2">
                        {/* <div className="w-2 h-2 bg-green-500 rounded-full" /> */}
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <div className="px-2 py-1.5">
                    <CreateProjectDialog isCreating={isCreating} />
                  </div>
                </SelectContent>
              </Select>
            </BreadcrumbItem>
            <BreadcrumbSeparator> / </BreadcrumbSeparator>
            <BreadcrumbItem>
              <span className="text-sm text-gray-600 font-medium">
                {breadcrumbs[0] || "Dashboard"}
              </span>
            </BreadcrumbItem>
            {breadcrumbs.length > 1 && (
              <>
                <BreadcrumbSeparator> / </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <span className="text-sm text-gray-600 font-medium">
                    {breadcrumbs[1]}
                  </span>
                </BreadcrumbItem>
              </>
            )}
            {breadcrumbs.length > 2 && (
              <>
                <BreadcrumbSeparator> / </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <span className="text-sm text-gray-600 font-medium">
                    {breadcrumbs[2]}
                  </span>
                </BreadcrumbItem>
              </>
            )}
            {breadcrumbs.length > 3 && (
              <>
                <BreadcrumbSeparator> / </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isDatabasePage && collections.length > 0 ? (
                    <Select
                      value={selectedCollection}
                      onValueChange={handleCollectionSelect}
                    >
                      <SelectPrimitive.SelectTrigger
                        aria-label="Select collection"
                        asChild
                      >
                        <Button
                          variant="ghost"
                          className="focus-visible:bg-accent text-foreground bg-transparent h-8 p-1.5 focus-visible:ring-0"
                        >
                          <span>
                            {selectedCollection || "Select Collection"}
                          </span>
                          <ChevronsUpDown
                            size={14}
                            className="text-muted-foreground/80"
                          />
                        </Button>
                      </SelectPrimitive.SelectTrigger>
                      <SelectContent
                        align="start"
                        className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2"
                      >
                        {collections.map((collection) => (
                          <SelectItem
                            key={collection}
                            value={collection}
                            className="flex items-center gap-2"
                          >
                            <span>{collection}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm text-gray-600 font-medium">
                      {breadcrumbs[3]}
                    </span>
                  )}
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator> / </BreadcrumbSeparator>
            <BreadcrumbItem>
              {isWorkflowsPage && workflows.length > 0 && (
                <Select
                  value={selectedWorkflow?._id || ""}
                  onValueChange={handleWorkflowSelect}
                >
                  <SelectPrimitive.SelectTrigger
                    aria-label="Select workflow"
                    asChild
                  >
                    <Button
                      variant="ghost"
                      className="focus-visible:bg-accent text-foreground bg-transparent h-8 p-1.5 focus-visible:ring-0"
                    >
                      <span>{selectedWorkflow?.name || "Select Workflow"}</span>
                      <ChevronsUpDown
                        size={14}
                        className="text-muted-foreground/80"
                      />
                    </Button>
                  </SelectPrimitive.SelectTrigger>
                  <SelectContent
                    align="start"
                    className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2"
                  >
                    {workflows.map((workflow) => (
                      <SelectItem
                        key={workflow._id}
                        value={workflow._id}
                        className="flex items-center gap-2"
                      >
                        <span>{workflow.name}</span>
                        <Badge
                          variant={
                            workflow.isDeployed ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {workflow.isDeployed ? "Deployed" : "UnDeployed"}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Workflow Dropdown - Only show on workflows page */}
      </div>

      {/* Right side - Actions and User Menu */}
      <div className="flex items-center gap-3">
        {/* Docs Button */}
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>Docs</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-3 border-b">
              <h4 className="font-medium">Notifications</h4>
            </div>
            <div className="p-3 text-sm text-gray-600">
              <p>No new notifications</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/logo-dark.png" alt="User" />
                <AvatarFallback className="bg-black text-white">
                  {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2 border-b">
              <p className="font-medium">{user?.full_name || "User"}</p>
              <p className="text-sm text-gray-600">
                {user?.email || "user@example.com"}
              </p>
            </div>
            <DropdownMenuItem
              onClick={() => router.push("/account")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span>Account Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

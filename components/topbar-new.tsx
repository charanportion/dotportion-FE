"use client";

import {
  ChevronsUpDown,
  BookOpen,
  Settings,
  TriangleAlert,
  Lightbulb,
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
  SelectValue,
} from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { logout, logoutUser } from "@/lib/redux/slices/authSlice";
import { selectProject } from "@/lib/redux/slices/projectsSlice";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { CreateProjectDialog } from "@/components/project-dialogs/create-project-dialog";
// import { databaseApi } from "@/lib/api/database";
import { selectWorkflow } from "@/lib/redux/slices/workflowsSlice";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { submitFeedback } from "@/lib/redux/slices/feedbackSlice";
import { toast } from "sonner";

export default function TopbarNew() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();
  // const searchParams = useSearchParams();

  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, selectedProject } = useSelector(
    (state: RootState) => state.projects
  );
  const { workflows, selectedWorkflow } = useSelector(
    (state: RootState) => state.workflows
  );
  const { isCreating } = useSelector((state: RootState) => state.projects);

  // Extract path parameters
  const pathSegments = pathname.split("/").filter(Boolean);
  const isDatabasePage = pathSegments.includes("database");
  // const secretId =
  //   isDatabasePage && pathSegments.length >= 4 ? pathSegments[3] : "";
  // const currentCollection =
  //   isDatabasePage && pathSegments.length >= 5 ? pathSegments[4] : "";
  // const isPlatform =
  //   secretId === "platform" || searchParams.get("type") === "platform";

  // Check if we're in a project route
  const isInProjectRoute = /^\/projects\/[^\/]+(\/.*)?$/.test(pathname);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<
    "idea" | "issue" | null
  >(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Fetch collections when on database pages
  // useEffect(() => {
  //   if (isDatabasePage && secretId) {
  //     const fetchCollections = async () => {
  //       try {
  //         let data: string[];

  //         if (isPlatform) {
  //           if (!user?.name || !selectedProject?._id) {
  //             return;
  //           }
  //           data = await databaseApi.getPlatformCollections(
  //             user.name,
  //             selectedProject._id
  //           );
  //         } else {
  //           data = await databaseApi.getCollections(secretId);
  //         }

  //         setCollections(data);
  //         if (currentCollection && data.includes(currentCollection)) {
  //           setSelectedCollection(currentCollection);
  //         }
  //       } catch (error) {
  //         console.error("Failed to fetch collections:", error);
  //       }
  //     };
  //     fetchCollections();
  //   }
  // }, [
  //   isDatabasePage,
  //   secretId,
  //   currentCollection,
  //   isPlatform,
  //   user,
  //   selectedProject,
  // ]);

  // Reset feedback state when popover closes
  const handleFeedbackOpenChange = (open: boolean) => {
    setFeedbackOpen(open);
    if (!open) {
      setSelectedFeedbackType(null);
      setFeedbackMessage("");
    }
  };

  const handleProjectSelect = (project: typeof selectedProject) => {
    if (project) {
      dispatch(selectProject(project));

      const pathSegments = pathname.split("/");
      if (pathSegments.length >= 3 && pathSegments[1] === "projects") {
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

      if (selectedProject) {
        router.push(
          `/projects/${selectedProject._id}/workflows/${workflow._id}`
        );
      }
    }
  };

  const handleSendFeedback = () => {
    if (!selectedFeedbackType || !feedbackMessage.trim()) return;

    dispatch(
      submitFeedback({
        type: "idea",
        message: feedbackMessage.trim(),
      })
    )
      .unwrap()
      .then((res) => {
        toast.success(res.message);
        setFeedbackOpen(false);
        setFeedbackMessage("");
        setSelectedFeedbackType(null);
      })
      .catch((err) => {
        toast.error(err || "Failed to submit feedback");
      });
  };

  const handleLogout = async () => {
    try {
      // This calls /api/auth/logout AND clears Redux state
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local Redux state (in case API failed)
      dispatch(logout());
      // Redirect to signin
      router.push("/auth/signin");
    }
  };

  // Generate breadcrumb based on current path
  const generateBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    if (segments.length === 0 || segments[0] === "dashboard") {
      breadcrumbs.push("Dashboard");
    } else if (segments[0] === "projects" && segments.length >= 2) {
      // In project route, show page name
      if (segments.length >= 3) {
        breadcrumbs.push(
          segments[2].charAt(0).toUpperCase() + segments[2].slice(1)
        );
      }
    } else {
      breadcrumbs.push(
        segments[0].charAt(0).toUpperCase() + segments[0].slice(1)
      );
    }

    // Add database-specific breadcrumbs
    if (isDatabasePage) {
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
    <header className="h-12 w-full border-b border-gray-300 bg-neutral-50 px-4 flex items-center justify-between shrink-0">
      {/* Left side - Logo, Project Selector and Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Link href={"/dashboard"} className="flex items-center gap-2">
          <Image
            src={"/logo/light.png"}
            alt="Dotportion Logo"
            width={50}
            height={50}
            className="w-5 h-5"
          />
        </Link>

        <Breadcrumb>
          <BreadcrumbList>
            {/* Show project selector only in project routes */}
            {isInProjectRoute && (
              <>
                <BreadcrumbItem>
                  <span className="text-gray-400">/</span>
                  <div className="flex items-center gap-2 ml-2">
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
                          className="focus-visible:bg-accent text-foreground bg-transparent h-8 p-1.5 focus-visible:ring-0 font-medium text-sm hover:bg-gray-100"
                        >
                          <SelectValue placeholder="Select project" />
                          <ChevronsUpDown
                            size={14}
                            className="text-muted-foreground/80 ml-1"
                          />
                        </Button>
                      </SelectPrimitive.SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            <div className="flex items-center gap-2">
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
                  </div>
                </BreadcrumbItem>

                {/* Dynamic breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <span className="text-sm text-gray-600 font-medium">
                        {breadcrumbs[0]}
                      </span>
                    </BreadcrumbItem>
                  </>
                )}

                {breadcrumbs.length > 2 && (
                  <>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <span className="text-sm text-gray-600 font-medium">
                        {breadcrumbs[2]}
                      </span>
                    </BreadcrumbItem>
                  </>
                )}

                {/* Workflow selector */}
                {isWorkflowsPage && workflows.length > 0 && (
                  <>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    <BreadcrumbItem>
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
                            className="focus-visible:bg-accent text-foreground bg-transparent h-8 p-1.5 focus-visible:ring-0 font-medium text-sm hover:bg-gray-100"
                          >
                            <span>
                              {selectedWorkflow?.name || "Select Workflow"}
                            </span>
                            <ChevronsUpDown
                              size={14}
                              className="text-muted-foreground/80 ml-1"
                            />
                          </Button>
                        </SelectPrimitive.SelectTrigger>
                        <SelectContent align="start">
                          {workflows.map((workflow) => (
                            <SelectItem key={workflow._id} value={workflow._id}>
                              <div className="flex items-center gap-2">
                                <span>{workflow.name}</span>
                                <Badge
                                  variant={
                                    workflow.isDeployed
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {workflow.isDeployed
                                    ? "Deployed"
                                    : "UnDeployed"}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </BreadcrumbItem>
                  </>
                )}
              </>
            )}

            {/* Show simple breadcrumb for non-project routes */}
            {!isInProjectRoute && (
              <BreadcrumbItem>
                <span className="text-gray-400 ml-2">/</span>
                <span className="text-sm text-gray-600 font-medium ml-2">
                  {pathname === "/dashboard" || pathname === "/"
                    ? "Analytics"
                    : pathSegments[0]?.charAt(0).toUpperCase() +
                      pathSegments[0]?.slice(1)}
                </span>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <Badge
          variant="default"
          className="text-xs rounded-full h-5 px-1.5 font-normal text-green-700 bg-green-100 border border-green-500"
        >
          Beta
        </Badge>
      </div>

      {/* Right side - Actions and User Menu */}
      <div className="flex items-center gap-2">
        {/* FEEDBACK POPOVER */}
        <Popover open={feedbackOpen} onOpenChange={handleFeedbackOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative px-2.5 h-7 rounded-full text-neutral-500 text-sm font-normal hover:text-gray-900 "
            >
              Feedback
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-96 p-0 shadow-xs border border-neutral-300"
          >
            <div className="rounded-md bg-background shadow-md outline-none px-0 flex flex-col pt-1 pb-3 w-full h-full">
              {!selectedFeedbackType && (
                <div className="flex flex-col gap-4 p-4">
                  {/* Title */}
                  <div className="font-medium text-sm text-primary">
                    What would you like to share?
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* ISSUE BUTTON */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        router.push("/support");
                        setFeedbackOpen(false);
                      }}
                      className="relative h-32 rounded-md flex flex-col justify-center items-center border-neutral-300 hover:border-neutral-400 transition"
                    >
                      <TriangleAlert className="min-w-7 max-w-7 min-h-7 max-h-7 h-full w-full text-destructive mb-1" />
                      <span className="text-sm font-medium">Issue</span>
                      <span className="text-xs text-muted-foreground">
                        with my project
                      </span>
                    </Button>

                    {/* IDEA BUTTON */}
                    <Button
                      variant="outline"
                      className="relative h-32 rounded-md flex flex-col justify-center items-center border-neutral-300 hover:border-neutral-400 transition"
                      onClick={() => setSelectedFeedbackType("idea")}
                    >
                      <Lightbulb className="min-w-7 max-w-7 min-h-7 max-h-7 h-full w-full text-chart-1 mb-1" />
                      <span className="text-sm font-medium">Idea</span>
                      <span className="text-xs text-muted-foreground">
                        to improve DotPortion
                      </span>
                    </Button>
                  </div>
                </div>
              )}
              {/* MESSAGE BOX STEP */}
              {selectedFeedbackType && (
                <div>
                  <div>
                    {/* TEXTAREA */}
                    <div className="px-5 pb-4">
                      <Textarea
                        className="flex w-full border border-neutral-300 text-sm mt-4 mb-1 max-h-60 h-38"
                        placeholder={"It would be great if..."}
                        value={feedbackMessage}
                        rows={5}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="px-5 flex flex-row justify-between items-start mt-4">
                    <div>
                      <p className="text-xs text-foreground">
                        Have a technical issue?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Contact{" "}
                        <span className=" text-accent-foreground cursor-pointer">
                          support
                        </span>{" "}
                        or{" "}
                        <span className="text-accent-foreground cursor-pointer">
                          see docs
                        </span>
                        .
                      </p>
                    </div>
                    <div className="flex items-center flex-row">
                      {/* SEND BUTTON */}
                      <Button
                        size="sm"
                        disabled={!feedbackMessage.trim()}
                        onClick={handleSendFeedback}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={"https://docs.dotportion.com"} target="_">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 border border-neutral-300 rounded-full bg-neutral-50"
              >
                <BookOpen className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Documentation</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 rounded-full p-0 ml-1 cursor-pointer"
            >
              <Avatar className="h-8 w-8 border border-gray-300">
                <AvatarImage src="/" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-neutral-400 to-neutral-800 text-white">
                  {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 shadow-none bg-white border border-neutral-300 p-0.5"
          >
            <DropdownMenuLabel className="px-2 py-1.5">
              <p className="font-medium text-sm">{user?.full_name || "User"}</p>
              <p className="text-xs text-neutral-600">
                {user?.email || "user@example.com"}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="flex items-center gap-2 text-xs px-2 py-1.5 text-neutral-600"
            >
              <Link href={"/account"}>
                <Settings className="h-3 w-3 text-neutral-600" />
                <span>Account Preferences</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs px-2 py-1.5 text-neutral-600"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

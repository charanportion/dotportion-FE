"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchProjects } from "@/lib/redux/slices/projectsSlice";
import { CreateProjectDialog } from "@/components/project-dialogs/create-project-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Folder, Search, List, ChevronRight, Grid3X3 } from "lucide-react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { userApi } from "@/lib/api/user";

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const {
    projects,
    isLoading,
    error: projectError,
    isCreating,
  } = useAppSelector((state) => state.projects);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [toursSynced, setToursSynced] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProjects());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    async function syncProjectsTour() {
      try {
        const res = await userApi.getTours();
        const tours = res?.tours || {};

        if (tours.projectTour === true) {
          localStorage.setItem("tour_done_projects", "true");
        }
      } catch (err) {
        console.warn("Failed to sync projects tour:", err);
      } finally {
        setToursSynced(true);
      }
    }

    if (typeof window !== "undefined") {
      setToursSynced(false);
      syncProjectsTour();
    }
  }, []);

  const filteredProjects = projects?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const projectSteps: DriveStep[] = useMemo(
    () => [
      {
        element: ".create-project",
        popover: {
          title: "Create New Project",
          description: "Click here to start building your first API project.",
        },
      },
      {
        element: ".project-search",
        popover: {
          title: "Search Projects",
          description: "Use this search box to quickly find your projects.",
        },
      },
      {
        element: ".view-toggle",
        popover: {
          title: "Switch Views",
          description:
            "Switch between Grid and List views to browse your projects.",
        },
      },
    ],
    []
  );

  useEffect(() => {
    const TOUR_KEY = "tour_done_projects";

    if (typeof window === "undefined") return;
    if (!toursSynced) return;

    if (localStorage.getItem(TOUR_KEY) === "true") return;

    const createBtn = document.querySelector(".create-project");
    const searchBox = document.querySelector(".project-search");
    const viewToggle = document.querySelector(".view-toggle");

    if (!createBtn || !searchBox || !viewToggle) return;

    if (isLoading) return;

    const tour = driver({
      showProgress: true,
      steps: projectSteps,
      onDestroyed: async () => {
        try {
          // Update UI immediately
          localStorage.setItem(TOUR_KEY, "true");

          await userApi.updateTourStatus({
            tourKey: "projectTour",
            completed: true,
          });
        } catch (err) {
          console.warn("Failed updating projects tour status:", err);
        }
      },
    });

    setTimeout(() => tour.drive(), 300);
  }, [isLoading, projectSteps, toursSynced]);

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl w-full  py-6 mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Projects
          </h1>
        </div>

        {/* Skeleton Grid (same as actual grid layout) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="border border-border bg-card shadow-none rounded-xl py-4 px-6"
            >
              {/* Header Skeleton */}
              {/* <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-5 rounded-md" />
              </div> */}

              {/* Body Skeleton */}
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-48" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error States
  if (projectError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center gap-4">
        <p className="text-red-600 font-medium">Error: {projectError}</p>
        <Button onClick={() => dispatch(fetchProjects())}>Retry</Button>
      </div>
    );
  }

  // Empty State
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center gap-4 bg-background">
        <Folder className="h-10 w-10 text-gray-400" />
        <h2 className="text-2xl font-semibold text-gray-800">
          No projects yet
        </h2>
        <p className="text-muted-foreground">
          Create your first project to start building APIs and workflows.
        </p>
        <div className="ml-1 create-project">
          <CreateProjectDialog isCreating={isCreating} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full  py-6 mx-auto ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          Projects
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="project-search relative w-full sm:w-80">
            <Search className="absolute left-2 top-1.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search for a project"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-10 h-7 border border-border bg-input text-xs shadow-none"
            />
          </div>
          {/* <Button
              variant="outline"
              className="flex items-center gap-2 border border-neutral-300 text-xs text-neutral-600 shadow-none size-7"
            >
              <Filter className="size-3.5" />
            </Button> */}
        </div>

        <div className="view-toggle flex items-center gap-1">
          <Button
            variant={"ghost"}
            size="icon"
            className={`size-7 shadow-none ${
              viewMode === "grid"
                ? "bg-neutral-300 text-black"
                : "text-neutral-500"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="size-3.5" />
          </Button>
          <Button
            variant={"ghost"}
            size="icon"
            className={`size-7 shadow-none ${
              viewMode === "list"
                ? "bg-neutral-300 text-black"
                : "text-neutral-500"
            }`}
            onClick={() => setViewMode("list")}
          >
            <List className="size-3.5" />
          </Button>
          <div className="ml-1 create-project">
            <CreateProjectDialog isCreating={isCreating} />
          </div>
        </div>
      </div>

      {/* Conditional Rendering */}
      {viewMode === "grid" ? (
        // ---------------- GRID VIEW ----------------
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project._id}
              onClick={() => router.push(`/projects/${project._id}/dashboard`)}
              className="cursor-pointer  shadow-none rounded-lg p-5 transition-colors duration-200 hover:bg-muted"
            >
              <CardHeader className="p-0  flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground truncate">
                    <span className="truncate">{project.name}</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground truncate">
                    {project.description}
                  </p>
                </div>

                {/* Chevron Button */}
                <div className="transition-transform duration-200 hover:scale-125">
                  <ChevronRight className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </div>
              </CardHeader>

              <CardContent className="p-0 flex w-full items-center justify-between text-xs text-muted-foreground">
                <div className="flex flex-col items-start gap-2 text-muted-foreground font-medium">
                  <p>
                    <span className="font-medium text-foreground">
                      Workflows:
                    </span>{" "}
                    {project.workflows?.length ?? 0}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Created on:
                    </span>{" "}
                    {format(new Date(project.createdAt), "dd MMM yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // ---------------- LIST VIEW ----------------
        <div className="w-full bg-card rounded-lg overflow-hidden  border border-border h-full">
          {/* List Header */}
          <div className="grid grid-cols-3 px-6 py-3 text-xs font-medium bg-card text-muted-foreground border-b-2 border-border uppercase tracking-wide min-w-[800px]">
            <div className="text-left">Project</div>
            <div className="text-center">Workflows</div>
            <div className="text-center">Created</div>
          </div>

          {/* List Rows */}
          <div className="divide-y divide-border">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                onClick={() =>
                  router.push(`/projects/${project._id}/dashboard`)
                }
                className="grid grid-cols-3 px-4 py-4 items-center text-sm text-foreground hover:bg-muted/50 transition cursor-pointer min-w-[800px]"
              >
                {/* LEFT ALIGNED PROJECT NAME + ID */}
                <div className="flex flex-col text-left">
                  <span className="font-semibold truncate">{project.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ID: {project._id?.slice(0, 16) ?? "N/A"}
                  </span>
                </div>

                {/* CENTERED WORKFLOW COUNT */}
                <div className="text-muted-foreground text-center">
                  {project.workflows?.length ?? 0}
                </div>
                {/* CENTERED CREATED DATE */}
                <div className="text-muted-foreground text-center">
                  {format(
                    new Date(project.createdAt),
                    "dd MMM yyyy - HH:mm:ss"
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

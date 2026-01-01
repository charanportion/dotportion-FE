"use client";

import { useEffect } from "react";
import { use } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { selectProject } from "@/lib/redux/slices/projectsSlice";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { SuccessFailChart } from "@/components/charts/success-fail-chart";
import { TopWorkflowsBarChart } from "@/components/charts/top-workflows-bar";
import { ApiCallsChart } from "@/components/charts/api-calls-chart";
import Image from "next/image";
import Link from "next/link";
// import AppSidebar from "@/components/app-sidebar";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: ProjectPageProps) {
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();

  const {
    projects,
    selectedProject,
    isLoading: projectsLoading,
  } = useSelector((state: RootState) => state.projects);

  // Find the current project
  const currentProject = projects.find((p) => p._id === id);

  useEffect(() => {
    // If the current project is different from selected, update it
    if (currentProject && currentProject._id !== selectedProject?._id) {
      dispatch(selectProject(currentProject));
    }
  }, [currentProject, selectedProject, dispatch]);

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-[94vh]">
        <div className="flex flex-col items-center gap-2">
          {/* <DotLoader /> */}
          <LoaderCircle className="size-4 text-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Project not found</h2>
          <p className="text-muted-foreground">
            The project you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full px-4 w-full mx-auto">
      <div className="h-full border-b border-border w-full  py-16 mx-auto">
        <div className="mx-auto max-w-7xl w-full  flex flex-col gap-y-4 ">
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between w-full">
            <div className="flex flex-col md:flex-row md:items-end gap-3 w-full ">
              <div>
                <h1 className="text-3xl text-foreground">
                  {currentProject.name}
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center  gap-x-6">
                <div className="flex flex-col gap-y-1">
                  <Link
                    href={`/projects/${currentProject._id}/workflows`}
                    className="text-sm transition text-muted-foreground cursor-pointer"
                  >
                    Workflows
                  </Link>
                  <p className="text-2xl tabular-nums text-foreground">
                    {currentProject.workflows.length}
                  </p>
                </div>
                <div className="flex flex-col gap-y-1">
                  <Link
                    href={`/projects/${currentProject._id}/secrets`}
                    className="text-sm transition text-muted-foreground cursor-pointer"
                  >
                    Secrets
                  </Link>
                  <p className="text-2xl tabular-nums text-foreground">
                    {currentProject.secrets.length}
                  </p>
                </div>
                <div className="flex flex-col gap-y-1">
                  <Link
                    href={`/projects/${currentProject._id}/logs`}
                    className="text-sm transition text-muted-foreground cursor-pointer"
                  >
                    Requests
                  </Link>
                  <p className="text-2xl tabular-nums text-foreground">
                    {currentProject.stats.totalApiCalls}
                  </p>
                </div>
              </div>
              <div className="ml-6 border-l flex  flex-col items-start w-[145px] justify-end pl-8 gap-2">
                <Link
                  href={`/projects/${currentProject._id}/settings`}
                  className="cursor-pointer text-xs items-center gap-2 inline-flex px-2.5 py-1 h-[26px] border border-border text-muted-foreground rounded-md bg-card hover:bg-muted transition duration-150"
                >
                  <div className="[&_svg]:h-[14px] [&_svg]:w-[14px] text-foreground-lighter">
                    <div
                      className={`w-2 h-2 rounded-full  ${
                        currentProject.cors.enabled
                          ? "bg-green-400"
                          : "bg-destructive"
                      }`}
                    ></div>
                  </div>
                  <span>Cors</span>
                </Link>
                <Link
                  href={`/projects/${currentProject._id}/settings`}
                  className="cursor-pointer text-xs items-center gap-2 inline-flex px-2.5 py-1 h-[26px] border border-border text-muted-foreground rounded-md bg-card hover:bg-muted transition duration-150"
                >
                  <div className="[&_svg]:h-[14px] [&_svg]:w-[14px] text-foreground-lighter">
                    <div
                      className={`w-2 h-2 rounded-full  ${
                        currentProject.rateLimit.enabled
                          ? "bg-green-400"
                          : "bg-destructive"
                      }`}
                    ></div>
                  </div>
                  <span>Rate Limiter</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-full border-b border-border w-full  py-16 mx-auto">
        <div className="mx-auto max-w-7xl w-full space-y-4 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <SuccessFailChart
              successCalls={currentProject.stats.successCalls}
              failedCalls={currentProject.stats.failedCalls}
            />
            <TopWorkflowsBarChart
              topWorkflows={currentProject.stats.topWorkflows}
            />
          </div>
          <ApiCallsChart projectId={currentProject._id} className="w-full" />
        </div>
      </div>
      <div className="h-full border-b border-border w-full  py-16 mx-auto">
        <div className="mx-auto max-w-7xl w-full space-y-16 ">
          <div className="space-y-8">
            <h2 className="text-lg">Example Template</h2>
            <div className="grid gap-2 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="group relative border border-border flex h-32 flex-row rounded-md p-4 bg-card hover:bg-muted transition"
                >
                  <div className="mr-4 flex flex-col">
                    <Image
                      src={"/logo/light.png"}
                      alt="Dotportion Logo"
                      width={26}
                      height={26}
                      className="transition group-hover:scale-110 block dark:hidden"
                    />
                    <Image
                      src={"/logo/dark.png"}
                      alt="Dotportion Logo"
                      width={26}
                      height={26}
                      className="transition group-hover:scale-110 hidden dark:block"
                    />
                  </div>

                  <div className="w-4/5 space-y-2">
                    <h5 className="text-foreground">Todo</h5>
                    <p className="text-sm text-muted-foreground">
                      Simple todo application
                    </p>
                  </div>

                  <ChevronRight className="absolute right-4 top-3 w-6 h-6 text-neutral-900 transition-all group-hover:right-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

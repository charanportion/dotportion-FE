"use client";

import {
  fetchWorkflows,
  selectWorkflow,
} from "@/lib/redux/slices/workflowsSlice";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { use, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Workflow as WorkflowType } from "@/lib/api/workflows";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Inbox,
  Info,
  Plus,
  Radio,
  RefreshCcw,
  Search,
  Workflow,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  clearSelectedLog,
  fetchLogDetail,
  fetchWorkflowLogs,
  setCurrentWorkflow,
  setPage,
} from "@/lib/redux/slices/logsSlice";
import { Log } from "@/lib/api/logs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLogsPolling } from "@/hooks/use-logs-polling";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip as ToolTipShadCn,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { userApi } from "@/lib/api/user";

interface LogsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const success = data.count - data.error;
    const error = data.error;

    return (
      <div className="bg-white text-xs border border-neutral-300 rounded-lg shadow-none p-2 min-w-[150px]">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground text-xs">Success</span>
            </div>
            <span className="font-mono font-semibold text-green-600">
              {success}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Failed</span>
            </div>
            <span className="font-mono font-semibold text-red-600">
              {error}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function Page({ params }: LogsPageProps) {
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();

  const {
    workflows,
    selectedWorkflow,
    isLoading: workflowsIsLoading,
  } = useSelector((state: RootState) => state.workflows);
  const { logs, selectedLog, isLoadingDetail, isLoading, pagination, filters } =
    useSelector((state: RootState) => state.logs);
  const { projects } = useSelector((state: RootState) => state.projects);

  const currentProject = projects.find((p) => p._id === id);

  // Local state for UI
  const [showChart, setShowChart] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [workflowSearchTerm, setWorkflowSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "raw">("details");
  const [isCopied, setIsCopied] = useState(false);
  const [hasAttemptedInitialFetch, setHasAttemptedInitialFetch] =
    useState(false);
  const [toursSynced, setToursSynced] = useState(false);

  // Initialize polling hook for live updates
  const { isPolling, togglePolling } = useLogsPolling({
    enabled: false,
    interval: 5000, // 5 seconds
    workflowId: selectedWorkflow?._id,
  });

  useEffect(() => {
    if (currentProject) {
      dispatch(fetchWorkflows(currentProject._id));
      setHasAttemptedInitialFetch(true); // Mark that we've attempted the fetch
    }
  }, [currentProject, dispatch]);

  useEffect(() => {
    if (selectedWorkflow) {
      // Set current workflow in logs state for polling
      dispatch(setCurrentWorkflow(selectedWorkflow._id));

      dispatch(
        fetchWorkflowLogs({
          workflowId: selectedWorkflow._id,
          page: 1,
          limit: 10,
        })
      );
    }
  }, [selectedWorkflow, dispatch]);

  // Stop polling when workflow changes
  useEffect(() => {
    return () => {
      if (isPolling) {
        togglePolling();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkflow?._id]);

  // Sync Logs tour state from backend -> localStorage (runs once when component mounts)
  useEffect(() => {
    async function syncLogsTour() {
      try {
        const res = await userApi.getTours();
        const tours = res?.tours || {};
        if (tours.logsTour === true) {
          localStorage.setItem("tour_done_logs", "true");
        }
      } catch (err) {
        console.warn("Failed to sync logs tour from server:", err);
      } finally {
        setToursSynced(true);
      }
    }
    setToursSynced(false);

    // Only attempt sync in browser
    if (typeof window !== "undefined") {
      void syncLogsTour();
    }
  }, []);

  useEffect(() => {
    const TOUR_KEY = "tour_done_logs";

    // Prevent re-running if already completed
    if (typeof window === "undefined") return;
    if (!toursSynced) return;
    if (localStorage.getItem(TOUR_KEY)) return;

    // Tour should only run if required elements exist
    const chartBtn = document.querySelector(".chart-button");
    const liveBtn = document.querySelector(".live-button");

    if (!chartBtn || !liveBtn) return;

    // Ensure logs page UI is ready (requires workflows loaded)
    if (!currentProject || workflowsIsLoading) return;

    // Run the tour
    const tour = driver({
      showProgress: true,
      steps: [
        {
          element: ".chart-button",
          popover: {
            title: "Chart",
            description:
              "View graphical insights of workflow execution logs and performance.",
          },
        },
        {
          element: ".live-button",
          popover: {
            title: "Live Mode",
            description:
              "Enable real-time streaming updates of incoming workflow logs.",
          },
        },
      ],
      onDestroyed: async () => {
        try {
          // immediate UX update
          localStorage.setItem(TOUR_KEY, "true");

          // update server so this persists across devices
          await userApi.updateTourStatus({
            tourKey: "logsTour",
            completed: true,
          });
        } catch (err) {
          console.warn("Failed to update logs tour status on server:", err);
        }
      },
    });

    setTimeout(() => tour.drive(), 300);
  }, [currentProject, workflowsIsLoading, toursSynced]);

  const handleWorkflowClick = (workflow: WorkflowType) => {
    dispatch(selectWorkflow(workflow));
    dispatch(clearSelectedLog());
  };

  const handleLogClick = (log: Log) => {
    dispatch(fetchLogDetail(log._id));
  };

  const handleCloseDetails = () => {
    dispatch(clearSelectedLog());
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!logs.length) return [];
    const data: Record<string, { time: string; count: number; error: number }> =
      {};
    logs.forEach((log) => {
      const date = new Date(log.createdAt);
      const key = format(date, "HH:mm");
      if (!data[key]) {
        data[key] = { time: key, count: 0, error: 0 };
      }
      data[key].count++;
      if (log.status === "fail") {
        data[key].error++;
      }
    });
    return Object.values(data).slice(-30).reverse();
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    return JSON.stringify(log)
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());
  });

  const filteredWorkflows = workflows.filter((workflow) => {
    if (!workflowSearchTerm) return true;
    const searchLower = workflowSearchTerm.toLowerCase();
    return (
      workflow.name.toLowerCase().includes(searchLower) ||
      workflow.description.toLowerCase().includes(searchLower) ||
      workflow.path.toLowerCase().includes(searchLower) ||
      workflow.method.toLowerCase().includes(searchLower)
    );
  });

  const handleRefresh = () => {
    if (selectedWorkflow) {
      dispatch(
        fetchWorkflowLogs({
          workflowId: selectedWorkflow._id,
          limit: 10,
          page: 1,
          // status: filters.status === "all" ? undefined : filters.status,
        })
      );
    }
  };

  const handleLoadOlder = () => {
    if (selectedWorkflow && !isLoading) {
      const nextPage = filters.page + 1;
      dispatch(setPage(nextPage));
      dispatch(
        fetchWorkflowLogs({
          workflowId: selectedWorkflow._id,
          limit: 10,
          page: nextPage,
        })
      );
    }
  };

  const handleLoadNewer = () => {
    if (selectedWorkflow && !isLoading && filters.page > 1) {
      const prevPage = filters.page - 1;
      dispatch(setPage(prevPage));
      dispatch(
        fetchWorkflowLogs({
          workflowId: selectedWorkflow._id,
          limit: 10,
          page: prevPage,
        })
      );
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full bg-background text-foreground overflow-hidden">
      {/* -- Custom Animation Styles for the Loader -- */}
      <style>{`
        @keyframes border-trail {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(0%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(0.2); }
        }
      `}</style>

      {/* Left Panel: Workflows List - Full height */}
      <div className="w-64 flex flex-col h-full border-r border-border bg-white shrink-0">
        <div className="border-b border-border flex min-h-12 items-center px-4">
          <h4 className="text-sm font-medium">Logs & Analytics</h4>
        </div>
        <div className="flex-grow overflow-y-auto flex flex-col">
          <div className="flex gap-x-2 items-center sticky top-0 bg-neutral-50 backdrop-blur z-[1] px-4 py-3 border-b border-border">
            <div className="relative h-7 flex-1">
              <Search className="absolute top-1.5 left-2 size-3.5 text-neutral-600" />
              <Input
                className="h-7 w-full pl-7 text-xs bg-neutral-100 border border-neutral-300 shadow-none text-neutral-600"
                placeholder="Search Workflows"
                value={workflowSearchTerm}
                onChange={(e) => setWorkflowSearchTerm(e.target.value)}
              />
            </div>
            <ToolTipShadCn>
              <TooltipTrigger>
                <Button
                  asChild
                  size={"icon"}
                  className="size-7 shadow-none bg-white border border-neutral-300 hover:bg-neutral-100 cursor-pointer"
                  variant="outline"
                >
                  <Link href={`/projects/${currentProject?._id}/workflows`}>
                    <Plus className="size-3.5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create Workflow</TooltipContent>
            </ToolTipShadCn>
          </div>

          <div className="px-2 py-2 space-y-0.5">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-2 mb-1 uppercase">
              Workflows
            </div>
            {workflowsIsLoading || !hasAttemptedInitialFetch ? (
              <div className="space-y-1.5 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-2">
                    <Skeleton className="size-4 shrink-0 rounded-md" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredWorkflows.length === 0 && workflowSearchTerm ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <Inbox className="size-8 text-neutral-400 mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No workflows found
                </h3>
                <p className="text-xs max-w-sm">
                  Try adjusting your search or{" "}
                  <Link
                    href={`/projects/${currentProject?._id}/workflows`}
                    className="text-primary hover:underline"
                  >
                    create a new workflow
                  </Link>
                  .
                </p>
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <Inbox className="size-8 text-neutral-400 mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No workflows created
                </h3>
                <p className="text-xs max-w-sm">
                  Get started by{" "}
                  <Link
                    href={`/projects/${currentProject?._id}/workflows`}
                    className="text-primary hover:underline"
                  >
                    creating your first workflow
                  </Link>
                  .
                </p>
              </div>
            ) : (
              filteredWorkflows.map((workflow) => (
                <div
                  key={workflow._id}
                  onClick={() => handleWorkflowClick(workflow)}
                  className={cn(
                    "h-7 px-4 py-2 cursor-pointer text-xs truncate rounded-md hover:bg-neutral-100 flex items-center gap-2 transition-colors",
                    selectedWorkflow?._id === workflow._id
                      ? "bg-neutral-100 text-black font-medium"
                      : "text-neutral-700"
                  )}
                >
                  <Workflow className="size-3.5 shrink-0" />
                  <span className="truncate">{workflow.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Logs View + Details Panel - Side by side */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Middle Panel: Logs View */}
        <div
          className={cn(
            "h-full flex flex-col bg-white transition-all",
            selectedLog ? "flex-1" : "flex-1"
          )}
        >
          {/* Top Bar - Added 'relative' for loader positioning */}
          <div className="relative flex w-full h-12 min-h-12 items-center justify-between border-b border-neutral-300 p-3 gap-4">
            <div className="flex flex-row items-center gap-x-2 flex-1 mr-2">
              <div className="relative h-7 ">
                <Search className="absolute top-1.5 left-2 size-3.5 text-neutral-600" />
                <Input
                  className="h-7 w-full pl-7 text-xs shadow-none bg-white border-neutral-300 focus:border-input focus:bg-white transition-all"
                  placeholder="Search events"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                size={"icon"}
                className="size-7 shadow-none bg-white border border-neutral-300 hover:bg-neutral-100 cursor-pointer text-neutral-600 hover:text-black"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCcw
                  className={cn("size-3.5", isLoading && "animate-spin")}
                  style={isLoading ? { animationDirection: "reverse" } : {}}
                />
              </Button>

              <Button
                variant={showChart ? "secondary" : "outline"}
                className="chart-button justify-start shadow-none gap-2 text-left font-normal border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-black cursor-pointer text-xs h-7 px-2.5 py-1"
                onClick={() => setShowChart(!showChart)}
              >
                {showChart ? (
                  <Eye className="size-3.5 " />
                ) : (
                  <EyeOff className="size-3.5 " />
                )}

                <span>Chart</span>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-x-2">
              <Button
                onClick={togglePolling}
                className={cn(
                  "live-button justify-start shadow-none gap-2 text-left font-normal border cursor-pointer text-xs h-7 px-2.5 py-1",
                  isPolling
                    ? "border-red-600 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-black"
                )}
              >
                <Radio
                  className={cn("size-3.5", isPolling && "animate-pulse")}
                />
                <span>{isPolling ? "Live" : "Live"}</span>
              </Button>
            </div>

            {/* --- ANIMATED BORDER TRAIL LOADER --- */}
            {isLoading && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] overflow-hidden z-10">
                <div
                  className="h-full w-full"
                  style={{
                    // Use a linear gradient for the transparent-to-black-to-transparent effect
                    background:
                      "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 50%, rgba(0,0,0,0) 100%)",
                    animation: "border-trail 1.5s ease-in-out infinite",
                    // Increase the size of the animated element so the gradient spans wider than the viewable area,
                    // which prevents hard cutoffs at the start/end of the animation cycle.
                    transform: "scaleX(2)",
                    transformOrigin: "left",
                  }}
                />
              </div>
            )}
            {isPolling && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] overflow-hidden z-10">
                <div
                  className="h-full w-full"
                  style={{
                    // Use a linear gradient for the transparent-to-black-to-transparent effect
                    background:
                      "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 50%, rgba(0,0,0,0) 100%)",
                    animation: "border-trail 1.5s ease-in-out infinite",
                    // Increase the size of the animated element so the gradient spans wider than the viewable area,
                    // which prevents hard cutoffs at the start/end of the animation cycle.
                    transform: "scaleX(2)",
                    transformOrigin: "left",
                  }}
                />
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Chart Section */}
            {showChart && (
              <div className="h-40 shrink-0 w-full border-b border-neutral-300 relative bg-white">
                <div className="absolute inset-0 p-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      barGap={2}
                      onMouseMove={(state: any) => {
                        if (state?.activeTooltipIndex !== undefined) {
                          setActiveIndex(state.activeTooltipIndex);
                        } else {
                          setActiveIndex(null);
                        }
                      }}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                      <Bar
                        dataKey="count"
                        fill="hsl(var(--primary))"
                        radius={[2, 2, 0, 0]}
                        barSize={8}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              activeIndex === null || activeIndex === index
                                ? entry.error > 0
                                  ? "hsl(var(--destructive))"
                                  : "hsl(var(--primary))"
                                : "#808080" // neutral-700
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute bottom-2 left-4 text-[10px] text-muted-foreground font-mono">
                  {logs.length > 0
                    ? format(
                        new Date(logs[logs.length - 1].createdAt),
                        "MMM dd, yyyy, HH:mm a"
                      )
                    : ""}
                </div>
                <div className="absolute bottom-2 right-4 text-[10px] text-muted-foreground font-mono">
                  {logs.length > 0
                    ? format(
                        new Date(logs[0].createdAt),
                        "MMM dd, yyyy, HH:mm a"
                      )
                    : ""}
                </div>
              </div>
            )}

            {/* Logs List */}

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50">
                {logs.length === 0 && !searchTerm && !selectedWorkflow ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                    <div className="bg-neutral-100 rounded-full p-6 mb-4">
                      <Inbox className="size-12 text-neutral-400" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      No logs yet
                    </h3>
                    <p className="text-sm text-center max-w-sm">
                      Select a workflow to view its execution logs.
                    </p>
                  </div>
                ) : logs.length === 0 && !searchTerm && selectedWorkflow ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                    <div className="bg-neutral-100 rounded-full p-6 mb-4">
                      <Inbox className="size-12 text-neutral-400" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      No logs yet
                    </h3>
                    <p className="text-sm text-center max-w-sm">
                      Logs will appear here when your workflow receives
                      requests.
                    </p>
                  </div>
                ) : filteredLogs.length === 0 && searchTerm ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                    <div className="bg-neutral-100 rounded-full p-6 mb-4">
                      <Inbox className="size-12 text-neutral-400" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      No logs found
                    </h3>
                    <p className="text-sm text-center max-w-sm">
                      Try adjusting your search criteria.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto overflow-x-auto">
                    <div className="min-w-full inline-block align-middle">
                      <div className="font-mono text-xs">
                        {filteredLogs.map((log) => (
                          <div
                            key={log._id}
                            onClick={() => handleLogClick(log)}
                            className={cn(
                              "flex items-center gap-4 px-4 py-2 border-b border-neutral-300 cursor-pointer hover:bg-white transition-colors whitespace-nowrap",
                              selectedLog?._id === log._id
                                ? "hover:bg-neutral-100 bg-white"
                                : ""
                            )}
                          >
                            <span className="text-muted-foreground shrink-0 w-36">
                              {format(
                                new Date(log.createdAt),
                                "dd MMM yy HH:mm:ss"
                              )}
                            </span>

                            <div className="w-20 shrink-0 flex items-center gap-1.5">
                              <div
                                className={cn(
                                  "size-2 rounded-full",
                                  log.status === "success"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                )}
                              />
                              <span
                                className={cn(
                                  "font-medium text-[11px]",
                                  log.status === "success"
                                    ? "text-green-600"
                                    : "text-red-600"
                                )}
                              >
                                {log.status === "success"
                                  ? "Success"
                                  : "Failed"}
                              </span>
                            </div>

                            <span className="text-foreground/80 truncate">
                              <span
                                className={cn(
                                  "text-muted-foreground mr-2 shrink-0  text-[10px] border px-2 rounded-sm",
                                  log.status === "success"
                                    ? "text-green-700 bg-green-50 border-green-500"
                                    : "text-red-700 bg-red-50 border-red-500"
                                )}
                              >
                                {log.response?.statusCode}
                              </span>
                              <span className="text-muted-foreground shrink-0 w-20 text-[10px]">
                                {log.durationMs < 1000
                                  ? `${log.durationMs}ms`
                                  : log.durationMs < 60000
                                  ? `${(log.durationMs / 1000).toFixed(1)}s`
                                  : `${(log.durationMs / 60000).toFixed(1)}m`}
                              </span>
                              <span className="text-muted-foreground mx-2 text-[10px]">
                                {log._id}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Details Panel - Independent Scroll */}
              {selectedLog && (
                <div className="w-[500px] h-full border-l border-border bg-card flex flex-col shrink-0">
                  {/* Details Header */}
                  <div className="h-10 border-b border-border flex items-center justify-between px-3 bg-muted/30 shrink-0">
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <span
                        className={cn(
                          "cursor-pointer hover:text-foreground py-2.5 transition-colors",
                          activeTab === "details" &&
                            "text-foreground border-b-2 border-primary"
                        )}
                        onClick={() => setActiveTab("details")}
                      >
                        Details
                      </span>
                      <span
                        className={cn(
                          "cursor-pointer hover:text-foreground py-2.5 transition-colors",
                          activeTab === "raw" &&
                            "text-foreground border-b-2 border-primary"
                        )}
                        onClick={() => setActiveTab("raw")}
                      >
                        Raw
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <ToolTipShadCn>
                          <TooltipTrigger asChild>
                            <Button
                              disabled={isLoadingDetail}
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  JSON.stringify(selectedLog, null, 2)
                                );
                                setIsCopied(true);
                                setTimeout(() => setIsCopied(false), 2000);
                              }}
                            >
                              {isCopied ? (
                                <Check className="size-3.5 text-green-600" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {isCopied ? "Copied!" : "Copy as JSON"}
                            </p>
                          </TooltipContent>
                        </ToolTipShadCn>
                      </TooltipProvider>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={handleCloseDetails}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Details Content - Native scroll */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {isLoadingDetail ? (
                      <div className="p-4 space-y-4">
                        <Skeleton className="w-3/4 h-4" />
                        <Skeleton className="w-full h-8" />
                        <Skeleton className="w-1/2 h-4" />
                      </div>
                    ) : (
                      <>
                        {activeTab === "details" ? (
                          <div className="p-4 space-y-4">
                            {/* Execution Summary */}
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-foreground">
                                Execution Summary
                              </h3>
                              <div className="bg-muted/50 rounded-lg p-3 space-y-3 border border-border">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground ">
                                      Status
                                    </p>
                                    <div
                                      className={cn(
                                        "inline-flex items-center gap-1.5 border px-2 py-0.5 rounded text-xs",
                                        selectedLog.status === "success"
                                          ? "bg-green-100 border-green-600 text-green-700"
                                          : "bg-red-100 border-red-600 text-red-700"
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          "size-1.5 rounded-full",
                                          selectedLog.status === "success"
                                            ? "bg-green-500 "
                                            : "bg-red-500"
                                        )}
                                      />
                                      {selectedLog.status
                                        .charAt(0)
                                        .toUpperCase() +
                                        selectedLog.status.slice(1)}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      Duration
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs">
                                      <Clock className="size-3.5 text-muted-foreground" />
                                      <span className="font-mono">
                                        {selectedLog.durationMs < 1000
                                          ? `${selectedLog.durationMs}ms`
                                          : selectedLog.durationMs < 60000
                                          ? `${(
                                              selectedLog.durationMs / 1000
                                            ).toFixed(1)}s`
                                          : `${(
                                              selectedLog.durationMs / 60000
                                            ).toFixed(1)}m`}
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      Steps
                                    </p>
                                    <p className="text-xs">
                                      {selectedLog.steps?.length || 0} total /{" "}
                                      {selectedLog.steps?.filter(
                                        (s) => s.status === "error"
                                      ).length || 0}{" "}
                                      failed
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      Response Code
                                    </p>
                                    <p className="text-xs font-mono">
                                      {selectedLog.response?.statusCode ||
                                        "N/A"}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Timestamp
                                  </p>
                                  <p className="text-xs font-mono">
                                    {format(
                                      new Date(selectedLog.createdAt),
                                      "MMM dd, yyyy 'at' HH:mm:ss"
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Request Details */}
                            <div className="space-y-2">
                              <h3 className="text-sm font-semibold text-foreground">
                                Request Details
                              </h3>
                              <div className="space-y-2">
                                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Method & Path
                                  </p>
                                  <p className="text-xs font-mono">
                                    {selectedLog.trigger.request.method}{" "}
                                    {selectedLog.trigger.request.path}
                                  </p>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Request Body
                                  </p>
                                  <pre className="text-xs font-mono overflow-x-auto">
                                    {JSON.stringify(
                                      selectedLog.trigger.request.body || {},
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              </div>
                            </div>

                            {/* Response Details */}
                            {selectedLog.response && (
                              <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-foreground">
                                  Response Details
                                </h3>
                                <div
                                  className={`${
                                    selectedLog.status === "success"
                                      ? "bg-muted/50 border border-neutral-300"
                                      : "bg-red-50 border border-red-300"
                                  } bg-muted/50 rounded-lg p-3 `}
                                >
                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Response Body
                                  </p>
                                  <pre className="text-xs font-mono overflow-x-auto">
                                    {JSON.stringify(
                                      selectedLog.response.body || {},
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Execution Steps with Accordion */}
                            {selectedLog.steps &&
                              selectedLog.steps.length > 0 && (
                                <div className="space-y-2">
                                  <h3 className="text-sm font-semibold text-foreground">
                                    Execution Steps
                                  </h3>
                                  <Accordion
                                    type="single"
                                    collapsible
                                    defaultValue={selectedLog.steps[0]?.nodeId}
                                    className="space-y-2"
                                  >
                                    {selectedLog.steps.map((step, index) => (
                                      <AccordionItem
                                        key={step.nodeId}
                                        value={step.nodeId}
                                        className="bg-muted/50 rounded-lg border border-border overflow-hidden"
                                      >
                                        <AccordionTrigger className="hover:no-underline px-3 py-2 hover:bg-muted/30 transition-colors">
                                          <div className="flex items-center justify-between w-full mr-2">
                                            <div className="flex items-center gap-2">
                                              <Info
                                                className={cn(
                                                  "size-3.5",
                                                  step.status === "success"
                                                    ? "text-green-500"
                                                    : step.status === "error"
                                                    ? "text-red-500"
                                                    : "text-blue-500"
                                                )}
                                              />
                                              <div className="text-left">
                                                <p className="text-xs font-medium">
                                                  {step.nodeName ||
                                                    `Node ${step.nodeId}`}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                  Step {index + 1} •{" "}
                                                  {step.durationMs < 1000
                                                    ? `${step.durationMs}ms`
                                                    : `${(
                                                        step.durationMs / 1000
                                                      ).toFixed(1)}s`}
                                                </p>
                                              </div>
                                            </div>
                                            <div
                                              className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-medium",
                                                step.status === "success"
                                                  ? "bg-green-100 text-green-700"
                                                  : step.status === "error"
                                                  ? "bg-red-100 text-red-700"
                                                  : "bg-blue-100 text-blue-700"
                                              )}
                                            >
                                              {step.status}
                                            </div>
                                          </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="px-3 pb-3 pt-0">
                                          <div className="space-y-2">
                                            {/* Timing */}
                                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                              <div>
                                                <p className="font-medium text-muted-foreground mb-0.5">
                                                  Started
                                                </p>
                                                <p className="font-mono">
                                                  {format(
                                                    new Date(step.startedAt),
                                                    "HH:mm:ss.SSS"
                                                  )}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="font-medium text-muted-foreground mb-0.5">
                                                  Finished
                                                </p>
                                                <p className="font-mono">
                                                  {format(
                                                    new Date(step.finishedAt),
                                                    "HH:mm:ss.SSS"
                                                  )}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Input */}
                                            {step.input && (
                                              <div>
                                                <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                                  Input
                                                </p>
                                                <pre className="text-[10px] font-mono bg-muted p-2 rounded overflow-x-auto max-h-32">
                                                  {JSON.stringify(
                                                    step.input,
                                                    null,
                                                    2
                                                  )}
                                                </pre>
                                              </div>
                                            )}

                                            {/* Output */}
                                            {step.output && (
                                              <div>
                                                <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                                  Output
                                                </p>
                                                <pre className="text-[10px] font-mono bg-muted p-2 rounded overflow-x-auto max-h-32">
                                                  {JSON.stringify(
                                                    step.output,
                                                    null,
                                                    2
                                                  )}
                                                </pre>
                                              </div>
                                            )}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))}
                                  </Accordion>
                                </div>
                              )}

                            {/* Metadata */}
                            <div className="space-y-2">
                              <h3 className="text-sm font-semibold text-foreground">
                                Metadata
                              </h3>
                              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                                <pre className="text-[10px] font-mono overflow-x-auto">
                                  {JSON.stringify(
                                    {
                                      id: selectedLog._id,
                                      workflow: selectedLog.workflow,
                                      project: selectedLog.project,
                                      createdAt: selectedLog.createdAt,
                                      updatedAt: selectedLog.updatedAt,
                                    },
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Raw JSON View
                          <div className="p-4">
                            <div className="bg-muted/50 rounded-lg p-4 border border-border">
                              <pre className="text-xs font-mono overflow-x-auto">
                                {JSON.stringify(selectedLog, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="h-9 border-t border-neutral-300 bg-white flex items-center justify-between p-2 shrink-0">
              <div className="flex items-center gap-4">
                {pagination.hasMore && (
                  <Button
                    onClick={handleLoadOlder}
                    disabled={isLoading}
                    className="justify-start shadow-none gap-2 text-left font-normal border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-black cursor-pointer text-xs h-7 px-2.5 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="size-3.5" />
                    Load older
                  </Button>
                )}
                {filters.page > 1 && (
                  <Button
                    onClick={handleLoadNewer}
                    disabled={isLoading}
                    className="justify-start shadow-none gap-2 text-left font-normal border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-black cursor-pointer text-xs h-7 px-2.5 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="size-3.5" />
                    Load newer
                  </Button>
                )}
                <span className="text-xs text-neutral-600">
                  Showing {filteredLogs.length} results
                  {filters.page > 1 && ` (Page ${filters.page})`}
                </span>
              </div>
              <div className="flex items-center gap-2 px-2">
                <p className="text-xs">30 days retention</p>
                <Info className="size-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

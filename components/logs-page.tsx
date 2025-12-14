"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { WorkflowsTable } from "./workflows-table";
import { fetchWorkflows } from "@/lib/redux/slices/workflowsSlice";
import { setCurrentWorkflow } from "@/lib/redux/slices/logsSlice";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import type { Workflow } from "@/lib/api/workflows";
// import { Activity, FileText, TrendingUp, AlertCircle } from "lucide-react";
// import { Activity } from "lucide-react";
import { GitPullRequestArrow } from "lucide-react";

interface LogsPageProps {
  projectId: string;
}

export function LogsPage({ projectId }: LogsPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { workflows, isLoading: workflowsLoading } = useSelector(
    (state: RootState) => state.workflows
  );
  //   const { currentWorkflowId, logs } = useSelector(
  //     (state: RootState) => state.logs
  //   );
  const { currentWorkflowId } = useSelector((state: RootState) => state.logs);

  React.useEffect(() => {
    // Try to fetch workflows, fallback to mock data
    if (workflows.length == 0) {
      dispatch(fetchWorkflows(projectId));
    }
  }, [dispatch, projectId, workflows.length]);

  const handleWorkflowClick = (workflow: Workflow) => {
    dispatch(setCurrentWorkflow(workflow._id));
    // Navigate to logs detail screen
    router.push(`/projects/${projectId}/logs/${workflow._id}`);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    // Handle workflow editing - placeholder for now
    console.log("Edit workflow:", workflow);
  };

  // Calculate stats from workflows
  //   const deployedCount = workflows.filter((w) => w.isDeployed).length;
  //   const totalWorkflows = workflows.length;
  //   const recentLogs = logs.slice(0, 5); // Show recent logs from current workflow

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage your workflow execution logs
        </p>
      </div> */}

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Workflows
                </p>
                <p className="text-2xl font-bold">{totalWorkflows}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Deployed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {deployedCount}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recent Logs
                </p>
                <p className="text-2xl font-bold">{recentLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Errors
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {recentLogs.filter((log) => log.status === "error").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Recent Activity */}
      {/* {currentWorkflowId && recentLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        log.status === "success"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : log.status === "error"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      }
                    >
                      {log.status}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {log.trigger.request.method} {log.trigger.request.path}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {log.durationMs}ms
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() =>
                  currentWorkflowId &&
                  router.push(
                    `/projects/${projectId}/logs/${currentWorkflowId}`
                  )
                }
                className="w-full"
              >
                View All Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* // <div className="py-0 bg-amber-300 w-full h-full m-0"> */}

      {/* Instructions */}
      {workflows.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-168 px-15 py-10 border-none shadow-none bg-background">
            <CardContent className="p-6 text-center">
              <GitPullRequestArrow className="h-9 w-9 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">
                Create a workflow to view logs
              </h3>
              <p className="text-muted-foreground">
                Click on any workflow above to view its execution logs and
                detailed information.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflows</h1> */}
          <WorkflowsTable
            workflows={workflows}
            projectId={projectId}
            isLoading={workflowsLoading}
            onEditWorkflow={handleEditWorkflow}
            onWorkflowClick={handleWorkflowClick}
            selectedWorkflowId={currentWorkflowId ?? undefined}
            mode="logs"
          />
        </>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Activity } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogsDetailTable } from "@/components/logs-detail-table";
import { LogDetailSheet } from "@/components/log-detail-sheet";
import { format } from "date-fns";
import {
  setCurrentWorkflow,
  fetchLogDetail,
} from "@/lib/redux/slices/logsSlice";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import type { Log } from "@/lib/api/logs";

export default function WorkflowLogsPage() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const workflowId = params.workflowId as string;
  const { workflows } = useSelector((state: RootState) => state.workflows);
  //   const { selectedLog } = useSelector((state: RootState) => state.logs);

  const currentWorkflow = workflows.find((w) => w._id === workflowId);

  React.useEffect(() => {
    if (workflowId) {
      dispatch(setCurrentWorkflow(workflowId));
    }
  }, [dispatch, workflowId]);

  const handleLogClick = (log: Log) => {
    dispatch(fetchLogDetail(log._id));
  };

  return (
    <div className="space-y-2 h-full max-w-7xl w-full  py-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 mb-2">
        {/* <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workflows
        </Button> */}
        <div className="flex flex-row items-center justify-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
              {currentWorkflow?.name || "Workflow Logs"}
            </h2>
            <p className="text-gray-600 text-sm dark:text-gray-400 mt-1">
              {currentWorkflow?.description ||
                `Execution logs for workflow ${workflowId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <LogsDetailTable workflowId={workflowId} onLogClick={handleLogClick} />

      {/* Log Detail Sheet */}
      <LogDetailSheet />
    </div>
  );
}

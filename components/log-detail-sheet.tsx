"use client";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import {
  Clock,
  Copy,
  CheckCircle,
  XCircle,
  Loader2,
  Activity,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { clearSelectedLog } from "@/lib/redux/slices/logsSlice";
import { logsApi, type LogStep } from "@/lib/api/logs";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";

export function LogDetailSheet() {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedLog, isLoadingDetail } = useSelector(
    (state: RootState) => state.logs
  );

  const handleClose = () => {
    dispatch(clearSelectedLog());
  };

  const handleCopyStep = (step: LogStep) => {
    const stepData = {
      nodeId: step.nodeId,
      nodeName: step.nodeName,
      status: step.status,
      input: step.input,
      output: step.output,
      duration: step.durationMs,
      startedAt: step.startedAt,
      finishedAt: step.finishedAt,
    };

    navigator.clipboard.writeText(JSON.stringify(stepData, null, 2));
    toast.success(`Copied ${step.nodeName} step data`);
  };

  const handleCopyFullLog = () => {
    if (!selectedLog) return;

    const logData = {
      id: selectedLog._id,
      status: selectedLog.status,
      duration: selectedLog.durationMs,
      trigger: selectedLog.trigger,
      steps: selectedLog.steps,
      response: selectedLog.response,
      createdAt: selectedLog.createdAt,
    };

    navigator.clipboard.writeText(JSON.stringify(logData, null, 2));
    toast.success("Copied full log data");
  };

  const getStepIcon = (status: LogStep["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getStepStatusColor = (status: LogStep["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50 dark:bg-green-950/20";
      case "error":
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      case "running":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatJson = (data: any) => {
    if (!data) return "No data";
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <Sheet open={!!selectedLog} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {isLoadingDetail ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading log details...</span>
            </div>
          </div>
        ) : selectedLog ? (
          <>
            <SheetHeader className="pb-0">
              <div className="flex flex-col w-full gap-4">
                <div className="flex items-center justify-between w-full">
                  {/* {getStepIcon(selectedLog.status)} */}
                  <div className="flex items-center gap-3">
                    <Activity className="h-full w-8" />
                    <div>
                      <SheetTitle className="text-lg mb-1.5">
                        {selectedLog.trigger.request.method}{" "}
                        {selectedLog.trigger.request.path}
                      </SheetTitle>
                      <SheetDescription>
                        Executed on{" "}
                        {format(
                          new Date(selectedLog.createdAt),
                          "MMM dd, yyyy 'at' HH:mm:ss"
                        )}
                      </SheetDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyFullLog}
                    className="mt-6 mb-0"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-4 p-4 pt-0">
              {/* Log Summary */}
              <Card className="shadow-none py-2 border-muted-foreground gap-2">
                <CardHeader className="px-4">
                  <CardTitle className="text-lg">Execution Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Status
                      </p>
                      <Badge
                        className={`${logsApi.getStatusColor(
                          selectedLog.status
                        )} py-1 mt-1`}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 text-xs"></div>
                        {selectedLog.status.charAt(0).toUpperCase() +
                          selectedLog.status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Duration
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="ml-1.5 text-sm">
                          {logsApi.formatDuration(selectedLog.durationMs)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Steps
                      </p>
                      <p className="text-sm mt-1">
                        {selectedLog.steps.length} total /{" "}
                        {
                          selectedLog.steps.filter((s) => s.status === "error")
                            .length
                        }{" "}
                        failed
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Response Code
                      </p>
                      <p className="text-sm mt-1">
                        {selectedLog.response?.statusCode || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Request Details */}
                  {/* <Separator /> */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Request Body
                    </p>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto border-1 border-muted-foreground">
                      {formatJson(selectedLog.trigger.request.body)}
                    </pre>
                  </div>

                  {/* Response Details */}
                  {selectedLog.response && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Response Body
                      </p>
                      <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto border-1 border-muted-foreground">
                        {formatJson(selectedLog.response.body)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Steps Accordion */}
              <Card className="shadow-none py-2 border-muted-foreground gap-1">
                <CardHeader className="px-4">
                  <CardTitle className="text-lg">Execution Steps</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  <Accordion type="multiple" className="w-full">
                    {selectedLog.steps.map((step, index) => (
                      <AccordionItem key={step.nodeId} value={step.nodeId}>
                        <AccordionTrigger className="hover:no-underline py-2">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center gap-3">
                              {getStepIcon(step.status)}
                              <div className="text-left">
                                <p className="font-medium">
                                  {step.nodeName || `Node ${step.nodeId}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Step {index + 1} •{" "}
                                  {logsApi.formatDuration(step.durationMs)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getStepStatusColor(step.status)}
                                variant="secondary"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 text-xs"></div>
                                {step.status}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyStep(step);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {/* Step Timing */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="font-medium text-muted-foreground">
                                  Started
                                </p>
                                <p>
                                  {format(
                                    new Date(step.startedAt),
                                    "HH:mm:ss.SSS"
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-muted-foreground">
                                  Finished
                                </p>
                                <p>
                                  {format(
                                    new Date(step.finishedAt),
                                    "HH:mm:ss.SSS"
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* <Separator /> */}

                            {/* Input Data */}
                            <div>
                              <p className="font-medium text-muted-foreground mb-2">
                                Input
                              </p>
                              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-40 border-1 border-muted-foreground">
                                {formatJson(step.input)}
                              </pre>
                            </div>

                            {/* Output Data */}
                            <div>
                              <p className="font-medium text-muted-foreground mb-2">
                                Output
                              </p>
                              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-40 border-1 border-muted-foreground">
                                {formatJson(step.output)}
                              </pre>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

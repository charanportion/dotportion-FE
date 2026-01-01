"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  Play,
  FileJson,
  Beaker,
} from "lucide-react";
import type { Node } from "@xyflow/react";
import type { NodeData } from "@/types/node-types";
import type { TestData } from "@/types/test-types";
import { Button } from "./ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setRequestData } from "@/lib/redux/slices/executionSlice";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";

interface TestPanelProps {
  nodes: Node<NodeData>[];
  onClose: () => void;
  onRunWorkflow: (testInput?: TestData) => void;
  executionLogs: ExecutionLog[];
  finalResponse: TestData | null;
}

export interface ExecutionLog {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: "pending" | "running" | "completed" | "error";
  timestamp: number;
  duration?: number;
  input?: TestData;
  output?: TestData;
  error?: string;
}

export function TestPanel({
  nodes,
  onClose,
  onRunWorkflow,
  executionLogs,
  finalResponse,
}: TestPanelProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"logs" | "response" | "request">(
    "request"
  );
  const [testInput, setTestInput] = useState<string>('{\n  "body": {}\n}');
  const [isValidJson, setIsValidJson] = useState(true);
  const requestData = useAppSelector((state) => state.execution.requestData);
  const isRunningState = useAppSelector((state) => state.execution.isRunning);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (requestData) {
      setTestInput(JSON.stringify(requestData, null, 2));
    }
  }, [requestData]);

  useEffect(() => {
    nodes.forEach((node) => ({
      nodeId: node.id,
      nodeName: node.data.label || node.id,
      nodeType: node.type || "unknown",
      status: "pending",
      timestamp: Date.now(),
    }));
  }, [nodes, executionLogs]);

  const toggleLogExpansion = (nodeId: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: ExecutionLog["status"]) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        );
      case "running":
        return (
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
        );
      case "error":
        return (
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-red-500" />
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-neutral-400" />
          </div>
        );
    }
  };

  const getStatusColor = (status: ExecutionLog["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "running":
        return "text-blue-600";
      case "error":
        return "text-red-600";
      default:
        return "text-neutral-500";
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return "";
    return `${duration}ms`;
  };

  const handleTestInputChange = (value: string) => {
    setTestInput(value);
    try {
      const parsed = JSON.parse(value);
      setIsValidJson(true);
      dispatch(setRequestData(parsed));
    } catch {
      setIsValidJson(false);
    }
  };

  const handleRunWorkflow = () => {
    try {
      const parsedInput = JSON.parse(testInput);
      onRunWorkflow(parsedInput);
    } catch {
      // Invalid JSON, don't run
    }
  };

  const apiStartNode = nodes.find((node) => node.type === "apiStart");

  const tabs = [
    { id: "request", label: "Request" },
    { id: "logs", label: "Logs" },
    { id: "response", label: "Response" },
  ] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Beaker className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Test Panel
          </span>
          {isRunningState && (
            <div className="flex items-center gap-1.5 text-blue-600 text-xs ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Running
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              activeTab === tab.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground  hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "logs" && (
          <div className="p-3 space-y-2">
            {isRunningState && executionLogs.length === 0 ? (
              <div className="text-center py-8 text-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs">Waiting for execution logs...</p>
                </div>
              </div>
            ) : executionLogs.length === 0 ? (
              <div className="text-center py-8 text-foreground">
                <p className="text-xs">No execution logs yet.</p>
                <p className="text-[10px] mt-1">
                  Run the workflow to see execution logs.
                </p>
              </div>
            ) : (
              executionLogs.map((log) => {
                const isExpanded = expandedLogs.has(log.nodeId);
                return (
                  <div
                    key={log.nodeId}
                    className="border border-border rounded-md overflow-hidden"
                  >
                    <div
                      className="flex bg-card items-center justify-between p-2.5 cursor-pointer hover:bg-muted"
                      onClick={() => toggleLogExpansion(log.nodeId)}
                    >
                      <div className="flex items-center gap-2.5">
                        {getStatusIcon(log.status)}
                        <div>
                          <div className="font-medium text-xs text-foreground">
                            {log.nodeName}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {log.nodeType}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] capitalize",
                            getStatusColor(log.status)
                          )}
                        >
                          {log.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border p-2.5 bg-card">
                        <div className="text-[10px] text-muted-foreground mb-2">
                          {formatTime(log.timestamp)}
                          {log.duration && ` • ${formatDuration(log.duration)}`}
                        </div>

                        {log.error ? (
                          <div className="text-xs ">
                            <div className="font-medium text-red-600 text-[10px] mb-1">
                              Error:
                            </div>
                            <pre className="font-mono text-foreground text-[10px] bg-card border border-destructive p-2 rounded overflow-x-auto">
                              {typeof log.error === "string"
                                ? log.error
                                : JSON.stringify(log.error, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <>
                            {log.input && (
                              <div className="space-y-1 mb-2">
                                <div className="text-[10px] font-medium  text-muted-foreground">
                                  Input:
                                </div>
                                <pre className="text-[10px] font-mono bg-secondary border border-border0 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.input, null, 2)}
                                </pre>
                              </div>
                            )}

                            {log.output && (
                              <div className="space-y-1">
                                <div className="text-[10px] font-medium text-muted-foreground">
                                  Output:
                                </div>
                                <pre className="text-[10px] font-mono bg-secondary border border-border p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.output, null, 2)}
                                </pre>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "response" && (
          <div className="p-3">
            {isRunningState && !finalResponse ? (
              <div className="text-center py-8 text-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs">Waiting for response...</p>
                </div>
              </div>
            ) : finalResponse ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium">Final API Response</h4>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-950 text-green-500 text-[10px] rounded-full border border-green-500">
                    {typeof finalResponse.statusCode === "number"
                      ? `Status: ${finalResponse.statusCode}`
                      : "Completed"}
                  </span>
                </div>

                <div className="border border-border rounded-md overflow-hidden">
                  <div className="bg-card px-3 py-1.5 border-b border-border text-[10px] font-medium text-muted-foreground">
                    Response Body
                  </div>
                  <pre className="p-3 text-[10px] overflow-x-auto bg-card font-mono max-h-64">
                    {JSON.stringify(
                      finalResponse.data || finalResponse,
                      null,
                      2
                    )}
                  </pre>
                </div>

                {typeof finalResponse.timestamp === "number" && (
                  <div className="text-[10px] text-neutral-500">
                    Timestamp:{" "}
                    {new Date(finalResponse.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p className="text-xs">No API response yet.</p>
                <p className="text-[10px] mt-1">
                  Run the workflow to see the API response.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "request" && (
          <div className="p-3 space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Test Input (JSON)
              </label>
              <div className="relative">
                <Textarea
                  value={testInput}
                  onChange={(e) => handleTestInputChange(e.target.value)}
                  className={cn(
                    "w-full h-48 font-mono text-xs p-3 border rounded-md resize-none bg-input",
                    !isValidJson
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-border "
                  )}
                  placeholder="Enter test input JSON..."
                  disabled={isRunningState}
                />
                {!isValidJson && (
                  <div className="absolute bottom-2 right-2 text-[10px] text-red-500 bg-card px-1.5 py-0.5 rounded">
                    Invalid JSON
                  </div>
                )}
              </div>
            </div>

            {apiStartNode && (
              <div className="border border-blue-500 rounded-md p-2.5 bg-blue-50 dark:bg-blue-950/10">
                <div className="font-medium text-xs flex items-center gap-1.5 text-blue-500 mb-1">
                  <FileJson className="h-3.5 w-3.5" />
                  Schema Validation
                </div>
                <p className="text-[10px] text-blue-400">
                  This API has schema validation enabled. Your test input will
                  be validated against the schema before processing.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 h-12  border-t border-border shrink-0 bg-background">
        <Button
          variant="outline"
          size="sm"
          className="h-7 shadow-none gap-2 border-border bg-white hover:bg-neutral-100 text-muted-foreground text-xs px-2.5"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          size="sm"
          variant="default"
          className="h-7 shadow-none text-xs px-3"
          onClick={handleRunWorkflow}
          disabled={!isValidJson || isRunningState}
        >
          {isRunningState ? (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Running...
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5" />
              Run Workflow
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}

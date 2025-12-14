// import type { Node, Edge } from "@xyflow/react";
// import type { NodeData } from "@/types/node-types";
import type { ExecutionLog } from "@/components/test-panel";
import type { TestData } from "@/types/test-types";
// import axios from "axios";
// import { getSocket } from "./socket";
// import type { Socket } from "socket.io-client";
import { Workflow } from "./api/workflows";
import { realtimeApi, ExecuteWorkflowResponse } from "./api/realtime";

export interface WorkflowExecutionResult {
  logs: ExecutionLog[];
  finalResponse: Record<string, unknown> | null;
  success: boolean;
  executionId?: string;
  error?: string;
}

interface WebSocketMessage {
  event: string;
  data: Record<string, unknown>;
  executionId?: string;
  timestamp?: string;
}

export async function executeWorkflow(
  // nodes: Node<NodeData>[],
  // edges: Edge[],
  testInput?: TestData,
  workflow?: Workflow
): Promise<WorkflowExecutionResult> {
  const logs: ExecutionLog[] = [];
  const finalResponse: Record<string, unknown> | null = null;

  // const apiWorkflow = convertWorkflowToApiFormat(nodes);
  console.log("workflow", workflow);
  try {
    if (!workflow) {
      throw new Error("Workflow is required for execution");
    }

    const testjson = {
      workflow,
      input: testInput || ({} as Record<string, unknown>),
    };

    const res: ExecuteWorkflowResponse =
      await realtimeApi.executeRealtimeWorkflow(testjson);
    console.log("res", res);

    // Connect to the WebSocket using the URL from the response
    if (res.websocketUrl && res.executionId) {
      const executionId = res.executionId;
      const websocketUrl = res.websocketUrl;

      // Create a promise that will resolve when execution completes or fails
      const executionPromise = new Promise<WorkflowExecutionResult>(
        (resolve) => {
          const ws = new WebSocket(websocketUrl);

          ws.onopen = () => {
            console.log("Connected to WebSocket:", websocketUrl);
          };

          ws.onmessage = (event) => {
            try {
              const message: WebSocketMessage = JSON.parse(event.data);
              console.log("WebSocket message:", message);

              switch (message.event) {
                case "node_started":
                  const startedLogEntry = {
                    nodeId: message.data.nodeId as string,
                    nodeName: `Node ${message.data.nodeId as string}`,
                    nodeType: message.data.nodeType as string,
                    status: "running" as const,
                    timestamp: Date.now(),
                  };
                  updateLogEntry(
                    logs,
                    message.data.nodeId as string,
                    startedLogEntry
                  );
                  // Dispatch to Redux store
                  window.dispatchEvent(
                    new CustomEvent("node_started", { detail: startedLogEntry })
                  );
                  break;

                case "node_completed":
                  const completedLogEntry = {
                    nodeId: message.data.nodeId as string,
                    nodeName: `Node ${message.data.nodeId as string}`,
                    nodeType: message.data.nodeType as string,
                    status: "completed" as const,
                    timestamp: Date.now(),
                    output: message.data.output as TestData,
                    duration: message.data.duration as number,
                  };
                  updateLogEntry(
                    logs,
                    message.data.nodeId as string,
                    completedLogEntry
                  );
                  // Dispatch to Redux store
                  window.dispatchEvent(
                    new CustomEvent("node_completed", {
                      detail: completedLogEntry,
                    })
                  );
                  break;

                case "node_failed":
                  const failedLogEntry = {
                    nodeId: message.data.nodeId as string,
                    nodeName: `Node ${message.data.nodeId as string}`,
                    nodeType: message.data.nodeType as string,
                    status: "error" as const,
                    timestamp: Date.now(),
                    error: message.data.error as string,
                  };
                  updateLogEntry(
                    logs,
                    message.data.nodeId as string,
                    failedLogEntry
                  );
                  // Dispatch to Redux store
                  window.dispatchEvent(
                    new CustomEvent("node_failed", { detail: failedLogEntry })
                  );
                  break;

                case "execution_started":
                  console.log("Execution started:", message.data);
                  break;

                case "execution_completed":
                  console.log("Execution completed:", message.data);
                  ws.close();
                  resolve({
                    logs,
                    finalResponse:
                      (message.data.output as Record<string, unknown>) ||
                      ({ ...res } as Record<string, unknown>),
                    success: true,
                    executionId,
                  });
                  break;

                case "execution_failed":
                  console.log("Execution failed:", message.data);
                  ws.close();
                  resolve({
                    logs,
                    finalResponse: null,
                    success: false,
                    executionId,
                    error: message.data.error as string,
                  });
                  break;

                default:
                  console.log("Unknown event:", message.event);
              }
            } catch (error) {
              console.error("Error parsing WebSocket message:", error);
            }
          };

          ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            ws.close();
            resolve({
              logs,
              finalResponse: null,
              success: false,
              executionId,
              error: "WebSocket connection error",
            });
          };

          ws.onclose = () => {
            console.log("WebSocket connection closed");
          };
        }
      );

      // Wait for the execution to complete
      return await executionPromise;
    }

    return { logs, finalResponse: { ...res }, success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorLog = {
      nodeId: "system",
      nodeName: "System",
      nodeType: "system",
      status: "error" as const,
      timestamp: Date.now(),
      error: errorMsg,
    };
    logs.push(errorLog);
    // Dispatch error to Redux store
    window.dispatchEvent(new CustomEvent("node_failed", { detail: errorLog }));
    return { logs, finalResponse, success: false };
  }
}

// Helper function to update a log entry
function updateLogEntry(
  logs: ExecutionLog[],
  nodeId: string,
  updates: Partial<ExecutionLog>
) {
  const logIndex = logs.findIndex((log) => log.nodeId === nodeId);

  if (logIndex >= 0) {
    logs[logIndex] = { ...logs[logIndex], ...updates };
  }
}

// Helper function to clean up socket listeners - no longer needed for WebSocket
// function cleanupSocketListeners(socket: Socket) {
//   socket.off("node_started");
//   socket.off("workflow_nodes");
//   socket.off("node_completed");
//   socket.off("node_failed");
//   socket.off("execution_started");
//   socket.off("execution_completed");
//   socket.off("execution_failed");
// }

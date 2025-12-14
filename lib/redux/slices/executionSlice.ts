import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import type { Node, Edge } from "@xyflow/react";
import type { ExecutionLog } from "@/components/test-panel";
import { executeWorkflow } from "@/lib/workflow-executor";
// import type { NodeData } from "@/types/node-types";
import type { TestData } from "@/types/test-types";
import { Workflow } from "@/lib/api/workflows";

interface ApiResponse {
  statusCode?: number;
  body?: unknown;
  headers?: Record<string, string>;
  error?: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

interface ExecutionState {
  isRunningWorkflow: boolean;
  isRunning: boolean;
  executionLogs: ExecutionLog[];
  requestData: TestData | null;
  responseData: ApiResponse | null;
  executionId: string | null;
  nodeStartTimes: Record<string, number>;
}

const initialState: ExecutionState = {
  isRunningWorkflow: false,
  isRunning: false,
  executionLogs: [],
  requestData: null,
  responseData: null,
  executionId: null,
  nodeStartTimes: {},
};

// Async thunk with proper typing
export const runWorkflow = createAsyncThunk<
  {
    logs: ExecutionLog[];
    finalResponse: unknown;
    success: boolean;
    executionId?: string;
  },
  {
    workflow: Workflow;
    // nodes: Node<NodeData>[];
    // edges: Edge[];
    testInput?: TestData;
  },
  {
    rejectValue: { error: string };
  }
>(
  "execution/runWorkflow",
  async ({ workflow, testInput }, { dispatch, rejectWithValue }) => {
    try {
      console.log("[ExecutionSlice] Running workflow...");
      // Store the request data
      if (testInput) {
        dispatch(setRequestData(testInput));
      }

      // console.log("[ExecutionSlice]", nodes, edges, testInput);

      dispatch(setIsRunning(true));

      // Set up event listeners for real-time updates
      const handleNodeStarted = (event: CustomEvent<ExecutionLog>) => {
        dispatch(updateNodeLog(event.detail));
      };

      const handleNodeCompleted = (event: CustomEvent<ExecutionLog>) => {
        dispatch(updateNodeLog(event.detail));
      };

      const handleNodeFailed = (event: CustomEvent<ExecutionLog>) => {
        dispatch(updateNodeLog(event.detail));
      };

      window.addEventListener(
        "node_started",
        handleNodeStarted as EventListener
      );
      window.addEventListener(
        "node_completed",
        handleNodeCompleted as EventListener
      );
      window.addEventListener("node_failed", handleNodeFailed as EventListener);

      // Execute the workflow
      // console.log("workflow", workflow);

      // const result = await executeWorkflow(nodes, edges, testInput, workflow);
      const result = await executeWorkflow(testInput, workflow);

      // Clean up event listeners
      window.removeEventListener(
        "node_started",
        handleNodeStarted as EventListener
      );
      window.removeEventListener(
        "node_completed",
        handleNodeCompleted as EventListener
      );
      window.removeEventListener(
        "node_failed",
        handleNodeFailed as EventListener
      );

      // Set the final response data
      if (result.success) {
        dispatch(setResponseData(result.finalResponse as ApiResponse));
      } else {
        dispatch(setResponseData({ error: result.error }));
      }

      // Set isRunning to false but keep the logs
      dispatch(setIsRunning(false));

      return result;
    } catch (error) {
      console.error("[ExecutionSlice] Error in workflow execution:", error);
      return rejectWithValue({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

// Helper function to update a log entry
// function updateLogEntry(
//   logs: ExecutionLog[],
//   nodeId: string,
//   updates: Partial<ExecutionLog>
// ) {
//   const logIndex = logs.findIndex((log) => log.nodeId === nodeId);

//   if (logIndex >= 0) {
//     logs[logIndex] = { ...logs[logIndex], ...updates };
//   }
// }

export const executionSlice = createSlice({
  name: "execution",
  initialState,
  reducers: {
    clearExecutionState: (state) => {
      state.executionLogs = [];
      state.requestData = null;
      state.responseData = null;
      state.executionId = null;
      state.nodeStartTimes = {};
      state.isRunning = false;
    },
    // setSocketConnected: (state, action: PayloadAction<boolean>) => {
    //   state.socketConnected = action.payload;
    // },
    setRequestData: (state, action: PayloadAction<TestData>) => {
      state.requestData = action.payload;
    },
    setIsRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
    },
    setResponseData: (state, action: PayloadAction<ApiResponse>) => {
      state.responseData = action.payload;
    },
    setExecutionId: (state, action: PayloadAction<string>) => {
      state.executionId = action.payload;
    },
    setNodeStartTime: (state, action: PayloadAction<string>) => {
      state.nodeStartTimes[action.payload] = Date.now();
    },
    updateNodeLog: (
      state,
      action: PayloadAction<{
        nodeId: string;
        nodeName: string;
        nodeType: string;
        status: ExecutionLog["status"];
        timestamp: number;
        duration?: number;
        output?: TestData;
        error?: string;
      }>
    ) => {
      const {
        nodeId,
        nodeName,
        nodeType,
        status,
        timestamp,
        duration,
        output,
        error,
      } = action.payload;
      const logIndex = state.executionLogs.findIndex(
        (log) => log.nodeId === nodeId
      );

      if (logIndex >= 0) {
        state.executionLogs[logIndex] = {
          ...state.executionLogs[logIndex],
          status,
          timestamp,
          duration,
          output,
          error,
        };
      } else {
        state.executionLogs.push({
          nodeId,
          nodeName,
          nodeType,
          status,
          timestamp,
          duration,
          output,
          error,
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runWorkflow.pending, (state) => {
        state.isRunningWorkflow = true;
        state.isRunning = true;
        // Clear logs only when starting a new workflow
        state.executionLogs = [];
        state.requestData = null;
        state.responseData = null;
        state.executionId = null;
        state.nodeStartTimes = {};
      })
      .addCase(runWorkflow.fulfilled, (state, action) => {
        state.isRunningWorkflow = false;
        // Don't clear logs here, they're already updated by the event listeners
        if (action.payload.executionId) {
          state.executionId = action.payload.executionId;
        }
      })
      .addCase(runWorkflow.rejected, (state, action) => {
        state.isRunningWorkflow = false;
        state.isRunning = false;
        if (action.payload) {
          state.executionLogs.push({
            nodeId: "system",
            nodeName: "System",
            nodeType: "system",
            status: "error",
            timestamp: Date.now(),
            error: action.payload.error,
          });
        }
      });
  },
});

export const {
  clearExecutionState,
  setRequestData,
  setResponseData,
  setIsRunning,
  setExecutionId,
  setNodeStartTime,
  updateNodeLog,
} = executionSlice.actions;

export default executionSlice.reducer;

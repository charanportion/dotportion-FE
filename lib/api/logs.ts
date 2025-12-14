import api from "./axios";

export interface LogStep {
  nodeId: string;
  nodeName: string;
  status: "success" | "error" | "running" | "fail";
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
}

export interface LogTrigger {
  type: string;
  request: {
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: Record<string, unknown>;
  };
}

export interface LogResponse {
  statusCode: number;
  body: Record<string, unknown>;
}

export interface Log {
  _id: string;
  project: string;
  workflow: string;
  status: "success" | "error" | "running" | "fail";
  trigger: LogTrigger;
  steps: LogStep[];
  response?: LogResponse;
  expireAt: string;
  createdAt: string;
  updatedAt: string;
  durationMs: number;
  __v: number;
}

export interface LogsListResponse {
  data: Log[];
}

export interface LogDetailResponse {
  data: Log;
}

export interface GetLogsParams {
  workflowId: string;
  limit?: number;
  page?: number;
  status?: "success" | "error" | "running" | "fail";
}

export const logsApi = {
  getWorkflowLogs: async (params: GetLogsParams): Promise<Log[]> => {
    const { workflowId, limit = 10, page = 1, status } = params;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      ...(status && { status }),
    });

    const response = await api.get<LogsListResponse>(
      `/logs/workflow/${workflowId}?${queryParams}`
    );
    return response.data.data;
  },

  getLogDetail: async (logId: string): Promise<Log> => {
    const response = await api.get<LogDetailResponse>(`/logs/${logId}`);
    return response.data.data;
  },

  // Helper function to get status color
  getStatusColor: (status: Log["status"]): string => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "running":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  },

  // Helper function to format duration
  formatDuration: (durationMs: number): string => {
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    } else if (durationMs < 60000) {
      return `${(durationMs / 1000).toFixed(1)}s`;
    } else {
      return `${(durationMs / 60000).toFixed(1)}m`;
    }
  },
};

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { logsApi, type Log, type GetLogsParams } from "@/lib/api/logs";
import { AxiosError } from "axios";

interface LogsState {
  logs: Log[];
  selectedLog: Log | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;
  currentWorkflowId: string | null;
  filters: {
    status: "all" | "success" | "error" | "running" | "fail";
    page: number;
    limit: number;
  };
  pagination: {
    total: number;
    hasMore: boolean;
  };
  isPolling: boolean;
  lastUpdated: string | null;
}

const initialState: LogsState = {
  logs: [],
  selectedLog: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,
  currentWorkflowId: null,
  filters: {
    status: "all",
    page: 1,
    limit: 10,
  },
  pagination: {
    total: 0,
    hasMore: false,
  },
  isPolling: false,
  lastUpdated: null,
};

const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  return "An unexpected error occurred";
};

export const fetchWorkflowLogs = createAsyncThunk(
  "logs/fetchWorkflowLogs",
  async (params: GetLogsParams, { rejectWithValue }) => {
    try {
      const logs = await logsApi.getWorkflowLogs(params);
      return { logs, params };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchLogDetail = createAsyncThunk(
  "logs/fetchLogDetail",
  async (logId: string, { rejectWithValue }) => {
    try {
      return await logsApi.getLogDetail(logId);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const refreshLogs = createAsyncThunk(
  "logs/refreshLogs",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { logs: LogsState };
      const { currentWorkflowId, filters } = state.logs;

      if (!currentWorkflowId) {
        throw new Error("No workflow selected");
      }

      const params: GetLogsParams = {
        workflowId: currentWorkflowId,
        limit: filters.limit,
        page: 1, // Always fetch from first page for refresh
        status: filters.status === "all" ? undefined : filters.status,
      };

      const logs = await logsApi.getWorkflowLogs(params);
      return logs;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLogs: (state) => {
      state.logs = [];
      state.selectedLog = null;
      state.currentWorkflowId = null;
      state.filters.page = 1;
      state.pagination = { total: 0, hasMore: false };
    },
    setCurrentWorkflow: (state, action: PayloadAction<string>) => {
      state.currentWorkflowId = action.payload;
      state.logs = [];
      state.selectedLog = null;
      state.filters.page = 1;
      state.pagination = { total: 0, hasMore: false };
    },
    setStatusFilter: (
      state,
      action: PayloadAction<LogsState["filters"]["status"]>
    ) => {
      state.filters.status = action.payload;
      state.filters.page = 1;
      state.logs = [];
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    clearSelectedLog: (state) => {
      state.selectedLog = null;
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.isPolling = action.payload;
    },
    updateLastRefresh: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
    prependNewLogs: (state, action: PayloadAction<Log[]>) => {
      const newLogs = action.payload.filter(
        (newLog) =>
          !state.logs.some((existingLog) => existingLog._id === newLog._id)
      );
      state.logs = [...newLogs, ...state.logs];
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflowLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkflowLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        const { logs, params } = action.payload;

        if (params.page === 1) {
          state.logs = logs;
        } else {
          state.logs = [...state.logs, ...logs];
        }

        state.pagination.hasMore = logs.length === params.limit;
        state.pagination.total = state.logs.length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchWorkflowLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLogDetail.pending, (state) => {
        state.isLoadingDetail = true;
        state.error = null;
      })
      .addCase(fetchLogDetail.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.selectedLog = action.payload;
      })
      .addCase(fetchLogDetail.rejected, (state, action) => {
        state.isLoadingDetail = false;
        state.error = action.payload as string;
      })
      .addCase(refreshLogs.pending, (state) => {
        // Don't set isLoading for refresh to avoid UI flicker
        state.error = null;
      })
      .addCase(refreshLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(refreshLogs.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearLogs,
  setCurrentWorkflow,
  setStatusFilter,
  setPage,
  clearSelectedLog,
  setPolling,
  updateLastRefresh,
  prependNewLogs,
} = logsSlice.actions;

export default logsSlice.reducer;

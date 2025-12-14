"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { refreshLogs, setPolling } from "@/lib/redux/slices/logsSlice";
import type { RootState, AppDispatch } from "@/lib/redux/store";

interface UseLogsPollingOptions {
  enabled?: boolean;
  interval?: number;
  workflowId?: string;
}

export function useLogsPolling({
  enabled = false,
  interval = 5000,
  workflowId,
}: UseLogsPollingOptions = {}) {
  const dispatch = useDispatch<AppDispatch>();
  const { isPolling, logs, currentWorkflowId } = useSelector(
    (state: RootState) => state.logs
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousLogsRef = useRef(logs);

  const startPolling = useCallback(() => {
    if (!workflowId && !currentWorkflowId) return;

    dispatch(setPolling(true));

    intervalRef.current = setInterval(() => {
      dispatch(refreshLogs());
    }, interval);
  }, [dispatch, interval, workflowId, currentWorkflowId]);

  const stopPolling = useCallback(() => {
    dispatch(setPolling(false));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [dispatch]);

  const togglePolling = useCallback(() => {
    if (isPolling) {
      stopPolling();
    } else {
      startPolling();
    }
  }, [isPolling, startPolling, stopPolling]);

  // Auto-start polling when enabled
  useEffect(() => {
    if (enabled && (workflowId || currentWorkflowId)) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, workflowId, currentWorkflowId, startPolling, stopPolling]);

  // Detect new logs and show notification
  useEffect(() => {
    const currentLogs = logs;
    const previousLogs = previousLogsRef.current;

    if (currentLogs.length > previousLogs.length && previousLogs.length > 0) {
      const newLogs = currentLogs.slice(
        0,
        currentLogs.length - previousLogs.length
      );
      // New logs are already handled by the Redux slice
      console.log(`${newLogs.length} new log(s) received`);
    }

    previousLogsRef.current = currentLogs;
  }, [logs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isPolling,
    startPolling,
    stopPolling,
    togglePolling,
  };
}

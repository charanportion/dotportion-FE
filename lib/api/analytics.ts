import api from "./axios";

export interface ApiCallData {
  label: string;
  totalCalls: number;
  year?: number;
}

export interface CallsOverTimeParams {
  projectId: string;
  range: "today" | "7" | "30" | "90";
  groupBy: "day" | "week" | "hour";
  selectedDate?: string; // Format: "yyyy-MM-dd"
}

export const analyticsApi = {
  getCallsOverTime: async (
    params: CallsOverTimeParams
  ): Promise<ApiCallData[]> => {
    const { projectId, ...queryParams } = params;

    const searchParams = new URLSearchParams();
    searchParams.append("range", queryParams.range);
    searchParams.append("groupBy", queryParams.groupBy);

    if (queryParams.selectedDate) {
      searchParams.append("selectedDate", queryParams.selectedDate);
    }

    const response = await api.get(
      `/projects/${projectId}/analytics/calls-over-time?${searchParams.toString()}`
    );
    // console.log("response", response);
    return response.data.data || [];
  },
};

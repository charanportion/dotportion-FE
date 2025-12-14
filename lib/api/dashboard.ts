import api from "./axios";

export interface DashboardCounts {
  totalProjects: number;
  totalWorkflows: number;
  totalSecrets: number;
  totalApiCalls: number;
  successRate: number;
}

export interface CallsOverTime {
  date: string;
  calls: number;
}

export interface TopProject {
  name: string;
  calls: number;
}

export interface TopWorkflow {
  name: string;
  calls: number;
}

export interface SecretByProvider {
  provider: string;
  count: number;
}

export interface SuccessVsFailed {
  success: number;
  failed: number;
}

export interface RequestByMethod {
  method: string;
  count: number;
}

export interface DashboardData {
  counts: DashboardCounts;
  callsOverTime: CallsOverTime[];
  topProjects: TopProject[];
  topWorkflows: TopWorkflow[];
  secretsByProvider: SecretByProvider[];
  successVsFailed: SuccessVsFailed;
  requestsByMethod: RequestByMethod[];
}

export const dashboardApi = {
  getGlobalDashboard: async (): Promise<DashboardData> => {
    const response = await api.get("/dashboard/global");
    console.log(response.data);
    return response.data;
  },
};

import api from "./axios";
import { NodeData } from "@/types/node-types";

export interface WorkflowNode {
  id: string;
  type: string;
  data: NodeData;
  position: { x: number; y: number };
  _id?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  _id?: string;
}

export interface Workflow {
  _id: string;
  name: string;
  description: string;
  method: string;
  path: string;
  project: string;
  owner: string;
  tenant: string;
  isDeployed: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface WorkflowDocs {
  name: string;
  description: string;
  endpoint: string;
  method: string;
  bodyParams: Record<string, { type: string; required: boolean; from: string }>;
  queryParams: Record<
    string,
    { type: string; required: boolean; from: string }
  >;
  headers: Record<string, string>;
  snippets: {
    curl: string;
    nodeFetch: string;
    nodeAxios: string;
    python: string;
  };
  responseExample: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  method: string;
  path: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  method?: string;
  path?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

export const workflowsApi = {
  getWorkflows: async (projectId: string): Promise<Workflow[]> => {
    const response = await api.get(`/workflows/projects/${projectId}`);
    return response.data.data;
  },

  createWorkflow: async (
    projectId: string,
    data: CreateWorkflowRequest
  ): Promise<Workflow> => {
    const response = await api.post(`/workflows/projects/${projectId}`, data);
    return response.data.data;
  },

  updateWorkflow: async (
    projectId: string,
    workflowId: string,
    data: UpdateWorkflowRequest
  ): Promise<Workflow> => {
    const response = await api.post(`/workflows/${workflowId}`, data);
    return response.data.data;
  },

  deleteWorkflow: async (
    projectId: string,
    workflowId: string
  ): Promise<void> => {
    await api.delete(`/workflows/${workflowId}`);
  },

  toggleDeployment: async (workflowId: string): Promise<Workflow> => {
    const response = await api.get(
      `/workflows/${workflowId}/toggle-deployment`
    );
    // console.log("response", response.data);
    return response.data.data;
  },

  getWorkflowDocs: async (workflowId: string): Promise<WorkflowDocs> => {
    const response = await api.get(`/workflows/${workflowId}/docs`);
    return response.data.data;
  },
};

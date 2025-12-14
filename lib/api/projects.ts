import api from "./axios";

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: string;
  workflows: Array<{
    _id: string;
    name: string;
    method: string;
    path: string;
  }>;
  secrets: Array<{
    _id: string;
    provider: string;
  }>;
  createdAt: string;
  updatedAt: string;
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    max: number;
    message: string;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  stats: {
    totalApiCalls: number;
    successCalls: number;
    failedCalls: number;
    topWorkflows: TopWorkflow[];
  };
  __v: number;
}

export interface TopWorkflow {
  _id: string;
  workflowId: {
    _id: string;
    name: string;
    method: string;
    path: string;
  };
  calls: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  cors?: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
  };
  rateLimit?: {
    enabled: boolean;
    windowMs: number;
    max: number;
    message: string;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
}

export interface CreateProjectResponse {
  message: string;
  data: Project;
}

export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get("/projects/");
    return response.data;
  },

  createProject: async (
    data: CreateProjectRequest
  ): Promise<CreateProjectResponse> => {
    const response = await api.post("/projects/", data);
    return response.data;
  },

  updateProject: async (
    id: string,
    data: UpdateProjectRequest
  ): Promise<Project> => {
    const response = await api.post(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

import api from "./axios";

export interface Secret {
  _id: string;
  tenant: string;
  owner: string;
  project: string;
  provider: "mongodb" | "jwt";
  data: {
    uri?: string;
    secret?: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateSecretRequest {
  provider: "mongodb" | "jwt";
  data: {
    uri?: string;
    secret?: string;
  };
}

export interface UpdateSecretRequest {
  provider?: "mongodb" | "jwt";
  data?: {
    uri?: string;
    secret?: string;
  };
}

export const secretsApi = {
  getSecrets: async (projectId: string): Promise<Secret[]> => {
    const response = await api.get(`/secrets/projects/${projectId}`);
    return response.data.data;
  },

  createSecret: async (
    projectId: string,
    data: CreateSecretRequest
  ): Promise<Secret> => {
    const response = await api.post(`/secrets/projects/${projectId}`, data);
    return response.data.data;
  },

  updateSecret: async (
    projectId: string,
    secretId: string,
    data: UpdateSecretRequest
  ): Promise<Secret> => {
    const response = await api.post(`/secrets/${secretId}`, data);
    return response.data.data;
  },

  deleteSecret: async (projectId: string, secretId: string): Promise<void> => {
    await api.delete(`/secrets/${secretId}`);
  },
};

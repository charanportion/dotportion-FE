import api from "./axios";

export interface DatabaseDocument {
  _id: string;
  [key: string]: any;
}

export interface DatabaseResponse {
  documents: DatabaseDocument[];
  pagination: {
    totalDocuments: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export const databaseApi = {
  getCollections: async (secretId: string): Promise<string[]> => {
    const response = await api.get(`/external-db/collections/${secretId}`);
    return response.data;
  },

  getPlatformCollections: async (
    tenant: string,
    projectId: string
  ): Promise<string[]> => {
    const response = await api.get(
      `/external-db/platform/${tenant}/${projectId}/collections`
    );
    return response.data.collections || response.data;
  },

  getDocuments: async (
    secretId: string,
    collectionName: string,
    page = 1,
    limit = 10,
    search?: string
  ): Promise<DatabaseResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await api.get(
      `/external-db/collections/${secretId}/${collectionName}?${params}`
    );
    return response.data;
  },

  getPlatformDocuments: async (
    tenant: string,
    projectId: string,
    collectionName: string,
    page = 1,
    limit = 10,
    search?: string
  ): Promise<DatabaseResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await api.get(
      `/external-db/platform/${tenant}/${projectId}/collections/${collectionName}?${params}`
    );
    return response.data;
  },

  createDocument: async (
    secretId: string,
    collectionName: string,
    data: Omit<DatabaseDocument, "_id">
  ): Promise<DatabaseDocument> => {
    const response = await api.post(
      `/external-db/collections/${secretId}/${collectionName}`,
      data
    );
    return response.data;
  },

  createPlaformDocument: async (
    tenant: string,
    projectId: string,
    collectionName: string,
    data: Omit<DatabaseDocument, "_id">
  ): Promise<DatabaseDocument> => {
    const response = await api.post(
      `/external-db/platform/${tenant}/${projectId}/collections/${collectionName}`,
      data
    );
    return response.data;
  },

  updateDocument: async (
    secretId: string,
    collectionName: string,
    documentId: string,
    data: Partial<DatabaseDocument>
  ): Promise<DatabaseDocument> => {
    const response = await api.post(
      `/external-db/collections/${secretId}/${collectionName}/${documentId}`,
      data
    );
    return response.data;
  },
  updatePlatformDocument: async (
    tenant: string,
    projectId: string,
    collectionName: string,
    documentId: string,
    data: Partial<DatabaseDocument>
  ): Promise<DatabaseDocument> => {
    const response = await api.post(
      `/external-db/platform/${tenant}/${projectId}/collections/${collectionName}/${documentId}`,
      data
    );
    return response.data;
  },

  deleteDocument: async (
    secretId: string,
    collectionName: string,
    documentId: string
  ): Promise<void> => {
    await api.delete(
      `/external-db/collections/${secretId}/${collectionName}/${documentId}`
    );
  },
  deletePlatformDocument: async (
    tenant: string,
    projectId: string,
    collectionName: string,
    documentId: string
  ): Promise<void> => {
    await api.delete(
      `/external-db/platform/${tenant}/${projectId}/collections/${collectionName}/${documentId}`
    );
  },
};

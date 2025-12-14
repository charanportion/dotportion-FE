import api from "./axios";

export interface SchemaField {
  type: string;
  required?: boolean;
  unique?: boolean;
  min?: number;
  max?: number;
  default?: string | number | boolean | null;
  enum?: string[];
  description?: string;
}

export interface Schema {
  [fieldName: string]: SchemaField;
}

export interface CreateSchemaRequest {
  provider: string;
  collection: string;
  schema: Schema;
}

export interface CreateSchemaResponse {
  message: string;
  result: {
    collection: string;
  };
}

export interface CollectionParameter {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  min?: number;
  max?: number;
  default?: string | number | boolean | null;
  enum?: string[];
  description: string;
}

export interface CollectionParametersResponse {
  collection: string;
  parameters: CollectionParameter[];
}

export interface AllCollectionsResponse {
  collections: string[];
}

export interface AllParametersResponse {
  [collectionName: string]: CollectionParameter[];
}

export const schemaApi = {
  createSchema: async (
    tenant: string,
    projectId: string,
    data: CreateSchemaRequest
  ): Promise<CreateSchemaResponse> => {
    const response = await api.post(`/schemas/${tenant}/${projectId}`, data);
    return response.data;
  },

  getSchema: async (
    tenant: string,
    projectId: string,
    collectionName: string,
    provider = "mongodb"
  ): Promise<Schema> => {
    const response = await api.get(
      `/schemas/${tenant}/${projectId}/${collectionName}?provider=${provider}`
    );
    return response.data;
  },

  updateSchema: async (
    tenant: string,
    projectId: string,
    collectionName: string,
    data: CreateSchemaRequest
  ): Promise<CreateSchemaResponse> => {
    const response = await api.put(
      `/schemas/${tenant}/${projectId}/${collectionName}`,
      data
    );
    return response.data;
  },

  deleteSchema: async (
    tenant: string,
    projectId: string,
    collectionName: string,
    provider = "mongodb"
  ): Promise<void> => {
    await api.delete(
      `/schemas/${tenant}/${projectId}/${collectionName}?provider=${provider}`
    );
  },

  getAllCollections: async (
    tenant: string,
    projectId: string,
    provider = "mongodb"
  ): Promise<AllCollectionsResponse> => {
    const response = await api.get(
      `/schemas/${tenant}/${projectId}/collections/all?provider=${provider}`
    );
    return response.data;
  },

  getCollectionParameters: async (
    tenant: string,
    projectId: string,
    collectionName: string,
    provider = "mongodb"
  ): Promise<CollectionParametersResponse> => {
    const response = await api.get(
      `/schemas/${tenant}/${projectId}/collections/${collectionName}/parameters?provider=${provider}`
    );
    return response.data;
  },

  getAllCollectionParameters: async (
    tenant: string,
    projectId: string,
    provider = "mongodb"
  ): Promise<AllParametersResponse> => {
    const response = await api.get(
      `/schemas/${tenant}/${projectId}/collections/parameters?provider=${provider}`
    );
    return response.data;
  },
};

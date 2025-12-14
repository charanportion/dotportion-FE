import { SchemaEdge, SchemaNode } from "@/types/schema-types";
import api from "./axios";

export interface SchemaCanvas {
  projectId: string;
  dataBase: string;
  nodes: SchemaNode[];
  edges: SchemaEdge[];
}

export interface SchemaCanvasDocument extends SchemaCanvas {
  _id: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetSchemaCanvasResponse {
  message: string;
  result: SchemaCanvasDocument[];
}

export interface GenerateSchemaCanvasResponse {
  message: string;
  result: {
    success: boolean;
    deletedCount: number;
    createdCollections: string[];
    dbType: string;
  };
}

export interface CreateUpdateSchemaCanvasResponse {
  message: string;
  result: SchemaCanvasDocument;
}

export const schemaCanvasApi = {
  createSchemaCanvas: async (
    data: SchemaCanvas
  ): Promise<CreateUpdateSchemaCanvasResponse> => {
    const response = await api.post("/schemacanvas/", data);
    return response.data;
  },
  updateSchemaCanvas: async (
    data: SchemaCanvas
  ): Promise<CreateUpdateSchemaCanvasResponse> => {
    const response = await api.post("/schemacanvas/update", data);
    return response.data;
  },
  getSchemaCanvas: async (
    projectId: string,
    database: string
  ): Promise<GetSchemaCanvasResponse> => {
    const response = await api.get(`/schemacanvas/${projectId}/${database}`);
    return response.data;
  },
  generateSchemaCanvas: async (
    projectId: string,
    database: string
  ): Promise<GenerateSchemaCanvasResponse> => {
    const response = await api.get(
      `/schemacanvas/${projectId}/${database}/generate`
    );
    return response.data;
  },
};

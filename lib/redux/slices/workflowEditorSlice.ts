import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Node, Edge } from "@xyflow/react";
import type { NodeData } from "@/types/node-types";
import { workflowsApi } from "@/lib/api/workflows";
import { AxiosError } from "axios";

interface WorkflowEditorState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

const initialState: WorkflowEditorState = {
  nodes: [],
  edges: [],
  isLoading: false,
  isSaving: false,
  error: null,
  hasUnsavedChanges: false,
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

// Load workflow into editor
export const loadWorkflowIntoEditor = createAsyncThunk(
  "workflowEditor/loadWorkflow",
  async (
    { projectId, workflowId }: { projectId: string; workflowId: string },
    { rejectWithValue }
  ) => {
    try {
      const workflows = await workflowsApi.getWorkflows(projectId);
      const workflow = workflows.find((w) => w._id === workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }
      return workflow;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Save workflow from editor
export const saveWorkflowFromEditor = createAsyncThunk(
  "workflowEditor/saveWorkflow",
  async (
    {
      projectId,
      workflowId,
      nodes,
      edges,
    }: {
      projectId: string;
      workflowId: string;
      nodes: Node<NodeData>[];
      edges: Edge[];
    },
    { rejectWithValue }
  ) => {
    try {
      const workflowNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type || "",
        data: node.data,
        position: node.position,
      }));

      const workflowEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? undefined,
        targetHandle: edge.targetHandle ?? undefined,
      }));

      return await workflowsApi.updateWorkflow(projectId, workflowId, {
        nodes: workflowNodes,
        edges: workflowEdges,
      });
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const workflowEditorSlice = createSlice({
  name: "workflowEditor",
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node<NodeData>[]>) => {
      state.nodes = action.payload;
      state.hasUnsavedChanges = true;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
      state.hasUnsavedChanges = true;
    },
    updateNodeData: (
      state,
      action: PayloadAction<{ id: string; data: Partial<NodeData> }>
    ) => {
      const { id, data } = action.payload;
      const nodeIndex = state.nodes.findIndex((node) => node.id === id);
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = {
          ...state.nodes[nodeIndex],
          data: {
            ...state.nodes[nodeIndex].data,
            ...data,
          },
        };
        state.hasUnsavedChanges = true;
      }
    },
    addNode: (state, action: PayloadAction<Node<NodeData>>) => {
      state.nodes.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    removeNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter((node) => node.id !== action.payload);
      state.hasUnsavedChanges = true;
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      state.edges.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    removeEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter((edge) => edge.id !== action.payload);
      state.hasUnsavedChanges = true;
    },
    clearUnsavedChanges: (state) => {
      state.hasUnsavedChanges = false;
    },
    clearWorkflowEditor: (state) => {
      state.nodes = [];
      state.edges = [];
      state.hasUnsavedChanges = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWorkflowIntoEditor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadWorkflowIntoEditor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nodes = action.payload.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        }));
        state.edges = action.payload.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle ?? undefined,
          targetHandle: edge.targetHandle ?? undefined,
        }));
        state.hasUnsavedChanges = false;
      })
      .addCase(loadWorkflowIntoEditor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(saveWorkflowFromEditor.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveWorkflowFromEditor.fulfilled, (state) => {
        state.isSaving = false;
        state.hasUnsavedChanges = false;
      })
      .addCase(saveWorkflowFromEditor.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setNodes,
  setEdges,
  updateNodeData,
  addNode,
  removeNode,
  addEdge,
  removeEdge,
  clearUnsavedChanges,
  clearWorkflowEditor,
  clearError,
} = workflowEditorSlice.actions;

export default workflowEditorSlice.reducer;

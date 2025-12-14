import {
  createSlice,
  nanoid,
  createEntityAdapter,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { SchemaNode, SchemaEdge, Field } from "@/types/schema-types";
import type { RootState } from "@/lib/redux/store";
import { schemaCanvasApi, type SchemaCanvas } from "@/lib/api/schemaCanvas";
import { AxiosError } from "axios";

const nodesAdapter = createEntityAdapter<SchemaNode>();
const edgesAdapter = createEntityAdapter<SchemaEdge>();

function generateNewTableNode(
  name: string,
  position?: { x: number; y: number }
): SchemaNode {
  return {
    id: `node-${nanoid()}`,
    type: "table",
    label: name,
    position: position ?? { x: Math.random() * 400, y: Math.random() * 400 },
    fields: [],
  };
}

type SchemaSheetState =
  | { open: false; mode: "table" }
  | { open: true; mode: "table" }
  | { open: true; mode: "field_add"; tableId: string }
  | { open: true; mode: "field_edit"; tableId: string; fieldId: string }
  | { open: true; mode: "table_details"; tableId: string };

type SchemaCanvasState = {
  nodes: ReturnType<typeof nodesAdapter.getInitialState>;
  edges: ReturnType<typeof edgesAdapter.getInitialState>;
  selected: { nodeIds: string[]; edgeIds: string[] };
  clipboard: unknown;
  projectId: string;
  dataBase: "mongodb" | "platform";
  ui: {
    isDirty: boolean;
    applying: boolean;
    isSaving: boolean;
    lastSavedAt: string | undefined;
    isGenerating: boolean;
    schemaSheet: SchemaSheetState;
  };
  isLoading: boolean;
  error: string | null;
  // History for undo/redo
  history: {
    past: Array<{
      nodes: ReturnType<typeof nodesAdapter.getInitialState>;
      edges: ReturnType<typeof edgesAdapter.getInitialState>;
    }>;
    future: Array<{
      nodes: ReturnType<typeof nodesAdapter.getInitialState>;
      edges: ReturnType<typeof edgesAdapter.getInitialState>;
    }>;
  };
};

const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.error) return error.response.data.error;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.message) return error.message;
  }
  return "An unexpected error occurred";
};

export const fetchSchemaCanvas = createAsyncThunk(
  "schemaCanvas/fetch",
  async (
    { projectId, database }: { projectId: string; database: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await schemaCanvasApi.getSchemaCanvas(
        projectId,
        database
      );
      return response.result[0];
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createSchemaCanvas = createAsyncThunk(
  "schemaCanvas/create",
  async (data: SchemaCanvas, { rejectWithValue }) => {
    try {
      const response = await schemaCanvasApi.createSchemaCanvas(data);
      return response.result;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateSchemaCanvas = createAsyncThunk(
  "schemaCanvas/update",
  async (data: SchemaCanvas, { rejectWithValue }) => {
    try {
      const response = await schemaCanvasApi.updateSchemaCanvas(data);
      return response.result;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const generateSchemaCanvas = createAsyncThunk(
  "schemaCanvas/generate",
  async (
    { projectId, database }: { projectId: string; database: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await schemaCanvasApi.generateSchemaCanvas(
        projectId,
        database
      );
      return response.result;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const initialState: SchemaCanvasState = {
  nodes: nodesAdapter.getInitialState(),
  edges: edgesAdapter.getInitialState(),
  selected: { nodeIds: [], edgeIds: [] },
  clipboard: null,
  projectId: "",
  dataBase: "mongodb",
  ui: {
    isDirty: false,
    applying: false,
    isSaving: false,
    lastSavedAt: undefined,
    isGenerating: false,
    schemaSheet: { open: false, mode: "table" },
  },
  isLoading: false,
  error: null,
  history: {
    past: [],
    future: [],
  },
};

// Helper to record history
const recordHistory = (state: SchemaCanvasState) => {
  // Don't record if we're at max history
  if (state.history.past.length >= 50) {
    state.history.past.shift(); // Remove oldest
  }
  state.history.past.push({
    nodes: { ...state.nodes },
    edges: { ...state.edges },
  });
  state.history.future = []; // Clear future on new action
};

const slice = createSlice({
  name: "schemaCanvas",
  initialState,
  reducers: {
    setDataBase(state, action: PayloadAction<"mongodb" | "platform">) {
      recordHistory(state);
      state.dataBase = action.payload;
      state.ui.isDirty = true;
    },
    setProjectID(state, action: PayloadAction<string>) {
      state.projectId = action.payload;
    },
    openSchemaSheet(
      state,
      action: PayloadAction<Exclude<SchemaSheetState, { open: false }>>
    ) {
      state.ui.schemaSheet = action.payload;
    },
    closeSchemaSheet(state) {
      state.ui.schemaSheet = { open: false, mode: "table" };
    },
    createNode(state, action) {
      recordHistory(state);
      const id = action.payload.id ?? `node-${nanoid()}`;
      nodesAdapter.addOne(state.nodes, { ...action.payload, id });
      state.ui.isDirty = true;
    },
    updateNode(state, action) {
      recordHistory(state);
      nodesAdapter.updateOne(state.nodes, {
        id: action.payload.nodeId,
        changes: action.payload.patch,
      });
      state.ui.isDirty = true;
    },
    updateNodePosition(
      state,
      action: PayloadAction<{ id: string; position: { x: number; y: number } }>
    ) {
      // Don't record history for position updates (too many)
      const { id, position } = action.payload;
      nodesAdapter.updateOne(state.nodes, {
        id,
        changes: { position },
      });
      state.ui.isDirty = true;
    },
    deleteNode(state, action) {
      recordHistory(state);
      nodesAdapter.removeOne(state.nodes, action.payload.nodeId);
      const toRemove: string[] = [];
      Object.values(state.edges.entities).forEach((e) => {
        if (!e) return;
        if (
          e.sourceNode === action.payload.nodeId ||
          e.targetNode === action.payload.nodeId
        )
          toRemove.push(e.id);
      });
      edgesAdapter.removeMany(state.edges, toRemove);
      state.ui.isDirty = true;
    },
    createEdge(state, action: PayloadAction<Omit<SchemaEdge, "id">>) {
      recordHistory(state);
      const edge = {
        id: `edge-${nanoid()}`,
        ...action.payload,
      };
      edgesAdapter.addOne(state.edges, edge);
      state.ui.isDirty = true;
    },
    deleteEdge(state, action: PayloadAction<{ edgeId: string }>) {
      recordHistory(state);
      edgesAdapter.removeOne(state.edges, action.payload.edgeId);
      state.ui.isDirty = true;
    },
    setClipboard(state, action) {
      state.clipboard = action.payload;
    },
    createTable(
      state,
      action: PayloadAction<{
        label: string;
        position?: { x: number; y: number };
        fields?: Omit<Field, "id">[];
        isEditing?: boolean;
      }>
    ) {
      recordHistory(state);
      const { label, position, fields, isEditing } = action.payload;
      const newNode = generateNewTableNode(label ?? "New Table", position);
      const idField: Field = {
        id: nanoid(),
        name: "_id",
        type: "objectId",
        handleType: "both",
      };

      newNode.fields = [idField];
      if (fields && fields.length) {
        const additionalFields = fields.map((f) => ({ ...f, id: nanoid() }));
        newNode.fields.push(...additionalFields);
      }

      if (isEditing) {
        newNode.ui = {
          ...newNode.ui,
          isEditing: true,
        };
      }

      nodesAdapter.addOne(state.nodes, newNode);
      state.ui.isDirty = true;
    },
    moveTable(
      state,
      action: PayloadAction<{ id: string; position: { x: number; y: number } }>
    ) {
      const { id, position } = action.payload;
      nodesAdapter.updateOne(state.nodes, {
        id,
        changes: { position },
      });
      // Don't mark as dirty for live dragging
    },
    addFieldToTable(
      state,
      action: PayloadAction<{ nodeId: string; field: Omit<Field, "id"> }>
    ) {
      recordHistory(state);
      const { nodeId, field } = action.payload;
      const node = state.nodes.entities[nodeId];
      if (node) {
        const newField: Field =
          "id" in field ? (field as Field) : { ...field, id: nanoid() };
        if (!node.fields.find((f) => f.id === newField.id)) {
          node.fields.push(newField);
        }
        state.ui.isDirty = true;
      }
    },
    updateFieldInTable(
      state,
      action: PayloadAction<{ nodeId: string; field: Field }>
    ) {
      recordHistory(state);
      const { nodeId, field } = action.payload;
      const node = state.nodes.entities[nodeId];
      if (node) {
        const fieldIndex = node.fields.findIndex((f) => f.id === field.id);
        if (fieldIndex !== -1) {
          const oldField = node.fields[fieldIndex];

          const hadHandles =
            oldField.handleType === "both" ||
            oldField.handleType === "source" ||
            oldField.handleType === "target";
          const willHaveHandles =
            field.handleType === "both" ||
            field.handleType === "source" ||
            field.handleType === "target";

          if (hadHandles && !willHaveHandles) {
            const toRemove: string[] = [];
            Object.values(state.edges.entities).forEach((e) => {
              if (!e) return;
              if (
                (e.sourceNode === nodeId &&
                  e.sourceHandle === `src-${field.id}`) ||
                (e.targetNode === nodeId &&
                  e.targetHandle === `tgt-${field.id}`)
              ) {
                toRemove.push(e.id);
              }
            });
            edgesAdapter.removeMany(state.edges, toRemove);
          }

          node.fields[fieldIndex] = field;
          state.ui.isDirty = true;
        }
      }
    },
    setFieldsForTable(
      state,
      action: PayloadAction<{ nodeId: string; fields: Field[] }>
    ) {
      recordHistory(state);
      const { nodeId, fields } = action.payload;
      const node = state.nodes.entities[nodeId];
      if (node) {
        node.fields = fields;
        state.ui.isDirty = true;
      }
    },
    removeFieldFromTable(
      state,
      action: PayloadAction<{ nodeId: string; fieldId: string }>
    ) {
      recordHistory(state);
      const { nodeId, fieldId } = action.payload;
      const node = state.nodes.entities[nodeId];
      if (node) {
        node.fields = node.fields.filter((f) => f.id !== fieldId);
        const toRemove: string[] = [];
        Object.values(state.edges.entities).forEach((e) => {
          if (!e) return;
          if (e.sourceNode === nodeId && e.sourceHandle === `src-${fieldId}`)
            toRemove.push(e.id);
          if (e.targetNode === nodeId && e.targetHandle === `tgt-${fieldId}`)
            toRemove.push(e.id);
        });
        edgesAdapter.removeMany(state.edges, toRemove);
        state.ui.isDirty = true;
      }
    },
    deleteTable(state, action: PayloadAction<{ nodeId: string }>) {
      recordHistory(state);
      const nodeId = action.payload.nodeId;
      nodesAdapter.removeOne(state.nodes, nodeId);
      const toRemove: string[] = [];
      Object.values(state.edges.entities).forEach((e) => {
        if (!e) return;
        if (e.sourceNode === nodeId || e.targetNode === nodeId)
          toRemove.push(e.id);
      });
      edgesAdapter.removeMany(state.edges, toRemove);
      state.ui.isDirty = true;
    },
    markAsSaved: (state) => {
      state.ui.isDirty = false;
      state.ui.lastSavedAt = new Date().toISOString();
    },
    clearError: (state) => {
      state.error = null;
    },
    undo: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past.pop()!;
        state.history.future.unshift({
          nodes: { ...state.nodes },
          edges: { ...state.edges },
        });
        state.nodes = previous.nodes;
        state.edges = previous.edges;
        state.ui.isDirty = true;
      }
    },
    redo: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future.shift()!;
        state.history.past.push({
          nodes: { ...state.nodes },
          edges: { ...state.edges },
        });
        state.nodes = next.nodes;
        state.edges = next.edges;
        state.ui.isDirty = true;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Schema Canvas
    builder
      .addCase(fetchSchemaCanvas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchemaCanvas.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          nodesAdapter.setAll(state.nodes, action.payload.nodes);
          edgesAdapter.setAll(state.edges, action.payload.edges);
          state.ui.isDirty = false;
          state.ui.lastSavedAt = action.payload.updatedAt;
          // Clear history on load
          state.history = { past: [], future: [] };
        }
      })
      .addCase(fetchSchemaCanvas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Schema Canvas
    builder
      .addCase(createSchemaCanvas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSchemaCanvas.fulfilled, (state, action) => {
        state.isLoading = false;
        nodesAdapter.setAll(state.nodes, action.payload.nodes);
        edgesAdapter.setAll(state.edges, action.payload.edges);
        state.ui.isDirty = false;
        state.ui.lastSavedAt = action.payload.updatedAt;
      })
      .addCase(createSchemaCanvas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Schema Canvas
    builder
      .addCase(updateSchemaCanvas.pending, (state) => {
        state.ui.isSaving = true;
        state.error = null;
      })
      .addCase(updateSchemaCanvas.fulfilled, (state, action) => {
        state.ui.isSaving = false;
        state.ui.isDirty = false;
        state.ui.lastSavedAt = action.payload.updatedAt;
      })
      .addCase(updateSchemaCanvas.rejected, (state, action) => {
        state.ui.isSaving = false;
        state.error = action.payload as string;
      });

    // Generate Schema Canvas
    builder
      .addCase(generateSchemaCanvas.pending, (state) => {
        state.ui.isGenerating = true;
        state.error = null;
      })
      .addCase(generateSchemaCanvas.fulfilled, (state) => {
        state.ui.isGenerating = false;
      })
      .addCase(generateSchemaCanvas.rejected, (state, action) => {
        state.ui.isGenerating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  createNode,
  updateNode,
  updateNodePosition,
  deleteNode,
  createEdge,
  deleteEdge,
  setClipboard,
  createTable,
  moveTable,
  addFieldToTable,
  updateFieldInTable,
  setFieldsForTable,
  removeFieldFromTable,
  deleteTable,
  openSchemaSheet,
  closeSchemaSheet,
  setDataBase,
  setProjectID,
  markAsSaved,
  clearError,
  undo,
  redo,
} = slice.actions;

// Selectors
export const selectSchemaForAPI = (state: RootState): SchemaCanvas => {
  const { projectId, dataBase, nodes, edges } = state.schemaCanvas;

  const nodesArray = Object.values(nodes.entities).filter(
    Boolean
  ) as SchemaNode[];
  const edgesArray = Object.values(edges.entities).filter(
    Boolean
  ) as SchemaEdge[];

  return {
    projectId,
    dataBase,
    nodes: nodesArray,
    edges: edgesArray,
  };
};

export const selectCanUndo = (state: RootState) =>
  state.schemaCanvas.history.past.length > 0;
export const selectCanRedo = (state: RootState) =>
  state.schemaCanvas.history.future.length > 0;

export default slice.reducer;

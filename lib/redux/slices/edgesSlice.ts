import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Edge, Connection, EdgeChange } from "@xyflow/react";
import { initialEdges } from "@/lib/initial-data";
import { addEdge as rfAddEdge } from "@xyflow/react";

interface EdgesState {
  edges: Edge[];
}

const initialState: EdgesState = {
  edges: initialEdges,
};

export const edgesSlice = createSlice({
  name: "edges",
  initialState,
  reducers: {
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    addEdge: (state, action: PayloadAction<Edge | Connection>) => {
      state.edges = rfAddEdge(action.payload, state.edges);
    },
    removeEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter((edge) => edge.id !== action.payload);
    },
    removeEdgesByNodeId: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      state.edges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );
    },
    removeSelectedEdges: (state, action: PayloadAction<string[]>) => {
      const edgeIds = new Set(action.payload);
      state.edges = state.edges.filter((edge) => !edgeIds.has(edge.id));
    },
    onEdgesChange: (state, action: PayloadAction<EdgeChange[]>) => {
      // This is a placeholder for the ReactFlow onEdgesChange
      // The actual implementation will be handled in the component
      console.log("onEdgesChange", action.payload);
    },
  },
});

export const {
  setEdges,
  addEdge,
  removeEdge,
  removeEdgesByNodeId,
  removeSelectedEdges,
  onEdgesChange,
} = edgesSlice.actions;

export default edgesSlice.reducer;

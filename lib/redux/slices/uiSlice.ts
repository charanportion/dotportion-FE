import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Node, Edge } from "@xyflow/react";
import type { NodeData } from "@/types/node-types";

interface UiState {
  selectedNode: Node<NodeData> | null;
  selectedEdges: Edge[];
  clipboard: Node<NodeData>[];
  showPalette: boolean;
  showTestPanel: boolean;
  showDocumentation: boolean;
}

const initialState: UiState = {
  selectedNode: null,
  selectedEdges: [],
  clipboard: [],
  showPalette: false,
  showTestPanel: false,
  showDocumentation: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSelectedNode: (state, action: PayloadAction<Node<NodeData> | null>) => {
      state.selectedNode = action.payload;
    },
    toggleEdgeSelection: (state, action: PayloadAction<Edge>) => {
      const edge = action.payload;
      const isSelected = state.selectedEdges.some((e) => e.id === edge.id);
      if (isSelected) {
        state.selectedEdges = state.selectedEdges.filter(
          (e) => e.id !== edge.id
        );
      } else {
        state.selectedEdges.push(edge);
      }
    },
    clearSelectedEdges: (state) => {
      state.selectedEdges = [];
    },
    setClipboard: (state, action: PayloadAction<Node<NodeData>[]>) => {
      state.clipboard = action.payload;
    },
    setShowPalette: (state, action: PayloadAction<boolean>) => {
      state.showPalette = action.payload;
    },
    setShowTestPanel: (state, action: PayloadAction<boolean>) => {
      state.showTestPanel = action.payload;
    },
    setShowDocumentation: (state, action: PayloadAction<boolean>) => {
      state.showDocumentation = action.payload;
    },
    clearSelections: (state) => {
      state.selectedNode = null;
      state.selectedEdges = [];
    },
  },
});

export const {
  setSelectedNode,
  toggleEdgeSelection,
  clearSelectedEdges,
  setClipboard,
  setShowPalette,
  setShowTestPanel,
  setShowDocumentation,
  clearSelections,
} = uiSlice.actions;

export default uiSlice.reducer;

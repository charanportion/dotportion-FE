import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Node, NodeChange } from "@xyflow/react";
import type { NodeData } from "@/types/node-types";
import { initialNodes } from "@/lib/initial-data";

interface NodesState {
  nodes: Node<NodeData>[];
}

const initialState: NodesState = {
  nodes: initialNodes,
};

export const nodesSlice = createSlice({
  name: "nodes",
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node<NodeData>[]>) => {
      state.nodes = action.payload;
    },
    updateNodeData: (
      state,
      action: PayloadAction<{ id: string; data: Partial<NodeData> }>
    ) => {
      const { id, data } = action.payload;
      const nodeIndex = state.nodes.findIndex((node) => node.id === id);
      if (nodeIndex !== -1) {
        const currentPosition = state.nodes[nodeIndex].position;
        state.nodes[nodeIndex] = {
          ...state.nodes[nodeIndex],
          data: {
            ...state.nodes[nodeIndex].data,
            ...data,
          },
          position: currentPosition,
        };
      }
    },
    addNode: (state, action: PayloadAction<Node<NodeData>>) => {
      state.nodes.push(action.payload);
    },
    removeNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter((node) => node.id !== action.payload);
    },
    duplicateNode: (
      state,
      action: PayloadAction<{
        id: string;
        newId: string;
        position: { x: number; y: number };
      }>
    ) => {
      const { id, newId, position } = action.payload;
      const nodeToClone = state.nodes.find((node) => node.id === id);
      if (nodeToClone) {
        state.nodes.push({
          ...nodeToClone,
          id: newId,
          position,
        });
      }
    },
    onNodesChange: (state, action: PayloadAction<NodeChange[]>) => {
      // This is a placeholder for the ReactFlow onNodesChange
      // The actual implementation will be handled in the component
      console.log("onNodesChange", action.payload);
    },
  },
});

export const {
  setNodes,
  updateNodeData,
  addNode,
  removeNode,
  duplicateNode,
  onNodesChange,
} = nodesSlice.actions;

export default nodesSlice.reducer;

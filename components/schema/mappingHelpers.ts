import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { SchemaNode, SchemaEdge } from "@/types/schema-types";
export function toReactFlowNodes(nodes: SchemaNode[]): RFNode[] {
  return nodes.map((n) => ({
    id: n.id,
    position: n.position,
    type: "databaseSchema",
    selectable: true, // Enable selection
    deletable: true, // Enable deletion
    data: {
      label: n.label,
      schema: n.fields.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        handleType: f.handleType,
        arrayItemType: f.arrayItemType,
        required: f.required,
        unique: f.unique,
        nullable: f.nullable,
        index: f.index,
        default: f.default,
        description: f.description,
      })),
      nodeId: n.id,
      isEditing: n.ui?.isEditing,
    },
  }));
}

export function toReactFlowEdges(edges: SchemaEdge[]): RFEdge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.sourceNode,
    target: e.targetNode,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    type: "step", // Step edge type
    animated: true, // Animated dashes
    selectable: true, // Enable selection
    deletable: true, // Enable deletion
    style: {
      strokeWidth: 2,
      stroke: "#94a3b8", // slate-400 color
    },
    selectedStyle: {
      strokeWidth: 3,
      stroke: "#3b82f6", // blue-500 when selected
    },
  }));
}

export function buildSnapshot(opts: {
  projectId: string;
  name: string;
  dataBase: "mongodb" | "platform";
  version?: number;
  nodes: SchemaNode[];
  edges: SchemaEdge[];
  meta?: Record<string, unknown>;
}) {
  return {
    projectId: opts.projectId,
    name: opts.name,
    dataBase: opts.dataBase,
    exportedAt: new Date().toISOString(),
    version: opts.version ?? 1,
    nodes: opts.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      label: n.label,
      position: n.position,
      ui: n.ui,
      fields: n.fields.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        nullable: !!f.nullable,
        unique: !!f.unique,
        index: !!f.index,
        default: f.default,
      })),
    })),
    edges: opts.edges,
    meta: opts.meta ?? { savedAt: new Date().toISOString() },
  };
}

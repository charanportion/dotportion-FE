export type MongoFieldType =
  | "string"
  | "number"
  | "objectId"
  | "boolean"
  | "date"
  | "array"
  | "object"
  | "binary";

export type Field = {
  id: string; // stable handle id (immutable)
  name: string; // editable label shown in UI
  type: string; // "varchar", "uuid", "int4", ...
  handleType?: "source" | "target" | "both" | "none"; // dynamic handle config
  nullable?: boolean;
  unique?: boolean;
  required?: boolean;
  index?: boolean;
  default?: unknown;
  description?: string;
  arrayItemType?: string;
};

export type Position = { x: number; y: number };

export type SchemaNode = {
  id: string;
  type: "table" | "collection";
  label: string;
  position: Position;
  ui?: { collapsed?: boolean; zIndex?: number; isEditing?: boolean };
  fields: Field[]; // ordered
};

export type SchemaEdge = {
  id: string;
  sourceNode: string;
  targetNode: string;
  sourceHandle: string; // field.id on source
  targetHandle: string; // field.id on target
  relation?: { kind?: string; onDelete?: string };
};

export type SchemaCanvasState = {
  projectId?: string;
  name?: string;
  version?: number;
  nodes: Record<string, SchemaNode>;
  edges: Record<string, SchemaEdge>;
  selected: { nodeIds: string[]; edgeIds: string[] };
  clipboard?: { nodes: SchemaNode[]; edges: SchemaEdge[] } | null;
  ui: { isDirty: boolean; applying: boolean; lastSavedAt?: string };
};

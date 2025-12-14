import { z } from "zod";

export const FieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Field name required"),
  type: z.string().min(1),
  nullable: z.boolean().optional(),
  unique: z.boolean().optional(),
  index: z.boolean().optional(),
  default: z.any().optional(),
  description: z.string().optional(),
});

export const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(["table", "collection"]),
  label: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  ui: z
    .object({
      collapsed: z.boolean().optional(),
      zIndex: z.number().optional(),
    })
    .optional(),
  fields: z.array(FieldSchema).min(1),
});

export const EdgeSchema = z.object({
  id: z.string(),
  sourceNode: z.string(),
  targetNode: z.string(),
  sourceHandle: z.string(),
  targetHandle: z.string(),
  relation: z
    .object({ kind: z.string().optional(), onDelete: z.string().optional() })
    .optional(),
});

export const SnapshotSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  version: z.number().int().nonnegative(),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema).optional(),
  meta: z.record(z.any()).optional(),
});

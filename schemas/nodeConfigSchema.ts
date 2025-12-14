import { z } from "zod";

export const httpConfigSchema = z.object({
  type: z.literal("apiStart"),
  path: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
});

export const logicConfigSchema = z.object({
  type: z.literal("logic"),
  code: z.string().min(1, "Code cannot be empty"),
});
export const conditionConfigSchema = z.object({
  type: z.literal("condition"),
  condition: z.string().min(1, "condition cannot be empty"),
});
export const loopConfigSchema = z.object({
  type: z.literal("loop"),
  items: z.string().min(1, "items cannot be empty"),
});

export const jwtGenerateSchema = z.object({
  type: z.literal("jwtGenerate"),
  secretType: z.string(),
  payload: z.string().min(1),
  expiresIn: z.string().optional(),
});

export const jwtVerifySchema = z.object({
  type: z.literal("jwtVerify"),
  secretType: z.string(),
});

export const parameterSchema = z.object({
  type: z.literal("parameters"),
  sources: z.array(
    z.object({
      from: z.enum(["query", "body", "headers", "params"]),
      parameters: z.record(
        z.object({
          required: z.boolean(), // Remove .default(false) to make it required
        })
      ), // Remove .optional() to make parameters required
    })
  ),
});

export const ResponseSchema = z.object({
  type: z.literal("response"),
  status: z.string(),
});

export const databaseSchema = z.object({
  type: z.literal("database"),
  provider: z.string(),
  collection: z.string(),
  operation: z.enum([
    "findOne",
    "findMany",
    "updateOne",
    "updateMany",
    "insertOne",
    "insertMany",
    "deleteOne",
    "deleteMany",
  ]),
  query: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.object({})]))
    .optional(),
  data: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.object({})]))
    .optional(),
});

export const mongodbSchema = z.object({
  type: z.literal("mongodb"),
  provider: z.string(),
  collection: z.string(),
  operation: z.enum([
    "findOne",
    "findMany",
    "updateOne",
    "updateMany",
    "insertOne",
    "insertMany",
    "deleteOne",
    "deleteMany",
  ]),
  query: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.object({})]))
    .optional(),
  data: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.object({})]))
    .optional(),
});

export const nodeConfigSchema = z.discriminatedUnion("type", [
  httpConfigSchema,
  logicConfigSchema,
  jwtGenerateSchema,
  jwtVerifySchema,
  ResponseSchema,
  parameterSchema,
  databaseSchema,
  mongodbSchema,
  conditionConfigSchema,
  loopConfigSchema,
]);

export type NodeConfig = z.infer<typeof nodeConfigSchema>;

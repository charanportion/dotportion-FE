import type { Node, Edge } from "@xyflow/react";
import type { NodeData } from "@/types/node-types";

export const initialNodes: Node<NodeData>[] = [
  {
    id: "1",
    type: "apiStart",
    data: {
      label: "API Endpoint",
      method: "GET",
      path: "/create-user",
      description: "Entry point for the API",
    },
    position: { x: 250, y: 100 },
  },
  {
    id: "2",
    type: "parameters",
    data: {
      label: "Request Parameters",
      description: "Define query parameters",
      node: {
        id: "param",
        type: "parameters",
        data: {
          sources: [
            {
              from: "query",
              required: ["age"],
            },
            {
              from: "body",
              required: ["name", "email"],
            },
          ],
        },
      },
      output: { parameters: { limit: "10" } },
    },
    position: { x: 250, y: 250 },
  },
  {
    id: "3",
    type: "logic",
    data: {
      label: "Process Data",
      description: "Transform the input data",
      node: {
        id: "logic",
        type: "logic",
        data: {
          code: "return {...input};",
        },
      },
      output: { processedLimit: 20 },
    },
    position: { x: 250, y: 400 },
  },
  {
    id: "4",
    type: "response",
    data: {
      node: {
        id: "response",
        type: "response",
        data: {
          status: 200,
        },
      },
      label: "API Response",
      description: "Send response to client",
    },
    position: { x: 250, y: 550 },
  },
];

export const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4" },
];

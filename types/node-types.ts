export interface NodeData extends Record<string, unknown> {
  label: string;
  description?: string;

  // API Start Node
  method?: string;
  path?: string; // important

  // Response Node
  status?: number;
  responseType?: string;
  responseBody?: string;

  // Database Node
  provider?: string;
  collection?: string;
  operation?:
    | "findOne"
    | "updateOne"
    | "insertOne"
    | "findMany"
    | "insertMany"
    | "updateMany"
    | "deleteOne"
    | "deleteMany";
  query?: Record<string, string | number | boolean | undefined | object>;
  data?: Record<string, string | number | boolean | undefined | object>;

  // Parameter Node
  sources?: Source[];

  // JWT and Logic Nodes
  type?: string;
  code?: string;
  payload?: Record<string, string | number | boolean>;
  expiresIn?: string;

  // loop node
  items?: string;
  trueEdgeId?: string;
  falseEdgeId?: string;

  // condition node
  condition?: string;
}

export interface Source {
  from: "query" | "body" | "headers" | "params";
  parameters: Record<string, ParameterConfig>;
}

export interface ParameterConfig {
  required: boolean;
}

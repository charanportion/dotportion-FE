import type { NodeData } from "@/types/node-types";
import { Handle, Position } from "@xyflow/react";
import { Leaf } from "lucide-react";

export default function MongoDbNode({
  data,
  isConnectable,
  selected,
  id,
}: {
  data: NodeData;
  isConnectable: boolean;
  selected: boolean;
  id: string;
}) {
  const operationColor =
    data.operation === "findOne" || data.operation === "findMany"
      ? "bg-blue-100 dark:bg-blue-950 text-blue-700"
      : data.operation === "insertOne" || data.operation === "insertMany"
      ? "bg-green-100 dark:bg-green-950  text-green-700"
      : data.operation === "updateOne" || data.operation === "updateMany"
      ? "bg-amber-100 dark:bg-amber-950  text-amber-700"
      : data.operation === "deleteOne" || data.operation === "deleteMany"
      ? "bg-red-100 dark:bg-red-950 text-red-700"
      : "bg-neutral-100 dark:bg-neutral-950  text-neutral-700";

  return (
    <div
      className={`rounded-md border bg-card w-[200px] overflow-hidden ${
        selected ? "border-green-600 ring-1 ring-green-600" : "border-border"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-green-600 !border-2 !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-border bg-green-50 dark:bg-green-950/10">
        <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center">
          <Leaf className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs text-foreground truncate">
            {data.label || "MongoDB"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2.5 py-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground">Collection:</span>
          <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[80px]">
            {data.collection || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground">Operation:</span>
          <span
            className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${operationColor}`}
          >
            {data.operation || "findOne"}
          </span>
        </div>

        <div className="text-[9px] text-muted-foreground font-mono">{id}</div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-green-600 !border-2 !border-white"
      />
    </div>
  );
}

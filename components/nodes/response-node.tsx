import { Handle, Position } from "@xyflow/react";
import { Send } from "lucide-react";
import type { NodeData } from "@/types/node-types";

export function ResponseNode({
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
  const statusColor =
    data.status && data.status >= 200 && data.status < 300
      ? "bg-green-100 dark:bg-green-950 text-green-700"
      : data.status && data.status >= 400
      ? "bg-red-100 dark:bg-red-950 text-red-700"
      : "bg-amber-100 dark:bg-amber-950 text-amber-700";

  return (
    <div
      className={`rounded-md border bg-card w-[200px] overflow-hidden ${
        selected ? "border-orange-500 ring-1 ring-orange-500" : "border-border"
      } tour-api-response-node`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-orange-500 !border-2 !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-border bg-orange-50 dark:bg-orange-950/10">
        <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center">
          <Send className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs text-foreground truncate">
            {data.label || "Response"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2.5 py-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${statusColor}`}
          >
            {data.status || 200}
          </span>
          <span className="text-[10px] text-muted-foreground truncate">
            {data.responseType || "application/json"}
          </span>
        </div>

        {data.responseBody && (
          <div className="bg-neutral-50 border border-border rounded px-1.5 py-1">
            <code className="text-[10px] text-muted-foreground font-mono block truncate">
              {data.responseBody.substring(0, 30)}...
            </code>
          </div>
        )}

        <div className="text-[9px] text-muted-foreground font-mono">{id}</div>
      </div>
    </div>
  );
}

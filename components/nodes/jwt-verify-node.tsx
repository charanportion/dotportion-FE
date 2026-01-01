import type { NodeData } from "@/types/node-types";
import { Handle, Position } from "@xyflow/react";
import { ShieldCheck } from "lucide-react";

export default function JwtVerifyNode({
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
  return (
    <div
      className={`rounded-md border bg-card w-[200px] overflow-hidden ${
        selected ? "border-cyan-500 ring-1 ring-cyan-500" : "border-border"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-cyan-500 !border-2 !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-border bg-cyan-50 dark:bg-cyan-950/10">
        <div className="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center">
          <ShieldCheck className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs text-foreground truncate">
            {data.label || "JWT Verify"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2.5 py-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground">Token source:</span>
          <span className="text-[10px] font-medium text-muted-foreground">
            {"header"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
          <span className="text-[10px] text-muted-foreground">
            Validates JWT signature
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
        className="!w-2.5 !h-2.5 !bg-cyan-500 !border-2 !border-white"
      />
    </div>
  );
}

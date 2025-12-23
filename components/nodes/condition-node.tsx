import { Handle, Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import type { NodeData } from "@/types/node-types";

export function ConditionNode({
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
  const conditionPreview = data.condition
    ? data.condition.substring(0, 25) +
      (data.condition.length > 25 ? "..." : "")
    : "No condition set";

  return (
    <div
      className={`rounded-md border bg-card w-[200px] overflow-hidden relative ${
        selected ? "border-amber-500 ring-1 ring-amber-500" : "border-border"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-border bg-amber-50 dark:bg-amber-950/10">
        <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center">
          <GitBranch className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs text-foreground truncate">
            {data.label || "Condition"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2.5 py-2 pb-6 space-y-1.5">
        <div className="bg-secondary border border-border rounded px-1.5 py-1">
          <code className="text-[10px] text-foreground font-mono block truncate">
            {conditionPreview}
          </code>
        </div>

        <div className="text-[9px] text-muted-foreground font-mono">{id}</div>
      </div>

      {/* True Output Handle (Bottom) */}
      <div className="absolute bottom-0 left-5 flex flex-col items-center translate-y-1/2">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          isConnectable={isConnectable}
          className="!w-2.5 !h-2.5 !bg-green-500 !border-2 !border-white !relative !transform-none !left-0 !top-0"
        />
        <span className="text-[9px] text-green-600 font-medium mt-1">True</span>
      </div>

      {/* False Output Handle (Right) */}
      <div className="absolute -right-3 top-1/2 flex items-center -translate-y-1/2 translate-x-1/2">
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          isConnectable={isConnectable}
          className="!w-2.5 !h-2.5 !bg-red-500 !border-2 !border-white !relative !transform-none !left-0 !top-0"
        />
        <span className="text-[9px] text-red-600 font-medium ml-1">False</span>
      </div>
    </div>
  );
}

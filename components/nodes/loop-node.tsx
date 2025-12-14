import { Handle, Position } from "@xyflow/react";
import { RotateCw } from "lucide-react";
import type { NodeData } from "@/types/node-types";

export function LoopNode({
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
  const itemsPreview = data.items
    ? data.items.substring(0, 25) + (data.items.length > 25 ? "..." : "")
    : "No items defined";

  return (
    <div
      className={`rounded-md border bg-white w-[200px] overflow-hidden relative ${
        selected
          ? "border-violet-500 ring-1 ring-violet-500"
          : "border-neutral-300"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-violet-500 !border-2 !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-neutral-200 bg-violet-50">
        <div className="w-6 h-6 rounded bg-violet-500 flex items-center justify-center">
          <RotateCw className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs text-neutral-900 truncate">
            {data.label || "Loop"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2.5 py-2 pb-6 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500">Iterates over:</span>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded px-1.5 py-1">
          <code className="text-[10px] text-neutral-600 font-mono block truncate">
            {itemsPreview}
          </code>
        </div>

        <div className="text-[9px] text-neutral-400 font-mono">{id}</div>
      </div>

      {/* Loop Body Output Handle (Bottom) */}
      <div className="absolute bottom-0 left-5 flex flex-col items-center translate-y-1/2">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          isConnectable={isConnectable}
          className="!w-2.5 !h-2.5 !bg-violet-500 !border-2 !border-white !relative !transform-none !left-0 !top-0"
        />
        <span className="text-[9px] text-violet-600 font-medium mt-1">
          Each
        </span>
      </div>

      {/* Done Output Handle (Right) */}
      <div className="absolute right-0 top-1/2 flex items-center -translate-y-1/2 translate-x-1/2">
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          isConnectable={isConnectable}
          className="!w-2.5 !h-2.5 !bg-neutral-500 !border-2 !border-white !relative !transform-none !left-0 !top-0"
        />
        <span className="text-[9px] text-neutral-600 font-medium ml-1">
          Done
        </span>
      </div>
    </div>
  );
}

import { Handle, Position } from "@xyflow/react";
import { Settings } from "lucide-react";
import type { NodeData } from "@/types/node-types";

export function ParameterNode({
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
  // Count total parameters from sources
  const paramCount =
    data.sources?.reduce((acc, source) => {
      return acc + Object.keys(source.parameters || {}).length;
    }, 0) || 0;

  const sourceTypes = data.sources?.map((s) => s.from).join(", ") || "none";

  return (
    <div
      className={`rounded-md border bg-white w-[200px] overflow-hidden ${
        selected
          ? "border-green-500 ring-1 ring-green-500"
          : "border-neutral-300"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-green-500 !border-2 !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-neutral-200 bg-green-50">
        <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
          <Settings className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs text-neutral-900 truncate">
            {data.label || "Parameters"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2.5 py-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500">Sources:</span>
          <span className="text-[10px] font-medium text-neutral-700 truncate max-w-[100px]">
            {sourceTypes}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500">Parameters:</span>
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">
            {paramCount}
          </span>
        </div>

        <div className="text-[9px] text-neutral-400 font-mono">{id}</div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-green-500 !border-2 !border-white"
      />
    </div>
  );
}

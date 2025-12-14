"use client";

import {
  Globe,
  Settings,
  Code,
  Send,
  GlobeLock,
  ShieldCheck,
  Database,
  GitBranch,
  Repeat,
  Plus,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NodePaletteProps {
  onSelectNodeType: (type: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

const nodeTypes = [
  {
    type: "apiStart",
    label: "API Start",
    description: "Define API endpoint",
    icon: Globe,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    type: "parameters",
    label: "Parameters",
    description: "Request parameters",
    icon: Settings,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    type: "logic",
    label: "Logic",
    description: "JavaScript logic",
    icon: Code,
    color: "bg-violet-50 text-violet-600 border-violet-200",
  },
  {
    type: "response",
    label: "Response",
    description: "API response",
    icon: Send,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    type: "jwtGenerate",
    label: "JWT Generate",
    description: "Generate JWT token",
    icon: GlobeLock,
    color: "bg-cyan-50 text-cyan-600 border-cyan-200",
  },
  {
    type: "jwtVerify",
    label: "JWT Verify",
    description: "Verify JWT token",
    icon: ShieldCheck,
    color: "bg-teal-50 text-teal-600 border-teal-200",
  },
  {
    type: "database",
    label: "Database",
    description: "Database operations",
    icon: Database,
    color: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    type: "mongodb",
    label: "MongoDB",
    description: "MongoDB operations",
    icon: Database,
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    type: "condition",
    label: "Condition",
    description: "Conditional logic",
    icon: GitBranch,
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    type: "loop",
    label: "Loop",
    description: "Loop operations",
    icon: Repeat,
    color: "bg-pink-50 text-pink-600 border-pink-200",
  },
];

export function NodePalette({
  onSelectNodeType,
  open,
  onOpenChange,
  className,
}: NodePaletteProps) {
  const handleSelect = (type: string) => {
    onSelectNodeType(type);
    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-7 shadow-none gap-2 border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-black text-xs px-2.5",
            className
          )}
        >
          <Plus className="size-3.5" />
          <span>Add Node</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 shadow-sm border border-neutral-300 bg-white"
      >
        <div className="px-3 py-2 border-b border-neutral-200">
          <h4 className="text-xs font-medium text-neutral-900">Add Node</h4>
          <p className="text-[10px] text-neutral-500 mt-0.5">
            Select a node type to add to your workflow
          </p>
        </div>
        <div className="p-2 grid grid-cols-2 gap-1.5 max-h-[320px] overflow-y-auto">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <button
                key={nodeType.type}
                className="flex items-start gap-2 p-2 hover:bg-neutral-100 rounded-md transition-colors text-left group"
                onClick={() => handleSelect(nodeType.type)}
              >
                <div
                  className={`w-7 h-7 rounded-md border ${nodeType.color} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs text-neutral-800 group-hover:text-neutral-900">
                    {nodeType.label}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
                    {nodeType.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

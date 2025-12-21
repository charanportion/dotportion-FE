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
    color:
      "bg-blue-50 dark:bg-blue-950 text-blue-500 border-blue-200 dark:border-blue-500",
  },
  {
    type: "parameters",
    label: "Parameters",
    description: "Request parameters",
    icon: Settings,
    color:
      "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-500",
  },
  {
    type: "logic",
    label: "Logic",
    description: "JavaScript logic",
    icon: Code,
    color:
      "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950 dark:border-violet-500",
  },
  {
    type: "response",
    label: "Response",
    description: "API response",
    icon: Send,
    color:
      "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:border-amber-500",
  },
  {
    type: "jwtGenerate",
    label: "JWT Generate",
    description: "Generate JWT token",
    icon: GlobeLock,
    color:
      "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-500",
  },
  {
    type: "jwtVerify",
    label: "JWT Verify",
    description: "Verify JWT token",
    icon: ShieldCheck,
    color:
      "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950 dark:border-teal-500",
  },
  {
    type: "database",
    label: "Database",
    description: "Database operations",
    icon: Database,
    color:
      "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950 dark:border-rose-500",
  },
  {
    type: "mongodb",
    label: "MongoDB",
    description: "MongoDB operations",
    icon: Database,
    color:
      "bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:border-green-500",
  },
  {
    type: "condition",
    label: "Condition",
    description: "Conditional logic",
    icon: GitBranch,
    color:
      "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:border-orange-500",
  },
  {
    type: "loop",
    label: "Loop",
    description: "Loop operations",
    icon: Repeat,
    color:
      "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950 dark:border-pink-500",
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
            "h-7 shadow-none bg-secondary border border-border hover:bg-muted text-xs cursor-pointer",
            className
          )}
        >
          <Plus className="size-3.5" />
          <span>Add Node</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 shadow-sm border border-border bg-card"
      >
        <div className="px-3 py-2 border-b border-border">
          <h4 className="text-xs font-medium text-foreground">Add Node</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Select a node type to add to your workflow
          </p>
        </div>
        <div className="p-2 grid grid-cols-2 gap-1.5 max-h-[320px] overflow-y-auto">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <button
                key={nodeType.type}
                className="flex items-start gap-2 p-2 hover:bg-secondary cursor-pointer rounded-md transition-colors text-left group"
                onClick={() => handleSelect(nodeType.type)}
              >
                <div
                  className={`w-7 h-7 rounded-md border ${nodeType.color} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs text-foreground ">
                    {nodeType.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
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

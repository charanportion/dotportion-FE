"use client";

import { useEffect, useRef } from "react";
import { Copy, Scissors, Trash2, Settings, ClipboardPaste } from "lucide-react";
import type { Node } from "@xyflow/react";
import type { NodeData } from "@/types/node-types";
import { cn } from "@/lib/utils";

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

interface WorkflowContextMenuProps {
  contextMenu: ContextMenuState;
  selectedNode: Node<NodeData> | null;
  hasClipboard: boolean;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onConfigure: () => void;
  onClose: () => void;
}

export function WorkflowContextMenu({
  contextMenu,
  selectedNode,
  hasClipboard,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onConfigure,
  onClose,
}: WorkflowContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as globalThis.Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (contextMenu.show) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu.show, onClose]);

  if (!contextMenu.show) return null;

  // Check if we have a node context (either right-clicked node or selected node)
  const hasNodeContext = !!contextMenu.nodeId || !!selectedNode;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
    >
      <ContextMenuItem
        icon={<Copy className="h-4 w-4" />}
        label="Copy"
        shortcut="⌘C"
        disabled={!hasNodeContext}
        onClick={() => handleAction(onCopy)}
      />
      <ContextMenuItem
        icon={<Scissors className="h-4 w-4" />}
        label="Cut"
        shortcut="⌘X"
        disabled={!hasNodeContext}
        onClick={() => handleAction(onCut)}
      />
      <ContextMenuItem
        icon={<ClipboardPaste className="h-4 w-4" />}
        label="Paste"
        shortcut="⌘V"
        disabled={!hasClipboard}
        onClick={() => handleAction(onPaste)}
      />

      <div className="my-1 h-px bg-border" />

      <ContextMenuItem
        icon={<Settings className="h-4 w-4" />}
        label="Configure"
        disabled={!hasNodeContext}
        onClick={() => handleAction(onConfigure)}
      />

      <div className="my-1 h-px bg-border" />

      <ContextMenuItem
        icon={<Trash2 className="h-4 w-4" />}
        label="Delete"
        shortcut="⌫"
        disabled={!hasNodeContext}
        onClick={() => handleAction(onDelete)}
        variant="destructive"
      />
    </div>
  );
}

interface ContextMenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onClick: () => void;
  variant?: "default" | "destructive";
}

function ContextMenuItem({
  icon,
  label,
  shortcut,
  disabled,
  onClick,
  variant = "default",
}: ContextMenuItemProps) {
  return (
    <button
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        disabled
          ? "pointer-events-none opacity-50"
          : variant === "destructive"
          ? "text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950 hover:bg-red-50 dark:hover:bg-red-950"
          : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="ml-auto text-xs tracking-widest text-muted-foreground">
          {shortcut}
        </span>
      )}
    </button>
  );
}

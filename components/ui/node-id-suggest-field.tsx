import { useAppSelector } from "@/lib/redux/hooks";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import { cn } from "@/lib/utils";
import type { Edge } from "@xyflow/react";
import { Textarea } from "./textarea";
import { Input } from "./input";

interface NodeIdSuggestFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  as?: "input" | "textarea";
  rows?: number;
  currentNodeId?: string;
}

export const NodeIdSuggestField = ({
  value,
  onChange,
  placeholder = "Type {{ to see node suggestions (e.g., {{nodename.field}})",
  className,
  as = "input",
  rows = 3,
  currentNodeId,
}: NodeIdSuggestFieldProps) => {
  const nodes = useAppSelector((state) => state.workflowEditor.nodes);
  const edges = useAppSelector((state) => state.workflowEditor.edges);

  // Create bidirectional maps for nodeId <-> displayName
  const { idToName, nameToId } = useMemo(() => {
    const idToName: Record<string, string> = {};
    const nameToId: Record<string, string> = {};

    nodes.forEach((node) => {
      const originalName = node.data?.label || node.type || node.id;
      // Convert to lowercase and remove spaces for display
      const displayName = originalName.toLowerCase().replace(/\s+/g, "");

      idToName[node.id] = displayName;
      // Handle potential name collisions by appending the ID
      const key = nameToId[displayName]
        ? `${displayName}${node.id}`
        : displayName;
      nameToId[key] = node.id;
      if (key !== displayName) {
        idToName[node.id] = key;
      }
    });

    return { idToName, nameToId };
  }, [nodes]);

  // Convert actual value (nodeId.result.field) to display value (nodename.field)
  const actualToDisplay = (text: string): string => {
    if (!text) return text;

    // Match patterns like {{nodeId.result.anything}} or {{nodeId.result}}
    const pattern = /\{\{([^.}]+)\.result\.?([^}]*)\}\}/g;

    return text.replace(pattern, (match, nodeId, field) => {
      const displayName = idToName[nodeId] || nodeId;
      // If there's a field after .result., include it with a dot
      const fieldPart = field ? `.${field}` : "";
      return `{{${displayName}${fieldPart}}}`;
    });
  };

  // Convert display value (nodename.field) to actual value (nodeId.result.field)
  const displayToActual = (text: string): string => {
    if (!text) return text;

    // Match patterns like {{nodename.field}} or {{nodename}}
    const pattern = /\{\{([^.}]+)\.?([^}]*)\}\}/g;

    return text.replace(pattern, (match, displayName, field) => {
      const nodeId = nameToId[displayName] || displayName;
      // If there's a field, add it after .result.
      const fieldPart = field ? `.${field}` : "";
      return `{{${nodeId}.result${fieldPart}}}`;
    });
  };

  // Display value for the input
  const displayValue = actualToDisplay(value || "");

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { id: string; label: string }[]
  >([]);
  const [searchText, setSearchText] = useState("");
  const [bracketInfo, setBracketInfo] = useState<{
    position: number;
    searchStart: number;
  } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pendingCursorPosition, setPendingCursorPosition] = useState<
    number | null
  >(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  const getCurrentRef = () => {
    return as === "textarea" ? textareaRef.current : inputRef.current;
  };

  // Scroll selected item into view
  useEffect(() => {
    if (showSuggestions && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, showSuggestions]);

  // Apply pending cursor position after render
  useEffect(() => {
    if (pendingCursorPosition !== null) {
      const ref = getCurrentRef();
      if (ref) {
        ref.focus();
        ref.setSelectionRange(pendingCursorPosition, pendingCursorPosition);
        setPendingCursorPosition(null);
      }
    }
  }, [pendingCursorPosition, displayValue]);

  const getUpstreamNodes = (nodeId: string, allEdges: Edge[]): Set<string> => {
    const upstream = new Set<string>();
    const queue = [nodeId];
    const visited = new Set<string>();
    const maxDepth = 100;
    let depth = 0;

    while (queue.length > 0 && depth < maxDepth) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const incomingEdges = allEdges.filter((edge) => edge.target === current);
      for (const edge of incomingEdges) {
        if (!upstream.has(edge.source)) {
          upstream.add(edge.source);
          queue.push(edge.source);
        }
      }
      depth++;
    }

    if (depth >= maxDepth) {
      console.warn("Possible circular dependency detected in workflow graph");
    }

    return upstream;
  };

  useEffect(() => {
    if (!showSuggestions) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inputElement = getCurrentRef();
      const popoverElement = popoverRef.current;

      const clickedOutsideInput =
        inputElement && !inputElement.contains(target);
      const clickedOutsidePopover =
        popoverElement && !popoverElement.contains(target);

      if (clickedOutsideInput && clickedOutsidePopover) {
        setShowSuggestions(false);
        setBracketInfo(null);
        setSuggestions([]);
        setSelectedIndex(0);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions, displayValue]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newDisplayText = e.target.value;
    const cursorPos = e.target.selectionStart ?? 0;

    // Convert display text to actual value before passing to parent
    const newActualValue = displayToActual(newDisplayText);
    onChange(newActualValue);

    // Check for {{ pattern in display text
    const textBeforeCursor = newDisplayText.slice(0, cursorPos);
    const lastDoubleBracket = textBeforeCursor.lastIndexOf("{{");

    if (lastDoubleBracket !== -1) {
      const textAfterBrackets = textBeforeCursor.slice(lastDoubleBracket + 2);
      const hasClosingBrackets = textAfterBrackets.includes("}}");

      if (!hasClosingBrackets) {
        const search = textAfterBrackets;
        setSearchText(search);
        setBracketInfo({
          position: lastDoubleBracket,
          searchStart: lastDoubleBracket + 2,
        });

        let availableNodes = nodes || [];

        if (currentNodeId) {
          const upstreamIds = getUpstreamNodes(currentNodeId, edges || []);
          availableNodes = availableNodes.filter((node) =>
            upstreamIds.has(node.id)
          );
        }

        availableNodes = availableNodes.filter(
          (node) =>
            node.type !== "apiStart" &&
            node.id !== "1" &&
            node.id !== currentNodeId
        );

        // Filter by display name (label) instead of ID
        const filteredNodes = availableNodes
          .filter((node) => {
            const originalName = node.data?.label || node.type || node.id;
            const displayName = originalName.toLowerCase().replace(/\s+/g, "");
            return (
              search === "" ||
              displayName.toLowerCase().includes(search.toLowerCase()) ||
              originalName.toLowerCase().includes(search.toLowerCase()) ||
              node.id.toLowerCase().includes(search.toLowerCase())
            );
          })
          .map((node) => {
            const originalName = node.data?.label || node.type || node.id;
            const displayName = originalName.toLowerCase().replace(/\s+/g, "");
            return {
              id: node.id,
              label: `${displayName} (${originalName})`,
            };
          });

        setSuggestions(filteredNodes);
        setShowSuggestions(true);
        setSelectedIndex(0); // Reset selection when suggestions update
        return;
      }
    }

    setShowSuggestions(false);
    setBracketInfo(null);
    setSuggestions([]);
  };

  const handleCursorPositionChange = (
    e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!showSuggestions || !bracketInfo) {
      return;
    }

    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const cursorPos = target.selectionStart ?? 0;

    const textAfterBrackets = displayValue.slice(bracketInfo.position + 2);
    const closingBracketsIndex = textAfterBrackets.indexOf("}}");

    if (closingBracketsIndex === -1) {
      return;
    }

    const closingPosition = bracketInfo.position + 2 + closingBracketsIndex + 2;

    if (cursorPos < bracketInfo.position || cursorPos > closingPosition) {
      setShowSuggestions(false);
      setBracketInfo(null);
      setSuggestions([]);
      setSelectedIndex(0);
    }
  };

  const handleNodeSelect = (nodeId: string) => {
    if (!bracketInfo) {
      return;
    }

    const ref = getCurrentRef();
    if (!ref) {
      return;
    }

    // Use display name for what user sees (lowercase, no spaces, no .result)
    const displayName = idToName[nodeId] || nodeId;
    const insertedDisplayText = "{{" + displayName + ".}}";

    // Build new display text
    const beforeBrackets = displayValue.slice(0, bracketInfo.position);
    const afterCursor = displayValue.slice(ref.selectionStart || 0);
    const newDisplayText = beforeBrackets + insertedDisplayText + afterCursor;

    // Convert to actual value (with nodeId.result.) for backend
    const newActualValue = displayToActual(newDisplayText);

    // Position cursor after the dot in the DISPLAY text (before }})
    // {{nodename.|}}
    const cursorPosition =
      beforeBrackets.length + "{{".length + displayName.length + ".".length;

    // Update with actual value first
    onChange(newActualValue);

    // Close suggestions
    setShowSuggestions(false);
    setBracketInfo(null);
    setSelectedIndex(0);

    // Set cursor position to be applied after render
    setPendingCursorPosition(cursorPosition);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle special keys when suggestions are visible and we have suggestions
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setShowSuggestions(false);
      setBracketInfo(null);
      setSuggestions([]);
      setSelectedIndex(0);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const selectedNode = suggestions[selectedIndex];
      if (selectedNode) {
        handleNodeSelect(selectedNode.id);
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      const selectedNode = suggestions[selectedIndex];
      if (selectedNode) {
        handleNodeSelect(selectedNode.id);
      }
      return;
    }
  };

  return (
    <div className="relative">
      {as === "textarea" ? (
        <Textarea
          ref={textareaRef}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleCursorPositionChange}
          onClick={handleCursorPositionChange}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-md border border-border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none",
            className
          )}
          rows={rows}
        />
      ) : (
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleCursorPositionChange}
          onClick={handleCursorPositionChange}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-md border border-border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />
      )}

      {showSuggestions && (
        <div
          ref={popoverRef}
          className="absolute z-50 w-80 mt-1 bg-card border border-border rounded-lg shadow-lg"
        >
          <Command className="rounded-lg border-0">
            <CommandInput
              placeholder="Search nodes..."
              value={searchText}
              onValueChange={setSearchText}
            />
            <CommandEmpty>
              {(() => {
                if (!currentNodeId) {
                  return "No nodes available.";
                }
                if (nodes.length === 0) {
                  return "No nodes in workflow.";
                }
                const upstreamIds = getUpstreamNodes(
                  currentNodeId,
                  edges || []
                );
                if (upstreamIds.size === 0) {
                  return "No upstream nodes. Connect nodes before this one.";
                }
                return "No nodes match your search.";
              })()}
            </CommandEmpty>
            <CommandGroup>
              {suggestions.map((node, index) => (
                <CommandItem
                  key={node.id}
                  ref={index === selectedIndex ? selectedItemRef : null}
                  onSelect={() => handleNodeSelect(node.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "cursor-pointer",
                    index === selectedIndex && "bg-accent"
                  )}
                >
                  {node.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>
      )}
    </div>
  );
};

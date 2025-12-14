import { useAppSelector } from "@/lib/redux/hooks";
import { useState, useRef, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import { cn } from "@/lib/utils";
import type { Edge } from "@xyflow/react";

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
  placeholder = "Type {{ to see node suggestions",
  className,
  as = "input",
  rows = 3,
  currentNodeId,
}: NodeIdSuggestFieldProps) => {
  const nodes = useAppSelector((state) => state.workflowEditor.nodes);
  const edges = useAppSelector((state) => state.workflowEditor.edges);

  // Ensure value is always a string
  const currentValue = value || "";

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { id: string; label: string }[]
  >([]);
  const [searchText, setSearchText] = useState("");
  const [bracketInfo, setBracketInfo] = useState<{
    position: number;
    searchStart: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const getCurrentRef = () => {
    return as === "textarea" ? textareaRef.current : inputRef.current;
  };

  const getUpstreamNodes = (nodeId: string, allEdges: Edge[]): Set<string> => {
    const upstream = new Set<string>();
    const queue = [nodeId];
    const visited = new Set<string>();
    const maxDepth = 100; // Prevent infinite loops in case of circular dependencies
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
      console.warn('Possible circular dependency detected in workflow graph');
    }

    return upstream;
  };

  // Click outside handler to close suggestions
  useEffect(() => {
    if (!showSuggestions) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside both the input and the popover
      const inputElement = getCurrentRef();
      const popoverElement = popoverRef.current;

      const clickedOutsideInput = inputElement && !inputElement.contains(target);
      const clickedOutsidePopover = popoverElement && !popoverElement.contains(target);

      if (clickedOutsideInput && clickedOutsidePopover) {
        setShowSuggestions(false);
        setBracketInfo(null);
        setSuggestions([]);
      }
    };

    // Add listener with slight delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions, currentValue]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart ?? 0;

    // Always update parent first
    onChange(newText);

    // Check for {{ pattern
    const textBeforeCursor = newText.slice(0, cursorPos);
    const lastDoubleBracket = textBeforeCursor.lastIndexOf("{{");

    if (lastDoubleBracket !== -1) {
      // Check if we're still within the {{ }} context
      const textAfterBrackets = textBeforeCursor.slice(lastDoubleBracket + 2);
      const hasClosingBrackets = textAfterBrackets.includes("}}");

      if (!hasClosingBrackets) {
        // We're in suggestion mode
        const search = textAfterBrackets;
        setSearchText(search);
        setBracketInfo({
          position: lastDoubleBracket,
          searchStart: lastDoubleBracket + 2,
        });

        let availableNodes = nodes || [];

        // Filter by upstream connections if currentNodeId is provided
        if (currentNodeId) {
          const upstreamIds = getUpstreamNodes(currentNodeId, edges || []);
          availableNodes = availableNodes.filter((node) =>
            upstreamIds.has(node.id)
          );
        }

        // Exclude API Start nodes and current node
        availableNodes = availableNodes.filter(
          (node) =>
            node.type !== "apiStart" &&  // Exclude API Start by type
            node.id !== "1" &&            // Exclude hardcoded API Start ID
            node.id !== currentNodeId     // Exclude current node from its own suggestions
        );

        // Filter nodes by search text
        const filteredNodes = availableNodes
          .filter(
            (node) =>
              search === "" ||
              node.id.toLowerCase().includes(search.toLowerCase())
          )
          .map((node) => ({
            id: node.id,
            label: `${node.id} (${node.data?.label || node.type || "Unknown"})`,
          }));

        setSuggestions(filteredNodes);
        setShowSuggestions(true);
        return;
      }
    }

    // Hide suggestions
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

    // Find the closing }} that corresponds to our opening {{
    const textAfterBrackets = currentValue.slice(bracketInfo.position + 2);
    const closingBracketsIndex = textAfterBrackets.indexOf("}}");

    if (closingBracketsIndex === -1) {
      // No closing brackets found, keep suggestions open
      return;
    }

    // Calculate absolute position of closing }}
    const closingPosition = bracketInfo.position + 2 + closingBracketsIndex + 2;

    // Close suggestions if cursor is outside the {{ }} range
    if (cursorPos < bracketInfo.position || cursorPos > closingPosition) {
      setShowSuggestions(false);
      setBracketInfo(null);
      setSuggestions([]);
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

    const insertedText = "{{" + nodeId + ".result.}}";

    // Build new text
    const beforeBrackets = currentValue.slice(0, bracketInfo.position);
    const afterCursor = currentValue.slice(ref.selectionStart || 0);
    const newText = beforeBrackets + insertedText + afterCursor;

    // Position cursor after the dot (before }})
    // {{nodeId.result.|}}
    const cursorPosition = beforeBrackets.length + "{{".length + nodeId.length + ".result.".length;

    // Update
    onChange(newText);
    setShowSuggestions(false);
    setBracketInfo(null);

    // Set cursor position
    setTimeout(() => {
      if (ref) {
        ref.focus();
        ref.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && showSuggestions) {
      e.preventDefault();
      setShowSuggestions(false);
      setBracketInfo(null);
      setSuggestions([]);
    }
  };

  return (
    <div className="relative">
      {as === "textarea" ? (
        <textarea
          ref={textareaRef}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleCursorPositionChange}
          onClick={handleCursorPositionChange}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none",
            className
          )}
          rows={rows}
        />
      ) : (
        <input
          ref={inputRef}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleCursorPositionChange}
          onClick={handleCursorPositionChange}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />
      )}

      {showSuggestions && (
        <div
          ref={popoverRef}
          className="absolute z-50 w-80 mt-1 bg-white border rounded-lg shadow-lg"
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
                const upstreamIds = getUpstreamNodes(currentNodeId, edges || []);
                if (upstreamIds.size === 0) {
                  return "No upstream nodes. Connect nodes before this one.";
                }
                return "No nodes match your search.";
              })()}
            </CommandEmpty>
            <CommandGroup>
              {suggestions.map((node) => (
                <CommandItem
                  key={node.id}
                  onSelect={() => handleNodeSelect(node.id)}
                  className="cursor-pointer"
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

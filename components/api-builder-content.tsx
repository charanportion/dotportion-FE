"use client";
import type React from "react";
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  useReactFlow,
  type NodeTypes,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TestPanel } from "@/components/test-panel";
import {
  Beaker,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { APIStartNode } from "@/components/nodes/api-start-node";
import { ParameterNode } from "@/components/nodes/parameter-node";
import { LogicNode } from "@/components/nodes/logic-node";
import { ResponseNode } from "@/components/nodes/response-node";
import type { NodeData } from "@/types/node-types";
import { NodePalette } from "@/components/node-palette";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setSelectedNode,
  toggleEdgeSelection,
  clearSelections,
  clearSelectedEdges,
  setClipboard,
  setShowPalette,
  setShowTestPanel,
} from "@/lib/redux/slices/uiSlice";
import {
  recordHistory,
  undo as undoAction,
  redo as redoAction,
} from "@/lib/redux/slices/historySlice";
import {
  runWorkflow as runWorkflowAction,
  setIsRunning,
} from "@/lib/redux/slices/executionSlice";
import type { TestData } from "@/types/test-types";
import JwtGenerateNode from "./nodes/jwt-generate-node";
import JwtVerifyNode from "./nodes/jwt-verify-node";
import DataBaseNode from "./nodes/database-node";
import { NodeConfigPanelNew } from "./node-config-panel-new";
import { toast } from "sonner";
import {
  loadWorkflowIntoEditor,
  saveWorkflowFromEditor,
  setNodes as setWorkflowNodes,
  setEdges as setWorkflowEdges,
  clearWorkflowEditor,
  clearUnsavedChanges,
  addNode as addWorkflowNode,
  removeNode as removeWorkflowNode,
  addEdge as addWorkflowEdge,
  removeEdge as removeWorkflowEdge,
  updateNodeData as updateWorkflowNodeData,
} from "@/lib/redux/slices/workflowEditorSlice";
import type { RootState } from "@/lib/redux/store";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ConditionNode } from "./nodes/condition-node";
import { LoopNode } from "./nodes/loop-node";
import MongoDbNode from "./nodes/mongodb-node";
import { cn } from "@/lib/utils";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { userApi } from "@/lib/api/user";
import { WorkflowContextMenu } from "./workflow-context-menu";

// Define custom node types
const nodeTypes: NodeTypes = {
  apiStart: APIStartNode,
  parameters: ParameterNode,
  logic: LogicNode,
  response: ResponseNode,
  jwtGenerate: JwtGenerateNode,
  jwtVerify: JwtVerifyNode,
  database: DataBaseNode,
  mongodb: MongoDbNode,
  condition: ConditionNode,
  loop: LoopNode,
};

interface ApiBuilderContentProps {
  workflowId: string;
  projectId: string;
}

const getApiBuilderTourKey = (userId: string) =>
  `tour_done_api_builder_${userId}`;

const deepClone = <T,>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

export function ApiBuilderContent({
  workflowId,
  projectId,
}: ApiBuilderContentProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const selectedNode = useAppSelector((state) => state.ui.selectedNode);
  const selectedEdges = useAppSelector((state) => state.ui.selectedEdges);
  const clipboard = useAppSelector((state) => state.ui.clipboard);
  const showPalette = useAppSelector((state) => state.ui.showPalette);
  const showTestPanel = useAppSelector((state) => state.ui.showTestPanel);
  const executionLogs = useAppSelector(
    (state) => state.execution.executionLogs
  );
  const finalResponse = useAppSelector((state) => state.execution.responseData);
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?._id;
  const historyState = useAppSelector((state) => state.history);

  const { nodes, edges, hasUnsavedChanges, isSaving, isLoading } = useSelector(
    (state: RootState) => state.workflowEditor
  );
  const { selectedWorkflow } = useSelector(
    (state: RootState) => state.workflows
  );

  const [showMinimap, setShowMinimap] = useState(true);
  const [toursSynced, setToursSynced] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
    nodeId: null,
  });
  const contextMenuPositionRef = useRef<{ x: number; y: number } | null>(null);
  const contextMenuNodeRef = useRef<Node<NodeData> | null>(null);

  const clonedNodes = useMemo(() => deepClone(nodes), [nodes]);
  const clonedEdges = useMemo(() => deepClone(edges), [edges]);

  const [reactFlowNodes, setReactFlowNodes, onNodesChangeInternal] =
    useNodesState<Node<NodeData>>(clonedNodes);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] =
    useEdgesState(clonedEdges);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(loadWorkflowIntoEditor({ projectId, workflowId }));
    return () => {
      dispatch(clearWorkflowEditor());
    };
  }, [projectId, workflowId, dispatch]);

  useEffect(() => {
    if (selectedWorkflow) {
      dispatch(clearUnsavedChanges());
    }
  }, [selectedWorkflow, dispatch]);

  useEffect(() => {
    setReactFlowNodes(clonedNodes);
  }, [clonedNodes, setReactFlowNodes]);

  useEffect(() => {
    setReactFlowEdges(clonedEdges);
  }, [clonedEdges, setReactFlowEdges]);

  useEffect(() => {
    async function syncApiBuilderTour() {
      if (!userId) return;
      try {
        const res = await userApi.getTours();
        const tours = res?.tours || {};
        if (tours.workflowsTour === true) {
          localStorage.setItem(getApiBuilderTourKey(userId), "true");
        }
      } catch (err) {
        console.warn("Failed to sync API Builder tour:", err);
      } finally {
        setToursSynced(true);
      }
    }
    setToursSynced(false);
    syncApiBuilderTour();
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!toursSynced) return;
    if (!userId) return;
    const TOUR_KEY = getApiBuilderTourKey(userId);
    if (localStorage.getItem(TOUR_KEY)) return;

    const waitFor = (selectors: string[], timeout = 5000) =>
      new Promise<boolean>((resolve) => {
        const start = Date.now();
        const interval = setInterval(() => {
          const ok = selectors.every((s) => document.querySelector(s));
          if (ok) {
            clearInterval(interval);
            resolve(true);
          }
          if (Date.now() - start > timeout) {
            clearInterval(interval);
            resolve(false);
          }
        }, 120);
      });

    const buildSteps = (): DriveStep[] => {
      const steps: DriveStep[] = [];
      const add = (selector: string, popover: DriveStep["popover"]) => {
        if (document.querySelector(selector)) {
          steps.push({ element: selector, popover });
        }
      };
      add(".tour-add-node", {
        title: "Add Node",
        description: "Open the palette to insert new workflow nodes.",
      });
      add(".tour-test", {
        title: "Test Workflow",
        description: "Run your workflow with custom inputs.",
      });
      add(".tour-save", {
        title: "Save Workflow",
        description: "Save all current workflow changes.",
      });
      add(".tour-api-start-node", {
        title: "API Endpoint Node",
        description: "Defines the API method, path & entry configuration.",
        side: "right",
      });
      add(".tour-api-response-node", {
        title: "API Response Node",
        description: "Sends the final response back to the API caller.",
        side: "right",
      });
      return steps;
    };

    (async () => {
      await waitFor([".tour-add-node", ".tour-test", ".tour-save"], 3000);
      const steps = buildSteps();
      if (!steps.length) return;
      const tour = driver({
        showProgress: true,
        steps,
        onDestroyed: async () => {
          try {
            localStorage.setItem(TOUR_KEY, "true");
            await userApi.updateTourStatus({
              tourKey: "workflowsTour",
              completed: true,
            });
          } catch (err) {
            console.warn("Failed to update API Builder tour status:", err);
          }
        },
      });
      setTimeout(() => tour.drive(), 300);
    })();
  }, [toursSynced, userId]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<NodeData>>[]) => {
      const updatedNodes = deepClone(nodes);
      let hasChanges = false;
      changes.forEach((change) => {
        if (change.type === "position" && change.dragging && change.position) {
          const nodeIndex = updatedNodes.findIndex((n) => n.id === change.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position: change.position,
            };
            hasChanges = true;
          }
        }
      });
      if (hasChanges) {
        dispatch(setWorkflowNodes(updatedNodes));
      }
      onNodesChangeInternal(changes);
    },
    [nodes, dispatch, onNodesChangeInternal]
  );

  const saveWorkflow = useCallback(async () => {
    if (!selectedWorkflow) return;
    try {
      await dispatch(
        saveWorkflowFromEditor({
          projectId,
          workflowId: selectedWorkflow._id,
          nodes,
          edges,
        })
      ).unwrap();
      dispatch(clearUnsavedChanges());
      toast("Success", {
        description: "Workflow saved successfully",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast("Error in Saving Workflow", {
        description: errorMessage,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  }, [selectedWorkflow, nodes, edges, projectId, dispatch]);

  const lastUpdateRef = useRef(0);

  useEffect(() => {
    dispatch(setWorkflowNodes(nodes));
  }, [nodes, edges, dispatch]);

  useEffect(() => {
    if (!historyState.isHistoryAction) {
      dispatch(recordHistory({ nodes, edges }));
    }
  }, [nodes, edges, dispatch, historyState.isHistoryAction]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const timestamp = Date.now();
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}-${timestamp}`,
      };
      dispatch(addWorkflowEdge(newEdge));
      const sourceNode = nodes.find((n) => n.id === params.source);
      if (
        sourceNode &&
        (sourceNode.type === "condition" || sourceNode.type === "loop") &&
        (params.sourceHandle === "true" || params.sourceHandle === "false")
      ) {
        const edgeField =
          params.sourceHandle === "true" ? "trueEdgeId" : "falseEdgeId";
        const { node, ...restData } = sourceNode.data || {};
        void node;
        dispatch(
          updateWorkflowNodeData({
            id: sourceNode.id,
            data: { ...restData, [edgeField]: newEdge.id },
          })
        );
      }
    },
    [dispatch, nodes]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      dispatch(setSelectedNode(node as Node<NodeData>));
    },
    [dispatch]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      dispatch(toggleEdgeSelection(edge));
    },
    [dispatch]
  );

  const onPaneClick = useCallback(() => {
    dispatch(clearSelections());
    setContextMenu({ show: false, x: 0, y: 0, nodeId: null });
    contextMenuNodeRef.current = null;
  }, [dispatch]);

  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<NodeData>) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 100) {
        setTimeout(() => updateNodeData(nodeId, newData), 100);
        return;
      }
      lastUpdateRef.current = now;
      dispatch(updateWorkflowNodeData({ id: nodeId, data: newData }));
    },
    [dispatch]
  );

  const duplicateSelectedNode = useCallback(() => {
    if (selectedNode) {
      const timestamp = Date.now();
      const newId = `${selectedNode.id}-copy-${timestamp}`;
      const newPosition = {
        x: selectedNode.position.x + 50,
        y: selectedNode.position.y + 50,
      };
      const newNode: Node<NodeData> = {
        ...deepClone(selectedNode),
        id: newId,
        position: newPosition,
      };
      dispatch(addWorkflowNode(newNode));
      const connectedEdges = edges.filter(
        (edge) =>
          edge.source === selectedNode.id || edge.target === selectedNode.id
      );
      connectedEdges.forEach((edge) => {
        const newEdgeId = `e${
          edge.source === selectedNode.id ? newId : edge.source
        }-${
          edge.target === selectedNode.id ? newId : edge.target
        }-copy-${timestamp}`;
        const newEdge: Edge = {
          ...deepClone(edge),
          id: newEdgeId,
          source: edge.source === selectedNode.id ? newId : edge.source,
          target: edge.target === selectedNode.id ? newId : edge.target,
        };
        dispatch(addWorkflowEdge(newEdge));
      });
    }
  }, [selectedNode, dispatch, edges]);

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      dispatch(removeWorkflowNode(selectedNode.id));
      const connectedEdges = edges.filter(
        (edge) =>
          edge.source === selectedNode.id || edge.target === selectedNode.id
      );
      connectedEdges.forEach((edge) => {
        dispatch(removeWorkflowEdge(edge.id));
      });
      dispatch(setSelectedNode(null));
    }
  }, [selectedNode, dispatch, edges]);

  const copySelectedNode = useCallback(() => {
    if (selectedNode) {
      const clonedNode = deepClone(selectedNode);
      dispatch(setClipboard([clonedNode]));
      toast("Copied", { description: "Node copied to clipboard" });
    }
  }, [selectedNode, dispatch]);

  const cutSelectedNode = useCallback(() => {
    if (selectedNode) {
      const clonedNode = deepClone(selectedNode);
      dispatch(setClipboard([clonedNode]));
      deleteSelectedNode();
      toast("Cut", { description: "Node cut to clipboard" });
    }
  }, [selectedNode, dispatch, deleteSelectedNode]);

  const pasteNodes = useCallback(() => {
    if (clipboard.length > 0 && reactFlowWrapper.current) {
      let pastePosition: { x: number; y: number };
      if (contextMenuPositionRef.current) {
        pastePosition = reactFlowInstance.screenToFlowPosition(
          contextMenuPositionRef.current
        );
      } else {
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const centerX = reactFlowBounds.width / 2;
        const centerY = reactFlowBounds.height / 2;
        pastePosition = reactFlowInstance.screenToFlowPosition({
          x: centerX,
          y: centerY,
        });
      }
      const timestamp = Date.now();
      const newNodes: Node<NodeData>[] = [];
      const newEdges: Edge[] = [];
      const idMapping: Record<string, string> = {};
      clipboard.forEach((node, index) => {
        const newId = `${node.id}-pasted-${timestamp}-${index}`;
        idMapping[node.id] = newId;
        const newNode: Node<NodeData> = {
          ...deepClone(node),
          id: newId,
          position: {
            x: pastePosition.x + index * 50,
            y: pastePosition.y + index * 50,
          },
        };
        newNodes.push(newNode);
      });
      clipboard.forEach((node) => {
        const nodeEdges = edges.filter(
          (edge) => edge.source === node.id || edge.target === node.id
        );
        nodeEdges.forEach((edge) => {
          const newEdgeId = `e${idMapping[edge.source] || edge.source}-${
            idMapping[edge.target] || edge.target
          }-pasted-${timestamp}`;
          const newEdge: Edge = {
            ...deepClone(edge),
            id: newEdgeId,
            source: idMapping[edge.source] || edge.source,
            target: idMapping[edge.target] || edge.target,
          };
          newEdges.push(newEdge);
        });
      });
      newNodes.forEach((node) => dispatch(addWorkflowNode(node)));
      newEdges.forEach((edge) => dispatch(addWorkflowEdge(edge)));
      dispatch(setClipboard([]));
      contextMenuPositionRef.current = null;
      toast("Pasted", { description: `${newNodes.length} node(s) pasted` });
    }
  }, [clipboard, reactFlowInstance, dispatch, edges]);

  // Context menu handlers
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      // Store the node for context menu actions, but don't select it (don't open panel)
      contextMenuNodeRef.current = node as Node<NodeData>;
      contextMenuPositionRef.current = { x: event.clientX, y: event.clientY };
      setContextMenu({
        show: true,
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      contextMenuPositionRef.current = { x: event.clientX, y: event.clientY };
      setContextMenu({
        show: true,
        x: event.clientX,
        y: event.clientY,
        nodeId: null,
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu({ show: false, x: 0, y: 0, nodeId: null });
    contextMenuNodeRef.current = null;
  }, []);

  const configureNode = useCallback(() => {
    // Select the node from context menu to open the config panel
    if (contextMenuNodeRef.current) {
      dispatch(setSelectedNode(contextMenuNodeRef.current));
      contextMenuNodeRef.current = null;
    }
  }, [dispatch]);

  // Context menu action handlers (use context menu node if available, otherwise selected node)
  const handleContextMenuCopy = useCallback(() => {
    const nodeToUse = contextMenuNodeRef.current || selectedNode;
    if (nodeToUse) {
      const clonedNode = deepClone(nodeToUse);
      dispatch(setClipboard([clonedNode]));
      toast("Copied", { description: "Node copied to clipboard" });
    }
    contextMenuNodeRef.current = null;
  }, [selectedNode, dispatch]);

  const handleContextMenuCut = useCallback(() => {
    const nodeToUse = contextMenuNodeRef.current || selectedNode;
    if (nodeToUse) {
      const clonedNode = deepClone(nodeToUse);
      dispatch(setClipboard([clonedNode]));
      // Delete the node
      dispatch(removeWorkflowNode(nodeToUse.id));
      const connectedEdges = edges.filter(
        (edge) => edge.source === nodeToUse.id || edge.target === nodeToUse.id
      );
      connectedEdges.forEach((edge) => {
        dispatch(removeWorkflowEdge(edge.id));
      });
      if (selectedNode?.id === nodeToUse.id) {
        dispatch(setSelectedNode(null));
      }
      toast("Cut", { description: "Node cut to clipboard" });
    }
    contextMenuNodeRef.current = null;
  }, [selectedNode, dispatch, edges]);

  const handleContextMenuDelete = useCallback(() => {
    const nodeToUse = contextMenuNodeRef.current || selectedNode;
    if (nodeToUse) {
      dispatch(removeWorkflowNode(nodeToUse.id));
      const connectedEdges = edges.filter(
        (edge) => edge.source === nodeToUse.id || edge.target === nodeToUse.id
      );
      connectedEdges.forEach((edge) => {
        dispatch(removeWorkflowEdge(edge.id));
      });
      if (selectedNode?.id === nodeToUse.id) {
        dispatch(setSelectedNode(null));
      }
    }
    contextMenuNodeRef.current = null;
  }, [selectedNode, dispatch, edges]);

  const handleContextMenuPaste = useCallback(() => {
    pasteNodes();
    contextMenuNodeRef.current = null;
  }, [pasteNodes]);

  const deleteSelectedEdges = useCallback(() => {
    if (selectedEdges.length > 0) {
      const edgeIds = selectedEdges.map((edge) => edge.id);
      edgeIds.forEach((edgeId) => dispatch(removeWorkflowEdge(edgeId)));
      dispatch(clearSelectedEdges());
    }
  }, [selectedEdges, dispatch]);

  const addNodeFromPalette = useCallback(
    (nodeType: string) => {
      if (reactFlowWrapper.current) {
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const centerX = reactFlowBounds.width / 2;
        const centerY = reactFlowBounds.height / 2;
        const position = reactFlowInstance.screenToFlowPosition({
          x: centerX,
          y: centerY,
        });
        let newNode: Node<NodeData>;
        switch (nodeType) {
          case "apiStart":
            newNode = {
              id: `api-${Date.now()}`,
              type: "apiStart",
              position,
              data: {
                label: "API Endpoint",
                method: "GET",
                path: "/api/new",
                description: "Entry point for the API",
              },
            };
            break;
          case "parameters":
            newNode = {
              id: `param-${Date.now()}`,
              type: "parameters",
              position,
              data: {
                label: "Request Parameters",
                sources: [
                  {
                    from: "body",
                    parameters: {
                      email: { required: true },
                      name: { required: false },
                    },
                  },
                ],
                description: "Define request parameters",
                output: { parameters: {} },
              },
            };
            break;
          case "logic":
            newNode = {
              id: `logic-${Date.now()}`,
              type: "logic",
              position,
              data: {
                label: "Process Data",
                code: "",
                description: "Transform the input data",
                output: { processed: true },
              },
            };
            break;
          case "response":
            newNode = {
              id: `response-${Date.now()}`,
              type: "response",
              position,
              data: {
                label: "API Response",
                statusCode: 200,
                responseType: "application/json",
                responseBody: '{\n  "success": true\n}',
                description: "Send response to client",
                output: { success: true },
              },
            };
            break;
          case "jwtGenerate":
            newNode = {
              id: `jwtGenerate-${Date.now()}`,
              type: "jwtGenerate",
              position,
              data: {
                label: "JWT Generate",
                description: "Send response to client",
                type: "jwt",
                expiresIn: "1h",
                payload: { msg: "hello world" },
              },
            };
            break;
          case "jwtVerify":
            newNode = {
              id: `jwtVerify-${Date.now()}`,
              type: "jwtVerify",
              position,
              data: {
                label: "JWT Verify",
                description: "Send response to client",
                type: "jwt",
              },
            };
            break;
          case "database":
            newNode = {
              id: `database-${Date.now()}`,
              type: "database",
              position,
              data: {
                label: "Data Base",
                description: "Make Database Operations",
                collection: "users",
                provider: "monbgo",
                operation: "findOne",
              },
            };
            break;
          case "mongodb":
            newNode = {
              id: `mongodb-${Date.now()}`,
              type: "mongodb",
              position,
              data: {
                label: "Mongo DB",
                description: "Make Mongo DB Operations",
                collection: "users",
                provider: "mongodb",
                operation: "findOne",
              },
            };
            break;
          case "condition":
            newNode = {
              id: `condition-${Date.now()}`,
              type: "condition",
              position,
              data: {
                label: "Condition Node",
                description: "Make Condition Operations",
                condition: "",
              },
            };
            break;
          case "loop":
            newNode = {
              id: `loop-${Date.now()}`,
              type: "loop",
              position,
              data: {
                label: "Loop Node",
                description: "Make Loop Operations",
                items: "",
              },
            };
            break;
          default:
            return;
        }
        dispatch(addWorkflowNode(newNode));
        dispatch(setShowPalette(false));
      }
    },
    [reactFlowInstance, dispatch]
  );

  const undo = useCallback(() => {
    if (historyState.past.length > 0) {
      dispatch(undoAction());
      const previousState = historyState.past[historyState.past.length - 1];
      dispatch(
        setWorkflowNodes(deepClone(previousState.nodes) as Node<NodeData>[])
      );
      dispatch(setWorkflowEdges(deepClone(previousState.edges)));
    }
  }, [dispatch, historyState.past]);

  const redo = useCallback(() => {
    if (historyState.future.length > 0) {
      dispatch(redoAction());
      const futureState = historyState.future[0];
      dispatch(
        setWorkflowNodes(deepClone(futureState.nodes) as Node<NodeData>[])
      );
      dispatch(setWorkflowEdges(deepClone(futureState.edges)));
    }
  }, [dispatch, historyState.future]);

  const runWorkflow = useCallback(
    async (testInput?: TestData) => {
      try {
        if (!user?.name) {
          toast.error(
            "User not authenticated. Please log in to run workflows."
          );
          return;
        }
        dispatch(setShowTestPanel(true));
        dispatch(setIsRunning(true));
        dispatch(setWorkflowNodes(nodes));
        dispatch(setWorkflowEdges(edges));
        if (!selectedWorkflow) {
          toast.error("Workflow not found");
          return;
        }
        const enrichedInput: TestData = testInput
          ? { ...testInput, tenant: user.name }
          : { body: {}, query: {}, headers: {}, tenant: user.name };
        const result = await dispatch(
          runWorkflowAction({
            workflow: selectedWorkflow,
            testInput: enrichedInput,
          })
        ).unwrap();
        return result;
      } catch (error) {
        console.error("Failed to run workflow:", error);
        dispatch(setIsRunning(false));
      }
    },
    [nodes, edges, dispatch, user, selectedWorkflow]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNode) {
          deleteSelectedNode();
        } else if (selectedEdges.length > 0) {
          deleteSelectedEdges();
        }
      }
      if (event.key === "c" && (event.ctrlKey || event.metaKey)) {
        copySelectedNode();
      }
      if (event.key === "x" && (event.ctrlKey || event.metaKey)) {
        cutSelectedNode();
      }
      if (event.key === "v" && (event.ctrlKey || event.metaKey)) {
        pasteNodes();
      }
      if (event.key === "d" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        duplicateSelectedNode();
      }
      if (
        event.key === "z" &&
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey
      ) {
        event.preventDefault();
        undo();
      }
      if (
        (event.key === "y" && (event.ctrlKey || event.metaKey)) ||
        (event.key === "z" &&
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey)
      ) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedNode,
    selectedEdges,
    deleteSelectedNode,
    deleteSelectedEdges,
    copySelectedNode,
    cutSelectedNode,
    pasteNodes,
    duplicateSelectedNode,
    undo,
    redo,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[94vh]">
        <div className="flex flex-col items-center gap-2">
          <LoaderCircle className="size-4 text-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Workflow...</p>
        </div>
      </div>
    );
  }

  if (!selectedWorkflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Workflow not found</h2>
          <Button
            onClick={() => router.push(`/projects/${projectId}/workflows/`)}
          >
            Back to Project
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full bg-background text-foreground overflow-hidden flex-col">
      <style>{`
        @keyframes border-trail {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(0%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(0.2); }
        }
      `}</style>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "flex flex-col bg-background transition-all overflow-hidden",
            selectedNode || showTestPanel ? "flex-1" : "flex-1"
          )}
        >
          <div className="relative flex w-full min-h-[3rem] h-12 items-center justify-between border-b border-border px-4 gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 shadow-none border border-border hover:bg-muted text-xs"
                onClick={() => router.push(`/projects/${projectId}/workflows/`)}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                Back
              </Button>
              <h1 className="text-sm font-medium text-foreground">
                {selectedWorkflow.name}
              </h1>
              <span className="px-2 py-0.5 text-[10px] rounded bg-secondary border border-border">
                {selectedWorkflow.method}
              </span>
              <span className="text-xs text-muted-foreground">
                /{selectedWorkflow.path}
              </span>
              {hasUnsavedChanges && (
                <span className="text-xs text-orange-500">• Unsaved</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <NodePalette
                onSelectNodeType={addNodeFromPalette}
                open={showPalette}
                onOpenChange={(open) => dispatch(setShowPalette(open))}
                className="tour-add-node"
              />
              <Button
                variant="outline"
                className="h-7 shadow-none bg-secondary border border-border hover:bg-muted text-xs cursor-pointer tour-test"
                onClick={() => dispatch(setShowTestPanel(true))}
              >
                <Beaker className="size-3.5" />
                <span>Test</span>
              </Button>
              <Button
                variant="outline"
                className="h-7 shadow-none bg-secondary border border-border hover:bg-muted text-xs cursor-pointer"
                onClick={() => setShowMinimap(!showMinimap)}
              >
                {showMinimap ? (
                  <Eye className="size-3.5" />
                ) : (
                  <EyeOff className="size-3.5" />
                )}
                <span>Minimap</span>
              </Button>
              <Button
                size="sm"
                variant="default"
                className="h-7 shadow-none text-xs px-3 tour-save cursor-pointer"
                onClick={saveWorkflow}
                disabled={isSaving || !hasUnsavedChanges}
              >
                <Save className="h-3.5 w-3.5 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
            {isSaving && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] overflow-hidden z-10">
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 50%, rgba(0,0,0,0) 100%)",
                    animation: "border-trail 1.5s ease-in-out infinite",
                    transform: "scaleX(2)",
                    transformOrigin: "left",
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden min-h-0">
            <div
              ref={reactFlowWrapper}
              className="flex-1 relative bg-background min-h-0"
            >
              <ReactFlow
                nodes={reactFlowNodes}
                edges={reactFlowEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                onNodeContextMenu={onNodeContextMenu}
                onPaneContextMenu={onPaneContextMenu}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
              >
                <Controls className="border border-neutral-300 text-black dark:text-white bg-white dark:bg-neutral-900" />
                {showMinimap && (
                  <MiniMap className="border border-neutral-300 bg-white/70" />
                )}
                <Background gap={12} size={0.3} />
              </ReactFlow>

              {/* Context Menu */}
              <WorkflowContextMenu
                contextMenu={contextMenu}
                selectedNode={selectedNode}
                hasClipboard={clipboard.length > 0}
                onCopy={handleContextMenuCopy}
                onCut={handleContextMenuCut}
                onPaste={handleContextMenuPaste}
                onDelete={handleContextMenuDelete}
                onConfigure={configureNode}
                onClose={closeContextMenu}
              />
            </div>
          </div>
        </div>

        {(selectedNode || showTestPanel) && (
          <div className="w-[350px] border-l border-border bg-background flex flex-col shrink-0 overflow-hidden">
            {selectedNode ? (
              <NodeConfigPanelNew
                node={selectedNode}
                onClose={() => dispatch(setSelectedNode(null))}
                onUpdate={updateNodeData}
              />
            ) : showTestPanel ? (
              <TestPanel
                nodes={nodes}
                onClose={() => dispatch(setShowTestPanel(false))}
                onRunWorkflow={runWorkflow}
                executionLogs={executionLogs}
                finalResponse={finalResponse as TestData | null}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

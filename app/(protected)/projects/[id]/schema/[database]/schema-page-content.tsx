"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeChange,
  type OnConnect,
  type Node as RFNode,
  type Edge as RFEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toast } from "sonner";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import type { SchemaNode, SchemaEdge } from "@/types/schema-types";
import {
  setDataBase,
  setProjectID,
  fetchSchemaCanvas,
  createSchemaCanvas,
  updateSchemaCanvas,
  generateSchemaCanvas,
  createEdge as createEdgeAction,
  updateNodePosition,
  undo,
  redo,
  selectSchemaForAPI,
  selectCanUndo,
  selectCanRedo,
  createTable,
  deleteTable,
  deleteEdge,
} from "@/lib/redux/slices/schemaCanvasSlice";
import {
  toReactFlowNodes,
  toReactFlowEdges,
} from "@/components/schema/mappingHelpers";
import DatabaseSchemaNode from "@/components/schema/DatabaseSchemaNode";
import SchemaBuilderSheet from "@/components/schema/SchemaBuilderSheet";
import TableDetailsSheet from "@/components/schema/TableDetailsSheet";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as TooltipShadCn,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Undo,
  Redo,
  // Download,
  Save,
  Zap,
  Loader2,
  Plus,
  Key,
  Hash,
  Fingerprint,
  Circle,
  Diamond,
} from "lucide-react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { userApi } from "@/lib/api/user";

const nodeTypes = { databaseSchema: DatabaseSchemaNode };
const defaultEdgeOptions = {
  type: "step",
  animated: true,
  style: { strokeWidth: 2, stroke: "#94a3b8" },
};

const getSchemaTourKey = (userId: string) => `tour_done_schema_page_${userId}`;

export default function SchemaPageContent() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const projectId = params.id as string;
  const currentDatabase = params.database as string;

  // Redux state
  const schemaCanvas = useSelector((state: RootState) => state.schemaCanvas);
  const schemaForAPI = useSelector(selectSchemaForAPI);
  const canUndo = useSelector(selectCanUndo);
  const canRedo = useSelector(selectCanRedo);

  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?._id;

  const { isDirty, isSaving, isGenerating } = schemaCanvas.ui;
  const isSavingRef = useRef(false);

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);

  const [toursSynced, setToursSynced] = useState(false);

  // ReactFlow state
  const nodes = Object.values(schemaCanvas.nodes.entities).filter(
    Boolean
  ) as SchemaNode[];
  const edges = Object.values(schemaCanvas.edges.entities).filter(
    Boolean
  ) as SchemaEdge[];
  const [rfNodes, setRfNodes, onNodesChangeInternal] = useNodesState(
    toReactFlowNodes(nodes)
  );
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(
    toReactFlowEdges(edges)
  );

  // Initialize schema canvas
  useEffect(() => {
    const initializeSchema = async () => {
      if (!projectId || !currentDatabase || isInitialized) return;
      try {
        dispatch(setProjectID(projectId));
        dispatch(setDataBase(currentDatabase as "mongodb" | "platform"));
        toast.loading("Loading schema...", { id: "schema-load" });
        const result = await dispatch(
          fetchSchemaCanvas({ projectId, database: currentDatabase })
        ).unwrap();
        if (result) {
          toast.success("Schema loaded", { id: "schema-load", duration: 2000 });
        } else {
          toast.info("Creating new schema...", { id: "schema-load" });
          await dispatch(
            createSchemaCanvas({
              projectId,
              dataBase: currentDatabase,
              nodes: [],
              edges: [],
            })
          ).unwrap();
          toast.success("New schema created", {
            id: "schema-load",
            duration: 2000,
          });
        }
        setIsInitialized(true);
      } catch (err) {
        toast.error("Failed to initialize schema", {
          id: "schema-load",
          description: err as string,
        });
      }
    };
    initializeSchema();
  }, [projectId, currentDatabase, dispatch, isInitialized]);

  // Reset initialization when database changes
  useEffect(() => {
    setIsInitialized(false);
  }, [currentDatabase]);

  // Sync Redux → ReactFlow
  useEffect(() => {
    const n = Object.values(schemaCanvas.nodes.entities).filter(
      Boolean
    ) as SchemaNode[];
    setRfNodes(toReactFlowNodes(n));
  }, [schemaCanvas.nodes, setRfNodes]);

  useEffect(() => {
    const e = Object.values(schemaCanvas.edges.entities).filter(
      Boolean
    ) as SchemaEdge[];
    setRfEdges(toReactFlowEdges(e));
  }, [schemaCanvas.edges, setRfEdges]);

  // Sync schema-page tour from backend to localStorage
  useEffect(() => {
    async function syncSchemaTour() {
      if (!userId) return;
      try {
        const res = await userApi.getTours();
        const tours = res.tours || {};

        if (tours.schemaPageTour === true) {
          localStorage.setItem(getSchemaTourKey(userId), "true");
        }
      } catch (err) {
        console.warn("Failed to sync schema tour:", err);
      } finally {
        setToursSynced(true);
      }
    }
    setToursSynced(false);
    syncSchemaTour();
  }, [userId]);

  // ------- Add this useEffect (tour) ------- //
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userId) return;
    if (!toursSynced) return;

    const TOUR_KEY = getSchemaTourKey(userId);
    if (localStorage.getItem(TOUR_KEY) === "true") return;

    const waitForSelectors = (selectors: string[], timeout = 5000) =>
      new Promise<boolean>((resolve) => {
        const start = Date.now();
        const iv = setInterval(() => {
          const allFound = selectors.every((s) => !!document.querySelector(s));
          if (allFound) {
            clearInterval(iv);
            resolve(true);
          } else if (Date.now() - start > timeout) {
            clearInterval(iv);
            resolve(false);
          }
        }, 150);
      });

    const buildStepsFromMapping = (): DriveStep[] => {
      const steps: DriveStep[] = [];

      const pushIfExists = (
        selector: string,
        popover: DriveStep["popover"]
      ) => {
        const el = document.querySelector(selector);
        if (el) {
          steps.push({
            element: selector,
            popover,
          });
        }
      };

      pushIfExists(".tour-undo", {
        title: "Undo",
        description: "Revert the last change in the schema editor.",
        side: "bottom",
      });

      pushIfExists(".tour-redo", {
        title: "Redo",
        description: "Re-apply an undone change.",
        side: "bottom",
      });

      pushIfExists(".tour-add-table", {
        title: "Add Table",
        description: "Create a new table (collection) in the schema canvas.",
        side: "bottom",
      });

      pushIfExists(".tour-save", {
        title: "Save",
        description: "Save your schema to the project (persist changes).",
        side: "bottom",
      });

      pushIfExists(".tour-generate", {
        title: "Generate",
        description:
          "Generate runtime collections / scaffold code from the current schema.",
        side: "bottom",
      });

      pushIfExists(".tour-table-node", {
        title: "Table Node",
        description:
          "This is a table node on the canvas. Click to edit fields.",
        side: "right",
      });

      pushIfExists(".tour-node-settings", {
        title: "Table Settings",
        description: "Open table settings to configure name / options.",
        side: "right",
      });

      pushIfExists(".tour-node-delete", {
        title: "Delete Table",
        description: "Remove this table from the schema canvas.",
        side: "right",
      });

      pushIfExists(".tour-node-add-field", {
        title: "Add Field",
        description: "Add a new field/column to the table.",
        side: "bottom",
      });

      pushIfExists(".tour-node-connector", {
        title: "Connectors",
        description:
          "Use these handles to create relationships between tables (drag to connect).",
        side: "left",
      });

      pushIfExists(".tour-field-row", {
        title: "Field Row",
        description:
          "Each row represents a field — click to rename, change type or delete.",
        side: "right",
      });

      return steps;
    };

    (async () => {
      // wait for top-bar elements quickly; node elements may come later
      await waitForSelectors(
        [
          ".tour-undo",
          ".tour-redo",
          ".tour-add-table",
          ".tour-save",
          ".tour-generate",
        ],
        3000
      );

      // Always build steps only from elements actually present
      const steps = buildStepsFromMapping();
      if (steps.length === 0) {
        // nothing to show
        return;
      }

      const tour = driver({
        showProgress: true,
        steps,
        onDestroyed: async () => {
          try {
            localStorage.setItem(TOUR_KEY, "true");
            await userApi.updateTourStatus({
              tourKey: "schemaPageTour",
              completed: true,
            });
          } catch (err) {
            console.warn("Failed to update schema tour:", err);
          }
        },
      });

      // small delay to let layout settle (especially ReactFlow)
      setTimeout(() => {
        tour.drive();
      }, 250);
    })();
  }, [toursSynced, userId]);

  // ReactFlow handlers
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updated = [...rfNodes];
      let hasPos = false;
      changes.forEach((c) => {
        if (c.type === "position" && c.dragging && c.position) {
          const idx = updated.findIndex((n) => n.id === c.id);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], position: c.position };
            hasPos = true;
          }
        }
      });
      if (hasPos) setRfNodes(updated);
      onNodesChangeInternal(changes);
    },
    [rfNodes, setRfNodes, onNodesChangeInternal]
  );

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: RFNode) => {
      dispatch(updateNodePosition({ id: node.id, position: node.position }));
    },
    [dispatch]
  );

  const handleConnect: OnConnect = useCallback(
    (conn) => {
      dispatch(
        createEdgeAction({
          sourceNode: conn.source!,
          targetNode: conn.target!,
          sourceHandle: conn.sourceHandle!,
          targetHandle: conn.targetHandle!,
        })
      );
    },
    [dispatch]
  );

  const handleNodesDelete = useCallback(
    (nodesToDel: RFNode[]) => {
      nodesToDel.forEach((n) => dispatch(deleteTable({ nodeId: n.id })));
      toast.info(`Deleted ${nodesToDel.length} table(s)`);
    },
    [dispatch]
  );

  const handleEdgesDelete = useCallback(
    (edgesToDel: RFEdge[]) => {
      edgesToDel.forEach((e) => dispatch(deleteEdge({ edgeId: e.id })));
      toast.info(`Deleted ${edgesToDel.length} connection(s)`);
    },
    [dispatch]
  );

  // Action handlers
  const handleAddTable = () => {
    dispatch(
      createTable({
        label: "New Table",
        position: { x: 250, y: 250 },
        fields: [],
        isEditing: true,
      })
    );
  };

  // const handleExportJson = () => {
  //   const blob = new Blob([JSON.stringify(schemaForAPI, null, 2)], {
  //     type: "application/json",
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `schema-${currentDatabase}-${Date.now()}.json`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  //   toast.success("Schema exported");
  // };

  const handleManualSave = async () => {
    if (!schemaCanvas.projectId || !isDirty || isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      await dispatch(updateSchemaCanvas(schemaForAPI)).unwrap();
      toast.success("Schema saved", { duration: 2000 });
    } catch (err) {
      toast.error("Save failed", { description: err as string });
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleGenerate = async () => {
    if (!schemaCanvas.projectId || !schemaCanvas.dataBase) {
      toast.error("Missing project info");
      return;
    }
    try {
      if (isDirty && !isSavingRef.current) {
        toast.info("Saving before generation...");
        isSavingRef.current = true;
        await dispatch(updateSchemaCanvas(schemaForAPI)).unwrap();
        isSavingRef.current = false;
      }
      toast.loading("Generating schema...", { id: "generate" });
      const result = await dispatch(
        generateSchemaCanvas({
          projectId: schemaCanvas.projectId,
          database: schemaCanvas.dataBase,
        })
      ).unwrap();
      toast.success("Schema generated!", {
        id: "generate",
        description: `Created ${result.createdCollections.length} collection(s)`,
      });
    } catch (err) {
      toast.error("Generation failed", {
        id: "generate",
        description: err as string,
      });
    }
  };

  if (schemaCanvas.isLoading || !isInitialized) {
    return (
      <>
        {/* Top Bar Skeleton */}
        <div className="relative flex w-full h-12 min-h-12 items-center justify-between border-b border-neutral-300 px-3 gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="size-7 rounded-md" />
            <div className="w-px h-5 bg-neutral-300 mx-1" />
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
        </div>
        {/* Canvas Loading */}
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        {/* Footer Skeleton */}
        <div className="h-9 border-t border-neutral-300 bg-white flex items-center justify-center gap-6 px-4 shrink-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Skeleton className="size-3.5 rounded" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <div className="relative flex w-full h-12 min-h-12 items-center justify-between border-b border-border px-3 gap-4">
        <div className="flex items-center gap-2">
          <TooltipShadCn>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="size-7 shadow-none border-border tour-undo"
                onClick={() => dispatch(undo())}
                disabled={!canUndo}
              >
                <Undo className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </TooltipShadCn>
          <TooltipShadCn>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="size-7 shadow-none border-border tour-redo"
                onClick={() => dispatch(redo())}
                disabled={!canRedo}
              >
                <Redo className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </TooltipShadCn>
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs shadow-none border-border gap-1.5 tour-add-table"
            onClick={handleAddTable}
          >
            <Plus className="size-3.5" />
            Add Table
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs shadow-none border-neutral-300 gap-1.5"
            onClick={handleExportJson}
          >
            <Download className="size-3.5" />
            Export
          </Button> */}
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs shadow-none border-border gap-1.5 tour-save"
            onClick={handleManualSave}
            disabled={isSaving || !isDirty}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                Save
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs gap-1.5 tour-generate"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="size-3.5" />
                Generate
              </>
            )}
          </Button>
          {isDirty && !isSaving && (
            <span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950 px-2 py-1 dark:py-1.5 rounded border border-orange-200 dark:border-none">
              Unsaved
            </span>
          )}
          {!isDirty && schemaCanvas.ui.lastSavedAt && (
            <span className="text-xs text-green-600 bg-green-50  dark:bg-green-950 px-2 py-1 dark:py-1.5 rounded border border-green-200 dark:border-none">
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeDragStop={handleNodeDragStop}
          onNodesDelete={handleNodesDelete}
          onEdgesDelete={handleEdgesDelete}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          deleteKeyCode="Delete"
          elementsSelectable
          nodesConnectable
          nodesDraggable
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background variant={BackgroundVariant.Cross} gap={16} size={0.3} />
          <MiniMap nodeStrokeWidth={3} zoomable pannable className="" />
          <Controls className="text-neutral-950" />
        </ReactFlow>
      </div>

      {/* Bottom Footer - Legend */}
      <div className="h-9 border-t border-border bg-background flex items-center justify-center gap-6 px-4 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Key className="size-3.5 text-amber-500" />
          <span>Primary key</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Hash className="size-3.5 text-blue-500" />
          <span>Identity</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Fingerprint className="size-3.5 text-purple-500" />
          <span>Unique</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Circle className="size-3.5 text-neutral-400" />
          <span>Nullable</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Diamond className="size-3.5 text-neutral-700 fill-neutral-700" />
          <span>Non-Nullable</span>
        </div>
      </div>

      <SchemaBuilderSheet />
      <TableDetailsSheet />
    </>
  );
}

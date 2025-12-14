"use client";

import React, { useCallback, useEffect, useRef } from "react";
import "@xyflow/react/dist/style.css";
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
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import type { SchemaNode, SchemaEdge } from "@/types/schema-types";

import DatabaseSchemaNode from "./DatabaseSchemaNode";
import SchemaBuilderSheet from "./SchemaBuilderSheet";
import TableDetailsSheet from "./TableDetailsSheet";
import { toReactFlowNodes, toReactFlowEdges } from "./mappingHelpers";
import {
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
  updateSchemaCanvas,
  generateSchemaCanvas,
} from "@/lib/redux/slices/schemaCanvasSlice";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Undo, Redo, Plus, Download, Zap, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const nodeTypes = {
  databaseSchema: DatabaseSchemaNode,
};

const defaultEdgeOptions = {
  type: "step",
  animated: true,
  style: {
    strokeWidth: 2,
    stroke: "#94a3b8",
  },
};

type SchemaCanvasProps = {
  projectId: string;
  name: string;
  nodes: SchemaNode[];
  edges: SchemaEdge[];
};

export default function SchemaCanvas({
  nodes: initialNodes,
  edges: initialEdges,
}: SchemaCanvasProps) {
  const [rfNodes, setRfNodes, onNodesChangeInternal] = useNodesState(
    toReactFlowNodes(initialNodes)
  );
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(
    toReactFlowEdges(initialEdges)
  );

  const dispatch = useDispatch<AppDispatch>();
  const schemaCanvas = useSelector((state: RootState) => state.schemaCanvas);
  const schemaForAPI = useSelector(selectSchemaForAPI);
  const canUndo = useSelector(selectCanUndo);
  const canRedo = useSelector(selectCanRedo);

  const { isDirty, isSaving, isGenerating } = schemaCanvas.ui;
  const isSavingRef = useRef(false);

  // Sync Redux → ReactFlow
  useEffect(() => {
    const nodes = Object.values(schemaCanvas.nodes.entities).filter(
      Boolean
    ) as SchemaNode[];
    setRfNodes(toReactFlowNodes(nodes));
  }, [schemaCanvas.nodes, setRfNodes]);

  useEffect(() => {
    const edges = Object.values(schemaCanvas.edges.entities).filter(
      Boolean
    ) as SchemaEdge[];
    setRfEdges(toReactFlowEdges(edges));
  }, [schemaCanvas.edges, setRfEdges]);


  // Handle node changes (positions during drag)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = [...rfNodes];
      let hasPositionChanges = false;

      changes.forEach((change) => {
        if (change.type === "position" && change.dragging && change.position) {
          const nodeIndex = updatedNodes.findIndex((n) => n.id === change.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position: change.position,
            };
            hasPositionChanges = true;
          }
        }
      });

      if (hasPositionChanges) {
        setRfNodes(updatedNodes);
      }

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
    (connection) => {
      const newEdgePayload = {
        sourceNode: connection.source!,
        targetNode: connection.target!,
        sourceHandle: connection.sourceHandle!,
        targetHandle: connection.targetHandle!,
      };
      dispatch(createEdgeAction(newEdgePayload));
    },
    [dispatch]
  );

  const handleNodesDelete = useCallback(
    (nodesToDelete: RFNode[]) => {
      nodesToDelete.forEach((node) => {
        dispatch(deleteTable({ nodeId: node.id }));
      });
      toast.info(`Deleted ${nodesToDelete.length} table(s)`);
    },
    [dispatch]
  );

  const handleEdgesDelete = useCallback(
    (edgesToDelete: RFEdge[]) => {
      edgesToDelete.forEach((edge) => {
        dispatch(deleteEdge({ edgeId: edge.id }));
      });
      toast.info(`Deleted ${edgesToDelete.length} connection(s)`);
    },
    [dispatch]
  );

  const handleExportJson = () => {
    const dataStr = JSON.stringify(schemaForAPI, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schema-${schemaCanvas.dataBase}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Schema exported successfully");
  };

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

  const handleManualSave = async () => {
    if (!schemaCanvas.projectId || !isDirty || isSavingRef.current) return;

    isSavingRef.current = true;
    try {
      await dispatch(updateSchemaCanvas(schemaForAPI)).unwrap();
      toast.success("Schema saved successfully", { duration: 2000 });
    } catch (error) {
      toast.error("Save failed", {
        description: error as string,
        duration: 4000,
      });
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleGenerate = async () => {
    if (!schemaCanvas.projectId || !schemaCanvas.dataBase) {
      toast.error("Missing project information");
      return;
    }

    try {
      if (isDirty && !isSavingRef.current) {
        toast.info("Saving schema before generation...");
        isSavingRef.current = true;
        await dispatch(updateSchemaCanvas(schemaForAPI)).unwrap();
        isSavingRef.current = false;
      }

      toast.loading("Generating database schema...", { id: "generate" });

      const result = await dispatch(
        generateSchemaCanvas({
          projectId: schemaCanvas.projectId,
          database: schemaCanvas.dataBase,
        })
      ).unwrap();

      toast.success("Schema generated successfully!", {
        id: "generate",
        description: `Created ${result.createdCollections.length} collection(s)`,
        duration: 5000,
      });

      if (result.createdCollections.length > 0) {
        toast.info(`Collections: ${result.createdCollections.join(", ")}`, {
          duration: 5000,
        });
      }

      if (result.deletedCount > 0) {
        toast.warning(`Removed ${result.deletedCount} old collection(s)`, {
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error("Generation failed", {
        id: "generate",
        description: error as string,
        duration: 5000,
      });
    }
  };

  return (
    <div className="h-[91vh] relative w-full flex flex-col shadow-lg">
      <div className="p-4 absolute top-0 z-10 right-1/2 flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            onClick={() => dispatch(undo())}
            disabled={!canUndo}
            className="bg-white"
            title="Undo"
          >
            <Undo className="h-4 w-4 text-black" />
          </Button>
          <Button
            size="icon"
            onClick={() => dispatch(redo())}
            disabled={!canRedo}
            className="bg-white"
            title="Redo"
          >
            <Redo className="h-4 w-4 text-black" />
          </Button>

          <Button
            variant="outline"
            onClick={handleExportJson}
            title="Export schema as JSON"
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>

          <Button
            variant="outline"
            onClick={handleManualSave}
            disabled={isSaving || !isDirty || !schemaCanvas.projectId}
            title="Save schema changes"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>

          <Button
            variant="default"
            onClick={handleGenerate}
            disabled={isGenerating || !schemaCanvas.projectId}
            title="Generate database schema"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>

          <Button onClick={handleAddTable}>
            <Plus className="mr-2 h-4 w-4" /> Add Table
          </Button>

          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1 rounded">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}
          {!isSaving && isDirty && (
            <div className="text-sm text-orange-600 bg-white px-3 py-1 rounded">
              Unsaved changes
            </div>
          )}
          {!isSaving && !isDirty && schemaCanvas.ui.lastSavedAt && (
            <div className="text-sm text-green-600 bg-white px-3 py-1 rounded">
              Saved
            </div>
          )}
        </div>
      </div>
      <CardContent className="p-0 flex-1 relative">
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
          elementsSelectable={true}
          nodesConnectable={true}
          nodesDraggable={true}
          selectNodesOnDrag={false}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background variant={BackgroundVariant.Cross} gap={16} size={1} />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Controls />
        </ReactFlow>
      </CardContent>
      <SchemaBuilderSheet />
      <TableDetailsSheet />
    </div>
  );
}

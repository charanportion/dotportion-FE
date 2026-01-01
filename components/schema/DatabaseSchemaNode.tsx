"use client";

import React, { useEffect, useRef, useState } from "react";
import { Position, Handle } from "@xyflow/react";
import { useDispatch } from "react-redux";
import {
  openSchemaSheet,
  deleteTable,
  removeFieldFromTable,
  updateFieldInTable,
  addFieldToTable,
  updateNode,
} from "@/lib/redux/slices/schemaCanvasSlice";
import type { Field } from "@/types/schema-types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Settings,
  Table2,
  Trash2,
  Key,
  Fingerprint,
  Circle,
  Diamond,
  ExternalLink,
} from "lucide-react";
import { nanoid } from "@reduxjs/toolkit";
import { cn } from "@/lib/utils";

type DatabaseSchemaData = {
  label: string;
  schema: Field[];
  isEditing?: boolean;
};

type DatabaseSchemaNodeProps = {
  id: string;
  data: DatabaseSchemaData;
};

const DatabaseSchemaNode: React.FC<DatabaseSchemaNodeProps> = ({
  id,
  data,
}) => {
  const dispatch = useDispatch();
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingTableName, setEditingTableName] = useState(false);
  const [tableName, setTableName] = useState(data.label);
  const fieldInputRef = useRef<HTMLInputElement>(null);
  const tableNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.isEditing && tableNameInputRef.current) {
      setEditingTableName(true);
      setTimeout(() => {
        tableNameInputRef.current?.focus();
        tableNameInputRef.current?.select();
      }, 0);
    }
  }, [data.isEditing]);

  useEffect(() => {
    if (editingFieldId && fieldInputRef.current) {
      setTimeout(() => fieldInputRef.current?.focus(), 0);
    }
  }, [editingFieldId]);

  const handleAddField = () => {
    const newFieldId = nanoid();
    const newField: Field = {
      id: newFieldId,
      name: "",
      type: "string",
      handleType: "none",
    };
    dispatch(addFieldToTable({ nodeId: id, field: newField }));
    setTimeout(() => {
      setEditingFieldId(newFieldId);
      setEditingName("");
    }, 0);
  };

  const handleDeleteTable = () => {
    dispatch(deleteTable({ nodeId: id }));
  };

  const handleOpenDetails = () => {
    dispatch(
      openSchemaSheet({ open: true, mode: "table_details", tableId: id })
    );
  };

  const handleTableNameClick = () => {
    setEditingTableName(true);
    setTableName(data.label);
  };

  const handleTableNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTableName(e.target.value);

  const handleTableNameBlur = () => {
    const trimmed = tableName.trim();
    if (trimmed && trimmed !== data.label) {
      dispatch(updateNode({ nodeId: id, patch: { label: trimmed } }));
    } else if (!trimmed) {
      setTableName(data.label);
    }
    setEditingTableName(false);
  };

  const handleTableNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTableNameBlur();
    } else if (e.key === "Escape") {
      setTableName(data.label);
      setEditingTableName(false);
    }
  };

  const handleNameClick = (field: Field) => {
    if (field.name === "_id") return;
    setEditingFieldId(field.id);
    setEditingName(field.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditingName(e.target.value);

  const handleNameBlur = (field: Field) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      dispatch(removeFieldFromTable({ nodeId: id, fieldId: field.id }));
    } else if (trimmed !== field.name) {
      const updated = {
        ...field,
        name: trimmed,
        handleType: (field.type === "objectId" ? "both" : "none") as
          | "both"
          | "none",
      };
      dispatch(updateFieldInTable({ nodeId: id, field: updated }));
    }
    setEditingFieldId(null);
    setEditingName("");
  };

  const handleNameKeyDown = (e: React.KeyboardEvent, field: Field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNameBlur(field);
    } else if (e.key === "Escape") {
      if (!editingName.trim())
        dispatch(removeFieldFromTable({ nodeId: id, fieldId: field.id }));
      setEditingFieldId(null);
      setEditingName("");
    }
  };

  const handleTypeChange = (field: Field, newType: string) => {
    let handleType: "both" | "none" = "none";
    if (newType === "objectId") handleType = "both";
    else if (newType === "array" && field.arrayItemType === "objectId")
      handleType = "both";
    const updated: Field = {
      ...field,
      type: newType,
      handleType,
      arrayItemType: newType === "array" ? field.arrayItemType : undefined,
    };
    dispatch(updateFieldInTable({ nodeId: id, field: updated }));
  };

  const renderFieldIndicators = (field: Field) => {
    const indicators = [];

    if (field.name === "_id") {
      indicators.push(
        <Tooltip key="pk">
          <TooltipTrigger asChild>
            <Key className="size-3 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Primary Key
          </TooltipContent>
        </Tooltip>
      );
    }

    if (field.unique) {
      indicators.push(
        <Tooltip key="unique">
          <TooltipTrigger asChild>
            <Fingerprint className="size-3 text-purple-500" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Unique
          </TooltipContent>
        </Tooltip>
      );
    }

    if (field.required) {
      indicators.push(
        <Tooltip key="required">
          <TooltipTrigger asChild>
            <Diamond className="size-3 text-neutral-700 fill-neutral-700" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Required
          </TooltipContent>
        </Tooltip>
      );
    } else if (field.name !== "_id") {
      indicators.push(
        <Tooltip key="nullable">
          <TooltipTrigger asChild>
            <Circle className="size-3 text-neutral-400" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Nullable
          </TooltipContent>
        </Tooltip>
      );
    }

    if (
      field.type === "objectId" ||
      (field.type === "array" && field.arrayItemType === "objectId")
    ) {
      indicators.push(
        <Tooltip key="ref">
          <TooltipTrigger asChild>
            <ExternalLink className="size-3 text-sky-500" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Reference
          </TooltipContent>
        </Tooltip>
      );
    }

    return indicators.length > 0 ? (
      <div className="flex items-center gap-0.5">{indicators}</div>
    ) : null;
  };

  return (
    <div
      className="min-w-72 bg-card border border-border rounded-lg shadow-sm relative"
      style={{ pointerEvents: "all" }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 flex flex-row items-center justify-between border-b border-border bg-secondary rounded-t-lg">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-muted-foreground" />
          {editingTableName ? (
            <Input
              ref={tableNameInputRef}
              value={tableName}
              onChange={handleTableNameChange}
              onBlur={handleTableNameBlur}
              onKeyDown={handleTableNameKeyDown}
              className="h-7 text-sm font-semibold px-2 w-40"
              placeholder="Table name..."
            />
          ) : (
            <span
              className="text-sm font-semibold cursor-pointer hover:bg-muted px-2 py-0.5 rounded transition-colors"
              onClick={handleTableNameClick}
            >
              {data.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 tour-node-settings"
                onClick={handleOpenDetails}
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Table Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 tour-node-delete"
                onClick={handleDeleteTable}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Table</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Fields */}
      <div className="py-1">
        {data.schema.length === 0 ? (
          <p className="px-3 py-3 text-sm text-muted-foreground italic text-center">
            No fields defined
          </p>
        ) : (
          data.schema.map((field) => (
            <div
              key={field.id}
              className="group relative px-3 py-1.5 hover:bg-muted transition-colors tour-field-row"
            >
              {(field.handleType === "target" ||
                field.handleType === "both") && (
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`tgt-${field.id}`}
                  className="!w-2.5 !h-2.5 !bg-sky-500 !border-2 !border-white tour-node-connector"
                />
              )}

              <div className="flex items-center gap-2">
                {/* Indicators */}
                <div className="w-12 flex items-center justify-start gap-0.5 shrink-0">
                  {renderFieldIndicators(field)}
                </div>

                {/* Field Name */}
                <div className="flex-1 min-w-0">
                  {editingFieldId === field.id ? (
                    <Input
                      ref={fieldInputRef}
                      value={editingName}
                      onChange={handleNameChange}
                      onBlur={() => handleNameBlur(field)}
                      onKeyDown={(e) => handleNameKeyDown(e, field)}
                      className="h-6 text-xs px-1.5"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={cn(
                        "text-xs font-mono",
                        field.name === "_id"
                          ? "cursor-default text-foreground"
                          : "cursor-pointer hover:text-primary"
                      )}
                      onClick={() => handleNameClick(field)}
                    >
                      {field.name}
                    </span>
                  )}
                </div>

                {/* Field Type */}
                <div className="flex items-center gap-1 shrink-0">
                  {field.name === "_id" ? (
                    <span className="text-xs text-muted-foreground font-mono">
                      {field.type}
                    </span>
                  ) : (
                    <Select
                      value={field.type}
                      onValueChange={(v) => handleTypeChange(field, v)}
                    >
                      <SelectTrigger className="h-5 w-auto min-w-[70px] text-[11px] border-border bg-input shadow-none px-1.5 font-mono text-muted-foreground hover:text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">string</SelectItem>
                        <SelectItem value="number">number</SelectItem>
                        <SelectItem value="boolean">boolean</SelectItem>
                        <SelectItem value="date">date</SelectItem>
                        <SelectItem value="objectId">objectId</SelectItem>
                        <SelectItem value="array">array</SelectItem>
                        <SelectItem value="mixed">mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {field.name !== "_id" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        dispatch(
                          removeFieldFromTable({
                            nodeId: id,
                            fieldId: field.id,
                          })
                        )
                      }
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>

              {(field.handleType === "source" ||
                field.handleType === "both") && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`src-${field.id}`}
                  className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white tour-node-connector"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Field Button */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="h-6 w-6 rounded-full shadow-md tour-node-add-field"
              onClick={handleAddField}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Field</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default React.memo(DatabaseSchemaNode);

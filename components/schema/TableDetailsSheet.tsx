"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import type { Field, SchemaNode } from "@/types/schema-types";
import {
  closeSchemaSheet,
  updateFieldInTable,
  updateNode,
} from "@/lib/redux/slices/schemaCanvasSlice";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";

function getHandleType(type: string, arrayItemType?: string): "both" | "none" {
  if (type === "objectId") {
    return "both";
  }
  if (type === "array" && arrayItemType === "objectId") {
    return "both";
  }
  return "none";
}

export default function TableDetailsSheet() {
  const dispatch = useDispatch();
  const sheetState = useSelector(
    (s: RootState) => s.schemaCanvas.ui.schemaSheet
  );
  const nodesMap = useSelector((s: RootState) => s.schemaCanvas.nodes.entities);

  const [tableName, setTableName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);

  const isOpen = sheetState.open && sheetState.mode === "table_details";
  const tableId = isOpen ? sheetState.tableId : "";
  const currentNode = tableId ? (nodesMap[tableId] as SchemaNode) : null;

  useEffect(() => {
    if (isOpen && currentNode) {
      setTableName(currentNode.label);
      setFields([...currentNode.fields]);
    }
  }, [isOpen, currentNode]);

  const handleClose = () => dispatch(closeSchemaSheet());

  // Only update local state on change
  const handleTableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableName(e.target.value);
  };

  // Dispatch to Redux only on blur
  const handleTableNameBlur = () => {
    const trimmedName = tableName.trim();
    if (tableId && trimmedName && trimmedName !== currentNode?.label) {
      dispatch(
        updateNode({
          nodeId: tableId,
          patch: { label: trimmedName },
        })
      );
    } else if (!trimmedName && currentNode?.label) {
      // Revert to original if empty
      setTableName(currentNode.label);
    }
  };

  // Handle Enter key
  const handleTableNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setTableName(currentNode?.label || "");
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<Field>) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !tableId) return;

    // Create updated field with proper handleType
    const updatedField = { ...field, ...updates };

    // Determine handleType based on type and arrayItemType
    updatedField.handleType = getHandleType(
      updatedField.type,
      updatedField.arrayItemType
    );

    // Clear arrayItemType if type is no longer array
    if (updatedField.type !== "array") {
      updatedField.arrayItemType = undefined;
    }

    // Update local state
    setFields((prev) => prev.map((f) => (f.id === fieldId ? updatedField : f)));

    // Dispatch to Redux (this will trigger edge cleanup in the reducer)
    dispatch(
      updateFieldInTable({
        nodeId: tableId,
        field: updatedField,
      })
    );
  };

  if (!isOpen || !currentNode) return null;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto ">
        <SheetHeader className="flex flex-col gap-1">
          <SheetTitle className="flex items-center gap-2 font-inter text-[16px] font-medium text-foreground">
            Table Details
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
            Manage table name and field properties
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Table Name Section */}
          <div className="space-y-2 px-3">
            <Label htmlFor="table-name" className="text-sm font-inter">
              Table/Collection Name
            </Label>
            <Input
              id="table-name"
              value={tableName}
              onChange={handleTableNameChange}
              onBlur={handleTableNameBlur}
              onKeyDown={handleTableNameKeyDown}
              placeholder="e.g., users"
              className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter text-xs"
            />
          </div>

          {/* Fields Accordion */}
          <div className="space-y-2 p-4">
            <Label className="text-sm font-inter text-foreground">Fields</Label>
            <Accordion type="single" collapsible className="w-full">
              {fields.map((field) => (
                <AccordionItem key={field.id} value={field.id}>
                  <AccordionTrigger className="hover:no-underline ">
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="font-mono text-sm">{field.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {field.type}
                        {field.type === "array" && field.arrayItemType
                          ? `<${field.arrayItemType}>`
                          : ""}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2 px-4">
                      {/* Field Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`name-${field.id}`}
                          className="text-sm font-inter text-foreground"
                        >
                          Field Name
                        </Label>
                        <Input
                          id={`name-${field.id}`}
                          value={field.name}
                          onChange={(e) =>
                            handleFieldUpdate(field.id, {
                              name: e.target.value,
                            })
                          }
                          disabled={field.name === "_id"}
                          placeholder="e.g., email"
                          className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter  text-xs"
                        />
                      </div>

                      {/* Field Type */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`type-${field.id}`}
                          className="text-sm font-inter"
                        >
                          Type
                        </Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) =>
                            handleFieldUpdate(field.id, { type: value })
                          }
                          disabled={field.name === "_id"}
                        >
                          <SelectTrigger
                            id={`type-${field.id}`}
                            className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter w-full  text-xs"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="array">Array</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="date">Date</SelectItem>

                            <SelectItem value="number">Number</SelectItem>

                            <SelectItem value="mixed">Mixed</SelectItem>
                            <SelectItem value="objectId">ObjectId</SelectItem>

                            <SelectItem value="string">String</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Array Item Type - Only show if type is array */}
                      {field.type === "array" && (
                        <div className="space-y-2">
                          <Label
                            htmlFor={`arrayItemType-${field.id}`}
                            className="text-sm font-inter"
                          >
                            Array Item Type
                          </Label>
                          <Select
                            value={field.arrayItemType || "string"}
                            onValueChange={(value) =>
                              handleFieldUpdate(field.id, {
                                arrayItemType: value,
                              })
                            }
                          >
                            <SelectTrigger
                              id={`arrayItemType-${field.id}`}
                              className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter w-full  text-xs"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="array">Array</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                              <SelectItem value="date">Date</SelectItem>

                              <SelectItem value="number">Number</SelectItem>

                              <SelectItem value="mixed">Mixed</SelectItem>
                              <SelectItem value="objectId">ObjectId</SelectItem>

                              <SelectItem value="string">String</SelectItem>
                            </SelectContent>
                          </Select>
                          {field.arrayItemType === "objectId" && (
                            <p className="text-xs text-muted-foreground">
                              ℹ️ This field will support connections (handles)
                            </p>
                          )}
                        </div>
                      )}

                      {/* Default Value */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`default-${field.id}`}
                          className="text-sm font-inter"
                        >
                          Default Value
                        </Label>
                        <Input
                          id={`default-${field.id}`}
                          value={
                            field.default !== undefined &&
                            field.default !== null
                              ? String(field.default)
                              : ""
                          }
                          className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter  text-xs"
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            let defaultValue: unknown;

                            // Parse the value based on field type
                            if (inputValue === "") {
                              defaultValue = undefined;
                            } else if (field.type === "number") {
                              const numValue = Number(inputValue);
                              defaultValue = isNaN(numValue)
                                ? inputValue
                                : numValue;
                            } else if (field.type === "boolean") {
                              const lowerValue = inputValue.toLowerCase();
                              if (lowerValue === "true") {
                                defaultValue = true;
                              } else if (lowerValue === "false") {
                                defaultValue = false;
                              } else {
                                defaultValue = inputValue;
                              }
                            } else if (field.type === "array") {
                              // Store array representation as string
                              // Backend will parse: "[]" or "['item1', 'item2']"
                              defaultValue = inputValue;
                            } else if (field.type === "object") {
                              // Store object representation as string
                              // Backend will parse: "{}" or "{'key': 'value'}"
                              defaultValue = inputValue;
                            } else if (field.type === "date") {
                              // For dates, accept "Date.now" or ISO string
                              defaultValue = inputValue;
                            } else {
                              // string, objectId, binary
                              defaultValue = inputValue;
                            }

                            handleFieldUpdate(field.id, {
                              default: defaultValue,
                            });
                          }}
                          placeholder={
                            field.type === "string"
                              ? "e.g., John Doe"
                              : field.type === "number"
                              ? "e.g., 0"
                              : field.type === "boolean"
                              ? "true or false"
                              : field.type === "date"
                              ? "Date.now"
                              : field.type === "array"
                              ? "[]"
                              : field.type === "object"
                              ? "{}"
                              : "Default value"
                          }
                          disabled={field.name === "_id"}
                        />
                        <p className="text-xs text-muted-foreground">
                          {field.type === "date" &&
                            "Use 'Date.now' for current timestamp"}
                          {field.type === "array" &&
                            "Use '[]' for empty array or JSON format"}
                          {field.type === "object" &&
                            "Use '{}' for empty object or JSON format"}
                          {field.type === "number" && "Enter numeric value"}
                          {field.type === "boolean" &&
                            "Enter 'true' or 'false'"}
                        </p>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`description-${field.id}`}
                          className="text-sm font-inter"
                        >
                          Description
                        </Label>
                        <Input
                          id={`description-${field.id}`}
                          value={field.description || ""}
                          onChange={(e) =>
                            handleFieldUpdate(field.id, {
                              description: e.target.value,
                            })
                          }
                          className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter w-full  text-xs"
                          placeholder="Field description..."
                        />
                      </div>

                      {/* Required Toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`required-${field.id}`}
                          checked={field.required || false}
                          onCheckedChange={(checked) =>
                            handleFieldUpdate(field.id, { required: checked })
                          }
                          disabled={field.name === "_id"}
                        />
                        <Label
                          htmlFor={`required-${field.id}`}
                          className="text-sm font-inter"
                        >
                          Required
                        </Label>
                      </div>

                      {/* Unique Toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`unique-${field.id}`}
                          checked={field.unique || false}
                          onCheckedChange={(checked) =>
                            handleFieldUpdate(field.id, { unique: checked })
                          }
                          disabled={field.name === "_id"}
                        />
                        <Label
                          htmlFor={`unique-${field.id}`}
                          className="text-sm font-inter"
                        >
                          Unique
                        </Label>
                      </div>

                      {/* Index Toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`index-${field.id}`}
                          checked={field.index || false}
                          onCheckedChange={(checked) =>
                            handleFieldUpdate(field.id, { index: checked })
                          }
                          disabled={field.name === "_id"}
                        />
                        <Label
                          htmlFor={`index-${field.id}`}
                          className="text-sm font-inter"
                        >
                          Index
                        </Label>
                      </div>

                      {/* Connection Info */}
                      {(field.type === "objectId" ||
                        (field.type === "array" &&
                          field.arrayItemType === "objectId")) && (
                        <div className="bg-muted/50 p-3 rounded text-sm">
                          <p className="font-medium mb-1">Connection Type</p>
                          <p className="text-muted-foreground">
                            {field.handleType === "both"
                              ? "Both (In & Out)"
                              : field.handleType === "source"
                              ? "Source (Out only)"
                              : field.handleType === "target"
                              ? "Target (In only)"
                              : "None"}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <SheetFooter>
          <Button
            onClick={handleClose}
            variant="secondary"
            className="justify-center gap-2 text-center font-normal  cursor-pointer text-xs h-8 px-2.5 py-2"
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

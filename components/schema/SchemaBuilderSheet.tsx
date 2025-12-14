"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import type { Field, SchemaNode } from "@/types/schema-types";
import {
  closeSchemaSheet,
  createTable,
  addFieldToTable,
  updateFieldInTable,
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

const defaultField: Omit<Field, "id"> = {
  name: "",
  type: "string",
  handleType: "none",
};

export default function SchemaBuilderSheet() {
  const dispatch = useDispatch();
  const sheetState = useSelector(
    (s: RootState) => s.schemaCanvas.ui.schemaSheet
  );
  const nodesMap = useSelector((s: RootState) => s.schemaCanvas.nodes.entities);

  const [tableName, setTableName] = useState("");
  const [field, setField] = useState<Omit<Field, "id"> | Field>(defaultField);

  const isOpen =
    sheetState.open &&
    (sheetState.mode === "table" ||
      sheetState.mode === "field_add" ||
      sheetState.mode === "field_edit");

  useEffect(() => {
    if (sheetState.open) {
      if (sheetState.mode === "table") {
        setTableName("");
        setField(defaultField);
      } else if (sheetState.mode === "field_add") {
        setField(defaultField);
      } else if (sheetState.mode === "field_edit") {
        const node = nodesMap[sheetState.tableId] as SchemaNode;
        const existingField = node?.fields.find(
          (f) => f.id === sheetState.fieldId
        );
        if (existingField) {
          // Prevent editing _id field
          if (existingField.name === "_id") {
            alert("The _id field cannot be edited.");
            dispatch(closeSchemaSheet());
            return;
          }
          setField(existingField);
        }
      }
    }
  }, [sheetState, nodesMap, dispatch]);

  const handleFieldChange = (key: keyof Field, value: string) => {
    setField((prev) => {
      const updated = { ...prev, [key]: value };

      // Automatically set handleType based on type
      if (key === "type") {
        updated.handleType = (value === "objectId" ? "both" : "none") as
          | "both"
          | "none";
      }

      return updated;
    });
  };

  const handleClose = () => dispatch(closeSchemaSheet());

  const handleSubmit = () => {
    if (!sheetState.open) return;

    if (sheetState.mode === "table") {
      if (!tableName.trim()) return alert("Table name cannot be empty.");
      const newField = field.name.trim() ? [field] : [];
      dispatch(
        createTable({
          label: tableName,
          fields: newField,
          position: { x: 250, y: 250 },
        })
      );
    } else if (sheetState.mode === "field_add") {
      if (!field.name.trim()) return alert("Field name cannot be empty.");
      const fieldToAdd = {
        ...field,
        handleType: (field.type === "objectId" ? "both" : "none") as
          | "both"
          | "none",
      };
      dispatch(
        addFieldToTable({ nodeId: sheetState.tableId, field: fieldToAdd })
      );
    } else if (sheetState.mode === "field_edit") {
      if (!field.name.trim()) return alert("Field name cannot be empty.");
      const fieldToUpdate = {
        ...(field as Field),
        handleType: (field.type === "objectId" ? "both" : "none") as
          | "both"
          | "none",
      };

      dispatch(
        updateFieldInTable({
          nodeId: sheetState.tableId,
          field: fieldToUpdate,
        })
      );
    }

    handleClose();
  };

  const getTitle = () => {
    if (!isOpen) return "";
    switch (sheetState.mode) {
      case "table":
        return "Create New Table";
      case "field_add":
        return `Add Field to "${nodesMap[sheetState.tableId]?.label}"`;
      case "field_edit":
        return `Edit Field in "${nodesMap[sheetState.tableId]?.label}"`;
      default:
        return "";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription>
            {sheetState.open && sheetState.mode === "table"
              ? "Define a new table and its first field."
              : "Manage the properties of this field."}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4 px-2">
          {sheetState.open && sheetState.mode === "table" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-name" className="text-right">
                Table Name
              </Label>
              <Input
                id="table-name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., users"
              />
            </div>
          )}

          <h4 className="font-semibold mt-4 border-b pb-2">
            {sheetState.open && sheetState.mode === "table"
              ? "First Field (Optional)"
              : "Field Details"}
          </h4>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="field-name" className="text-right">
              Name
            </Label>
            <Input
              id="field-name"
              value={field.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="col-span-3"
              placeholder="e.g., email"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="field-type" className="text-right">
              Type
            </Label>
            <Select
              value={field.type}
              onValueChange={(value) => handleFieldChange("type", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="array">Array</SelectItem>
                <SelectItem value="binary">Binary</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="decimal128">Decimal128</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="int32">Int32</SelectItem>
                <SelectItem value="int64">Int64</SelectItem>
                <SelectItem value="maxkey">MaxKey</SelectItem>
                <SelectItem value="minkey">MinKey</SelectItem>
                <SelectItem value="null">Null</SelectItem>
                <SelectItem value="object">Object</SelectItem>
                <SelectItem value="objectId">ObjectId</SelectItem>
                <SelectItem value="int64">Number</SelectItem>
                <SelectItem value="bsonregexp">BSONRegExp</SelectItem>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="bsonsymbol">BSONSymbol</SelectItem>
                <SelectItem value="timestamp">TimeStamps</SelectItem>
                <SelectItem value="undefined">Undefined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="handle-type" className="text-right">
              Connection
            </Label>
            <Select
              value={field.handleType}
              onValueChange={(value) => handleFieldChange("handleType", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select handle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="source">Source (Out)</SelectItem>
                <SelectItem value="target">Target (In)</SelectItem>
                <SelectItem value="both">Both</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

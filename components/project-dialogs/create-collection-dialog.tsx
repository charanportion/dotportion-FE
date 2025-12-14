"use client";

import type React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { createSchema } from "@/lib/redux/slices/schemaSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import type { Schema, SchemaField } from "@/lib/api/schema";
import { toast } from "sonner";

interface CreateCollectionDialogProps {
  tenant: string;
  initialProvider?: string;
  projectId: string;
  children: React.ReactNode;
  onCollectionCreated?: (collectionName: string) => void;
}

interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  defaultValue: string;
  min?: number;
  max?: number;
  enumValues: string[];
  description: string;
}

export function CreateCollectionDialog({
  tenant,
  initialProvider,
  projectId,
  children,
  onCollectionCreated,
}: CreateCollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [provider, setProvider] = useState(initialProvider || "platform");
  const [fields, setFields] = useState<FieldDefinition[]>([
    {
      name: "",
      type: "String",
      required: false,
      unique: false,
      defaultValue: "",
      enumValues: [],
      description: "",
    },
  ]);

  const dispatch = useDispatch<AppDispatch>();
  const { isCreating } = useSelector((state: RootState) => state.schema);

  const fieldTypes = ["String", "Number", "Boolean", "Date", "Array", "Object"];

  const addField = () => {
    setFields([
      ...fields,
      {
        name: "",
        type: "String",
        required: false,
        unique: false,
        defaultValue: "",
        enumValues: [],
        description: "",
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const updateEnumValues = (index: number, enumString: string) => {
    const enumValues = enumString
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    updateField(index, { enumValues });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collectionName.trim()) {
      toast("Error", {
        description: "Collection name is required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    if (fields.length === 0 || !fields.some((f) => f.name.trim())) {
      toast("Error", {
        description: "At least one field is required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    // Build schema object
    const schema: Schema = {};
    fields.forEach((field) => {
      if (field.name.trim()) {
        const schemaField: SchemaField = {
          type: field.type,
        };

        if (field.required) schemaField.required = true;
        if (field.unique) schemaField.unique = true;
        if (field.min !== undefined && field.min > 0)
          schemaField.min = field.min;
        if (field.max !== undefined && field.max > 0)
          schemaField.max = field.max;
        if (field.defaultValue.trim()) {
          // Handle different default value types
          if (field.type === "Number") {
            schemaField.default = Number(field.defaultValue);
          } else if (field.type === "Boolean") {
            schemaField.default = field.defaultValue.toLowerCase() === "true";
          } else if (field.defaultValue === "Date.now") {
            schemaField.default = "Date.now";
          } else {
            schemaField.default = field.defaultValue;
          }
        }
        if (field.enumValues.length > 0) schemaField.enum = field.enumValues;
        if (field.description.trim())
          schemaField.description = field.description;

        schema[field.name.trim()] = schemaField;
      }
    });

    try {
      await dispatch(
        createSchema({
          tenant,
          projectId,
          data: {
            provider,
            collection: collectionName.trim(),
            schema,
          },
        })
      ).unwrap();

      toast("Success", {
        description: "Collection created successfully",
        className: "bg-green-500 text-white",
      });

      onCollectionCreated?.(collectionName.trim());
      setOpen(false);
      setCollectionName("");
      setFields([
        {
          name: "",
          type: "String",
          required: false,
          unique: false,
          defaultValue: "",
          enumValues: [],
          description: "",
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast("Error", {
        description: errorMessage,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Define the schema for your new database collection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Enter collection name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider">Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Schema Fields</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addField}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Field {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          updateField(index, { name: e.target.value })
                        }
                        placeholder="Field name"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) =>
                          updateField(index, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={field.required}
                        onChange={(e) =>
                          updateField(index, { required: e.target.checked })
                        }
                      />
                      <Label htmlFor={`required-${index}`}>Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`unique-${index}`}
                        checked={field.unique}
                        onChange={(e) =>
                          updateField(index, { unique: e.target.checked })
                        }
                      />
                      <Label htmlFor={`unique-${index}`}>Unique</Label>
                    </div>
                  </div>

                  {field.type === "Number" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Min Value</Label>
                        <Input
                          type="number"
                          value={field.min || ""}
                          onChange={(e) =>
                            updateField(index, {
                              min: Number(e.target.value) || undefined,
                            })
                          }
                          placeholder="Minimum value"
                        />
                      </div>
                      <div>
                        <Label>Max Value</Label>
                        <Input
                          type="number"
                          value={field.max || ""}
                          onChange={(e) =>
                            updateField(index, {
                              max: Number(e.target.value) || undefined,
                            })
                          }
                          placeholder="Maximum value"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Default Value</Label>
                    <Input
                      value={field.defaultValue}
                      onChange={(e) =>
                        updateField(index, { defaultValue: e.target.value })
                      }
                      placeholder={
                        field.type === "Date" ? "Date.now" : "Default value"
                      }
                    />
                  </div>

                  <div>
                    <Label>Enum Values (comma-separated)</Label>
                    <Input
                      value={field.enumValues.join(", ")}
                      onChange={(e) => updateEnumValues(index, e.target.value)}
                      placeholder="value1, value2, value3"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={field.description}
                      onChange={(e) =>
                        updateField(index, { description: e.target.value })
                      }
                      placeholder="Field description"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

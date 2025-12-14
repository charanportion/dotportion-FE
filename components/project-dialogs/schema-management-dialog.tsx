"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit, Database, Save, X, Settings } from "lucide-react";
import { fetchCollections, createSchema } from "@/lib/redux/slices/schemaSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import type { Schema, SchemaField } from "@/lib/api/schema";
import { schemaApi } from "@/lib/api/schema";
import { toast } from "sonner";

interface SchemaManagementDialogProps {
  tenant: string;
  initialProvider?: string;
  projectId: string;
  children: React.ReactNode;
  onSchemaUpdated?: () => void;
}

interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  default: string;
  min?: number;
  max?: number;
  enum: string[];
  description: string;
}

interface CollectionSchema {
  name: string;
  schema: Schema;
  isEditing: boolean;
}

export function SchemaManagementDialog({
  tenant,
  initialProvider,
  projectId,
  children,
  onSchemaUpdated,
}: SchemaManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [schemas, setSchemas] = useState<CollectionSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schemaToDelete, setSchemaToDelete] = useState<string | null>(null);
  const [editingSchema, setEditingSchema] = useState<CollectionSchema | null>(
    null
  );
  const [editingFields, setEditingFields] = useState<FieldDefinition[]>([]);

  // New schema creation state
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newProvider, setNewProvider] = useState(initialProvider || "platform");
  const [newFields, setNewFields] = useState<FieldDefinition[]>([
    {
      name: "",
      type: "String",
      required: false,
      unique: false,
      default: "",
      enum: [],
      description: "",
    },
  ]);

  const dispatch = useDispatch<AppDispatch>();
  //   const { collections, isCreating } = useSelector(
  //     (state: RootState) => state.schema
  //   );
  const { isCreating } = useSelector((state: RootState) => state.schema);
  // Remove the useToast import and hook usage
  // const { toast } = useToast()

  const fieldTypes = ["String", "Number", "Boolean", "Date", "Array", "Object"];

  // Load schemas when dialog opens
  useEffect(() => {
    if (open) {
      loadSchemas();
    }
  }, [open]);

  const loadSchemas = async () => {
    setIsLoading(true);
    try {
      // First get all collections
      const collectionsResponse = await schemaApi.getAllCollections(
        tenant,
        projectId,
        newProvider
      );

      // Then get schema for each collection
      const schemaPromises = collectionsResponse.collections.map(
        async (collectionName) => {
          try {
            const schema = await schemaApi.getSchema(
              tenant,
              projectId,
              collectionName,
              newProvider
            );
            return {
              name: collectionName,
              schema,
              isEditing: false,
            };
          } catch (error) {
            console.error(
              `Failed to load schema for ${collectionName}:`,
              error
            );
            return null;
          }
        }
      );

      const loadedSchemas = (await Promise.all(schemaPromises)).filter(
        Boolean
      ) as CollectionSchema[];
      setSchemas(loadedSchemas);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load schemas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchema = async (collectionName: string) => {
    try {
      await schemaApi.deleteSchema(
        tenant,
        projectId,
        collectionName,
        newProvider
      );
      setSchemas(schemas.filter((s) => s.name !== collectionName));
      toast.success("Schema deleted successfully");
      onSchemaUpdated?.();
      // Refresh collections in Redux
      dispatch(fetchCollections({ tenant, projectId }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete schema");
    }
    setDeleteDialogOpen(false);
    setSchemaToDelete(null);
  };

  const startEditingSchema = (schema: CollectionSchema) => {
    // Convert schema to field definitions for editing
    const fieldDefinitions: FieldDefinition[] = Object.entries(
      schema.schema.schema
    ).map(([fieldName, field]) => ({
      name: fieldName,
      type: field.type,
      required: field.required || false,
      unique: field.unique || false,
      default: field.default ? String(field.default) : "",
      min: field.min,
      max: field.max,
      enum: field.enum || [],
      description: field.description || "",
    }));

    setEditingSchema({ ...schema, isEditing: true });
    setEditingFields(fieldDefinitions);
    setActiveTab("edit");
  };

  const cancelEditing = () => {
    setEditingSchema(null);
    setEditingFields([]);
    setActiveTab("view");
  };

  const saveEditedSchema = async () => {
    if (!editingSchema) return;

    // Convert field definitions back to schema format
    const schema: Schema = {};
    editingFields.forEach((field) => {
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
        if (field.default.trim()) {
          if (field.type === "Number") {
            schemaField.default = Number(field.default);
          } else if (field.type === "Boolean") {
            schemaField.default = field.default.toLowerCase() === "true";
          } else if (field.default === "Date.now") {
            schemaField.default = "Date.now";
          } else {
            schemaField.default = field.default;
          }
        }
        if (field.enum.length > 0) schemaField.enum = field.enum;
        if (field.description.trim())
          schemaField.description = field.description;

        schema[field.name.trim()] = schemaField;
      }
    });

    try {
      await schemaApi.updateSchema(tenant, projectId, editingSchema.name, {
        provider: newProvider,
        collection: editingSchema.name,
        schema,
      });

      // Update local state
      const updatedSchema = { ...editingSchema, schema, isEditing: false };
      setSchemas(
        schemas.map((s) => (s.name === editingSchema.name ? updatedSchema : s))
      );
      setEditingSchema(null);
      setEditingFields([]);
      setActiveTab("view");

      toast.success("Schema updated successfully");
      onSchemaUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update schema");
    }
  };

  const addFieldToEditingSchema = () => {
    setEditingFields([
      ...editingFields,
      {
        name: "",
        type: "String",
        required: false,
        unique: false,
        default: "",
        enum: [],
        description: "",
      },
    ]);
  };

  const removeFieldFromEditingSchema = (index: number) => {
    setEditingFields(editingFields.filter((_, i) => i !== index));
  };

  const updateEditingField = (
    index: number,
    updates: Partial<FieldDefinition>
  ) => {
    const newFields = [...editingFields];
    newFields[index] = { ...newFields[index], ...updates };
    setEditingFields(newFields);
  };

  // New schema creation functions
  const addNewField = () => {
    setNewFields([
      ...newFields,
      {
        name: "",
        type: "String",
        required: false,
        unique: false,
        default: "",
        enum: [],
        description: "",
      },
    ]);
  };

  const removeNewField = (index: number) => {
    setNewFields(newFields.filter((_, i) => i !== index));
  };

  const updateNewField = (index: number, updates: Partial<FieldDefinition>) => {
    const updatedFields = [...newFields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setNewFields(updatedFields);
  };

  const createNewSchema = async () => {
    if (!newCollectionName.trim()) {
      toast.error("Collection name is required");
      return;
    }

    if (newFields.length === 0 || !newFields.some((f) => f.name.trim())) {
      toast.error("At least one field is required");
      return;
    }

    // Build schema object
    const schema: Schema = {};
    newFields.forEach((field) => {
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
        if (field.default.trim()) {
          if (field.type === "Number") {
            schemaField.default = Number(field.default);
          } else if (field.type === "Boolean") {
            schemaField.default = field.default.toLowerCase() === "true";
          } else if (field.default === "Date.now") {
            schemaField.default = "Date.now";
          } else {
            schemaField.default = field.default;
          }
        }
        if (field.enum.length > 0) schemaField.enum = field.enum;
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
            provider: newProvider,
            collection: newCollectionName.trim(),
            schema,
          },
        })
      ).unwrap();

      // Add to local state
      setSchemas([
        ...schemas,
        {
          name: newCollectionName.trim(),
          schema,
          isEditing: false,
        },
      ]);

      toast.success("Schema created successfully");

      // Reset form
      setNewCollectionName("");
      setNewFields([
        {
          name: "",
          type: "String",
          required: false,
          unique: false,
          default: "",
          enum: [],
          description: "",
        },
      ]);
      setActiveTab("view");
      onSchemaUpdated?.();
    } catch (error) {
      toast.error(error as string);
    }
  };

  const renderSchemaField = (
    fieldName: string,
    field: SchemaField,
    isEditing = false,
    index?: number,
    onUpdate?: (index: number, updates: Partial<FieldDefinition>) => void,
    onRemove?: (index: number) => void
  ) => {
    // console.log(fieldName);
    if (isEditing && index !== undefined && onUpdate && onRemove) {
      return (
        <Card key={fieldName} className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Input
                value={fieldName}
                onChange={(e) => {
                  const newSchema = { ...editingSchema?.schema };
                  delete newSchema[fieldName];
                  newSchema[e.target.value] = field;
                  setEditingSchema({ ...editingSchema!, schema: newSchema });
                }}
                className="font-medium"
              />
              <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(value) => onUpdate(index, { type: value })}
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
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={field.required || false}
                    onChange={(e) =>
                      onUpdate(index, { required: e.target.checked })
                    }
                  />
                  <Label>Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={field.unique || false}
                    onChange={(e) =>
                      onUpdate(index, { unique: e.target.checked })
                    }
                  />
                  <Label>Unique</Label>
                </div>
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
                      onUpdate(index, {
                        min: Number(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Max Value</Label>
                  <Input
                    type="number"
                    value={field.max || ""}
                    onChange={(e) =>
                      onUpdate(index, {
                        max: Number(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Default Value</Label>
              <Input
                value={String(field.default || "")}
                onChange={(e) => onUpdate(index, { default: e.target.value })}
              />
            </div>

            <div>
              <Label>Enum Values (comma-separated)</Label>
              <Input
                value={field.enum?.join(", ") || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Store the raw input value
                  onUpdate(index, { enum: [value] });
                }}
                onBlur={(e) => {
                  // Process the value when input loses focus
                  const value = e.target.value;
                  const enumValues = value
                    .split(/,\s*/)
                    .map((v) => v.trim())
                    .filter((v) => v.length > 0);
                  onUpdate(index, { enum: enumValues });
                }}
                placeholder="value1, value2, value3"
                type="text"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={field.description || ""}
                onChange={(e) =>
                  onUpdate(index, { description: e.target.value })
                }
                placeholder="Field description"
                rows={2}
              />
            </div>
          </div>
        </Card>
      );
    }

    return null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Schema Management
            </DialogTitle>
            <DialogDescription>
              Manage your project&apos;s database schemas and collections.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="view">View Schemas</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="edit" disabled={!editingSchema}>
                Edit Schema
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p>Loading schemas...</p>
                </div>
              ) : schemas.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No schemas found</p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("create")}
                      className="mt-2"
                    >
                      Create your first schema
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {schemas.map((schema) => (
                    <Card key={schema.name}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Database className="h-5 w-5" />
                              {schema.name}
                            </CardTitle>
                            <CardDescription>
                              {Object.keys(schema.schema).length} field(s)
                              defined
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingSchema(schema)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSchemaToDelete(schema.name);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive border-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(schema.schema).map(
                            ([fieldName, field]) =>
                              renderSchemaField(fieldName, field)
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="new-collection-name">Collection Name</Label>
                    <Input
                      id="new-collection-name"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Enter collection name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-provider">Provider</Label>
                    <Select value={newProvider} onValueChange={setNewProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                        <SelectItem value="platform">Platform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Schema Fields</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewField}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>

                  {newFields.map((field, index) =>
                    renderSchemaField(
                      field.name,
                      {
                        type: field.type,
                        required: field.required,
                        unique: field.unique,
                        default: field.default,
                        min: field.min,
                        max: field.max,
                        enum: field.enum,
                        description: field.description,
                      },
                      true,
                      index,
                      updateNewField,
                      removeNewField
                    )
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("view")}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createNewSchema} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Schema"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="flex-1 overflow-y-auto">
              {editingSchema && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Editing: {editingSchema.name}
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={cancelEditing}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={saveEditedSchema}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Schema Fields</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addFieldToEditingSchema}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

                    {editingFields.map((field, index) =>
                      renderSchemaField(
                        field.name,
                        {
                          type: field.type,
                          required: field.required,
                          unique: field.unique,
                          default: field.default,
                          min: field.min,
                          max: field.max,
                          enum: field.enum,
                          description: field.description,
                        },
                        true,
                        index,
                        updateEditingField,
                        removeFieldFromEditingSchema
                      )
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schema</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the schema for &quot;
              {schemaToDelete}&quot;? This action cannot be undone and will
              permanently delete the collection schema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                schemaToDelete && handleDeleteSchema(schemaToDelete)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Schema
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

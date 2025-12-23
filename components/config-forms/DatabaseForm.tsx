"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Settings,
  Check,
  ChevronsUpDown,
  Info,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import {
  fetchCollections,
  fetchCollectionParameters,
} from "@/lib/redux/slices/schemaSlice";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NodeIdSuggestField } from "@/components/ui/node-id-suggest-field";
import Link from "next/link";

interface DatabaseFormProps {
  nodeId?: string;
}

export function DatabaseForm({ nodeId }: DatabaseFormProps) {
  const { control, watch, setValue } = useFormContext();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setValue("provider", "platform");
  }, [setValue]);

  const formQuery = watch("query") || {};
  const formData = watch("data") || {};
  const selectedCollection = watch("collection");
  const selectedProvider = "platform";

  const { collections, collectionParameters, isLoading } = useSelector(
    (state: RootState) => state.schema
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedProject } = useSelector((state: RootState) => state.projects);

  const [queryFields, setQueryFields] = useState<
    { key: string; value: string }[]
  >([]);
  const [dataFields, setDataFields] = useState<
    { key: string; value: string }[]
  >([]);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const isUpdatingFromForm = useRef(false);
  const isUpdatingFromLocal = useRef(false);

  const currentCollectionParams = selectedCollection
    ? collectionParameters[selectedCollection] || []
    : [];

  useEffect(() => {
    if (user && selectedProject) {
      dispatch(
        fetchCollections({
          tenant: user.name,
          projectId: selectedProject._id,
          provider: selectedProvider,
        })
      );
    }
  }, [dispatch, user, selectedProject]);

  useEffect(() => {
    if (selectedCollection && user && selectedProject) {
      dispatch(
        fetchCollectionParameters({
          tenant: user.name,
          projectId: selectedProject._id,
          collectionName: selectedCollection,
          provider: selectedProvider,
        })
      );
    }
  }, [selectedCollection, dispatch, user, selectedProject]);

  useEffect(() => {
    if (isUpdatingFromLocal.current) {
      isUpdatingFromLocal.current = false;
      return;
    }
    isUpdatingFromForm.current = true;
    const newQueryFields = Object.entries(formQuery).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    setQueryFields(newQueryFields);
    isUpdatingFromForm.current = false;
  }, [formQuery]);

  useEffect(() => {
    if (isUpdatingFromLocal.current) {
      isUpdatingFromLocal.current = false;
      return;
    }
    isUpdatingFromForm.current = true;
    const newDataFields = Object.entries(formData).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    setDataFields(newDataFields);
    isUpdatingFromForm.current = false;
  }, [formData]);

  useEffect(() => {
    if (isUpdatingFromForm.current) return;
    isUpdatingFromLocal.current = true;
    setValue(
      "query",
      Object.fromEntries(
        queryFields.filter((f) => f.key).map((f) => [f.key, f.value])
      )
    );
  }, [queryFields, setValue]);

  useEffect(() => {
    if (isUpdatingFromForm.current) return;
    isUpdatingFromLocal.current = true;
    setValue(
      "data",
      Object.fromEntries(
        dataFields.filter((f) => f.key).map((f) => [f.key, f.value])
      )
    );
  }, [dataFields, setValue]);

  const addField = (type: "query" | "data") => {
    if (type === "query") {
      setQueryFields([...queryFields, { key: "", value: "" }]);
    } else {
      setDataFields([...dataFields, { key: "", value: "" }]);
    }
  };

  const removeField = (type: "query" | "data", index: number) => {
    if (type === "query") {
      setQueryFields(queryFields.filter((_, i) => i !== index));
    } else {
      setDataFields(dataFields.filter((_, i) => i !== index));
    }
  };

  const updateField = (
    type: "query" | "data",
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    if (type === "query") {
      const newFields = [...queryFields];
      newFields[index] = { ...newFields[index], [field]: value };
      setQueryFields(newFields);
    } else {
      const newFields = [...dataFields];
      newFields[index] = { ...newFields[index], [field]: value };
      setDataFields(newFields);
    }
  };

  const renderFieldInput = (
    type: "query" | "data",
    index: number,
    field: { key: string; value: string }
  ) => {
    const availableFields = currentCollectionParams.map((param) => param.name);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="h-7 text-xs justify-between border-border flex-1 bg-input"
          >
            {field.key || "Select field..."}
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0 border-border">
          <Command>
            <CommandInput
              placeholder="Search fields..."
              className="h-8 text-xs"
            />
            <CommandList>
              <CommandEmpty className="text-xs py-2 text-center">
                No fields found.
              </CommandEmpty>
              <CommandGroup>
                {availableFields.map((fieldName) => {
                  const param = currentCollectionParams.find(
                    (p) => p.name === fieldName
                  );
                  return (
                    <CommandItem
                      key={fieldName}
                      value={fieldName}
                      onSelect={() =>
                        updateField(type, index, "key", fieldName)
                      }
                      className="text-xs"
                    >
                      <Check
                        className={cn(
                          "mr-1.5 h-3 w-3",
                          field.key === fieldName ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span>{fieldName}</span>
                        {param && (
                          <div className="flex gap-1">
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-4"
                            >
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge
                                variant="destructive"
                                className="text-[9px] px-1 py-0 h-4"
                              >
                                Required
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const renderValueInput = (
    type: "query" | "data",
    index: number,
    field: { key: string; value: string }
  ) => {
    const param = currentCollectionParams.find((p) => p.name === field.key);

    if (param?.enum && param.enum.length > 0) {
      return (
        <Select
          value={field.value}
          onValueChange={(value) => updateField(type, index, "value", value)}
        >
          <SelectTrigger className="h-7 text-xs border-border bg-input flex-1">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {param.enum.map((enumValue) => (
              <SelectItem key={enumValue} value={enumValue} className="text-xs">
                {enumValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (param?.type === "Boolean") {
      return (
        <Select
          value={field.value}
          onValueChange={(value) => updateField(type, index, "value", value)}
        >
          <SelectTrigger className="h-7 text-xs border-border bg-input flex-1">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true" className="text-xs">
              true
            </SelectItem>
            <SelectItem value="false" className="text-xs">
              false
            </SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <NodeIdSuggestField
        value={field.value}
        onChange={(value) => updateField(type, index, "value", value)}
        placeholder={param ? `${param.type} value` : "Value"}
        as="input"
        className="h-7 text-xs border-border bg-input flex-1"
        currentNodeId={nodeId}
      />
    );
  };

  if (!user || !selectedProject) {
    return (
      <div className="text-xs text-neutral-500 p-3 bg-card border border-border rounded">
        Please select a project first
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="collection"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <div className="flex items-center justify-between">
              <FormLabel className="text-xs font-medium text-foreground">
                Select Collection
              </FormLabel>
              {/* <CreateCollectionDialog
                tenant={user.name}
                initialProvider={selectedProvider}
                projectId={selectedProject._id}
                onCollectionCreated={handleCollectionCreated}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] border-neutral-300 bg-transparent"
                >
                  <Database className="h-3 w-3 mr-1" />
                  Create
                </Button>
              </CreateCollectionDialog> */}
            </div>
            <div className="space-y-1.5">
              <Popover open={collectionOpen} onOpenChange={setCollectionOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "h-8 text-xs justify-between w-full border-border bg-input",
                        !field.value && "text-neutral-500"
                      )}
                    >
                      {field.value
                        ? collections.find(
                            (collection) => collection === field.value
                          )
                        : "Select collection"}
                      <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 border-border">
                  <Command>
                    <CommandInput
                      placeholder="Search collections..."
                      className="h-8 text-xs"
                    />
                    <CommandList>
                      <CommandEmpty className="text-xs py-2 text-center">
                        {isLoading ? "Loading..." : "No collections found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {collections.map((collection) => (
                          <CommandItem
                            value={collection}
                            key={collection}
                            onSelect={() => {
                              setValue("collection", collection);
                              setCollectionOpen(false);
                            }}
                            className="text-xs"
                          >
                            <Check
                              className={cn(
                                "mr-1.5 h-3 w-3",
                                collection === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {collection}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Link href={`/projects/${selectedProject._id}/schema`}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] justify-start text-muted-foreground"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Manage Collections
                </Button>
              </Link>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="operation"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-foreground">
              Operation
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="h-8 text-xs border-border">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="findOne" className="text-xs">
                  Find One
                </SelectItem>
                <SelectItem value="findMany" className="text-xs">
                  Find Many
                </SelectItem>
                <SelectItem value="updateOne" className="text-xs">
                  Update One
                </SelectItem>
                <SelectItem value="updateMany" className="text-xs">
                  Update Many
                </SelectItem>
                <SelectItem value="insertOne" className="text-xs">
                  Insert One
                </SelectItem>
                <SelectItem value="insertMany" className="text-xs">
                  Insert Many
                </SelectItem>
                <SelectItem value="deleteOne" className="text-xs">
                  Delete One
                </SelectItem>
                <SelectItem value="deleteMany" className="text-xs">
                  Delete Many
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {selectedCollection && currentCollectionParams.length > 0 && (
        <div className="p-2 bg-card border border-border rounded">
          <h4 className="text-[10px] font-medium text-foreground mb-1.5">
            Available Fields in {selectedCollection}:
          </h4>
          <div className="flex flex-wrap gap-1">
            {currentCollectionParams.map((param) => (
              <div key={param.name} className="flex items-center gap-0.5">
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-border"
                >
                  {param.name}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1 py-0 h-4 bg-secondary"
                >
                  {param.type}
                </Badge>
                {param.required && (
                  <Badge
                    variant="destructive"
                    className="text-[9px] px-1 py-0 h-4"
                  >
                    Req
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <FormLabel className="text-xs font-medium text-foreground">
            Query Fields
          </FormLabel>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-6 text-[10px] border-border"
            onClick={() => addField("query")}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        {queryFields.map((field, index) => (
          <div key={index} className="flex gap-1.5 items-center">
            {renderFieldInput("query", index, field)}
            {renderValueInput("query", index, field)}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 shrink-0"
              onClick={() => removeField("query", index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <FormLabel className="text-xs font-medium text-foreground">
            Data Fields
          </FormLabel>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-6 text-[10px] border-border"
            onClick={() => addField("data")}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        {dataFields.map((field, index) => (
          <div key={index} className="flex gap-1.5 items-center">
            {renderFieldInput("data", index, field)}
            {renderValueInput("data", index, field)}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 shrink-0"
              onClick={() => removeField("data", index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 p-2 bg-card border border-borer rounded text-[10px] text-muted-foreground">
        <Info className="h-3 w-3 mt-0.5 shrink-0" />
        <span>
          Type{" "}
          <code className="px-1 py-0.5 bg-secondary rounded font-mono">
            {"{{"}
          </code>{" "}
          to insert dynamic node values
        </span>
      </div>
    </div>
  );
}

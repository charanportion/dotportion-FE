"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Source, ParameterConfig } from "@/types/node-types";
import { Checkbox } from "@/components/ui/checkbox";

export function ParameterForm() {
  const { control, watch } = useFormContext();
  const sources = watch("sources") || [];

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="sources"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-xs font-medium text-neutral-700">
              Parameter Sources
            </FormLabel>
            <div className="space-y-3">
              {sources.map((source: Source, sourceIndex: number) => (
                <div
                  key={sourceIndex}
                  className="p-3 border border-neutral-300 rounded-md space-y-3 bg-neutral-50"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-medium text-neutral-700">
                      Source {sourceIndex + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-neutral-500 hover:text-red-500"
                      onClick={() => {
                        const newSources = [...sources];
                        newSources.splice(sourceIndex, 1);
                        field.onChange(newSources);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <FormField
                    control={control}
                    name={`sources.${sourceIndex}.from`}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-medium text-neutral-600">
                          Source Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-7 text-xs border-neutral-300">
                              <SelectValue placeholder="Select source type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="query" className="text-xs">
                              Query
                            </SelectItem>
                            <SelectItem value="body" className="text-xs">
                              Body
                            </SelectItem>
                            <SelectItem value="headers" className="text-xs">
                              Headers
                            </SelectItem>
                            <SelectItem value="params" className="text-xs">
                              Params
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-[10px] text-neutral-500">
                          Where to extract parameters from
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel className="text-[10px] font-medium text-neutral-600">
                      Parameters
                    </FormLabel>
                    <div className="space-y-1.5">
                      {Object.entries(source.parameters || {}).map(
                        (
                          [paramName, paramConfig]: [string, ParameterConfig],
                          paramIndex: number
                        ) => (
                          <div
                            key={paramIndex}
                            className="flex items-center gap-2 p-2 border border-neutral-200 rounded bg-white"
                          >
                            <div className="flex-1">
                              <Input
                                value={paramName}
                                onChange={(e) => {
                                  const newSources = [...sources];
                                  const newParameters = {
                                    ...source.parameters,
                                  };
                                  delete newParameters[paramName];
                                  newParameters[e.target.value] = paramConfig;
                                  newSources[sourceIndex].parameters =
                                    newParameters;
                                  field.onChange(newSources);
                                }}
                                placeholder="Parameter name"
                                className="h-7 text-xs font-mono border-neutral-300"
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Checkbox
                                checked={paramConfig.required || false}
                                onCheckedChange={(checked) => {
                                  const newSources = [...sources];
                                  newSources[sourceIndex].parameters[
                                    paramName
                                  ] = {
                                    ...paramConfig,
                                    required: checked as boolean,
                                  };
                                  field.onChange(newSources);
                                }}
                                id={`required-${sourceIndex}-${paramIndex}`}
                                className="h-3.5 w-3.5"
                              />
                              <label
                                htmlFor={`required-${sourceIndex}-${paramIndex}`}
                                className="text-[10px] text-neutral-500 cursor-pointer"
                              >
                                Required
                              </label>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-neutral-500 hover:text-red-500"
                              onClick={() => {
                                const newSources = [...sources];
                                const newParameters = { ...source.parameters };
                                delete newParameters[paramName];
                                newSources[sourceIndex].parameters =
                                  newParameters;
                                field.onChange(newSources);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-neutral-300 bg-transparent"
                      onClick={() => {
                        const newSources = [...sources];
                        if (!newSources[sourceIndex].parameters) {
                          newSources[sourceIndex].parameters = {};
                        }
                        const paramCount = Object.keys(
                          newSources[sourceIndex].parameters
                        ).length;
                        newSources[sourceIndex].parameters[
                          `param${paramCount + 1}`
                        ] = {
                          required: false,
                        };
                        field.onChange(newSources);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Parameter
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs border-neutral-300 mt-2 bg-transparent"
              onClick={() => {
                field.onChange([
                  ...sources,
                  {
                    from: "body",
                    parameters: {},
                  },
                ]);
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Source
            </Button>
          </FormItem>
        )}
      />
    </div>
  );
}

"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { NodeIdSuggestField } from "@/components/ui/node-id-suggest-field";
import { Info } from "lucide-react";

interface ConditionFormProps {
  nodeId?: string;
}

export const ConditionForm = ({ nodeId }: ConditionFormProps) => {
  const { control } = useFormContext();

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="condition"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-foreground">
              Condition
            </FormLabel>
            <FormControl>
              <NodeIdSuggestField
                value={field.value}
                onChange={field.onChange}
                placeholder="Write your condition as a JavaScript expression"
                as="textarea"
                rows={3}
                className="text-xs border-border bg-input font-mono"
                currentNodeId={nodeId}
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
      <div className="flex items-start gap-2 p-2 bg-card border border-border rounded text-[10px] text-muted-foreground">
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
};

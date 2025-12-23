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

interface FormValues {
  code: string;
}

interface LogicFormProps {
  nodeId?: string;
}

export const LogicForm = ({ nodeId }: LogicFormProps) => {
  const { control } = useFormContext<FormValues>();

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="code"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-foreground">
              Code
            </FormLabel>
            <FormControl>
              <NodeIdSuggestField
                value={field.value}
                onChange={field.onChange}
                placeholder="write the code in javascript or typescript"
                as="textarea"
                rows={5}
                className="text-xs border-border font-mono"
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

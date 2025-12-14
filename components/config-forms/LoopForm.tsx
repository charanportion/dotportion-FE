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

interface LoopFormProps {
  nodeId?: string;
}

export const LoopForm = ({ nodeId }: LoopFormProps) => {
  const { control } = useFormContext();

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="items"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-neutral-700">
              Items
            </FormLabel>
            <FormControl>
              <NodeIdSuggestField
                value={field.value}
                onChange={field.onChange}
                placeholder="Write the items you need to loop in here"
                as="textarea"
                rows={3}
                className="text-xs border-neutral-300 font-mono"
                currentNodeId={nodeId}
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
      <div className="flex items-start gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded text-[10px] text-neutral-600">
        <Info className="h-3 w-3 mt-0.5 shrink-0" />
        <span>
          Type{" "}
          <code className="px-1 py-0.5 bg-neutral-200 rounded font-mono">
            {"{{"}
          </code>{" "}
          to insert dynamic node values
        </span>
      </div>
    </div>
  );
};

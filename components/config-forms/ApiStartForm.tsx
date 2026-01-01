"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ApiStartForm = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="method"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-foreground">
              Method
            </FormLabel>
            <Select
              disabled
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-8 text-xs border-border bg-input disabled:text-muted-foreground">
                  <SelectValue placeholder="Select a type of Method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="GET" className="text-xs">
                  GET
                </SelectItem>
                <SelectItem value="POST" className="text-xs">
                  POST
                </SelectItem>
                <SelectItem value="PUT" className="text-xs">
                  PUT
                </SelectItem>
                <SelectItem value="DELETE" className="text-xs">
                  DELETE
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="path"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-foreground">
              Path
            </FormLabel>
            <FormControl>
              <Input
                disabled
                {...field}
                placeholder="e.g., /create-user"
                className="h-8 text-xs border-border bg-input disabled:text-muted-foreground"
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  );
};

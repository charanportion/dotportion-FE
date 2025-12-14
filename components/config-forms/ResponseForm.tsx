"use client";

import { useFormContext } from "react-hook-form";
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

export const ResponseForm = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-neutral-700">
              Status
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="h-8 text-xs border-neutral-300">
                  <SelectValue placeholder="Select a type of status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="200" className="text-xs">
                  200 OK
                </SelectItem>
                <SelectItem value="201" className="text-xs">
                  201 Created
                </SelectItem>
                <SelectItem value="204" className="text-xs">
                  204 No Content
                </SelectItem>
                <SelectItem value="400" className="text-xs">
                  400 Bad Request
                </SelectItem>
                <SelectItem value="401" className="text-xs">
                  401 Unauthorized
                </SelectItem>
                <SelectItem value="403" className="text-xs">
                  403 Forbidden
                </SelectItem>
                <SelectItem value="404" className="text-xs">
                  404 Not Found
                </SelectItem>
                <SelectItem value="500" className="text-xs">
                  500 Server Error
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  );
};

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

export const JwtVerifyForm = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="secretType"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-neutral-700">
              Secret
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="h-8 text-xs border-neutral-300">
                  <SelectValue placeholder="Select a type of secret" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="jwt" className="text-xs">
                  JWT
                </SelectItem>
                <SelectItem value="cookie" className="text-xs">
                  Cookie
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

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
import { Textarea } from "@/components/ui/textarea";

export const JwtGenerateForm = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="payload"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-foreground">
              Payload
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Write what payload to be set in the JWT"
                {...field}
                className="text-xs border-border bg-input min-h-[80px] font-mono"
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="secretType"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-foreground">
              Secret
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="h-8 text-xs border-border bg-input">
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
      <FormField
        control={control}
        name="expiresIn"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-foreground">
              Expires In
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g., 1h, 30m"
                className="h-8 text-xs border-border bg-input"
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  );
};

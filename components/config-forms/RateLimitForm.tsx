import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { updateProject } from "@/lib/redux/slices/projectsSlice";
import { toast } from "sonner";
import { Project } from "@/lib/api/projects";
import { Badge } from "../ui/badge";
import { LoaderCircle } from "lucide-react";

const rateLimitSchema = z.object({
  enabled: z.boolean(),
  windowMs: z.number().min(1, "Window (ms) is required"),
  max: z.coerce.number().min(1, "Max requests must be at least 1"),
  message: z.string().min(1, "Message is required"),
  standardHeaders: z.boolean(),
  legacyHeaders: z.boolean(),
});

type RateLimitFormValues = z.infer<typeof rateLimitSchema>;

export function RateLimitForm({ project }: { project: Project }) {
  const dispatch = useDispatch<AppDispatch>();

  const defaultValues = {
    enabled: project.rateLimit.enabled,
    windowMs: project.rateLimit.windowMs,
    max: project.rateLimit.max,
    message: project.rateLimit.message,
    standardHeaders: project.rateLimit.standardHeaders,
    legacyHeaders: project.rateLimit.legacyHeaders,
  };
  const form = useForm<RateLimitFormValues>({
    resolver: zodResolver(rateLimitSchema),
    defaultValues,
  });

  const currentValues = form.watch();

  const hasChanges =
    currentValues.enabled !== defaultValues.enabled ||
    currentValues.windowMs !== defaultValues.windowMs ||
    currentValues.max !== defaultValues.max ||
    currentValues.standardHeaders !== defaultValues.standardHeaders ||
    currentValues.legacyHeaders !== defaultValues.legacyHeaders ||
    currentValues.message.trim() !== defaultValues.message.trim();

  const handleCancel = () => {
    form.reset(defaultValues);
  };

  const onSubmit = async (data: RateLimitFormValues) => {
    try {
      await dispatch(
        updateProject({
          id: project._id,
          data: {
            rateLimit: {
              enabled: data.enabled,
              windowMs: data.windowMs,
              max: data.max,
              message: data.message,
              standardHeaders: data.standardHeaders,
              legacyHeaders: data.legacyHeaders,
            },
          },
        })
      ).unwrap();
      toast("Success", {
        description: "Rate limit settings updated",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast("Error", {
        description: errorMessage,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-start w-full"
      >
        <div className="flex items-start justify-between w-full p-5">
          <div className="w-full flex-1">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-sm font-inter">
                      Rate Limiting
                    </FormLabel>
                    <Badge
                      className={
                        field.value
                          ? "bg-green-100 dark:bg-green-950 text-green-500 border border-green-500"
                          : "bg-red-100 dark:bg-red-950 text-red-500 border border-red-500"
                      }
                    >
                      {field.value ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full flex-1 space-y-4">
            <FormField
              control={form.control}
              name="windowMs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-inter">
                    Window (ms)
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter  text-xs"
                      {...field}
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-inter">
                    Max Requests
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter  text-xs"
                      {...field}
                      type="number"
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-inter">Message</FormLabel>
                  <FormControl>
                    <Input
                      className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter  text-xs"
                      {...field}
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="standardHeaders"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-inter">
                    Standard Headers
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legacyHeaders"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-inter">
                    Legacy Headers
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="w-full flex gap-2 items-start justify-end p-5 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={!hasChanges}
            className="justify-start shadow-none gap-2 text-left font-normal border-2 border-neutral-300 bg-white hover:bg-neutral-100 text-muted-foreground cursor-pointer text-xs h-7 px-2.5 py-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !hasChanges}
            className="justify-start gap-2 text-left font-normal  cursor-pointer text-xs h-7 px-2.5 py-1"
          >
            {form.formState.isSubmitting ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

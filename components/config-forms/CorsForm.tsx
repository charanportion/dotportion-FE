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

const corsSchema = z.object({
  enabled: z.boolean(),
  allowedOrigins: z.string().min(1, "At least one origin is required"),
  allowedMethods: z.string().min(1, "At least one method is required"),
  allowedHeaders: z.string().min(1, "At least one header is required"),
});

type CorsFormValues = z.infer<typeof corsSchema>;

export function CorsForm({
  project,
}: //   onSuccess,
{
  project: Project;
  //   onSuccess?: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const defaultValues = {
    enabled: project.cors.enabled,
    allowedOrigins: project.cors.allowedOrigins.join(", "),
    allowedMethods: project.cors.allowedMethods.join(", "),
    allowedHeaders: project.cors.allowedHeaders.join(", "),
  };

  const form = useForm<CorsFormValues>({
    resolver: zodResolver(corsSchema),
    defaultValues,
  });

  // Watch form values to check for changes
  const currentValues = form.watch();

  // Check if form has changes
  const hasChanges =
    currentValues.enabled !== defaultValues.enabled ||
    currentValues.allowedOrigins.trim() !==
      defaultValues.allowedOrigins.trim() ||
    currentValues.allowedMethods.trim() !==
      defaultValues.allowedMethods.trim() ||
    currentValues.allowedHeaders.trim() !== defaultValues.allowedHeaders.trim();

  const handleCancel = () => {
    form.reset(defaultValues);
  };
  const onSubmit = async (data: CorsFormValues) => {
    try {
      await dispatch(
        updateProject({
          id: project._id,
          data: {
            cors: {
              enabled: data.enabled,
              allowedOrigins: data.allowedOrigins
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              allowedMethods: data.allowedMethods
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              allowedHeaders: data.allowedHeaders
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            },
          },
        })
      ).unwrap();
      toast("Success", {
        description: "CORS settings updated",
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
                    <FormLabel className="text-sm font-inter">CORS</FormLabel>
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
              name="allowedOrigins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-inter">
                    Allowed Origins (comma separated)
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter  text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allowedMethods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-inter">
                    Allowed Methods (comma separated)
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter  text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allowedHeaders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-inter">
                    Allowed Headers (comma separated)
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter  text-xs"
                      {...field}
                    />
                  </FormControl>
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
            className="justify-start gap-2 text-left font-normal  cursor-pointer text-xs h-7 px-2.5 py-1"
            type="submit"
            disabled={form.formState.isSubmitting || !hasChanges}
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

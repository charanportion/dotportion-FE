import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { updateWorkflow } from "@/lib/redux/slices/workflowsSlice";
import { toast } from "sonner";
import type { Workflow } from "@/lib/api/workflows";
import { LoaderCircle } from "lucide-react";

interface EditWorkflowDialogProps {
  workflow: Workflow;
  projectId: string;
  //   children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWorkflowDialog({
  workflow,
  projectId,
  //   children,
  open,
  onOpenChange,
}: EditWorkflowDialogProps) {
  //   const [open, setOpen] = useState(false);
  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description || "");
  const [method, setMethod] = useState(workflow.method);
  const [path, setPath] = useState(workflow.path);
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(
        updateWorkflow({
          projectId,
          workflowId: workflow._id,
          data: {
            name: name.trim(),
            description: description.trim(),
            method,
            path: path.trim(),
          },
        })
      ).unwrap();
      toast("Success", {
        description: "Workflow updated successfully",
        className: "bg-green-500 text-white",
      });
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast("Error", {
        description: errorMessage,
        className: "bg-destructive text-destructive-foreground",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogTrigger asChild>{children}</DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px] border border-neutral-300 p-4">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-col gap-1">
            <DialogTitle className="flex items-center gap-2 font-inter text-[16px] font-medium">
              Edit Workflow
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 font-inter text-xs text-neutral-500">
              Update the workflow details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-inter">
                Workflow Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workflow name"
                className="h-8 px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-inter">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter workflow description"
                className="px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="method" className="text-sm font-inter">
                HTTP Method
              </Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-full px-3 py-2 bg-neutral-100 border border-neutral-300 shadow-none rounded-lg font-inter text-neutral-800 text-xs">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="path" className="text-sm font-inter">
                API Path
              </Label>
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="Enter API path (e.g., create-user)"
                required
                className="h-8 px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="justify-start shadow-none gap-2 text-left font-normal border-2 border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800 cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="justify-start gap-2 text-left font-normal border-2 border-neutral-950 bg-neutral-800 hover:bg-neutral-700 text-white hover:text-white cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              {isSaving ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

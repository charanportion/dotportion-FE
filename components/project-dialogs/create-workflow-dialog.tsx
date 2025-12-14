"use client";

import type React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createWorkflow } from "@/lib/redux/slices/workflowsSlice";
import type { AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

interface CreateWorkflowDialogProps {
  projectId: string;
  isCreating?: boolean;
  children: React.ReactNode;
}

export function CreateWorkflowDialog({
  projectId,
  isCreating = false,
  children,
}: CreateWorkflowDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !path.trim()) {
      toast("Error", {
        description: "Name and path are required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    const defaultNodes = [
      {
        id: "1",
        type: "apiStart",
        data: {
          label: "API Endpoint",
          method: method,
          path: `/${path}`,
          description: "Entry point for the API",
        },
        position: { x: 250, y: 100 },
      },
      {
        id: "2",
        type: "response",
        data: {
          label: "API Response",
          description: "Send response to client",
          status: 200,
        },
        position: { x: 250, y: 250 },
      },
    ];

    const defaultEdges = [{ id: "e1-2", source: "1", target: "2" }];

    try {
      await dispatch(
        createWorkflow({
          projectId,
          data: {
            name: name.trim(),
            description: description.trim(),
            method,
            path: path.trim(),
            nodes: defaultNodes,
            edges: defaultEdges,
          },
        })
      ).unwrap();
      toast("Success", {
        description: "Workflow created successfully",
        className: "bg-green-500 text-white",
      });
      setOpen(false);
      setName("");
      setDescription("");
      setPath("");
      setMethod("");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border border-neutral-300 p-4">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-col gap-1">
            <DialogTitle className="flex items-center gap-2 font-inter text-[16px] font-medium">
              Create New Workflow
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 font-inter text-xs text-neutral-500">
              Create a new API workflow for your project.
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
                className="h-8 px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setName("");
                setDescription("");
                setPath("");
                setMethod("");
                setOpen(false);
              }}
              className="justify-start shadow-none gap-2 text-left font-normal border-2 border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800 cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="justify-start gap-2 text-left font-normal border-2 border-neutral-950 bg-neutral-800 hover:bg-neutral-700 text-white hover:text-white cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              {isCreating ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                "Create Workflow"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import type React from "react";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { LoaderCircle, Plus } from "lucide-react";
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
import { createProject } from "@/lib/redux/slices/projectsSlice";
import type { AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  isCreating?: boolean;
}

export function CreateProjectDialog({
  isCreating = false,
}: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast("Error", {
        description: "Project name is required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    try {
      await dispatch(
        createProject({ name: name.trim(), description: description.trim() })
      ).unwrap();
      toast("Success", {
        description: "Project created successfully",
        className: "bg-green-500 text-white",
      });
      setOpen(false);
      setName("");
      setDescription("");
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
      <DialogTrigger asChild>
        <Button
          className="justify-start gap-2 text-left font-normal border-2 border-neutral-950 bg-neutral-800 hover:bg-neutral-700 text-white hover:text-white cursor-pointer text-xs h-7 px-2.5 py-1"
          disabled={isCreating}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="truncate">New Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border border-neutral-300 p-4">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-col gap-1">
            <DialogTitle className="flex items-center gap-2 font-inter text-[16px] font-medium">
              Create New Project
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 font-inter text-xs text-neutral-500">
              Create a new project to organize your APIs and workflows.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-inter">
                Project Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
                className="h-8 px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs"
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
                placeholder="Enter project description"
                rows={3}
                className="px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs"
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
                "Create new project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

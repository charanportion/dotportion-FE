"use client";

import type React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { LoaderCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/redux/slices/projectsSlice";
import type { AppDispatch } from "@/lib/redux/store";
import type { Project } from "@/lib/api/projects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteProjectDialogProps {
  project: Project;
  isDeleting?: boolean;
  children?: React.ReactNode;
}

export function DeleteProjectDialog({
  project,
  isDeleting = false,
  children,
}: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await dispatch(deleteProject(project._id)).unwrap();
      toast("Success", {
        description: "Project deleted successfully",
        className: "bg-green-500 text-white",
      });
      setOpen(false);
      router.push("/projects");
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px] border border-border p-4">
        <AlertDialogHeader className="flex flex-col gap-1">
          <AlertDialogTitle className="flex items-center gap-2 font-inter text-[16px] font-medium text-foreground">
            Delete Project
          </AlertDialogTitle>
          <AlertDialogDescription className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
            Are you sure you want to delete &quot;{project.name}&quot;? This
            action cannot be undone and will permanently delete the project and
            all its associated workflows and secrets.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="justify-start shadow-none gap-2 text-left font-normal border-2 border-neutral-300 bg-white hover:bg-neutral-100 text-muted-foreground cursor-pointer text-xs h-7 px-2.5 py-1">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="justify-start gap-2 text-left font-normal  bg-destructive hover:bg-destructive/70 text-white hover:text-white cursor-pointer text-xs h-7 px-2.5 py-1"
          >
            {isDeleting ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              "Delete Project"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteProjectDialog } from "@/components/project-dialogs/delete-project-dialog";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { selectProject, updateProject } from "@/lib/redux/slices/projectsSlice";
import { Copy, LoaderCircle, TriangleAlert } from "lucide-react";
import { CorsForm } from "@/components/config-forms/CorsForm";
import { RateLimitForm } from "@/components/config-forms/RateLimitForm";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SettingsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();

  const {
    projects,
    selectedProject,
    isLoading: projectsLoading,
  } = useSelector((state: RootState) => state.projects);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  // Find the current project

  useEffect(() => {
    if (selectedProject) {
      setName(selectedProject.name ?? "");
      setDescription(selectedProject.description ?? "");
    }
  }, [selectedProject]);

  const hasChanges =
    name.trim() !== (selectedProject?.name ?? "").trim() ||
    description.trim() !== (selectedProject?.description ?? "").trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast("Error", {
        description: "Project name is required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    if (!selectedProject?._id) {
      toast("Error", {
        description: "Project not found",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    try {
      await dispatch(
        updateProject({
          id: selectedProject?._id,
          data: { name: name.trim(), description: description.trim() },
        })
      ).unwrap();
      toast("Success", {
        description: "Project updated successfully",
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

  const handleCancel = () => {
    if (selectedProject) {
      setName(selectedProject.name || "");
      setDescription(selectedProject.description || "");
    }
  };

  const currentProject = projects.find((p) => p._id === id);

  useEffect(() => {
    // If the current project is different from selected, update it
    if (currentProject && currentProject._id !== selectedProject?._id) {
      dispatch(selectProject(currentProject));
    }
  }, [currentProject, selectedProject, dispatch]);

  const handleCopyProjectId = async () => {
    try {
      if (!currentProject) {
        return;
      }
      await navigator.clipboard.writeText(currentProject._id);
      toast("Success", {
        description: "Copied to clipboard",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.log(error);
      toast("Error", {
        description: "Failed to copy to clipboard",
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Project not found</h2>
          <p className="text-muted-foreground">
            The project you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=" max-w-6xl w-full py-6 mx-auto ">
      <div className="mb-12">
        <h1 className="text-xl font-inter font-medium tracking-tight text-foreground">
          Project Settings
        </h1>
        <p className="text-xs font-inter text-muted-foreground mt-1">
          Manage your project configuration
        </p>
      </div>

      <Card className="rounded-lg shadow-xs p-0 border border-border">
        <CardContent className=" p-0">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-start justify-between w-full"
          >
            <div className="flex items-start justify-between w-full p-8">
              <div className="w-full flex-1 ">
                <p className="text-sm font-inter">General Settings</p>
              </div>

              <div className="space-y-4 flex-1 w-full ">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name" className="text-sm font-inter">
                    Project Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter project name"
                    required
                    className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter text-xs"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter project description"
                    rows={3}
                    className="px-3 py-2 bg-input border border-border rounded-lg font-inter  text-xs"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-inter">Project ID</Label>
                  <div className="relative h-8 ">
                    <Input
                      value={currentProject._id}
                      placeholder="Project id"
                      disabled
                      className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter  text-xs cursor-not-allowed"
                    />
                    <Button
                      type="button"
                      onClick={handleCopyProjectId}
                      className="absolute right-1 top-0.5 justify-start shadow-none gap-2 text-left font-normal  cursor-pointer text-xs h-7 px-2.5 py-1"
                    >
                      <Copy className="size-3.5" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full justify-end border-t border-border py-4 px-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={!hasChanges}
                className="justify-start shadow-none gap-2 text-left font-normal border-2 border-neutral-300 bg-white hover:bg-neutral-100 text-muted-foreground  cursor-pointer text-xs h-7 px-2.5 py-1"
              >
                Cancel
              </Button>
              <Button
                className="justify-start gap-2 text-left font-normal  cursor-pointer text-xs h-7 px-2.5 py-1"
                type="submit"
                disabled={projectsLoading || !hasChanges}
              >
                {projectsLoading ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="pt-12 space-y-8">
        <div>
          <h1 className="text-xl font-inter font-medium tracking-tight text-foreground">
            CORS
          </h1>
          <p className="text-xs font-inter text-muted-foreground mt-1">
            Manage your project CORS configuration
          </p>
        </div>

        <Card className="rounded-lg shadow-xs p-0 border bg-card border-border">
          <CardContent className="p-0 flex items-start gap-4">
            <CorsForm project={currentProject} />
          </CardContent>
        </Card>
      </div>

      <div className="pt-12 space-y-8">
        <div>
          <h1 className="text-xl font-inter font-medium tracking-tight text-foreground">
            Rate Limiter
          </h1>
          <p className="text-xs font-inter text-muted-foreground mt-1">
            Manage your project Rate Limiter configuration
          </p>
        </div>

        <Card className="rounded-lg shadow-xs p-0 border bg-card border-border">
          <CardContent className="p-0 flex items-start gap-4">
            <RateLimitForm project={currentProject} />
          </CardContent>
        </Card>
      </div>

      <div className="pt-12 space-y-8">
        <h1 className="text-xl font-inter font-medium tracking-tight text-foreground">
          Delete Project
        </h1>

        <Card className="rounded-lg shadow-xs p-0 border bg-card border-border">
          <CardContent className="p-3 flex items-start gap-4">
            <div className="bg-destructive rounded-lg size-7 flex items-center justify-center">
              <TriangleAlert className="text-white size-4" />
            </div>
            <div className="space-y-2">
              <p className="font-inter text-sm text-foreground font-medium">
                Deleting this project will also remove your platform database
              </p>
              <p className="font-inter text-xs text-muted-foreground tracking-wide">
                Make sure you have made a backup if you want to keep your data
              </p>
              <DeleteProjectDialog
                project={currentProject}
                isDeleting={projectsLoading}
              >
                <Button
                  variant="destructive"
                  className="mt-2 justify-start gap-2 text-left font-normal  cursor-pointer text-xs h-7 px-2.5 py-1 shadow-none"
                >
                  Delete Project
                </Button>
              </DeleteProjectDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { Button } from "@/components/ui/button";
// import { CreateWorkflowDialog } from "@/components/project-dialogs/create-workflow-dialog";
import {
  fetchWorkflows,
  selectWorkflow,
} from "@/lib/redux/slices/workflowsSlice";
import { useRouter } from "next/navigation";
import { EditWorkflowDialog } from "@/components/project-dialogs/edit-workflow-dialog";
import { Workflow as WorkflowType } from "@/lib/api/workflows";
// import { Plus } from "lucide-react";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { WorkflowsTable } from "@/components/workflows-table";

interface WorkflowsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WorkflowsPage({ params }: WorkflowsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { projects, selectedProject } = useSelector(
    (state: RootState) => state.projects
  );

  const {
    workflows,
    // isLoading: workflowsLoading,
    isCreating: workflowsCreating,
    selectedWorkflow,
  } = useSelector((state: RootState) => state.workflows);

  // Find the current project
  const currentProject = projects.find((p) => p._id === id);

  useEffect(() => {
    if (currentProject) {
      dispatch(fetchWorkflows(currentProject._id));
    }
  }, [currentProject, dispatch]);

  const handleWorkflowClick = (workflow: WorkflowType) => {
    if (!currentProject) return;
    dispatch(selectWorkflow(workflow));
    router.push(`/projects/${currentProject._id}/workflows/${workflow._id}`);
  };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [workflowToEdit, setWorkflowToEdit] = useState<WorkflowType | null>(
    null
  );

  const handleEditWorkflow = (workflow: WorkflowType) => {
    console.log("Edit workflow:", workflow);
    setWorkflowToEdit(workflow);
    setEditDialogOpen(true);
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
    <div className="h-full max-w-7xl w-full  py-6 mx-auto">
      <WorkflowsTable
        workflows={workflows}
        projectId={selectedProject?._id || currentProject._id}
        onEditWorkflow={handleEditWorkflow}
        onWorkflowClick={handleWorkflowClick}
        selectedWorkflowId={selectedWorkflow?._id}
        mode="workflows"
        isCreating={workflowsCreating}
      />
      {workflowToEdit && (
        <EditWorkflowDialog
          workflow={workflowToEdit}
          projectId={currentProject._id}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);

            if (!open) setWorkflowToEdit(null);
          }}
        />
      )}
    </div>
  );
}

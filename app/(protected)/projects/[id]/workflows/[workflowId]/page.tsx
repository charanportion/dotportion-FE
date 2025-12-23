"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { ApiBuilderContent } from "@/components/api-builder-content";
import { use, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchWorkflows,
  selectWorkflow,
} from "@/lib/redux/slices/workflowsSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { LoaderCircle } from "lucide-react";

interface WorkflowEditorPageProps {
  params: Promise<{
    id: string;
    workflowId: string;
  }>;
}

export default function WorkflowEditorPage({
  params,
}: WorkflowEditorPageProps) {
  const { id: projectId, workflowId } = use(params);
  // const dispatch = useDispatch<AppDispatch>();
  // const router = useRouter();

  // const { workflows, isLoading, selectedWorkflow } = useSelector(
  //   (state: RootState) => state.workflows
  // );

  // useEffect(() => {
  //   dispatch(fetchWorkflows(projectId));
  // }, [projectId, dispatch]);

  // useEffect(() => {
  //   // If workflows are loaded and we have a workflowId, select the workflow
  //   if (workflows.length > 0 && workflowId) {
  //     const workflow = workflows.find((w) => w._id === workflowId);
  //     if (
  //       workflow &&
  //       (!selectedWorkflow || selectedWorkflow._id !== workflowId)
  //     ) {
  //       dispatch(selectWorkflow(workflow));
  //     }
  //   }
  // }, [workflows, workflowId, selectedWorkflow, dispatch]);

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-[94vh]">
  //       <div className="flex flex-col items-center gap-2">
  //         {/* <DotLoader /> */}
  //         <LoaderCircle className="size-4 text-foreground animate-spin" />
  //         <p className="text-sm text-muted-foreground">Loading project...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!selectedWorkflow || selectedWorkflow._id !== workflowId) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-semibold">Workflow not found</h2>
  //         <p className="text-muted-foreground mt-2">
  //           The workflow you are looking for does not exist.
  //         </p>
  //         <button
  //           onClick={() => router.push(`/projects/${projectId}/workflows/`)}
  //           className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
  //         >
  //           Back to Project
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <ReactFlowProvider>
      <ApiBuilderContent workflowId={workflowId} projectId={projectId} />
    </ReactFlowProvider>
  );
}

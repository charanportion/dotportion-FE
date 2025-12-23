"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { ApiBuilderContent } from "@/components/api-builder-content";
import { use } from "react";

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

  return (
    <ReactFlowProvider>
      <ApiBuilderContent workflowId={workflowId} projectId={projectId} />
    </ReactFlowProvider>
  );
}

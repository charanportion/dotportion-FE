"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { Card, CardContent } from "@/components/ui/card";

import { fetchSecrets } from "@/lib/redux/slices/secretsSlice";

import { EditSecretDialog } from "@/components/project-dialogs/edit-secret-dialog";
import { Secret } from "@/lib/api/secrets";

import type { RootState, AppDispatch } from "@/lib/redux/store";
import { SecretsTable } from "@/components/secrets-table";

interface SecretsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SecretsPage({ params }: SecretsPageProps) {
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();

  const { projects, selectedProject } = useSelector(
    (state: RootState) => state.projects
  );

  const {
    secrets,
    isLoading: secretsLoading,
    isCreating: secretsCreating,
  } = useSelector((state: RootState) => state.secrets);

  // Find the current project
  const currentProject = projects.find((p) => p._id === id);

  useEffect(() => {
    // If the current project is different from selected, update it
    if (currentProject && currentProject._id !== selectedProject?._id) {
      // This will be handled by the dashboard page or topbar
    }
  }, [currentProject, selectedProject]);

  useEffect(() => {
    if (currentProject) {
      dispatch(fetchSecrets(currentProject._id));
    }
  }, [currentProject, dispatch]);

  const [editSecretDialogOpen, setEditSecretDialogOpen] = useState(false);
  const [secretToEdit, setSecretToEdit] = useState<Secret | null>(null);

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
      {/* CHANGE: Render the table directly. We removed the Card wrapper. */}
      {secretsLoading ? (
        <p className="text-muted-foreground">Loading secrets...</p>
      ) : (
        <SecretsTable
          data={secrets}
          projectId={currentProject._id}
          isCreating={secretsCreating}
        />
      )}

      {/* The dialog can remain here as it's positioned absolutely */}
      {secretToEdit && (
        <EditSecretDialog
          secret={secretToEdit}
          projectId={currentProject._id}
          open={editSecretDialogOpen}
          onOpenChange={(open) => {
            setEditSecretDialogOpen(open);
            if (!open) setSecretToEdit(null);
          }}
        />
      )}
    </div>
  );
}

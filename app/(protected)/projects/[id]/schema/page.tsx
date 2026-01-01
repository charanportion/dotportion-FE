"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchSecrets } from "@/lib/redux/slices/secretsSlice";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Database,
  Server,
  Plus,
  ArrowRight,
  Key,
  Hash,
  Fingerprint,
  Circle,
  Diamond,
} from "lucide-react";

const DATABASE_TYPES = ["mongodb", "supabase", "neondb"];

type DatabaseOption = {
  id: string;
  name: string;
  description: string;
  type: "platform" | "mongodb" | "supabase" | "neondb";
  icon: React.ReactNode;
  isPlatform?: boolean;
};

export default function DatabasePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { secrets, error } = useSelector((state: RootState) => state.secrets);
  const { selectedProject } = useSelector((state: RootState) => state.projects);

  const databaseOptions: DatabaseOption[] = (() => {
    const options: DatabaseOption[] = [
      {
        id: "platform",
        name: "Platform Database",
        description: "Access project's internal database",
        type: "platform",
        icon: <Database className="size-4" />,
        isPlatform: true,
      },
    ];

    const dbSecrets = secrets.filter((s) =>
      DATABASE_TYPES.includes(s.provider.toLowerCase())
    );
    dbSecrets.forEach((secret) => {
      options.push({
        id: secret.provider.toLowerCase(),
        name: secret.provider,
        description: "Click to explore collections and data",
        type: secret.provider.toLowerCase() as
          | "mongodb"
          | "supabase"
          | "neondb",
        icon: <Server className="size-4" />,
      });
    });

    return options;
  })();

  const handleDatabaseClick = (db: DatabaseOption) => {
    router.push(`/projects/${selectedProject?._id}/schema/${db.id}`);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="flex w-full h-12 min-h-12 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Select a database to manage its schema
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-background p-8 overflow-auto">
        {error ? (
          <div className="text-center max-w-md">
            <div className="bg-card rounded-full p-4 w-fit mx-auto mb-4">
              <Database className="size-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error Loading Databases
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => {
                if (selectedProject)
                  dispatch(fetchSecrets(selectedProject._id));
              }}
            >
              Retry
            </Button>
          </div>
        ) : databaseOptions.length === 0 ? (
          <div className="text-center max-w-md">
            <div className="bg-card rounded-full p-6 w-fit mx-auto mb-4">
              <Database className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Database Secrets Found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a MongoDB, Supabase, or NeonDB secret to get started with
              schema management.
            </p>
            <Button>
              <Plus className="size-4 mr-2" />
              Add Database Secret
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                Schema Management
              </h2>
              <p className="text-muted-foreground">
                Select a database to visualize and manage your data schema
              </p>
            </div>

            <div
              className={cn(
                "grid gap-4",
                databaseOptions.length === 1
                  ? "grid-cols-1 place-items-center"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {databaseOptions.map((db) => (
                <div
                  key={db.id}
                  onClick={() => handleDatabaseClick(db)}
                  className={cn(
                    "group p-4 rounded-lg border cursor-pointer transition-all",
                    "hover:shadow-md hover:bg-muted border-border bg-card",
                    databaseOptions.length === 1 && "w-full max-w-sm"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        db.isPlatform ? "bg-secondary" : "bg-secondary"
                      )}
                    >
                      {db.icon}
                    </div>
                    {db.isPlatform && (
                      <span className="text-[10px] bg-secondary text-foreground px-2 py-0.5 rounded-full font-medium">
                        INTERNAL
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{db.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {db.description}
                  </p>
                  <div className="flex items-center text-xs text-primary group-hover:underline">
                    Open Schema Editor
                    <ArrowRight className="size-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer - Legend */}
      <div className="h-9 border-t border-border bg-background flex items-center justify-center gap-6 px-4 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Key className="size-3.5 text-amber-500" />
          <span>Primary key</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Hash className="size-3.5 text-blue-500" />
          <span>Identity</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Fingerprint className="size-3.5 text-purple-500" />
          <span>Unique</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Circle className="size-3.5 text-neutral-400" />
          <span>Nullable</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Diamond className="size-3.5 text-neutral-700 fill-neutral-700" />
          <span>Non-Nullable</span>
        </div>
      </div>
    </>
  );
}

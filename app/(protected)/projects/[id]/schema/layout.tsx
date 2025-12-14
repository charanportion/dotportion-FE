"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchSecrets } from "@/lib/redux/slices/secretsSlice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Database, Server, Search, Plus, Inbox } from "lucide-react";

const DATABASE_TYPES = ["mongodb", "supabase", "neondb"];

type DatabaseOption = {
  id: string;
  name: string;
  type: "platform" | "mongodb" | "supabase" | "neondb";
  icon: React.ReactNode;
  isPlatform?: boolean;
};

export default function SchemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const projectId = params.id as string;
  const currentDatabase = (params.database as string) || null;

  const { secrets, isLoading } = useSelector(
    (state: RootState) => state.secrets
  );
  const { selectedProject } = useSelector((state: RootState) => state.projects);

  const [searchTerm, setSearchTerm] = useState("");
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Fetch secrets once on mount
  useEffect(() => {
    if (selectedProject && !hasAttemptedFetch) {
      dispatch(fetchSecrets(selectedProject._id))
        .unwrap()
        .catch((err) => {
          toast.error("Failed to load database secrets", {
            description: err,
            duration: 4000,
          });
        });
      setHasAttemptedFetch(true);
    }
  }, [dispatch, selectedProject, hasAttemptedFetch]);

  // Build database options from secrets
  const databaseOptions: DatabaseOption[] = (() => {
    const options: DatabaseOption[] = [
      {
        id: "platform",
        name: "Platform Database",
        type: "platform",
        icon: <Database className="size-3.5" />,
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
        type: secret.provider.toLowerCase() as
          | "mongodb"
          | "supabase"
          | "neondb",
        icon: <Server className="size-3.5" />,
      });
    });

    return options;
  })();

  const filteredDatabases = databaseOptions.filter((db) => {
    if (!searchTerm) return true;
    return db.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDatabaseClick = (db: DatabaseOption) => {
    if (db.id === currentDatabase) return;
    router.push(`/projects/${projectId}/schema/${db.id}`);
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full bg-background text-foreground overflow-hidden">
      {/* Left Panel: Database List - Persisted across routes */}
      <div className="w-64 flex flex-col h-full border-r border-border bg-white shrink-0">
        <div className="border-b border-border flex min-h-12 items-center px-4">
          <h4 className="text-sm font-medium">Schema Management</h4>
        </div>
        <div className="flex-grow overflow-y-auto flex flex-col">
          <div className="flex gap-x-2 items-center sticky top-0 bg-neutral-50 backdrop-blur z-[1] px-4 py-3 border-b border-border">
            <div className="relative h-7 flex-1">
              <Search className="absolute top-1.5 left-2 size-3.5 text-neutral-600" />
              <Input
                className="h-7 w-full pl-7 text-xs bg-neutral-100 border border-neutral-300 shadow-none"
                placeholder="Search Databases"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="size-7 shadow-none border-neutral-300"
                >
                  <Plus className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Database Secret</TooltipContent>
            </Tooltip>
          </div>

          <div className="px-2 py-2 space-y-0.5">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-2 mb-1 uppercase">
              Databases
            </div>

            {isLoading || !hasAttemptedFetch ? (
              <div className="space-y-1.5 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-2">
                    <Skeleton className="size-4 shrink-0 rounded-md" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredDatabases.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <Inbox className="size-8 text-neutral-400 mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No databases found
                </h3>
                <p className="text-xs max-w-sm">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "Add a database secret to get started."}
                </p>
              </div>
            ) : (
              filteredDatabases.map((db) => (
                <div
                  key={db.id}
                  onClick={() => handleDatabaseClick(db)}
                  className={cn(
                    "h-7 px-4 py-2 cursor-pointer text-xs truncate rounded-md hover:bg-neutral-100 flex items-center gap-2 transition-colors",
                    currentDatabase === db.id
                      ? "bg-neutral-100 text-black font-medium"
                      : "text-neutral-700"
                  )}
                >
                  {db.icon}
                  <span className="truncate">{db.name}</span>
                  {db.isPlatform && (
                    <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      INTERNAL
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Dynamic Content */}
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden">
        {children}
      </div>
    </div>
  );
}

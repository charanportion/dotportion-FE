"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Database,
  Server,
  Search,
  Grid3X3,
  List,
  ChevronRight,
} from "lucide-react";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchSecrets } from "@/lib/redux/slices/secretsSlice";
import Link from "next/link";
import { format } from "date-fns";

const DATABASE_TYPES = ["mongodb", "supabase", "neondb"];

export default function DatabasePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { secrets, isLoading, error } = useSelector(
    (state: RootState) => state.secrets
  );
  const { selectedProject } = useSelector((state: RootState) => state.projects);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchSecrets(selectedProject._id));
    }
  }, [dispatch, selectedProject]);

  const databaseSecrets = secrets.filter((secret) =>
    DATABASE_TYPES.includes(secret.provider.toLowerCase())
  );

  // Include platform database in the list
  const allDatabases = [
    {
      _id: "platform",
      name: "Platform Database",
      provider: "Internal",
      description: "Access project's internal database",
      type: "platform",
      createdAt: selectedProject?.createdAt || new Date().toISOString(),
      updatedAt: selectedProject?.updatedAt || new Date().toISOString(),
    },
    ...databaseSecrets.map((secret) => ({
      _id: secret._id,
      name: secret.provider,
      provider: secret.provider.toUpperCase(),
      description: "Click to explore collections and data",
      type: "external",
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    })),
  ];

  const filteredDatabases = allDatabases.filter(
    (db) =>
      db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      db.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      db.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl w-full py-6 mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Database Management
          </h1>
        </div>

        {/* Skeleton Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="border border-border bg-card shadow-none rounded-xl py-4 px-6"
            >
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-48" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center gap-4">
        <p className="text-red-600 font-medium">Error: {error}</p>
        <Button
          onClick={() =>
            selectedProject && dispatch(fetchSecrets(selectedProject._id))
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  // Empty State (no external databases)
  if (databaseSecrets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center gap-4 bg-background">
        <Database className="h-10 w-10 text-gray-400" />
        <h2 className="text-2xl font-semibold text-gray-800">
          No database secrets configured
        </h2>
        <p className="text-muted-foreground">
          Add a MongoDB, Supabase, or NeonDB secret to connect external
          databases.
        </p>
        <Button>Add Database Secret</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full py-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">
            Database Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your database connections and explore your data
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2 top-1.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search for a database"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-10 h-7 border border-neutral-300 rounded-md bg-neutral-100 text-xs shadow-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={"ghost"}
            size="icon"
            className={`size-7 shadow-none ${
              viewMode === "grid"
                ? "bg-neutral-300 text-black"
                : "text-neutral-500"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="size-3.5" />
          </Button>
          <Button
            variant={"ghost"}
            size="icon"
            className={`size-7 shadow-none ${
              viewMode === "list"
                ? "bg-neutral-300 text-black"
                : "text-neutral-500"
            }`}
            onClick={() => setViewMode("list")}
          >
            <List className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Conditional Rendering */}
      {viewMode === "grid" ? (
        // ---------------- GRID VIEW ----------------
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDatabases.map((database) => {
            const href =
              database.type === "platform"
                ? `/projects/${selectedProject?._id}/database/platform?type=platform`
                : `/projects/${selectedProject?._id}/database/${database._id}`;

            return (
              <Link key={database._id} href={href}>
                <Card className="cursor-pointer border border-neutral-300 bg-white shadow-none rounded-lg p-5 transition-colors duration-200 hover:bg-muted">
                  <CardHeader className="p-0 flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
                        {database.type === "platform" ? (
                          <Database className="h-4 w-4" />
                        ) : (
                          <Server className="h-4 w-4" />
                        )}
                        <span className="truncate">{database.name}</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground truncate">
                        {database.description}
                      </p>
                    </div>

                    {/* Chevron Button */}
                    <div className="transition-transform duration-200 hover:scale-125">
                      <ChevronRight className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 flex w-full items-center justify-between text-xs text-muted-foreground">
                    <div className="flex flex-col items-start gap-2 text-muted-foreground font-medium">
                      <p>
                        <span className="font-medium text-foreground">
                          Type:
                        </span>{" "}
                        {database.provider}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Created on:
                        </span>{" "}
                        {format(new Date(database.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        // ---------------- LIST VIEW ----------------
        <div className="w-full bg-white rounded-lg overflow-hidden shadow-xs border border-neutral-300 h-full">
          {/* List Header */}
          <div className="grid grid-cols-3 px-6 py-3 text-xs font-medium bg-neutral-100 text-neutral-600 border-b-2 border-neutral-300 uppercase tracking-wide min-w-[800px]">
            <div className="text-left">Database</div>
            <div className="text-center">Type</div>
            <div className="text-center">Created</div>
          </div>

          {/* List Rows */}
          <div className="divide-y divide-border">
            {filteredDatabases.map((database) => {
              const href =
                database.type === "platform"
                  ? `/projects/${selectedProject?._id}/database/platform?type=platform`
                  : `/projects/${selectedProject?._id}/database/${database._id}`;

              return (
                <Link key={database._id} href={href}>
                  <div className="grid grid-cols-3 px-4 py-4 items-center text-sm text-foreground hover:bg-muted/50 transition cursor-pointer min-w-[800px]">
                    {/* LEFT ALIGNED DATABASE NAME + DESCRIPTION */}
                    <div className="flex flex-col text-left">
                      <span className="font-semibold truncate flex items-center gap-2">
                        {database.type === "platform" ? (
                          <Database className="h-4 w-4" />
                        ) : (
                          <Server className="h-4 w-4" />
                        )}
                        {database.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {database.description}
                      </span>
                    </div>

                    {/* CENTERED TYPE */}
                    <div className="text-muted-foreground text-center">
                      {database.provider}
                    </div>

                    {/* CENTERED CREATED DATE */}
                    <div className="text-muted-foreground text-center">
                      {format(
                        new Date(database.createdAt),
                        "dd MMM yyyy - HH:mm:ss"
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

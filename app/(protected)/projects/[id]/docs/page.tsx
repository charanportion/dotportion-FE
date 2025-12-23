// app/(protected)/projects/[id]/docs/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { use } from "react";

import { RootState, AppDispatch } from "@/lib/redux/store";
import {
  fetchWorkflows,
  fetchWorkflowDocs,
} from "@/lib/redux/slices/workflowsSlice";
import { selectProject } from "@/lib/redux/slices/projectsSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as TooltipShadCn,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { Language } from "prism-react-renderer";

import {
  Search,
  Plus,
  Inbox,
  FileCode,
  Copy,
  Check,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface ApiDocsPageProps {
  params: Promise<{ id: string }>;
}

export default function ApiDocsPage({ params }: ApiDocsPageProps) {
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();

  const { projects, selectedProject } = useSelector(
    (state: RootState) => state.projects
  );
  const {
    workflows,
    isLoading: workflowsLoading,
    docs,
    isDocsLoading,
  } = useSelector((state: RootState) => state.workflows);

  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(
    null
  );
  const [workflowSearchTerm, setWorkflowSearchTerm] = useState("");
  const [hasAttemptedInitialFetch, setHasAttemptedInitialFetch] =
    useState(false);
  const [copied, setCopied] = useState<string>("");

  const currentProject = projects.find((p) => p._id === id);

  // Filter to only show deployed workflows
  const deployedWorkflows = useMemo(() => {
    return workflows?.filter((w) => w.isDeployed) || [];
  }, [workflows]);

  const filteredWorkflows = useMemo(() => {
    if (!workflowSearchTerm) return deployedWorkflows;
    const searchLower = workflowSearchTerm.toLowerCase();
    return deployedWorkflows.filter(
      (workflow) =>
        workflow.name.toLowerCase().includes(searchLower) ||
        workflow.description?.toLowerCase().includes(searchLower) ||
        workflow.path?.toLowerCase().includes(searchLower) ||
        workflow.method?.toLowerCase().includes(searchLower)
    );
  }, [deployedWorkflows, workflowSearchTerm]);

  const selectedWorkflow = useMemo(() => {
    return workflows.find((w) => w._id === currentWorkflowId);
  }, [workflows, currentWorkflowId]);

  useEffect(() => {
    if (currentProject && currentProject._id !== selectedProject?._id) {
      dispatch(selectProject(currentProject));
    }
  }, [currentProject, selectedProject, dispatch]);

  useEffect(() => {
    if (!currentProject) return;
    dispatch(fetchWorkflows(currentProject._id));
    setHasAttemptedInitialFetch(true);
  }, [currentProject, dispatch]);

  useEffect(() => {
    if (!currentWorkflowId && deployedWorkflows?.length > 0) {
      setCurrentWorkflowId(deployedWorkflows[0]._id);
    }
  }, [deployedWorkflows, currentWorkflowId]);

  useEffect(() => {
    if (currentWorkflowId) {
      dispatch(fetchWorkflowDocs(currentWorkflowId));
    }
  }, [currentWorkflowId, dispatch]);

  const handleWorkflowClick = (workflowId: string) => {
    setCurrentWorkflowId(workflowId);
  };

  const handleRefresh = () => {
    if (currentWorkflowId) {
      dispatch(fetchWorkflowDocs(currentWorkflowId));
    }
  };

  const copy = (text: string, id?: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopied(id || "copied");
      toast.success("Copied!");
      setTimeout(() => setCopied(""), 1200);
    } catch {
      toast.error("Copy failed");
    }
  };

  const snippetList = docs
    ? [
        {
          key: "curl",
          label: "cURL",
          code: docs.snippets.curl,
          prismLang: "bash",
        },
        {
          key: "fetch",
          label: "Fetch",
          code: docs.snippets.nodeFetch,
          prismLang: "javascript",
        },
        {
          key: "axios",
          label: "Axios",
          code: docs.snippets.nodeAxios,
          prismLang: "javascript",
        },
        {
          key: "python",
          label: "Python",
          code: docs.snippets.python,
          prismLang: "python",
        },
      ]
    : [];

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <h2 className="text-xl">Project not found.</h2>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full bg-background text-foreground overflow-hidden">
      {/* Left Panel: Workflows List */}
      <div className="w-64 flex flex-col h-full border-r border-border bg-background shrink-0">
        <div className="border-b border-border flex min-h-12 items-center px-4">
          <h4 className="text-sm font-medium text-foreground">
            API Documentation
          </h4>
        </div>
        <div className="flex-grow overflow-y-auto flex flex-col">
          <div className="flex gap-x-2 items-center sticky top-0 bg-background backdrop-blur z-[1] px-4 py-3 border-b border-border">
            <div className="relative h-7 flex-1">
              <Search className="absolute top-1.5 left-2 size-3.5 text-neutral-600" />
              <Input
                className="h-7 w-full pl-7 text-xs bg-input border border-border shadow-none "
                placeholder="Search Workflows"
                value={workflowSearchTerm}
                onChange={(e) => setWorkflowSearchTerm(e.target.value)}
              />
            </div>
            <TooltipShadCn>
              <TooltipTrigger>
                <Button
                  asChild
                  size="icon"
                  className="size-7 shadow-none  border border-border cursor-pointer"
                  variant="outline"
                >
                  <Link href={`/projects/${currentProject?._id}/workflows`}>
                    <Plus className="size-3.5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create Workflow</TooltipContent>
            </TooltipShadCn>
          </div>

          <div className="px-2 py-2 space-y-0.5">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-2 mb-1 uppercase">
              Deployed Workflows
            </div>
            {workflowsLoading || !hasAttemptedInitialFetch ? (
              <div className="space-y-1.5 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-2">
                    <Skeleton className="size-4 shrink-0 rounded-md" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredWorkflows.length === 0 && workflowSearchTerm ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <Inbox className="size-8 text-foreground mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No workflows found
                </h3>
                <p className="text-xs max-w-sm">
                  Try adjusting your search or{" "}
                  <Link
                    href={`/projects/${currentProject?._id}/workflows`}
                    className="text-primary hover:underline"
                  >
                    create a new workflow
                  </Link>
                  .
                </p>
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <Inbox className="size-8 text-foreground mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No deployed workflows
                </h3>
                <p className="text-xs max-w-sm">
                  Deploy a workflow to generate its API documentation.
                </p>
              </div>
            ) : (
              filteredWorkflows.map((workflow) => (
                <div
                  key={workflow._id}
                  onClick={() => handleWorkflowClick(workflow._id)}
                  className={cn(
                    "h-7 px-4 py-2 cursor-pointer text-xs truncate rounded-md hover:bg-muted flex items-center gap-2 transition-colors",
                    currentWorkflowId === workflow._id
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <FileCode className="size-3.5 shrink-0" />
                  <span className="truncate">{workflow.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Documentation Content */}
      <div className="flex flex-1 h-full overflow-hidden">
        <div className="h-full flex flex-col bg-background flex-1">
          {/* Top Bar */}
          <div className="relative flex w-full h-12 min-h-12 items-center justify-between border-b border-border px-4 gap-4">
            <div className="flex items-center gap-2">
              {selectedWorkflow && (
                <>
                  <span className="text-sm font-medium text-foreground">
                    {selectedWorkflow.name}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border",
                      selectedWorkflow.isDeployed
                        ? "bg-green-50 dark:bg-green-950 text-green-500 border-green-500"
                        : "bg-neutral-50 dark:bg-neutral-950 text-neutral-500 border-neutral-500"
                    )}
                  >
                    {selectedWorkflow.isDeployed ? "Deployed" : "Draft"}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="size-7 shadow-none bg-secondary border border-border  cursor-pointer "
                onClick={handleRefresh}
                disabled={isDocsLoading}
              >
                <RefreshCcw
                  className={cn("size-3.5", isDocsLoading && "animate-spin")}
                  style={isDocsLoading ? { animationDirection: "reverse" } : {}}
                />
              </Button>
              {docs && (
                <Button
                  className="h-7 px-2.5 text-xs shadow-none  gap-1.5"
                  onClick={() => copy(docs.endpoint, "endpoint-header")}
                >
                  {copied === "endpoint-header" ? (
                    <Check className="size-3.5 text-green-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  Copy Endpoint
                </Button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {!currentWorkflowId ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                <div className=" rounded-full p-6 mb-4">
                  <FileCode className="size-12 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Select a workflow
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Choose a deployed workflow from the sidebar to view its API
                  documentation.
                </p>
              </div>
            ) : isDocsLoading || !docs ? (
              <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="w-full">
                {/* Endpoint Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-foreground">
                      {docs.name}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-2">
                      {docs.description}
                    </p>
                    <h3 className="text-base font-semibold text-foreground mt-6">
                      Endpoint
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Use this endpoint to trigger the workflow
                      programmatically.
                    </p>
                  </div>
                  <div className="bg-card p-6 flex items-end">
                    <div className="group w-full bg-secondary border border-border rounded-lg p-3 flex justify-between items-center gap-2">
                      <code className="text-xs break-all">
                        <span className="text-foreground font-medium">
                          {docs.method}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {docs.endpoint}
                        </span>
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copy(docs.endpoint, "endpoint")}
                        className="h-6 px-2 text-xs shrink-0 text-foreground"
                      >
                        {copied === "endpoint" ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Required Fields Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6">
                    <h3 className="text-base font-semibold text-foreground">
                      Required Fields
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      These parameters are required to execute the workflow
                      successfully.
                    </p>
                  </div>
                  <div className="bg-card p-6">
                    <div className="overflow-hidden border border-border rounded-lg bg-secondary">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary">
                            <TableHead className="text-xs font-medium text-muted-foreground">
                              Name
                            </TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground">
                              Type
                            </TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground">
                              Required
                            </TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground">
                              Location
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(docs.bodyParams || {}).map(
                            ([key, val]) => (
                              <TableRow key={key}>
                                <TableCell className="text-xs font-mono text-foreground">
                                  {key}
                                </TableCell>
                                <TableCell className="text-xs text-foreground">
                                  {val.type}
                                </TableCell>
                                <TableCell className="text-xs text-foreground">
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[10px]",
                                      val.required
                                        ? "bg-amber-50 dark:bg-amber-950 text-amber-500 border border-amber-500"
                                        : "bg-neutral-50 dark:bg-neutral-950 text-neutral-500 border border-neutral-500"
                                    )}
                                  >
                                    {val.required ? "Yes" : "No"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-xs text-foreground">
                                  {val.from}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                          {Object.entries(docs.queryParams || {}).map(
                            ([key, val]) => (
                              <TableRow key={key}>
                                <TableCell className="text-xs font-mono text-foreground">
                                  {key}
                                </TableCell>
                                <TableCell className="text-xs text-foreground">
                                  {val.type}
                                </TableCell>
                                <TableCell className="text-xs text-foreground">
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[10px]",
                                      val.required
                                        ? "bg-amber-50 dark:bg-amber-950 text-amber-500 border border-amber-500"
                                        : "bg-neutral-50 dark:bg-neutral-950 text-neutral-500 border border-neutral-500"
                                    )}
                                  >
                                    {val.required ? "Yes" : "No"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-xs text-foreground">
                                  {val.from}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                          {Object.keys(docs.bodyParams || {}).length === 0 &&
                            Object.keys(docs.queryParams || {}).length ===
                              0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center text-sm text-neutral-500 py-6"
                                >
                                  No parameters required
                                </TableCell>
                              </TableRow>
                            )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Code Snippets Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6">
                    <h3 className="text-base font-semibold text-foreground">
                      Code Snippets
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Choose a language to copy ready-to-use workflow API
                      examples.
                    </p>
                  </div>
                  <div className="bg-card p-6">
                    <Tabs defaultValue={snippetList[0]?.key} className="w-full">
                      <TabsList className=" border-border mb-3 h-7">
                        {snippetList.map((item) => (
                          <TabsTrigger
                            key={item.key}
                            value={item.key}
                            className="text-xs data-[state=active]:bg-secondary data-[state=active]:border data-[state=active]:border-border shadow-none"
                          >
                            {item.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {snippetList.map((item) => (
                        <TabsContent key={item.key} value={item.key}>
                          <div className="group relative">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => copy(item.code, item.key)}
                              className="absolute top-2 right-2 h-6 px-2 text-xs border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur"
                            >
                              {copied === item.key ? (
                                <>
                                  <Check className="size-3 mr-1 text-green-600" />{" "}
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="size-3 mr-1" /> Copy
                                </>
                              )}
                            </Button>
                            <CodeBlock
                              code={item.code}
                              language={item.prismLang as Language}
                            />
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </div>

                <Separator />

                {/* Response Example Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6">
                    <h3 className="text-base font-semibold text-foreground">
                      Response Example
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Example response returned by the workflow execution.
                    </p>
                  </div>
                  <div className="bg-card p-6">
                    <div className="group relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copy(docs.responseExample, "response")}
                        className="absolute top-2 right-2 h-6 px-2 text-xs border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur"
                      >
                        {copied === "response" ? (
                          <>
                            <Check className="size-3 mr-1 text-green-600" />{" "}
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3 mr-1" /> Copy
                          </>
                        )}
                      </Button>
                      <CodeBlock code={docs.responseExample} language="json" />
                    </div>
                  </div>
                </div>
                <Separator />
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="h-9 border-t border-border bg-background flex items-center justify-between px-4 shrink-0">
            <span className="text-xs text-muted-foreground">
              {deployedWorkflows.length} deployed workflow
              {deployedWorkflows.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                API Version 1.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

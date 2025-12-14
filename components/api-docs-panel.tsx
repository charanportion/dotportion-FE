// components/api-docs-panel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchWorkflowDocs } from "@/lib/redux/slices/workflowsSlice";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "./ui/separator";
import { CodeBlock } from "./code-block";
import { Language } from "prism-react-renderer";

export default function ApiDocsPanel({ workflowId }: { workflowId: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const { docs, isDocsLoading } = useSelector(
    (state: RootState) => state.workflows
  );

  const [copied, setCopied] = useState<string>("");

  useEffect(() => {
    if (workflowId) dispatch(fetchWorkflowDocs(workflowId));
  }, [workflowId, dispatch]);

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

  if (isDocsLoading || !docs) {
    return <div className="text-muted">Loading documentation...</div>;
  }

  const snippetList = [
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
  ];

  return (
    <div className="w-full min-h-full flex flex-col mx-auto">
      {/* ===========================================================
          HEADER
      ============================================================ */}

      {/* ===========================================================
          ENDPOINT (2-column Supabase layout)
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-start">
        {/* LEFT COLUMN */}

        <div>
          <h2 className="text-xl mt-4 px-6 max-h-7 h-full font-semibold text-foreground">
            {docs.name}
          </h2>
          <p className="text-muted-foreground text-sm mt-2 mb-4 px-6">
            {docs.description}
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-4 px-6 h-full max-h-7">
            Endpoint
          </h2>
          <p className="text-muted-foreground text-sm mt-2 mb-4 px-6">
            Use this endpoint to trigger the workflow programmatically.
          </p>
        </div>

        {/* RIGHT COLUMN */}
        <div className="bg-secondary px-6 pt-10 pb-2 flex items-end h-full">
          <div className="group bg-secondary border border-sidebar-border pt-2 pb-4 rounded-md flex justify-between items-center">
            <code className="text-xs text-accent-foreground break-all">
              {docs.method}{" "}
              <span className="text-xs text-muted-foreground">
                {docs.endpoint}
              </span>
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copy(docs.endpoint, "endpoint")}
              className="text-xs text-muted-foreground  px-6 py-3 min-h-3 max-h-3 h-full border-1 border-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied === "endpoint" ? <span>Copied</span> : <span>Copy</span>}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* ===========================================================
          REQUIRED FIELDS (2-column layout)
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-start">
        {/* LEFT COLUMN */}
        <div>
          <h2 className="text-xl mt-4 px-6 max-h-7 h-full font-semibold text-foreground">
            Required Fields
          </h2>
          <p className="text-muted-foreground text-sm mt-2 px-6">
            These parameters are required to execute the workflow successfully.
          </p>
        </div>

        {/* RIGHT COLUMN */}
        <div className="bg-secondary">
          <div className="overflow-hidden border border-sidebar-border rounded p-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary">
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Object.entries(docs.bodyParams || {}).map(([key, val]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{val.type}</TableCell>
                    <TableCell>{val.required ? "Yes" : "No"}</TableCell>
                    <TableCell>{val.from}</TableCell>
                  </TableRow>
                ))}

                {Object.entries(docs.queryParams || {}).map(([key, val]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{val.type}</TableCell>
                    <TableCell>{val.required ? "Yes" : "No"}</TableCell>
                    <TableCell>{val.from}</TableCell>
                  </TableRow>
                ))}

                {Object.keys(docs.bodyParams).length === 0 &&
                  Object.keys(docs.queryParams).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-primary text-center p-4"
                      >
                        No parameters
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Separator />

      {/* ===========================================================
          CODE SNIPPETS (2-column layout)
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-start">
        {/* LEFT COLUMN */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mt-4 px-6 max-h-7 h-full">
            Code Snippets
          </h2>
          <p className="text-muted-foreground text-sm mt-2 px-6">
            Choose a language to copy ready-to-use workflow API examples.
          </p>
        </div>

        {/* RIGHT COLUMN */}
        <div className="bg-secondary px-6 py-4 min-w-152">
          <Tabs defaultValue={snippetList[0].key} className="w-full">
            <div className="flex items center justify-between">
              <TabsList className="bg-secondary mb-2 flex flex-wrap gap-2">
                {snippetList.map((item) => (
                  <TabsTrigger key={item.key} value={item.key}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {snippetList.map((item) => (
              <TabsContent key={item.key} value={item.key}>
                <div className="group">
                  <div className="bg-secondary mb-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copy(item.code, item.key)}
                      className="text-xs text-muted-foreground px-6 py-3 min-h-3 max-h-3 h-full w-full max-w-8 min-w-8 border-1 border-muted-foreground  opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied === item.key ? "Copied" : "Copy"}
                    </Button>
                  </div>
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

      {/* ===========================================================
          RESPONSE EXAMPLE (2-column layout)
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-start">
        {/* LEFT COLUMN */}
        <div>
          <h2 className="text-xl font-semibold text-primary mt-4 px-6 max-h-7 h-full">
            Response Example
          </h2>
          <p className="text-muted-foreground text-sm mt-2 px-6">
            Example response returned by the workflow execution.
          </p>
        </div>

        {/* RIGHT COLUMN */}
        <div className="bg-secondary px-6 py-4 h-full">
          <CodeBlock
            code={docs.responseExample}
            className="bg-secondary mt-4 p-4 rounded text-sm whitespace-pre-wrap"
            language="json"
          />
        </div>
      </div>
    </div>
  );
}

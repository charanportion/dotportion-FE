// components/DocsSidebar.tsx
"use client";

import React from "react";
import { Workflow } from "@/lib/api/workflows";
import clsx from "clsx";

interface DocsSidebarProps {
  workflows: Workflow[];
  loading: boolean;
  selectedWorkflowId: string | null;
  onSelectWorkflow: (id: string) => void;
}

export default function DocsSidebar({
  workflows,
  loading,
  selectedWorkflowId,
  onSelectWorkflow,
}: DocsSidebarProps) {
  // Only show deployed workflows (like your page did)
  const deployed = workflows?.filter((w) => w.isDeployed) || [];

  return (
    <div
      className="w-52 min-w-64 max-w-64 bg-background border-r border-sidebar-border flex-shrink-0
                 sticky top-0 h-screen flex flex-col"
    >
      <div className="flex max-h-12 h-full items-center border-b px-6 min-h-3">
        <h4 className="text-lg font-semibold text-primary">API Docs</h4>
      </div>

      {/* This container stays fixed (no internal scrolling) */}
      <div className="flex-grow overfow-y-auto">
        <div className="flex flex-col space-y-8">
          <nav className="flex-1">
            {loading ? (
              <div className="text-accent-foreground text-sm animate-pulse">
                Loading workflows...
              </div>
            ) : deployed.length === 0 ? (
              <p className="text-accent-foreground text-sm">
                No deployed workflows
              </p>
            ) : (
              <ul>
                <div className="my-6 space-y-8">
                  <div className="mx-3">
                    <div>
                      {deployed.map((wf) => {
                        const active = selectedWorkflowId === wf._id;
                        return (
                          <li
                            key={wf._id}
                            onClick={() => onSelectWorkflow(wf._id)}
                            className={clsx(
                              "cursor-pointer flex space-x-3 items-center outline-none focus-visible:ring-1 ring-muted-foreground focus-visible:z-10 group px-3 py-1 border-default group-hover:border-muted-foreground",
                              active
                                ? "bg-sidebar-accent z-10 text-forgeound font-semibold rounder-md"
                                : "text-foreground hover:bg-background hover:text-primary"
                            )}
                          >
                            <span className="transition trunacte text-sm w-full text-foreground group-hover:text-foreground hover:font-semibold">
                              <div className="flex w-full items-center justify-between gap-1">
                                <div
                                  title={wf.name}
                                  className="flex space-between items-center gap-2 truncate w-full"
                                >
                                  <span className="truncate flex-1">
                                    {wf.name}
                                  </span>
                                </div>
                              </div>
                            </span>
                          </li>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ul>
            )}
          </nav>
        </div>
      </div>

      {/* bottom area for extra links (keeps at bottom because aside is flex-col) */}
      {/* <div className="mt-2">
        <div className="text-xs text-muted mb-2">MORE RESOURCES</div>
        <div className="text-sm text-foreground space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-sidebar-accent inline-block" />
            <span>Guides</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-sidebar-accent inline-block" />
            <span>API Reference</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}

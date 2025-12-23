"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SchemaPageContent = dynamic(() => import("./schema-page-content"), {
  ssr: false,
  loading: () => (
    <>
      {/* Top Bar Skeleton */}
      <div className="flex w-full h-12 min-h-12 items-center justify-between border-b border-border px-3 gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
          <div className="w-px h-5 bg-background mx-1" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
      </div>

      {/* Canvas Area Skeleton */}
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            Initializing schema editor...
          </p>
        </div>
      </div>

      {/* Bottom Footer Skeleton */}
      <div className="h-9 border-t border-border bg-background flex items-center justify-center gap-6 px-4 shrink-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Skeleton className="size-3.5 rounded" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </>
  ),
});

export default function SchemaClient() {
  return <SchemaPageContent />;
}

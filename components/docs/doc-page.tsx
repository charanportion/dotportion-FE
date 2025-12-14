import type React from "react";
import { DocsLayout } from "@/components/docs/docs-layout";
import { BreadcrumbNav } from "@/components/docs/breadcrumb-nav";

interface DocPageProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DocPage({ children, title, description }: DocPageProps) {
  return (
    <DocsLayout>
      <BreadcrumbNav />
      {title && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-4 text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="prose max-w-none prose-slate dark:prose-invert">
        {children}
      </div>
    </DocsLayout>
  );
}

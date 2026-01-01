import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import TopbarNew from "@/components/topbar-new";

export default function RequestAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen flex-col overflow-hidden  w-full">
        {/* Fixed Topbar - Full Width */}
        <div className="fixed top-0 left-0 right-0 z-50 h-12 bg-background border-b border-border">
          <TopbarNew />
        </div>
        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

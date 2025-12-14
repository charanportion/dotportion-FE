"use client";

import { ReduxProvider } from "@/components/providers/redux-provider";
import { AuthSync } from "@/components/auth/auth-sync";

import { TooltipProvider } from "@/components/ui/tooltip";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ReduxProvider>
      <TooltipProvider>
        <AuthSync />
        {children}
      </TooltipProvider>
    </ReduxProvider>
  );
}

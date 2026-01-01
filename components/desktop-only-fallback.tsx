"use client";

import { Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DesktopOnlyFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 font-inter">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <Monitor size={56} />
        </div>

        <h1 className="text-2xl font-medium ">Desktop Required</h1>

        <p className="text-muted-foreground text-sm">
          DotPortion is a powerful visual backend builder and works best on
          desktop screens. Please switch to a desktop or laptop to continue
          using the app.
        </p>

        <p className="text-xs text-muted-foreground">
          You can still sign up and complete onboarding on mobile.
        </p>

        <Button
          //   variant="outline"
          className="justify-start gap-2 text-left font-normal  cursor-pointer text-xs h-7 px-2.5 py-1"
          onClick={() => window.location.reload()}
        >
          I’m on Desktop
        </Button>
      </div>
    </div>
  );
}

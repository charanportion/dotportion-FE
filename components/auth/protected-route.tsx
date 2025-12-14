"use client";

import type React from "react";
import { useAppSelector } from "@/lib/redux/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Simply check Redux state - middleware handles actual protection
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Middleware already protects routes server-side, so if we reach here,
  // we can safely render. Just ensure Redux state is consistent.
  if (!isAuthenticated) {
    // This shouldn't happen if middleware is working, but provide fallback
    return null;
  }

  return <>{children}</>;
}

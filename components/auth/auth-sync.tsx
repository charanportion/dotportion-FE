"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setUser,
  setVerified,
  setAuthenticated,
  setIsNewUser,
} from "@/lib/redux/slices/authSlice";
import { authApi } from "@/lib/api/auth";

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

/**
 * AuthSync - Syncs cookie auth state with Redux on app load
 * Does NOT redirect - that's handled by middleware
 */
export function AuthSync() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const syncAuthState = async () => {
      const token = getCookie("auth-token");
      const isVerified = getCookie("auth-verified") === "true";
      const isNewUser = getCookie("auth-is-new-user") === "true";

      // If we have a token but Redux doesn't know about it, sync the state
      if (token && !isAuthenticated) {
        dispatch(setAuthenticated(true));
        dispatch(setVerified(isVerified));
        dispatch(setIsNewUser(isNewUser));

        // Fetch user details if we don't have them
        if (!user) {
          try {
            const userDetails = await authApi.getUserDetails();
            dispatch(setUser(userDetails));
          } catch (error) {
            console.error("Failed to fetch user details:", error);
            // Token might be invalid - let middleware handle redirect
          }
        }
      }

      // If no token but Redux thinks we're authenticated, clear state
      if (!token && isAuthenticated) {
        dispatch(setAuthenticated(false));
        dispatch(setVerified(false));
        dispatch(setIsNewUser(false));
      }
    };

    syncAuthState();
  }, [dispatch, isAuthenticated, user]);

  // This component doesn't render anything
  return null;
}

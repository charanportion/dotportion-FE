// lib/hooks/useAuth.ts
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  logout,
  logoutUser,
  setIsNewUser,
  fetchUserDetails,
} from "@/lib/redux/slices/authSlice";

export function useAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isVerified, isNewUser, isLoading } =
    useAppSelector((state) => state.auth);

  // Complete onboarding - call this when user finishes onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ updateBackend: true }),
      });

      if (response.ok) {
        dispatch(setIsNewUser(false));
        router.push("/dashboard");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      return false;
    }
  }, [dispatch, router]);

  // Logout user
  const handleLogout = useCallback(async () => {
    await dispatch(logoutUser());
    dispatch(logout());
    router.push("/auth/signin");
  }, [dispatch, router]);

  // Refresh user data from backend
  const refreshUser = useCallback(async () => {
    await dispatch(fetchUserDetails());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isVerified,
    isNewUser,
    isLoading,
    completeOnboarding,
    handleLogout,
    refreshUser,
  };
}

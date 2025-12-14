// lib/api/user.ts
// Uses axios with interceptor - token is automatically added from cookie
import api from "./axios";
import { ProfileData } from "@/components/onboarding/validationSchemas";

export interface UpdateUserRequest {
  full_name?: string;
  profile?: Partial<{
    name: string;
    contact_number: string;
    occupation: string;
    tools: string[];
    experience_level:
      | "beginner"
      | "intermediate"
      | "advanced"
      | "no_experience";
    subscription_tutorials?: boolean;
    subscription_newsletter?: boolean;
  }>;
}

export interface UpdateThemeRequest {
  theme: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    _id: string;
    full_name: string;
    profile: {
      name: string;
      contact_number: string;
      occupation: string;
      tools: string[];
      experience_level:
        | "beginner"
        | "intermediate"
        | "advanced"
        | "no_experience";
      subscription_tutorials?: boolean;
      subscription_newsletter?: boolean;
      theme: string;
    };
    updatedAt?: string;
  };
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ToursResponse {
  tours: Record<string, boolean>;
  isNewUser?: boolean;
}

// All these use axios directly - interceptor adds Authorization header automatically
export const userApi = {
  // Update profile during onboarding or settings
  updateProfile: async (data: {
    profile: Partial<ProfileData>;
  }): Promise<UpdateProfileResponse> => {
    const response = await api.post("/users/update", data);
    return response.data;
  },

  // Update user details
  updateUser: async (
    data: UpdateUserRequest
  ): Promise<UpdateProfileResponse> => {
    const response = await api.post("/users/update", data);
    return response.data;
  },

  // Change password
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> => {
    const response = await api.post("/users/change-password", data);
    return response.data;
  },

  // Update theme
  updateTheme: async (
    data: UpdateThemeRequest
  ): Promise<UpdateProfileResponse> => {
    const response = await api.post("/users/update-theme", data);
    return response.data;
  },

  // Complete onboarding - uses API route because it needs to set cookies
  completeOnboarding: async (): Promise<{
    message: string;
    isNewUser: boolean;
  }> => {
    const response = await fetch("/api/auth/complete-onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        result.error || result.message || "Failed to complete onboarding"
      );
    }
    return result;
  },

  getTours: async (): Promise<ToursResponse> => {
    const response = await api.get("/users/tours");
    return response.data;
  },

  updateTourStatus: async (payload: {
    tourKey: string;
    completed?: boolean;
  }): Promise<{ message: string; tours?: Record<string, boolean> }> => {
    const response = await api.post("/users/tours", payload);
    return response.data;
  },
};

// lib/api/auth.ts
// Hybrid approach:
// - Auth endpoints that SET cookies → Use API routes
// - Other endpoints → Use axios directly (interceptor adds token)
import api from "./axios";

/**
 * ============================
 * INTERFACES
 * ============================
 */

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  full_name: string;
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  status: number;
  message: string;
  user?: UserDetails;
}

export interface SigninResponse {
  status: number;
  message: string;
  user?: UserDetails;
  token?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  context?: "REGISTER" | "FORGOT_PASSWORD";
}

export interface VerifyOtpResponse {
  message: string;
  token?: string;
  user?: UserDetails;
}

export interface ResendOtpRequest {
  email: string;
  context?: "REGISTER" | "FORGOT_PASSWORD";
}

export interface ResendOtpResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UserDetails {
  _id: string;
  full_name: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
  isNewUser: boolean;
  profile?: {
    name?: string;
    contact_number?: string;
    occupation?: string;
    tools?: string[];
    experience_level?: string;
    subscription_tutorials?: boolean;
    subscription_newsletter?: boolean;
    theme?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type AuthResponse = SignupResponse | SigninResponse;

/**
 * ============================
 * AUTH API FUNCTIONS
 * ============================
 */

export const authApi = {
  // ========== USE API ROUTES (These set/manage cookies) ==========

  // Signup - Uses API route (no token returned, just passes through)
  signUp: async (data: SignUpRequest): Promise<SignupResponse> => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = await response.json();
    if (!response.ok) {
      throw { response: { data: result } };
    }
    return result;
  },

  // Login - Uses API route (sets auth-token cookie)
  signIn: async (data: SignInRequest): Promise<SigninResponse> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = await response.json();
    if (!response.ok) {
      throw { response: { data: result } };
    }
    return result;
  },

  // Verify OTP - Uses API route (sets auth-token cookie)
  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = await response.json();
    if (!response.ok) {
      throw { response: { data: result } };
    }
    return result;
  },

  // Logout - Uses API route (clears cookies)
  logout: async (): Promise<void> => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  },

  // Get user details - Uses API route (syncs cookie state)
  getUserDetails: async (): Promise<UserDetails> => {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });

    const result = await response.json();
    if (!response.ok) {
      throw { response: { data: result } };
    }
    return result;
  },

  // ========== USE AXIOS DIRECTLY (Token auto-added by interceptor) ==========

  // Resend OTP - Direct to backend (no cookie management needed)
  resendOtp: async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
    const response = await api.post("/auth/resend-otp", data);
    return response.data;
  },

  // Forgot password - Direct to backend
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  // Reset password - Direct to backend
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },
};

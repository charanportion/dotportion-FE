import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  authApi,
  type UserDetails,
  type SignupResponse,
  type SigninResponse,
} from "@/lib/api/auth";
import { AxiosError } from "axios";
import {
  UpdateProfileResponse,
  UpdateThemeRequest,
  UpdateUserRequest,
  userApi,
} from "@/lib/api/user";

interface AuthState {
  user: UserDetails | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isNewUser: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isVerified: false,
  isNewUser: false,
};

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message
    );
  }
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: { data?: { error?: string; message?: string } };
    };
    return (
      err.response?.data?.error ||
      err.response?.data?.message ||
      "An unexpected error occurred"
    );
  }
  return "An unexpected error occurred";
};

// Fetch user details (uses cookie auth)
export const fetchUserDetails = createAsyncThunk(
  "auth/fetchUserDetails",
  async (_, { rejectWithValue }) => {
    try {
      const userDetails = await authApi.getUserDetails();
      return userDetails;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Signup - No token returned
export const signUp = createAsyncThunk<
  SignupResponse,
  { full_name: string; name: string; email: string; password: string }
>("auth/signUp", async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.signUp(data);
    return res;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

// Login - Token returned and cookie set by API route
export const login = createAsyncThunk<
  SigninResponse,
  { email: string; password: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await authApi.signIn({ email, password });
    return res;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

// AFTER other thunks (login, signUp, etc.)

export const completeOAuthLogin = createAsyncThunk<
  { user: UserDetails; isNewUser: boolean },
  { token: string; isNewUser: boolean }
>(
  "auth/completeOAuthLogin",
  async ({ token, isNewUser }, { rejectWithValue }) => {
    try {
      // 1) Tell Next.js API to set cookies from this token
      const sessionRes = await fetch("/api/auth/oauth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, isNewUser }),
      });

      const sessionData = await sessionRes.json();

      if (!sessionRes.ok) {
        // this will go into handleApiError
        throw { response: { data: sessionData } };
      }

      // 2) Now cookies are set, we can fetch full user profile from backend
      const userDetails = await authApi.getUserDetails();

      return { user: userDetails, isNewUser: isNewUser };
    } catch (error) {
      console.log(error);
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Update user profile
export const updateUser = createAsyncThunk<
  UpdateProfileResponse,
  UpdateUserRequest
>("user/update", async (data, { rejectWithValue }) => {
  try {
    return await userApi.updateUser(data);
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

// Update theme
export const updateTheme = createAsyncThunk<
  UpdateProfileResponse,
  UpdateThemeRequest
>("user/updateTheme", async (data, { rejectWithValue }) => {
  try {
    return await userApi.updateTheme(data);
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // This calls the API route to clear cookies
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      return true;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isVerified = false;
      state.isNewUser = false;
      state.isLoading = false;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<UserDetails>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isVerified = action.payload.isVerified;
      state.isNewUser = action.payload.isNewUser;
    },
    setVerified: (state, action: PayloadAction<boolean>) => {
      state.isVerified = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setIsNewUser: (state, action: PayloadAction<boolean>) => {
      state.isNewUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isVerified = action.payload.isVerified;
        state.isNewUser = action.payload.isNewUser;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Sign Up - No token, just store user info temporarily
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload.user || null;
        // Not authenticated yet - no token until OTP verification
        state.isAuthenticated = false;
        state.isVerified = false;
        state.isNewUser = true;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Login - Token set via cookie, user is verified
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
        state.isVerified = true;
        state.isNewUser = action.payload.user?.isNewUser ?? false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    builder
      .addCase(completeOAuthLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeOAuthLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isVerified = action.payload.user.isVerified;
        // Prefer backend's isNewUser, fallback to what we passed
        state.isNewUser =
          action.payload.user.isNewUser ?? action.payload.isNewUser;
      })
      .addCase(completeOAuthLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isVerified = false;
        state.isNewUser = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Still clear state even on failure
        state.user = null;
        state.isAuthenticated = false;
        state.isVerified = false;
        state.isNewUser = false;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && action.payload?.user) {
          state.user = {
            ...state.user,
            full_name: action.payload.user.full_name ?? state.user.full_name,
            profile: {
              ...(state.user.profile || {}),
              ...(action.payload.user.profile || {}),
            },
            updatedAt: action.payload.user.updatedAt ?? state.user.updatedAt,
          };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update theme
      .addCase(updateTheme.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTheme.fulfilled, (state, action) => {
        state.isLoading = false;
        const newTheme = action.payload?.user?.profile?.theme;
        if (state.user && newTheme) {
          state.user = {
            ...state.user,
            profile: { ...state.user.profile, theme: newTheme },
          };
        }
      })
      .addCase(updateTheme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  logout,
  setUser,
  setVerified,
  setAuthenticated,
  setIsNewUser,
  clearError,
} = authSlice.actions;

// Re-export for backwards compatibility
// export type { AuthState } from "./authSlice";

export default authSlice.reducer;

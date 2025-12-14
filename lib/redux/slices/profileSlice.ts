// lib/redux/slices/profileSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProfileData } from "@/components/onboarding/validationSchemas";
import { userApi } from "@/lib/api/user";

interface ProfileState {
  step: number;
  answers: Partial<ProfileData>;
  status: "idle" | "loading" | "failed" | "succeeded";
  error?: string;
}

const initialState: ProfileState = {
  step: 0,
  answers: {},
  status: "idle",
};

// Submit profile answers - axios interceptor adds token automatically
export const submitAnswer = createAsyncThunk(
  "profile/submitAnswer",
  async (answers: Partial<ProfileData>, { rejectWithValue }) => {
    try {
      const res = await userApi.updateProfile({ profile: answers });
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      // Handle axios error
      const axiosError = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      const message =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

// Complete onboarding - sets isNewUser to false via API route
export const completeOnboarding = createAsyncThunk(
  "profile/completeOnboarding",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.completeOnboarding();
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setAnswer: <K extends keyof ProfileState["answers"]>(
      state: ProfileState,
      action: PayloadAction<{ key: K; value: ProfileState["answers"][K] }>
    ) => {
      const { key, value } = action.payload;
      state.answers[key] = value;
    },
    nextStep: (state: ProfileState) => {
      state.step += 1;
    },
    setStep: (state: ProfileState, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    resetProfile: (state) => {
      state.step = 0;
      state.answers = {};
      state.status = "idle";
      state.error = undefined;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAnswer.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(submitAnswer.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = undefined;
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(completeOnboarding.pending, (state) => {
        state.status = "loading";
      })
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = undefined;
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setAnswer, nextStep, setStep, resetProfile, clearError } =
  profileSlice.actions;
export default profileSlice.reducer;

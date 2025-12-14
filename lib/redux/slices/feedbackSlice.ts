import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  feedbackApi,
  FeedbackResponse,
  type CreateFeedbackDTO,
} from "@/lib/api/feedback";
import { AxiosError } from "axios";

interface FeedbackState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: FeedbackState = {
  loading: false,
  error: null,
  successMessage: null,
};

const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  return "An unexpected error occurred";
};

export const submitFeedback = createAsyncThunk<
  FeedbackResponse,
  CreateFeedbackDTO,
  { rejectValue: string }
>("feedback/submitFeedback", async (payload, { rejectWithValue }) => {
  try {
    const res = await feedbackApi.createFeedback(payload);
    return res;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearFeedbackState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        submitFeedback.fulfilled,
        (state, action: PayloadAction<FeedbackResponse>) => {
          state.loading = false;
          state.successMessage = action.payload.message;
        }
      )
      .addCase(submitFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unexpected server error";
      });
  },
});

export const { clearFeedbackState } = feedbackSlice.actions;
export default feedbackSlice.reducer;

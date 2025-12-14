import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  secretsApi,
  type Secret,
  type CreateSecretRequest,
  type UpdateSecretRequest,
} from "@/lib/api/secrets";
import { AxiosError } from "axios";

interface SecretsState {
  secrets: Secret[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const initialState: SecretsState = {
  secrets: [],
  isLoading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
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

export const fetchSecrets = createAsyncThunk(
  "secrets/fetchSecrets",
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await secretsApi.getSecrets(projectId);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createSecret = createAsyncThunk(
  "secrets/createSecret",
  async (
    { projectId, data }: { projectId: string; data: CreateSecretRequest },
    { rejectWithValue }
  ) => {
    try {
      return await secretsApi.createSecret(projectId, data);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateSecret = createAsyncThunk(
  "secrets/updateSecret",
  async (
    {
      projectId,
      secretId,
      data,
    }: { projectId: string; secretId: string; data: UpdateSecretRequest },
    { rejectWithValue }
  ) => {
    try {
      return await secretsApi.updateSecret(projectId, secretId, data);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteSecret = createAsyncThunk(
  "secrets/deleteSecret",
  async (
    { projectId, secretId }: { projectId: string; secretId: string },
    { rejectWithValue }
  ) => {
    try {
      await secretsApi.deleteSecret(projectId, secretId);
      return secretId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const secretsSlice = createSlice({
  name: "secrets",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSecrets: (state) => {
      state.secrets = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecrets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSecrets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.secrets = action.payload;
      })
      .addCase(fetchSecrets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createSecret.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSecret.fulfilled, (state, action) => {
        state.isCreating = false;
        state.secrets.push(action.payload);
      })
      .addCase(createSecret.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      .addCase(updateSecret.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSecret.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.secrets.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.secrets[index] = action.payload;
        }
      })
      .addCase(updateSecret.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSecret.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSecret.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.secrets = state.secrets.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteSecret.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSecrets } = secretsSlice.actions;
export default secretsSlice.reducer;

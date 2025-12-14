import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  schemaApi,
  type CreateSchemaRequest,
  type CollectionParameter,
  type AllParametersResponse,
} from "@/lib/api/schema";
import { AxiosError } from "axios";

interface SchemaState {
  collections: string[];
  collectionParameters: Record<string, CollectionParameter[]>;
  allParameters: AllParametersResponse;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: SchemaState = {
  collections: [],
  collectionParameters: {},
  allParameters: {},
  isLoading: false,
  isCreating: false,
  error: null,
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

export const fetchCollections = createAsyncThunk(
  "schema/fetchCollections",
  async (
    {
      tenant,
      projectId,
      provider = "mongodb",
    }: { tenant: string; projectId: string; provider?: string },
    { rejectWithValue }
  ) => {
    try {
      return await schemaApi.getAllCollections(tenant, projectId, provider);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchCollectionParameters = createAsyncThunk(
  "schema/fetchCollectionParameters",
  async (
    {
      tenant,
      projectId,
      collectionName,
      provider = "mongodb",
    }: {
      tenant: string;
      projectId: string;
      collectionName: string;
      provider?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await schemaApi.getCollectionParameters(
        tenant,
        projectId,
        collectionName,
        provider
      );
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchAllParameters = createAsyncThunk(
  "schema/fetchAllParameters",
  async (
    {
      tenant,
      projectId,
      provider = "mongodb",
    }: { tenant: string; projectId: string; provider?: string },
    { rejectWithValue }
  ) => {
    try {
      return await schemaApi.getAllCollectionParameters(
        tenant,
        projectId,
        provider
      );
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createSchema = createAsyncThunk(
  "schema/createSchema",
  async (
    {
      tenant,
      projectId,
      data,
    }: { tenant: string; projectId: string; data: CreateSchemaRequest },
    { rejectWithValue }
  ) => {
    try {
      return await schemaApi.createSchema(tenant, projectId, data);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const schemaSlice = createSlice({
  name: "schema",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSchema: (state) => {
      state.collections = [];
      state.collectionParameters = {};
      state.allParameters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.collections = action.payload.collections;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCollectionParameters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCollectionParameters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.collectionParameters[action.payload.collection] =
          action.payload.parameters;
      })
      .addCase(fetchCollectionParameters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllParameters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllParameters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allParameters = action.payload;
      })
      .addCase(fetchAllParameters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createSchema.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSchema.fulfilled, (state, action) => {
        state.isCreating = false;
        // Add the new collection to the list if it's not already there
        if (!state.collections.includes(action.payload.result.collection)) {
          state.collections.push(action.payload.result.collection);
        }
      })
      .addCase(createSchema.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSchema } = schemaSlice.actions;
export default schemaSlice.reducer;

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  projectsApi,
  type Project,
  type CreateProjectRequest,
  type UpdateProjectRequest,
  type CreateProjectResponse,
} from "@/lib/api/projects";
import { AxiosError } from "axios";

interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
}

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  isCreating: false,
};

// Helper function to handle API errors
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

// Async thunks for API calls
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      return await projectsApi.getProjects();
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData: CreateProjectRequest, { rejectWithValue }) => {
    try {
      return await projectsApi.createProject(projectData);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async (
    { id, data }: { id: string; data: UpdateProjectRequest },
    { rejectWithValue }
  ) => {
    try {
      return await projectsApi.updateProject(id, data);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id: string, { rejectWithValue }) => {
    try {
      await projectsApi.deleteProject(id);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    selectProject: (state, action: PayloadAction<Project>) => {
      state.selectedProject = action.payload;
      // Store selected project in localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedProject", JSON.stringify(action.payload));
      }
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("selectedProject");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    loadSelectedProjectFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("selectedProject");
        if (stored) {
          try {
            state.selectedProject = JSON.parse(stored);
          } catch {
            localStorage.removeItem("selectedProject");
          }
        }
      }
    },
    clearProjects: (state) => {
      state.projects = [];
      state.selectedProject = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("selectedProject");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<Project[] | { data: Project[] }>) => {
          state.isLoading = false;
          // Handle both possible response structures
          const projects = Array.isArray(action.payload)
            ? action.payload
            : action.payload.data || [];

          state.projects = projects;
          // If no selected project and projects exist, select the first one
          if (!state.selectedProject && projects.length > 0) {
            state.selectedProject = projects[0];
            if (typeof window !== "undefined") {
              localStorage.setItem(
                "selectedProject",
                JSON.stringify(projects[0])
              );
            }
          }
        }
      )
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(
        createProject.fulfilled,
        (state, action: PayloadAction<CreateProjectResponse>) => {
          state.isCreating = false;
          // Ensure projects is always an array
          if (!Array.isArray(state.projects)) {
            state.projects = [];
          }
          state.projects.push(action.payload.data);
          // Auto-select the newly created project
          state.selectedProject = action.payload.data;
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "selectedProject",
              JSON.stringify(action.payload.data)
            );
          }
        }
      )
      .addCase(createProject.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure projects is always an array
        if (!Array.isArray(state.projects)) {
          state.projects = [];
        }
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        // Update selected project if it's the one being updated
        if (state.selectedProject?._id === action.payload._id) {
          state.selectedProject = action.payload;
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "selectedProject",
              JSON.stringify(action.payload)
            );
          }
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure projects is always an array
        if (!Array.isArray(state.projects)) {
          state.projects = [];
        }
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        // Clear selected project if it's the one being deleted
        if (state.selectedProject?._id === action.payload) {
          state.selectedProject =
            state.projects.length > 0 ? state.projects[0] : null;
          if (typeof window !== "undefined") {
            if (state.selectedProject) {
              localStorage.setItem(
                "selectedProject",
                JSON.stringify(state.selectedProject)
              );
            } else {
              localStorage.removeItem("selectedProject");
            }
          }
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  selectProject,
  clearSelectedProject,
  clearError,
  loadSelectedProjectFromStorage,
  clearProjects,
} = projectsSlice.actions;

export default projectsSlice.reducer;

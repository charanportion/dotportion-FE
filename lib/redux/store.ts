import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import nodesReducer from "./slices/nodesSlice";
import edgesReducer from "./slices/edgesSlice";
import uiReducer from "./slices/uiSlice";
import historyReducer from "./slices/historySlice";
import executionReducer from "./slices/executionSlice";
import authReducer from "./slices/authSlice";
import projectsReducer from "./slices/projectsSlice";
import workflowsReducer from "./slices/workflowsSlice";
import secretsReducer from "./slices/secretsSlice";
import workflowEditorReducer from "./slices/workflowEditorSlice";
import schemaReducer from "./slices/schemaSlice";
import dashboardReducer from "./slices/dashboardSlice";
import logsReducer from "./slices/logsSlice";
import profileReducer from "./slices/profileSlice";
import schemaCanvasReducer from "./slices/schemaCanvasSlice";
import feedbackReducer from "./slices/feedbackSlice";

// Create SSR-safe storage using dynamic import
// This prevents redux-persist from trying to access localStorage during SSR
// Using require() instead of import ensures the module is only loaded at runtime
const createStorage = () => {
  if (typeof window === "undefined") {
    // Return noop storage for SSR
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }

  // Use require() for dynamic import to avoid module evaluation at parse time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("redux-persist/lib/storage").default;
};

const persistStorage = createStorage();

// Configure persistence for auth slice
const authPersistConfig = {
  key: "auth",
  storage: persistStorage,
  whitelist: ["token", "user", "isAuthenticated", "isVerified", "isNewUser"], // Only persist these fields
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    nodes: nodesReducer,
    edges: edgesReducer,
    ui: uiReducer,
    history: historyReducer,
    execution: executionReducer,
    projects: projectsReducer,
    auth: persistedAuthReducer, // Use persisted auth reducer
    workflows: workflowsReducer,
    secrets: secretsReducer,
    workflowEditor: workflowEditorReducer,
    schema: schemaReducer,
    dashboard: dashboardReducer,
    logs: logsReducer,
    profile: profileReducer,
    schemaCanvas: schemaCanvasReducer,
    feedback: feedbackReducer,
  },
  // Enable Redux DevTools
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions and paths
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
        // Ignore the schemaCanvas state from serializable checks since it has undoable wrapper
        // ignoredPaths: ["schemaCanvas"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import marketReducer from "./slices/marketSlice";
import strategyReducer from "./slices/strategySlice";
import alertReducer from "./slices/alertSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    market: marketReducer,
    strategy: strategyReducer,
    alerts: alertReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// TypeScript types would go here in a .ts file
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch

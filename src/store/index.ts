import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userLocationReducer from "./userLocationSlice";
import eventReducer from "./eventSlice";
import categoryReducer from "./categorySlice";
import userReducer from "@/store/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userLocation: userLocationReducer,
    event: eventReducer,
    category: categoryReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

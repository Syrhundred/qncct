import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userLocationReducer from "./userLocationSlice";
import eventReducer from "./eventSlice";
import categoryReducer from "./categorySlice";
import userReducer from "@/store/userSlice";
import chatReducer from "@/modules/chat/model/chatSlice";
import { chatApi } from "@/modules/chat/api/chatApiSlice";
import { chatWsMiddleware } from "@/modules/chat/model/chatWsMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userLocation: userLocationReducer,
    event: eventReducer,
    category: categoryReducer,
    user: userReducer,
    chat: chatReducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (gDM) => gDM().concat(chatWsMiddleware, chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

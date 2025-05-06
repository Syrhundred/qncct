// src/modules/chat/api/chatApiSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Room, Message } from "./types";
import { getAccessToken } from "@/shared/lib/cookies";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`,
    prepareHeaders: (headers) => {
      headers.set("Authorization", `Bearer ${getAccessToken()}`);
      return headers;
    },
  }),
  tagTypes: ["Rooms", "History"],
  endpoints: (builder) => ({
    getRooms: builder.query<Room[], void>({
      query: () => "/chat/rooms",
      providesTags: ["Rooms"],
    }),
    getHistory: builder.query<Message[], { roomId: string; limit?: number }>({
      query: ({ roomId, limit = 50 }) =>
        `/chat/history/${roomId}?limit=${limit}`,
      providesTags: (_r, _e, { roomId }) => [{ type: "History", id: roomId }],
    }),
  }),
});

export const { useGetRoomsQuery, useGetHistoryQuery } = chatApi;

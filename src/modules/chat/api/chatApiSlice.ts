import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/shared/lib/cookies";
import { RoomDTO, MessageDTO } from "./types";

export const chatApi = createApi({
  reducerPath: "chatApi",
  tagTypes: ["Rooms", "History"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`,
    prepareHeaders: (h) => h.set("Authorization", `Bearer ${getAccessToken()}`),
  }),
  endpoints: (b) => ({
    getRooms: b.query<RoomDTO[], void>({
      query: () => "/chat/rooms",
      providesTags: ["Rooms"],
    }),
    getHistory: b.query<MessageDTO[], string>({
      query: (roomId) => `/chat/history/${roomId}?limit=50`,
      providesTags: (_res, _err, roomId) => [{ type: "History", id: roomId }], // <— NEW
    }),
  }),
});

export const { useGetRoomsQuery, useGetHistoryQuery } = chatApi;

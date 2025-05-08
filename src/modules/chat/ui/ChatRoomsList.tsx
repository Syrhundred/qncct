"use client";

import React from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { useGetRoomsQuery } from "../api/chatApiSlice";
import ChatRoomItem from "./ChatRoomItem";

const selectRoomsArr = createSelector(
  (s: RootState) => s.chat.rooms,
  (rooms) =>
    Object.values(rooms).sort((a, b) =>
      (b.last_msg_preview?.created_at ?? "").localeCompare(
        a.last_msg_preview?.created_at ?? "",
      ),
    ),
);

export default function ChatRoomsList() {
  /** ① Триггерим GET /chat/rooms один раз, если нет кэша */
  useGetRoomsQuery();

  /** ② Читаем данные из стора (мемоизировано) */
  const rooms = useSelector(selectRoomsArr);

  if (!rooms.length) return <p className="p-6">No chats yet…</p>;

  return (
    <ul className="divide-y">
      {rooms.map((r) => (
        <ChatRoomItem key={r.room_id} room={r} />
      ))}
    </ul>
  );
}

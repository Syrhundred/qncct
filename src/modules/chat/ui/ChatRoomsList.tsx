"use client";

import React from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";

import ChatRoomItem from "./ChatRoomItem";

/* ---------- memo-selector: rooms[] ---------- */
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
  const rooms = useSelector(selectRoomsArr); // ← мемоизировано

  if (!rooms.length) return <p className="p-4">No chats yet…</p>;

  return (
    <ul className="divide-y">
      {rooms.map((r) => (
        <ChatRoomItem key={r.room_id} room={r} />
      ))}
    </ul>
  );
}

// src/modules/chat/model/chatSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message, Room } from "../api/types";

interface ChatState {
  rooms: Record<string, Room>;
  messages: Record<string, Message[]>; // key = roomId
  typing: Record<string, boolean>; // roomId → true/false
  totalUnread: number;
}

const initialState: ChatState = {
  rooms: {},
  messages: {},
  typing: {},
  totalUnread: 0,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    init(state, action: PayloadAction<Room[]>) {
      state.rooms = Object.fromEntries(action.payload.map((r) => [r.id, r]));
      state.totalUnread = action.payload.reduce((s, r) => s + r.unread, 0);
    },
    incomingMessage(
      state,
      action: PayloadAction<{ roomId: string; msg: Message }>,
    ) {
      const { roomId, msg } = action.payload;
      state.messages[roomId] ??= [];
      state.messages[roomId].push(msg);
      // обновляем превью + нечтёнку
      const room = state.rooms[roomId];
      if (room) {
        room.last_message_preview = msg.content;
        room.unread += 1;
        room.updated_at = msg.created_at;
      }
      state.totalUnread += 1;
    },
    badge(state, action: PayloadAction<{ roomId: string; unread: number }>) {
      const { roomId, unread } = action.payload;
      const room = state.rooms[roomId];
      if (room) {
        state.totalUnread += unread - room.unread;
        room.unread = unread;
      }
    },
    typing(state, action: PayloadAction<{ roomId: string; state: boolean }>) {
      state.typing[action.payload.roomId] = action.payload.state;
    },
    flushRoom(state, action: PayloadAction<{ roomId: string }>) {
      const room = state.rooms[action.payload.roomId];
      if (room) {
        state.totalUnread -= room.unread;
        room.unread = 0;
      }
    },
  },
});

export const { init, incomingMessage, badge, typing, flushRoom } =
  chatSlice.actions;
export default chatSlice.reducer;

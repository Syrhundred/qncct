import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MessageDTO, RoomDTO } from "../api/types";

interface MessagesState {
  [roomId: string]: MessageDTO[];
}
interface TypingState {
  [roomId: string]: {
    [username: string]: boolean;
  };
}
interface RoomsState {
  [roomId: string]: RoomDTO;
}

export interface ChatState {
  rooms: RoomsState;
  messages: MessagesState;
  typing: TypingState;
  totalUnread: number;
}

const initialState: ChatState = {
  rooms: {},
  messages: {},
  typing: {},
  totalUnread: 0,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    init(state, action: PayloadAction<RoomDTO[]>) {
      state.totalUnread = 0;
      action.payload.forEach((r) => {
        state.rooms[r.room_id] = r;
        state.totalUnread += r.unread;
      });
    },

    badge(state, action: PayloadAction<{ roomId: string; unread: number }>) {
      const { roomId, unread } = action.payload;
      const room = state.rooms[roomId];
      if (!room) return;

      state.totalUnread += unread - room.unread;
      room.unread = unread;
    },

    historyLoaded(
      state,
      action: PayloadAction<{ roomId: string; msgs: MessageDTO[] }>,
    ) {
      const { roomId, msgs } = action.payload;

      // Убираем дубли и создаем новую ссылку
      const existing = state.messages[roomId] ?? [];
      const ids = new Set(existing.map((m) => m.id));
      const deduped = [...existing];

      for (const m of msgs) {
        if (!ids.has(m.id)) deduped.push(m);
      }

      state.messages[roomId] = deduped;
    },

    incomingMessage(
      state,
      action: PayloadAction<{ roomId: string; msg: MessageDTO }>,
    ) {
      const { roomId, msg } = action.payload;
      const existing = state.messages[roomId] ?? [];

      const alreadyExists = existing.some((m) => m.id === msg.id);
      if (alreadyExists) return;

      state.messages[roomId] = [...existing, msg];

      const room = state.rooms[roomId];
      if (room) {
        room.last_msg_preview = {
          content: msg.content,
          created_at: msg.created_at,
        };

        if (!msg.is_mine) {
          room.unread += 1;
          state.totalUnread += 1;
        }
      }
    },

    typing(
      state,
      action: PayloadAction<{
        roomId: string;
        username: string;
        state: boolean;
      }>,
    ) {
      const { roomId, username, state: isTyping } = action.payload;
      const map = state.typing[roomId] ?? (state.typing[roomId] = {});
      if (isTyping) {
        map[username] = true;
      } else {
        delete map[username];
      }
    },

    flushRoom(state, action: PayloadAction<{ roomId: string }>) {
      const room = state.rooms[action.payload.roomId];
      if (!room) return;
      state.totalUnread -= room.unread;
      room.unread = 0;
    },
  },
});

export const {
  init,
  badge,
  historyLoaded,
  incomingMessage,
  typing,
  flushRoom,
} = chatSlice.actions;

export default chatSlice.reducer;

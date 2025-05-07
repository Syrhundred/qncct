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

interface ChatState {
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

const chatSlice = createSlice({
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
      if (room) {
        state.totalUnread += unread - room.unread;
        room.unread = unread;
      }
    },

    historyLoaded(
      state,
      action: PayloadAction<{ roomId: string; msgs: MessageDTO[] }>,
    ) {
      const { roomId, msgs } = action.payload;
      const existing = state.messages[roomId] ?? [];
      const ids = new Set(existing.map((m) => m.id));
      state.messages[roomId] = [
        ...existing,
        ...msgs.filter((m) => !ids.has(m.id)),
      ];
    },

    incomingMessage(
      state,
      action: PayloadAction<{ roomId: string; msg: MessageDTO }>,
    ) {
      const { roomId, msg } = action.payload;
      const current = state.messages[roomId] ?? [];

      if (!msg.id.startsWith("tmp-")) {
        const dupIdx = current.findIndex(
          (m) =>
            m.id.startsWith("tmp-") &&
            m.content === msg.content &&
            Math.abs(Date.parse(m.created_at) - Date.parse(msg.created_at)) <
              15000,
        );
        if (dupIdx !== -1) current.splice(dupIdx, 1);
      }

      if (!current.some((m) => m.id === msg.id)) {
        state.messages[roomId] = [...current, msg];
      }

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
      const map = state.typing[roomId] ?? {};
      if (isTyping) {
        map[username] = true;
      } else {
        delete map[username];
      }
      state.typing[roomId] = map;
    },

    flushRoom(state, action: PayloadAction<{ roomId: string }>) {
      const room = state.rooms[action.payload.roomId];
      if (room) {
        state.totalUnread -= room.unread;
        room.unread = 0;
      }
    },

    removeTmpMessage(
      state,
      action: PayloadAction<{ roomId: string; tmpId: string }>,
    ) {
      const { roomId, tmpId } = action.payload;
      if (state.messages[roomId]) {
        state.messages[roomId] = state.messages[roomId].filter(
          (m) => m.id !== tmpId,
        );
      }
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
  removeTmpMessage,
} = chatSlice.actions;

export default chatSlice.reducer;

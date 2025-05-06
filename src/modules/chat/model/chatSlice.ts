import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MessageDTO, RoomDTO } from "../api/types";

/* ------------------------------------------------------------------ */
/* Типы стора                                                          */
/* ------------------------------------------------------------------ */
interface MessagesState {
  [roomId: string]: MessageDTO[];
}
interface TypingState {
  [roomId: string]: {
    [username: string]: boolean; // true → «печатает»
  };
}
interface RoomsState {
  [roomId: string]: RoomDTO;
}

export interface ChatState {
  rooms: RoomsState; // список комнат
  messages: MessagesState; // сообщения по roomId
  typing: TypingState; // map «кто печатает» по roomId
  totalUnread: number; // суммарный badge на иконке inbox
}

/* ------------------------------------------------------------------ */
/* initialState                                                        */
/* ------------------------------------------------------------------ */
const initialState: ChatState = {
  rooms: {},
  messages: {},
  typing: {},
  totalUnread: 0,
};

/* ------------------------------------------------------------------ */
/* Вспомогательная функция: dedup                                      */
/* ------------------------------------------------------------------ */
function pushUnique(arr: MessageDTO[], msg: MessageDTO) {
  if (arr.some((m) => m.id === msg.id)) return;
  arr.push(msg);
}

/* ------------------------------------------------------------------ */
/* slice                                                               */
/* ------------------------------------------------------------------ */
export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /* init: пришёл после подключения к WS -------------------------- */
    init(state, action: PayloadAction<RoomDTO[]>) {
      state.totalUnread = 0;
      action.payload.forEach((r) => {
        state.rooms[r.room_id] = r;
        state.totalUnread += r.unread;
      });
    },

    /* список комнат badge/unread ----------------------------------- */
    badge(state, action: PayloadAction<{ roomId: string; unread: number }>) {
      const { roomId, unread } = action.payload;
      const room = state.rooms[roomId];
      if (!room) return;

      state.totalUnread += unread - room.unread;
      room.unread = unread;
    },

    /* история 50 сообщений через REST ------------------------------ */
    historyLoaded(
      state,
      action: PayloadAction<{ roomId: string; msgs: MessageDTO[] }>,
    ) {
      const { roomId, msgs } = action.payload;
      const arr = (state.messages[roomId] = []);
      msgs.forEach((m) => pushUnique(arr, m));
    },

    /* одно входящее сообщение (WS message или optimistic) ---------- */
    incomingMessage(
      state,
      action: PayloadAction<{ roomId: string; msg: MessageDTO }>,
    ) {
      const { roomId, msg } = action.payload;
      const arr = state.messages[roomId] ?? (state.messages[roomId] = []);

      /* ✅ защита от дублей */
      pushUnique(arr, msg);

      /* обновляем превью в комнате */
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

    /* состояние «кто печатает» ------------------------------------- */
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
      if (isTyping) map[username] = true;
      else delete map[username];
    },

    /* очистить счётчик после read ---------------------------------- */
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

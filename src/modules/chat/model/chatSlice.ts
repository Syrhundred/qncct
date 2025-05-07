/* -------------------------------------------------------------------------- */
/* chatSlice.ts – реактивный стор для чата                                    */
/* -------------------------------------------------------------------------- */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MessageDTO, RoomDTO } from "../api/types";

/* ---------- типы под-состояний ---------- */
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

/* ---------- shape всего slice ---------- */
export interface ChatState {
  rooms: RoomsState;
  messages: MessagesState;
  typing: TypingState;
  totalUnread: number;
}

/* ---------- initial ---------- */
const initialState: ChatState = {
  rooms: {},
  messages: {},
  typing: {},
  totalUnread: 0,
};

/* ---------- helpers ---------- */
const isTmp = (m: MessageDTO) => m.id.startsWith("tmp-");

/* -------------------------------------------------------------------------- */
/* slice                                                                      */
/* -------------------------------------------------------------------------- */
export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /* инициализация комнат после подключения к WS ------------------------ */
    init(state, action: PayloadAction<RoomDTO[]>) {
      state.totalUnread = 0;
      action.payload.forEach((r) => {
        state.rooms[r.room_id] = r;
        state.totalUnread += r.unread;
      });
    },

    /* обновление badge / preview (получено через WS) --------------------- */
    badge(state, action: PayloadAction<{ roomId: string; unread: number }>) {
      const { roomId, unread } = action.payload;
      const room = state.rooms[roomId];
      if (!room) return;

      state.totalUnread += unread - room.unread;
      room.unread = unread;
    },

    /* REST-история (50 сообщений) ---------------------------------------- */
    historyLoaded(
      state,
      action: PayloadAction<{ roomId: string; msgs: MessageDTO[] }>,
    ) {
      const { roomId, msgs } = action.payload;

      const existing = state.messages[roomId] ?? [];
      const ids = new Set(existing.map((m) => m.id));

      const merged = [...existing];
      for (const m of msgs) if (!ids.has(m.id)) merged.push(m);

      state.messages[roomId] = merged;
    },

    /* входящее сообщение (WS / optimistic) ------------------------------- */
    incomingMessage(
      state,
      action: PayloadAction<{ roomId: string; msg: MessageDTO }>,
    ) {
      const { roomId, msg } = action.payload;
      const current = state.messages[roomId] ?? [];

      /* ① убираем tmp-дубль, если пришёл реальный ответ от сервера */
      if (!isTmp(msg)) {
        const dupIdx = current.findIndex(
          (m) =>
            isTmp(m) &&
            m.content === msg.content &&
            Math.abs(Date.parse(m.created_at) - Date.parse(msg.created_at)) <
              15_000,
        );
        if (dupIdx !== -1) current.splice(dupIdx, 1);
      }

      /* ② не добавляем, если уже есть (может прийти повторный WS) */
      if (current.some((m) => m.id === msg.id)) {
        state.messages[roomId] = [...current];
        return;
      }

      /* ③ пишем новый массив, чтобы селекторы «увидели» обновление */
      state.messages[roomId] = [...current, msg];

      /* ④ обновляем превью и счётчики ---------------------------------- */
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

    /* «кто печатает» ----------------------------------------------------- */
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

    /* сброс счётчика непрочитанного после read --------------------------- */
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

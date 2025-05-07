/* -------------------------------------------------------------------------- */
/* chatWsMiddleware.ts                                                        */
/* -------------------------------------------------------------------------- */
import type { Middleware, Action } from "@reduxjs/toolkit";
import { socket } from "@/shared/lib/socket";
import {
  init,
  badge,
  incomingMessage,
  typing as typingAction,
} from "./chatSlice";
import { chatApi } from "@/modules/chat/api/chatApiSlice";
import type { RoomDTO, MessageDTO } from "../api/types";
import type { RootState } from "@/store";

/* ---------- расширяем сокет небольшим API ---------- */
interface ChatSocket {
  connect(token: string): void;
  addListener(cb: (e: MessageEvent<string>) => void): void;
  removeListener?(cb: (e: MessageEvent<string>) => void): void;
  _initialized?: boolean;
}

export const chatWsMiddleware: Middleware = (store) => {
  let handler: ((e: MessageEvent) => void) | null = null;

  return (next) => (action) => {
    /* SSR пропускаем */
    if (typeof window === "undefined") return next(action);

    /* -------------------- lazy-init -------------------- */
    const chatSocket = socket as ChatSocket;
    const token = localStorage.getItem("access_token");

    if (token && !chatSocket._initialized) {
      chatSocket.connect(token);

      if (handler && chatSocket.removeListener) {
        chatSocket.removeListener(handler);
      }

      handler = (e: MessageEvent) => {
        let d: any;
        try {
          d = JSON.parse(e.data as string);
        } catch {
          return; // не JSON
        }

        /* === вспомогалка: актуальный id авторизованного юзера === */
        const authId = (store.getState() as RootState).user.id;

        /* ---------- init ---------- */
        if (d.type === "init" && Array.isArray(d.rooms)) {
          const rooms: RoomDTO[] = d.rooms;
          store.dispatch(init(rooms));
          store.dispatch(
            chatApi.util.invalidateTags(
              rooms.map((r) => ({ type: "History" as const, id: r.room_id })),
            ),
          );
          return;
        }

        /* ---------- badge ---------- */
        if (d.type === "badge") {
          next(badge({ roomId: d.room_id, unread: d.unread }));
          store.dispatch(
            chatApi.util.invalidateTags([{ type: "History", id: d.room_id }]),
          );
          return;
        }

        /* ---------- typing ---------- */
        if (d.type === "typing") {
          next(
            typingAction({
              roomId: d.room_id,
              username: d.username,
              state: !!d.state,
            }),
          );
          return;
        }

        /* ---------- message с type ---------- */
        if (d.type === "message" && d.payload) {
          const msg: MessageDTO = {
            ...d.payload,
            is_mine: d.payload.sender?.id === authId,
          };
          next(incomingMessage({ roomId: d.room_id, msg }));
          return;
        }

        /* ---------- raw MessageDTO без type ---------- */
        if (d.room_id && d.id && d.content) {
          const msg: MessageDTO = {
            ...d,
            is_mine: d.sender?.id === authId,
          };
          next(incomingMessage({ roomId: msg.room_id, msg }));
          return;
        }

        /* ---------- нераспознанное ---------- */
        console.debug("[mw] unhandled WS payload:", d);
      };

      chatSocket.addListener(handler);
      chatSocket._initialized = true;
    }

    /* logout → сбросить флаг init */
    if ((action as Action).type === "user/logout") {
      chatSocket._initialized = false;
    }

    return next(action);
  };
};

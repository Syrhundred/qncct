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

/* ---------- точные типы WS-payload’ов ---------- */
interface InitEvent {
  type: "init";
  rooms: RoomDTO[];
}
interface BadgeEvent {
  type: "badge";
  room_id: string;
  unread: number;
}
interface TypingEvent {
  type: "typing";
  room_id: string;
  username: string;
  state: boolean;
}
interface MessageEventWS {
  type: "message";
  room_id: string;
  payload: MessageDTO;
}
/* «сырой» пакет без type */
type RawMessageDTO = MessageDTO & { type?: undefined };

/* ---------- расширяем сокет API ---------- */
interface ChatSocket {
  connect(token: string): void;
  addListener(cb: (e: MessageEvent<string>) => void): void;
  removeListener?(cb: (e: MessageEvent<string>) => void): void;
  _initialized?: boolean;
}

export const chatWsMiddleware: Middleware = (store) => {
  let handler: ((e: MessageEvent) => void) | null = null;

  return (next) => (action) => {
    if (typeof window === "undefined") return next(action); // SSR skip

    const chatSocket = socket as ChatSocket;
    const token = localStorage.getItem("access_token");

    if (token && !chatSocket._initialized) {
      chatSocket.connect(token);

      if (handler && chatSocket.removeListener)
        chatSocket.removeListener(handler);

      handler = (e: MessageEvent) => {
        let data: unknown;
        try {
          data = JSON.parse(e.data as string);
        } catch {
          return;
        }

        /* ---- актуальный id авторизованного юзера ---- */
        const authId = (store.getState() as RootState).user.id;

        /* ============== type guards + narrow ============== */
        if (isInitEvent(data)) {
          store.dispatch(init(data.rooms));
          store.dispatch(
            chatApi.util.invalidateTags(
              data.rooms.map((r) => ({
                type: "History" as const,
                id: r.room_id,
              })),
            ),
          );
          return;
        }

        if (isBadgeEvent(data)) {
          next(badge({ roomId: data.room_id, unread: data.unread }));
          store.dispatch(
            chatApi.util.invalidateTags([
              { type: "History", id: data.room_id },
            ]),
          );
          return;
        }

        if (isTypingEvent(data)) {
          next(
            typingAction({
              roomId: data.room_id,
              username: data.username,
              state: data.state,
            }),
          );
          return;
        }

        if (isMessageEventWS(data)) {
          const msg: MessageDTO = {
            ...data.payload,
            is_mine: data.payload.sender?.id === authId,
          };
          next(incomingMessage({ roomId: data.room_id, msg }));
          return;
        }

        if (isRawDTO(data)) {
          const msg: MessageDTO = {
            ...data,
            is_mine: data.sender?.id === authId,
          };
          next(incomingMessage({ roomId: msg.room_id, msg }));
          return;
        }

        console.debug("[mw] unhandled WS payload:", data);
      };

      chatSocket.addListener(handler);
      chatSocket._initialized = true;
    }

    if ((action as Action).type === "user/logout")
      chatSocket._initialized = false;

    return next(action);
  };
};

/* -------------------------------------------------------------------------- */
/* type-guard helpers                                                         */
/* -------------------------------------------------------------------------- */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isInitEvent(v: unknown): v is InitEvent {
  return isObject(v) && v.type === "init" && Array.isArray(v.rooms);
}
function isBadgeEvent(v: unknown): v is BadgeEvent {
  return isObject(v) && v.type === "badge" && "room_id" in v && "unread" in v;
}
function isTypingEvent(v: unknown): v is TypingEvent {
  return isObject(v) && v.type === "typing" && "username" in v;
}
function isMessageEventWS(v: unknown): v is MessageEventWS {
  return isObject(v) && v.type === "message" && "payload" in v;
}
function isRawDTO(v: unknown): v is RawMessageDTO {
  return (
    isObject(v) &&
    "room_id" in v &&
    "id" in v &&
    "content" in v &&
    !("type" in v)
  );
}

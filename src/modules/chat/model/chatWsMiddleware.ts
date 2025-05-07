/* -------------------------------------------------------------------------- */
/* chatWsMiddleware.ts – WebSocket ↔ Redux                                   */
/*  ▸  инициализирует сокет один раз                                          */
/*  ▸  маппит события WS → actions                                            */
/*  ▸  триггерит invalidateTags, чтобы RTK-Query сам refetch-ил историю       */
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

/* ---------- WebSocket event types ---------- */
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

interface MessageEvent {
  type: "message";
  room_id: string;
  payload: MessageDTO;
}

type WebSocketEvent =
  | InitEvent
  | BadgeEvent
  | TypingEvent
  | MessageEvent
  | MessageDTO;

/* ---------- расширяем сокет небольшим API ---------- */
interface ChatSocket {
  connect(token: string): void;
  addListener(cb: (e: globalThis.MessageEvent<string>) => void): void;
  removeListener?(cb: (e: globalThis.MessageEvent<string>) => void): void;
  _initialized?: boolean;
}

/* ---------- чисто тип, чтобы TS не ругался ---------- */
interface TypedAction extends Action {
  type: string;
}

export const chatWsMiddleware: Middleware = (store) => {
  /* один живой handler на всё приложение */
  let handler: ((e: globalThis.MessageEvent) => void) | null = null;

  return (next) => (action) => {
    /* SSR пропускаем */
    if (typeof window === "undefined") return next(action);

    /* -------------------- lazy-init -------------------- */
    const chatSocket = socket as ChatSocket;
    const token = localStorage.getItem("access_token");

    if (token && !chatSocket._initialized) {
      chatSocket.connect(token);

      /* safety: предыдущий handler снимаем, если API есть */
      if (handler && chatSocket.removeListener) {
        chatSocket.removeListener(handler);
      }

      /* основной обработчик WS-сообщений */
      handler = (e: globalThis.MessageEvent) => {
        let d: WebSocketEvent;
        try {
          d = JSON.parse(e.data as string) as WebSocketEvent;
        } catch {
          return;
        }

        /* ---------------- init (первичное состояние) ---------------- */
        if ("type" in d && d.type === "init" && "rooms" in d) {
          const { rooms } = d;
          console.debug("[mw] init:", rooms.length, "rooms");
          store.dispatch(init(rooms));

          /* invalidate history кэша для каждой комнаты */
          store.dispatch(
            chatApi.util.invalidateTags(
              rooms.map((r) => ({ type: "History" as const, id: r.room_id })),
            ),
          );
          return;
        }

        /* ---------------- badge (уведомление) ---------------------- */
        if (
          "type" in d &&
          d.type === "badge" &&
          "room_id" in d &&
          "unread" in d
        ) {
          const { room_id, unread } = d;
          console.debug("[mw] badge:", room_id, unread);
          next(badge({ roomId: room_id, unread }));
          store.dispatch(
            chatApi.util.invalidateTags([{ type: "History", id: room_id }]),
          );
          return;
        }

        /* ---------------- typing ---------------------- */
        if (
          "type" in d &&
          d.type === "typing" &&
          "room_id" in d &&
          "username" in d &&
          "state" in d
        ) {
          const { room_id, username, state } = d;
          next(
            typingAction({
              roomId: room_id,
              username,
              state: !!state,
            }),
          );
          return;
        }

        /* ---------------- message (нормальный) --------------------- */
        if (
          "type" in d &&
          d.type === "message" &&
          "room_id" in d &&
          "payload" in d
        ) {
          const { room_id, payload } = d;
          console.debug("[mw] message:", payload.id);
          next(incomingMessage({ roomId: room_id, msg: payload }));
          return;
        }

        /* ---------------- raw MessageDTO без type ------------------ */
        if ("room_id" in d && "id" in d && "content" in d) {
          const m = d as MessageDTO;
          next(incomingMessage({ roomId: m.room_id, msg: m }));
          return;
        }

        console.debug("[mw] unhandled WS payload:", d);
      };

      chatSocket.addListener(handler);
      chatSocket._initialized = true;
    }

    /* ---------------- logout → сбрасываем флаг -------------------- */
    const a = action as TypedAction;
    if (a.type === "user/logout") {
      chatSocket._initialized = false;
    }

    return next(action);
  };
};

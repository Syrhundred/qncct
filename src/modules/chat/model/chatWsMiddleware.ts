import type { Middleware } from "@reduxjs/toolkit";
import { socket } from "@/shared/lib/socket";
import {
  init,
  badge,
  incomingMessage,
  typing as typingAction,
} from "./chatSlice";

interface ChatSocket {
  /** Подключает веб-сокет с JWT */
  connect(token: string): void;
  /** Унифицированный метод подписки на сообщения */
  addListener(cb: (e: MessageEvent<string>) => void): void;
  /** Флаг одноразовой инициализации; выставляем только на клиенте */
  _initialized?: boolean;
}

export const chatWsMiddleware: Middleware = (store) => (next) => (action) => {
  if (typeof window === "undefined") return next(action);

  const chatSocket = socket as ChatSocket;

  /* однократная инициализация */
  const token = localStorage.getItem("access_token");
  if (token && !chatSocket._initialized) {
    chatSocket.connect(token);

    chatSocket.addListener((e) => {
      const d = JSON.parse(e.data);

      switch (d.type) {
        case "init":
          store.dispatch(init(d.rooms));
          break;

        case "message":
          console.debug("[mw] message →", {
            room: d.room_id,
            id: d.payload.id,
            mine: d.payload.is_mine,
          });
          store.dispatch(
            incomingMessage({ roomId: d.room_id, msg: d.payload }),
          );
          break;

        case "badge":
          store.dispatch(badge({ roomId: d.room_id, unread: d.unread }));
          break;

        case "typing":
          store.dispatch(
            typingAction({
              roomId: d.room_id,
              username: d.username,
              state: d.state,
            }),
          );
          break;
      }
    });

    chatSocket._initialized = true;
  }

  return next(action);
};

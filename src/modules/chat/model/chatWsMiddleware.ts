// src/modules/chat/model/chatWsMiddleware.ts
import type { Middleware } from "@reduxjs/toolkit";
import { socket } from "@/shared/lib/socket";
import { init, badge, incomingMessage, typing } from "./chatSlice";

export const chatWsMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  /** 1️⃣  Выполняем WS-логику только на клиенте */
  if (typeof window === "undefined") return result;

  const token = localStorage.getItem("access_token");
  if (token && !socket.connected) {
    socket.connect(token, (evt) => {
      const data = JSON.parse(evt.data);
      switch (data.type) {
        case "init":
          store.dispatch(init(data.rooms));
          break;
        case "message":
          store.dispatch(
            incomingMessage({ roomId: data.room_id, msg: data.message }),
          );
          break;
        case "badge":
          store.dispatch(badge({ roomId: data.room_id, unread: data.unread }));
          break;
        case "typing":
          store.dispatch(typing({ roomId: data.room_id, state: data.state }));
          break;
      }
    });
  }
  return result;
};

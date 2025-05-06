import type { Middleware } from "@reduxjs/toolkit";
import { socket } from "@/shared/lib/socket";
import {
  init,
  badge,
  incomingMessage,
  typing as typingAction,
} from "./chatSlice";

export const chatWsMiddleware: Middleware = (store) => (next) => (action) => {
  if (typeof window === "undefined") return next(action);

  /* однократная инициализация */
  const token = localStorage.getItem("access_token");
  if (token && !(socket as any)._initialized) {
    socket.connect(token);

    socket.addListener((e) => {
      const d = JSON.parse(e.data);

      switch (d.type) {
        case "init":
          store.dispatch(init(d.rooms));
          break;

        case "message": {
          console.debug("[mw] message →", {
            room: d.room_id,
            id: d.payload.id,
            mine: d.payload.is_mine,
          });
          store.dispatch(
            incomingMessage({ roomId: d.room_id, msg: d.payload }),
          );
          break;
        }

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

    (socket as any)._initialized = true;
  }

  return next(action);
};

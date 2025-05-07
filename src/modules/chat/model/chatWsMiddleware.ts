// src/modules/chat/model/chatWsMiddleware.ts - UPDATED
import type { Middleware, Action } from "@reduxjs/toolkit";
import { socket } from "@/shared/lib/socket";
import {
  init,
  badge,
  incomingMessage,
  typing as typingAction,
} from "./chatSlice";
import { chatApi } from "@/modules/chat/api/chatApiSlice";

interface ChatSocket {
  /** Подключает веб-сокет с JWT */
  connect(token: string): void;
  /** Унифицированный метод подписки на сообщения */
  addListener(cb: (e: MessageEvent<string>) => void): void;
  /** Флаг одноразовой инициализации; выставляем только на клиенте */
  _initialized?: boolean;
}

// Define an interface for actions with type property
interface TypedAction extends Action {
  type: string;
}

export const chatWsMiddleware: Middleware = (store) => {
  // Create and maintain a single message handler
  let messageHandler: ((e: MessageEvent) => void) | null = null;

  return (next) => (action) => {
    // Ignore on server-side rendering
    if (typeof window === "undefined") return next(action);

    const chatSocket = socket as ChatSocket;

    /* однократная инициализация */
    const token = localStorage.getItem("access_token");
    if (token && !chatSocket._initialized) {
      chatSocket.connect(token);

      // Remove previous handler if exists
      if (messageHandler) {
        // If we had an implementation for removing listeners
        // chatSocket.removeListener(messageHandler);
      }

      messageHandler = (e: MessageEvent) => {
        try {
          const d = JSON.parse(e.data);

          if (!d || typeof d !== "object" || !d.type) {
            return; // Invalid message format
          }

          switch (d.type) {
            case "init":
              if (Array.isArray(d.rooms)) {
                console.debug(
                  "[mw] Received init with",
                  d.rooms.length,
                  "rooms",
                );
                store.dispatch(init(d.rooms));
              }
              break;

            case "message":
              if (d.room_id && d.payload && d.payload.id) {
                console.debug("[mw] Received message →", {
                  room: d.room_id,
                  content: d.payload.content?.substring(0, 20),
                  id: d.payload.id,
                  mine: d.payload.is_mine,
                });

                // IMPORTANT: Use next() directly to avoid potential middleware re-entry issues
                // This allows the message to be dispatched immediately
                next(incomingMessage({ roomId: d.room_id, msg: d.payload }));
              }
              break;

            case "badge": {
              console.debug("[mw] Received badge", d.room_id, d.unread);
              next(badge({ roomId: d.room_id, unread: d.unread }));

              // 💡  Инвалидируем историю — RTK-Query сам сделает refetch,
              //     компонент подхватит новые данные.
              store.dispatch(
                chatApi.util.invalidateTags([
                  { type: "History", id: d.room_id },
                ]),
              );

              break;
            }

            case "typing":
              if (d.room_id && d.username) {
                console.debug(
                  "[mw] Typing status:",
                  d.username,
                  "in",
                  d.room_id,
                  "is",
                  d.state ? "typing" : "stopped",
                );
                next(
                  typingAction({
                    roomId: d.room_id,
                    username: d.username,
                    state: !!d.state,
                  }),
                );
              }
              break;

            default:
              console.debug("[mw] Unhandled message type:", d.type);
          }
        } catch (err) {
          console.error("[mw] Error handling WebSocket message", err, e.data);
        }
      };

      chatSocket.addListener(messageHandler);
      chatSocket._initialized = true;
    }

    // Handle certain action types that might need to interact with the WebSocket
    // Type assertion to ensure TypeScript knows action has a type property
    const typedAction = action as TypedAction;
    if (typedAction.type === "user/logout") {
      // Reset the initialization flag when user logs out
      chatSocket._initialized = false;
    }

    return next(action);
  };
};

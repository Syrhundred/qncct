import { ReliableSocket } from "./reliableSocket";
import { store } from "@/store";

// Create the socket instance
export const socket = new ReliableSocket(process.env.NEXT_PUBLIC_WS_URL!);

/* wake-up при возврате во вкладку или восстановлении сети */
if (typeof window !== "undefined") {
  const wake = () => {
    /* ① восстановить WebSocket */
    const token = localStorage.getItem("access_token");
    if (token) {
      console.info("[chat] Wake-up - reconnecting socket");
      socket.connect(token);
    }
    if (!token) console.warn("[mw] No token found during WebSocket init");

    /* ② если на /chat/[roomId] – forceRefetch истории */
    const m = window.location.pathname.match(/^\/chat\/([^/]+)/);
    if (m) {
      console.info("[chat] Wake-up - refreshing room history for", m[1]);

      /*  ленивый импорт, чтобы избежать цикла */
      import("@/modules/chat/api/chatApiSlice").then(({ chatApi }) => {
        store.dispatch(
          chatApi.endpoints.getHistory.initiate(m[1], {
            forceRefetch: true,
            subscribe: false, // нет подписки — одноразовый запрос
          }),
        );
      });
    }
  };

  // Handle visibility change (tab becomes active)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.info("[chat] Tab became visible - waking up");
      wake();
    }
  });

  // Handle network reconnection
  window.addEventListener("online", () => {
    console.info("[chat] Network came online - waking up");
    wake();
  });

  // Initial connection if we already have a token
  const token = localStorage.getItem("access_token");
  if (token) {
    console.info("[chat] Initial socket connection");
    socket.connect(token);
  }
}

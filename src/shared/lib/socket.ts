import { ReliableSocket } from "./reliableSocket";
import { store } from "@/store";

export const socket = new ReliableSocket(process.env.NEXT_PUBLIC_WS_URL!);

/* wake-up при возврате во вкладку или восстановлении сети */
if (typeof window !== "undefined") {
  const wake = () => {
    /* ① восстановить WebSocket */
    const token = localStorage.getItem("access_token");
    if (token && !socket.connected) socket.connect(token);

    /* ② если на /chat/[roomId] – forceRefetch истории */
    const m = window.location.pathname.match(/^\/chat\/([^/]+)/);
    if (m) {
      /*  ленивый импорт, чтобы избежать цикла */
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

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") wake();
  });
  window.addEventListener("online", wake);
}

import { ReliableSocket } from "./reliableSocket";
import { store } from "@/store";

// Создаём единый инстанс WebSocket
export const socket = new ReliableSocket(process.env.NEXT_PUBLIC_WS_URL!);

if (typeof window !== "undefined") {
  // Функция для восстановления инициализации WS и истории чата
  const wake = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      console.info("[chat] Wake-up - ensuring socket connection");
      socket.connect(token);
    } else {
      console.warn("[chat] No token found during WebSocket wake-up");
    }

    const m = window.location.pathname.match(/^\/chat\/([^/]+)/);
    if (m) {
      console.info("[chat] Wake-up - refreshing room history for", m[1]);
      import("@/modules/chat/api/chatApiSlice").then(({ chatApi }) => {
        store.dispatch(
          chatApi.endpoints.getHistory.initiate(m[1], {
            forceRefetch: true,
            subscribe: false,
          }),
        );
      });
    }
  };

  // При возврате в активную вкладку
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.info("[chat] Tab became visible - waking up");
      wake();
    }
  });

  // При восстановлении сети
  window.addEventListener("online", () => {
    console.info("[chat] Network came online - waking up");
    wake();
  });

  // 1) Проверяем авторизацию при старте и соединяем, если уже залогинен
  const checkInitialAuth = () => {
    const userId = store.getState().user.id;
    if (userId) {
      const token = localStorage.getItem("access_token");
      if (token) {
        console.info("[chat] Initial socket connection (user logged in)");
        socket.connect(token);
      }
    }
  };
  setTimeout(checkInitialAuth, 100);

  // 2) Подписываемся на изменения user.id и соединяем при логине
  let lastUserId: string | null = null;
  store.subscribe(() => {
    const userId = store.getState().user.id;
    if (userId !== lastUserId) {
      lastUserId = userId;
      if (userId) {
        const token = localStorage.getItem("access_token");
        if (token) {
          console.info("[chat] User logged in - connecting socket");
          socket.connect(token);
        }
      } else {
        console.info("[chat] User logged out - disposing socket");
        socket.dispose();
      }
    }
  });
}

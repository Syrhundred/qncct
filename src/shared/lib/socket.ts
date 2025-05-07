import { ReliableSocket } from "./reliableSocket";
import { store } from "@/store";

// Создаем экземпляр с улучшенным сокетом
export const socket = new ReliableSocket(process.env.NEXT_PUBLIC_WS_URL!);

/* Улучшенная система wake-up и поддержания соединения */
if (typeof window !== "undefined") {
  // Функция обновления истории чата, если находимся в комнате
  const refreshRoomHistory = () => {
    const m = window.location.pathname.match(/^\/chat\/([^/]+)/);
    if (m) {
      console.info("[chat] Refreshing room history for", m[1]);

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

  // Улучшенная функция wake-up с использованием ensureConnection вместо connect
  const wake = () => {
    /* Проверка и восстановление WebSocket */
    const token = localStorage.getItem("access_token");
    if (token) {
      console.info("[chat] Wake-up - ensuring socket connection");

      // Используем ensureConnection вместо connect для умной проверки соединения
      if (!socket.connected) {
        console.info("[chat] Connection lost - reconnecting");
        socket.connect(token);
      } else {
        console.debug("[chat] Socket already connected");
      }

      // Обновляем историю комнаты, если находимся в чате
      refreshRoomHistory();
    } else {
      console.warn("[chat] No token found during WebSocket wake-up");
    }
  };

  // Обработка изменения видимости (вкладка становится активной)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.info("[chat] Tab became visible - waking up");
      wake();

      // Дополнительно: проверяем соединение через короткое время
      // для случаев, когда браузер "замораживает" неактивные соединения
      setTimeout(() => {
        if (!socket.connected) {
          console.info("[chat] Delayed connection check after tab activation");
          wake();
        }
      }, 1000);
    }
  });

  // Обработка восстановления сети с принудительным переподключением
  window.addEventListener("online", () => {
    console.info("[chat] Network came online - reconnecting");
    const token = localStorage.getItem("access_token");
    if (token) {
      // При восстановлении сети делаем принудительное переподключение
      socket.reconnect();

      // После короткой паузы обновляем историю комнаты
      setTimeout(refreshRoomHistory, 1500);
    }
  });

  // Слушаем изменения в хранилище для определения входа/выхода пользователя
  let lastAuthState: boolean | null = null;

  // Проверяем авторизацию при старте
  const checkInitialAuth = () => {
    const { isAuth } = store.getState().auth;
    lastAuthState = isAuth;

    if (isAuth) {
      const token = localStorage.getItem("access_token");
      if (token) {
        console.info("[chat] Initial socket connection (user logged in)");
        socket.connect(token);
      }
    }
  };

  // Вызываем после инициализации хранилища
  setTimeout(checkInitialAuth, 100);

  // Слушаем изменения авторизации пользователя
  store.subscribe(() => {
    const { isAuth } = store.getState().auth;

    // Реагируем только на изменения статуса авторизации
    if (lastAuthState !== isAuth) {
      lastAuthState = isAuth;

      if (isAuth) {
        const token = localStorage.getItem("access_token");
        if (token) {
          console.info("[chat] User logged in - connecting socket");
          socket.connect(token);
        }
      } else {
        console.info("[chat] User logged out - cleaning up socket");
        // Очищаем ресурсы сокета при выходе
        socket.dispose();
      }
    }
  });

  // Начальное соединение при загрузке страницы (если есть токен)
  const token = localStorage.getItem("access_token");
  if (token) {
    console.info("[chat] Initial socket connection attempt");
    socket.connect(token);
  }
}

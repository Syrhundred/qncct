export type MsgHandler = (e: MessageEvent) => void;

export class ReliableSocket {
  private ws?: WebSocket;
  private handlers = new Set<MsgHandler>();

  private reconnectAttempts = 0;
  private pingTimer?: ReturnType<typeof setInterval>;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private keepAliveTimer?: ReturnType<typeof setInterval>;
  private messageQueue: Record<string, unknown>[] = []; // типизированная очередь сообщений

  // Новые параметры для настройки стабильности соединения
  private readonly MAX_RECONNECT_ATTEMPTS = 100; // Практически безлимитные попытки
  private readonly INITIAL_RECONNECT_DELAY = 500; // Более быстрое первое переподключение (500мс)
  private readonly PING_INTERVAL = 15000; // Пинг каждые 15 секунд
  private readonly PONG_TIMEOUT = 10000; // Таймаут для pong 10 секунд
  private readonly KEEP_ALIVE_INTERVAL = 5000; // Проверка соединения каждые 5 секунд

  private token: string = ""; // Сохраняем токен для быстрого переподключения
  private forceReconnect = false; // Флаг для принудительного переподключения

  constructor(private readonly url: string) {}

  /* ─── публичное API ─── */
  connect(token: string) {
    // Сохраняем токен для будущих переподключений
    this.token = token;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    // Если уже подключено и не требуется принудительное переподключение
    if (!this.forceReconnect && this.ws?.readyState === WebSocket.OPEN) {
      console.debug("[chat] WS already open");
      this.startKeepAlive(); // Убедимся, что keepAlive работает
      return;
    }

    // Если в процессе подключения и не требуется принудительное переподключение
    if (!this.forceReconnect && this.ws?.readyState === WebSocket.CONNECTING) {
      console.debug("[chat] WS already connecting");
      return;
    }

    // Закрываем существующее соединение если есть
    if (this.ws) {
      console.debug("[chat] Closing existing connection before reconnect");
      this.ws.onclose = null; // Предотвращаем автоматический reconnect при закрытии
      this.ws.close();
      this.ws = undefined;
    }

    // Сбрасываем флаг принудительного переподключения
    this.forceReconnect = false;

    console.debug("[chat] Establishing new connection");
    this.ws = new WebSocket(`${this.url}?token=${token}`);
    this.bindEvents(token);
  }

  // Принудительное переподключение - можно вызвать из внешнего кода
  reconnect() {
    console.info("[chat] Manual reconnection requested");
    this.forceReconnect = true;
    this.connect(this.token);
  }

  send(payload: Record<string, unknown>) {
    // Проверка состояния соединения перед отправкой
    if (!this.connected) {
      // Переподключаемся, если соединение закрыто
      this.ensureConnection();
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
        return true;
      } catch (err) {
        console.error("[chat] Error sending message:", err);
        this.messageQueue.push(payload);
        this.ensureConnection(); // При ошибке отправки пытаемся восстановить соединение
        return false;
      }
    } else {
      if (payload?.type !== "ping") {
        console.debug("[chat] Queuing message for later delivery", payload);
        this.messageQueue.push(payload);
        this.ensureConnection(); // Обеспечиваем соединение
      }
      return false;
    }
  }

  addListener(fn: MsgHandler) {
    this.handlers.add(fn);
  }

  removeListener(fn: MsgHandler) {
    this.handlers.delete(fn);
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Публичный метод для проверки и восстановления соединения
  ensureConnection() {
    if (!this.connected && this.token) {
      console.debug("[chat] Ensuring connection is established");
      this.connect(this.token);
    }
  }

  /* ─── внутреннее ─── */
  private bindEvents(token: string) {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.info("[chat] WS OPEN", this.ws!.url);
      this.reconnectAttempts = 0;
      this.startPing();
      this.startKeepAlive();

      if (this.messageQueue.length > 0) {
        console.debug(
          `[chat] Processing ${this.messageQueue.length} queued messages`,
        );
        const queue = [...this.messageQueue];
        this.messageQueue = [];

        queue.forEach((msg) => this.send(msg));
      }
    };

    this.ws.onmessage = (e) => {
      console.debug("[chat] ⬇︎ raw", e.data);

      try {
        const data = JSON.parse(e.data);
        if (data?.type === "pong") return;
      } catch {
        // not JSON — ignore
      }

      this.handlers.forEach((fn) => {
        try {
          fn(e);
        } catch (err) {
          console.error("[chat] Handler error", err);
        }
      });
    };

    this.ws.onerror = (err) => {
      console.error("[chat] WS ERROR", err);
      // Немедленное переподключение при ошибке
      this.scheduleReconnect(token, true);
    };

    this.ws.onclose = (e) => {
      console.warn("[chat] WS CLOSE", {
        code: e.code,
        reason: e.reason,
        wasClean: e.wasClean,
      });
      this.stopPing();
      this.stopKeepAlive();
      this.scheduleReconnect(token);
    };
  }

  /* ─ ping/pong для поддержания соединения ─ */
  private startPing() {
    this.stopPing();

    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        console.debug("[chat] Connection not open during ping, reconnecting");
        this.ensureConnection();
        return;
      }

      console.debug("[chat] Sending ping");
      this.ws.send(JSON.stringify({ type: "ping" }));

      const pongTimeout = setTimeout(() => {
        console.warn("[chat] Pong timeout - forcing reconnection");
        this.forceReconnect = true;
        this.ensureConnection();
      }, this.PONG_TIMEOUT);

      const pongHandler = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data?.type === "pong") {
            clearTimeout(pongTimeout);
            console.debug("[chat] Pong received");
          }
        } catch {
          // ignore
        }
      };

      this.ws!.addEventListener("message", pongHandler, { once: true });
    }, this.PING_INTERVAL); // Уменьшенный интервал для более частых пингов
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
  }

  /* ─ keepAlive для дополнительной проверки состояния соединения ─ */
  private startKeepAlive() {
    this.stopKeepAlive();

    this.keepAliveTimer = setInterval(() => {
      // Проверка состояния и переподключение при необходимости
      if (!this.connected && this.token) {
        console.debug("[chat] Keep-alive check: connection lost, reconnecting");
        this.connect(this.token);
      }
    }, this.KEEP_ALIVE_INTERVAL);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = undefined;
    }
  }

  /* ─ улучшенный алгоритм переподключения ─ */
  private scheduleReconnect(token: string, immediate = false) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    // Экспоненциальная задержка с начальным значением
    const delay = immediate
      ? 0 // Немедленное переподключение при immediate=true
      : Math.min(
          30000,
          this.INITIAL_RECONNECT_DELAY *
            Math.pow(1.5, Math.min(10, this.reconnectAttempts)),
        );

    this.reconnectAttempts += 1;

    console.info(
      `[chat] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    // Проверка на максимальное количество попыток
    if (this.reconnectAttempts > this.MAX_RECONNECT_ATTEMPTS) {
      console.warn("[chat] Maximum reconnect attempts reached, reset counter");
      this.reconnectAttempts = 0; // Сбрасываем счетчик для продолжения попыток
    }

    this.reconnectTimer = setTimeout(() => {
      console.info(`[chat] Attempting reconnect #${this.reconnectAttempts}`);
      this.connect(token);
    }, delay);
  }

  // Метод для очистки всех таймеров и освобождения ресурсов
  public dispose() {
    this.stopPing();
    this.stopKeepAlive();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = undefined;
    }

    this.handlers.clear();
    this.messageQueue = [];
  }
}

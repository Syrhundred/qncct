// src/modules/shared/lib/reliableSocket.ts
export type MsgHandler = (e: MessageEvent) => void;

/**
 * Надёжный WebSocket:
 *  • JSON-ping/pong каждые 20 с
 *  • экспоненциальный reconnect (макс. 30 с)
 *  • повторное подключение сохраняет подписчиков
 */
export class ReliableSocket {
  private ws?: WebSocket;
  private handlers = new Set<MsgHandler>();

  private reconnectAttempts = 0;
  private pingTimer?: ReturnType<typeof setInterval>;

  constructor(private readonly url: string) {}

  /* ─── публичное API ─── */
  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${this.url}?token=${token}`);
    this.bindEvents(token);
  }

  send(payload: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
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

  /* ─── внутреннее ─── */
  private bindEvents(token: string) {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.info("[chat] WS OPEN", this.ws!.url);
      this.reconnectAttempts = 0;
      this.startPing();
    };

    this.ws.onmessage = (e) => {
      console.debug("[chat] ⬇︎ raw", e.data);

      // фильтруем pong
      try {
        const data = JSON.parse(e.data);
        if (data?.type === "pong") return;
      } catch {
        /* не JSON — пропускаем дальше */
      }

      this.handlers.forEach((fn) => fn(e));
    };

    this.ws.onerror = (err) => {
      console.error("[chat] WS ERROR", err);
      this.ws?.close();
    };

    this.ws.onclose = (e) => {
      console.warn("[chat] WS CLOSE", {
        code: e.code,
        reason: e.reason,
        wasClean: e.wasClean,
      });
      this.stopPing();
      this.scheduleReconnect(token);
    };
  }

  /* ─ ping/pong ─ */
  private startPing() {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) return;

      // JSON-ping (сервер ожидает валидный JSON)
      this.ws.send(JSON.stringify({ type: "ping" }));

      const timeout = setTimeout(() => this.ws?.close(), 10_000);

      const once = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data?.type === "pong") clearTimeout(timeout);
        } catch {
          /* не JSON — игнорируем */
        }
      };
      this.ws.addEventListener("message", once, { once: true });
    }, 20_000);
  }
  private stopPing() {
    clearInterval(this.pingTimer);
  }

  /* ─ reconnect ─ */
  private scheduleReconnect(token: string) {
    const delay = Math.min(30, 2 ** this.reconnectAttempts) * 1_000; // 2-4-8…с
    setTimeout(() => {
      this.reconnectAttempts += 1;
      this.connect(token);
    }, delay);
  }
}

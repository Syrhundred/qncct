export type MsgHandler = (e: MessageEvent) => void;

export class ReliableSocket {
  private ws?: WebSocket;
  private handlers = new Set<MsgHandler>();

  private reconnectAttempts = 0;
  private pingTimer?: ReturnType<typeof setInterval>;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private messageQueue: Record<string, unknown>[] = []; // типизированная очередь сообщений

  constructor(private readonly url: string) {}

  /* ─── публичное API ─── */
  connect(token: string) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    ) {
      console.debug("[chat] WS already connecting/open");
      return;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }

    this.ws = new WebSocket(`${this.url}?token=${token}`);
    this.bindEvents(token);
  }

  send(payload: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    } else {
      if (payload?.type !== "ping") {
        console.debug("[chat] Queuing message for later delivery", payload);
        this.messageQueue.push(payload);
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

  /* ─── внутреннее ─── */
  private bindEvents(token: string) {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.info("[chat] WS OPEN", this.ws!.url);
      this.reconnectAttempts = 0;
      this.startPing();

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
    this.stopPing();
    // const PING_EVERY = 25_000; // 25 с
    const PONG_TIMEOUT = 45_000; // 45 с

    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) return;

      this.ws.send(JSON.stringify({ type: "ping" }));

      const pongTimeout = setTimeout(() => {
        console.warn("[chat] Pong timeout - closing connection");
        this.ws?.close();
      }, PONG_TIMEOUT);

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
    }, 20000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
  }

  /* ─ reconnect ─ */
  private scheduleReconnect(token: string) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(30000, 2000 * 2 ** this.reconnectAttempts);
    this.reconnectAttempts += 1;

    console.info(
      `[chat] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    this.reconnectTimer = setTimeout(() => {
      console.info(`[chat] Attempting reconnect #${this.reconnectAttempts}`);
      this.connect(token);
    }, delay);
  }
}

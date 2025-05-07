interface SocketMessage {
  type: string;
  [key: string]: any;
}

let currentToken = "";
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const socket = {
  ws: null as WebSocket | null,
  listeners: new Set<(e: MessageEvent) => void>(),
  connected: false,
  queue: [] as SocketMessage[],

  connect(token: string) {
    if (this.connected || token === currentToken) return;

    currentToken = token;
    this.ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);

    this.ws.onopen = () => {
      this.connected = true;
      reconnectAttempts = 0;
      this.processQueue();
    };

    this.ws.onmessage = (e) => {
      this.listeners.forEach((cb) => cb(e));
    };

    this.ws.onclose = () => {
      this.connected = false;
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(
          () => {
            reconnectAttempts++;
            this.connect(token);
          },
          Math.min(1000 * reconnectAttempts, 5000),
        );
      }
    };
  },

  addListener(cb: (e: MessageEvent) => void) {
    this.listeners.add(cb);
    return cb;
  },

  removeListener(cb: (e: MessageEvent) => void) {
    this.listeners.delete(cb);
  },

  send(message: SocketMessage): boolean {
    if (!this.connected) {
      this.queue.push(message);
      return false;
    }

    try {
      this.ws?.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error("WebSocket send error:", err);
      return false;
    }
  },

  processQueue() {
    while (this.queue.length > 0) {
      const msg = this.queue.shift();
      if (msg) this.send(msg);
    }
  },
};

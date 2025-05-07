interface SocketMessageBase {
  type: string;
  room_id?: string;
  priority?: "low" | "normal" | "high";
}

interface SendMessage extends SocketMessageBase {
  type: "send";
  room_id: string;
  content: string;
}

interface TypingMessage extends SocketMessageBase {
  type: "typing";
  room_id: string;
  state: boolean;
}

interface ReadMessage extends SocketMessageBase {
  type: "read";
  room_id: string;
  last_msg_id: string;
}

interface InitMessage extends SocketMessageBase {
  type: "init";
  rooms: Array<{
    room_id: string;
    title: string;
    banner: string;
    unread: number;
    last_msg_preview?: {
      content?: string;
      created_at?: string;
    };
  }>;
}

type SocketMessage = SendMessage | TypingMessage | ReadMessage | InitMessage;

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

  send<T extends SocketMessage>(message: T): boolean {
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

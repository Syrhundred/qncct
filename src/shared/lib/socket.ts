// src/modules/shared/lib/socket.ts
const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

export class Socket {
  private socket?: WebSocket;
  private reconnectTimer?: NodeJS.Timeout;
  public connected = false; // <—

  constructor(private readonly url: string) {}

  connect(token: string, onMsg: (evt: MessageEvent) => void) {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(`${this.url}?token=${token}`);
    this.socket.onmessage = onMsg;
    this.socket.onopen = () => (this.connected = true);
    this.socket.onclose = () => {
      this.connected = false;
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => this.connect(token, onMsg), 3_000);
    };
  }

  send(payload: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }
}

export const socket = new Socket(WS_URL);

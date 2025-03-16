export interface WebSocketCallbacks {
  onPeerJoined?: () => void;
  onMessage?: (message: string) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onSessionCode?: (code: string) => void;
}

export class WebSocketService {
  private baseUrl = "http://127.0.0.1:9081/ws";
  private ws: WebSocket | null = null;
  private sessionCode: string | null = null;
  private callbacks: WebSocketCallbacks = {};

  constructor(sessionCode: string | null = null) {
    this.sessionCode = sessionCode;
  }

  setCallbacks(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
  }

  connect() {
    const url = this.sessionCode
      ? `${this.baseUrl}/chat/${this.sessionCode}`
      : `${this.baseUrl}/chat`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("Connected to PeerDrop");
    };

    this.ws.onmessage = (event) => {
      const message = event.data;

      if (!this.sessionCode) {
        // First message for new sessions contains the code
        this.sessionCode = message;
        this.callbacks.onSessionCode?.(message);
        console.log("New session created:", this.sessionCode);
      } else if (message === "the other guy joined") {
        // Peer joined notification
        this.callbacks.onPeerJoined?.();
      } else {
        // Regular message
        this.callbacks.onMessage?.(message);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.callbacks.onError?.(error);
    };

    this.ws.onclose = (event) => {
      if (event.code !== 1000) {
        console.error("Connection lost:", event.reason);
      }
      this.callbacks.onClose?.(event);
    };
  }

  send(message: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      console.error("WebSocket is not connected");
    }
  }

  close() {
    this.ws?.close();
  }

  getSessionCode() {
    return this.sessionCode;
  }
}

export interface WebSocketCallbacks {
  onPeerJoined?: () => void;
  onMessage?: (message: string) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onSessionCode?: (code: string) => void;
  onConnected?: () => void;
}

export class WebSocketService {
  private baseUrl = "ws://localhost:9081";
  private ws: WebSocket | null = null;
  private sessionCode: string | null = null;
  private callbacks: WebSocketCallbacks = {};
  private isFirstMessage = true;
  private isJoining: boolean;

  constructor(sessionCode: string | null = null) {
    this.sessionCode = sessionCode;
    this.isJoining = sessionCode !== null;
  }

  setCallbacks(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
  }

  connect() {
    const url = this.sessionCode
      ? `${this.baseUrl}/ws/chat/${this.sessionCode}`
      : `${this.baseUrl}/ws/chat`;

    this.ws = new WebSocket(url);
    this.isFirstMessage = true;

    this.ws.onopen = () => {
      console.log("Connected to PeerDrop");
    };

    this.ws.onmessage = (event) => {
      const message = event.data;

      if (this.isFirstMessage) {
        // First message is always the session code
        this.sessionCode = message;
        this.isFirstMessage = false;

        if (!this.isJoining) {
          // If we're creating a new session, notify about the code
          this.callbacks.onSessionCode?.(message);
        } else if (message === this.sessionCode) {
          // If we're joining and got back the same code, we're connected
          this.callbacks.onConnected?.();
        }
        console.log("Session code received:", this.sessionCode);
      } else if (message === "the other guy joined") {
        // Peer joined notification
        this.callbacks.onPeerJoined?.();
      } else {
        // Regular message from peer
        this.callbacks.onMessage?.(message);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.callbacks.onError?.(error);
    };

    this.ws.onclose = (event) => {
      // According to docs, sessions expire on disconnect
      this.sessionCode = null;
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

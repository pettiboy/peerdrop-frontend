export interface WebSocketCallbacks {
  onPeerJoined?: () => void;
  onMessage?: (message: string) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onSessionCode?: (code: string) => void;
  onConnected?: () => void;
}

export class WebSocketService {
  private baseUrl = import.meta.env.VITE_WS_URL;
  private ws: WebSocket | null = null;
  private sessionCode: string | null = null;
  private callbacks: WebSocketCallbacks = {};
  private isFirstMessage = true;
  private isJoining: boolean;
  private isClosing = false;
  private isConnecting = false;

  constructor(sessionCode: string | null = null) {
    console.log("WebSocketService constructor", this.baseUrl);
    this.sessionCode = sessionCode;
    this.isJoining = sessionCode !== null;
  }

  setCallbacks(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
  }

  connect() {
    // Don't try to connect if we're already connecting or closing
    if (this.isConnecting || this.isClosing) {
      return;
    }

    // Clean up any existing connection first
    this.cleanup();

    const url = this.sessionCode
      ? `${this.baseUrl}/ws/chat/${this.sessionCode}`
      : `${this.baseUrl}/ws/chat`;

    console.log("Connecting to:", url);
    this.isConnecting = true;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      if (!this.isClosing) {
        console.log("Connected to PeerDrop");
        this.isConnecting = false;
      }
    };

    this.ws.onmessage = (event) => {
      if (this.isClosing) return;

      const message = event.data;
      console.log("Received message:", message);

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
      if (!this.isClosing) {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
        this.callbacks.onError?.(error);
      }
    };

    this.ws.onclose = (event) => {
      if (!this.isClosing) {
        console.log(
          "WebSocket closed with code:",
          event.code,
          "reason:",
          event.reason
        );
        this.isConnecting = false;
        // According to docs, sessions expire on disconnect
        this.sessionCode = null;
        this.callbacks.onClose?.(event);
      }
    };
  }

  private cleanup() {
    if (this.ws) {
      // Remove all listeners first
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;

      // Then close the connection
      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  send(message: string) {
    if (
      this.ws?.readyState === WebSocket.OPEN &&
      !this.isClosing &&
      !this.isConnecting
    ) {
      this.ws.send(message);
    } else {
      console.error(
        "WebSocket is not connected. State:",
        this.ws?.readyState,
        "Closing:",
        this.isClosing,
        "Connecting:",
        this.isConnecting
      );
    }
  }

  close() {
    console.log("Closing WebSocket connection");
    this.isClosing = true;
    this.cleanup();
    this.isClosing = false;
  }

  getSessionCode() {
    return this.sessionCode;
  }
}

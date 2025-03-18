import { useEffect, useState, useRef, useCallback } from "react";
import { WebSocketService } from "../services/websocket";
import { ImageUpload } from "./ImageUpload";

interface ChatProps {
  sessionCode?: string | null;
}

interface ChatMessage {
  text: string;
  fromSelf: boolean;
  type: "message" | "system" | "image";
  imageUrl?: string;
}

interface WebSocketMessage {
  type: "message" | "image";
  data: string;
}

export function Chat({ sessionCode }: ChatProps) {
  const [ws, setWs] = useState<WebSocketService | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentCode, setCurrentCode] = useState<string | null>(
    sessionCode || null
  );
  const [inputMessage, setInputMessage] = useState("");
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocketService | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupWebSocket = useCallback(() => {
    // Clean up any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsService = new WebSocketService(sessionCode || null);
    wsRef.current = wsService;

    wsService.setCallbacks({
      onPeerJoined: () => {
        setMessages((prev) => [
          ...prev,
          { text: "Peer joined the chat", fromSelf: false, type: "system" },
        ]);
        setStatus("connected");
      },
      onMessage: (message) => {
        try {
          // Try to parse the message as JSON first
          const parsedMessage = JSON.parse(message) as WebSocketMessage;

          if (parsedMessage.type === "image") {
            setMessages((prev) => [
              ...prev,
              {
                text: "Image",
                fromSelf: false,
                type: "image",
                imageUrl: parsedMessage.data,
              },
            ]);
          } else if (parsedMessage.type === "message") {
            setMessages((prev) => [
              ...prev,
              {
                text: parsedMessage.data,
                fromSelf: false,
                type: "message",
              },
            ]);
          }
        } catch (e) {
          // If parsing fails, treat it as a regular text message
          setMessages((prev) => [
            ...prev,
            { text: message, fromSelf: false, type: "message" },
          ]);
        }
      },
      onSessionCode: (code) => {
        setCurrentCode(code);
        setMessages((prev) => [
          ...prev,
          {
            text: `New session created. Share this code with others: ${code}`,
            fromSelf: false,
            type: "system",
          },
        ]);
      },
      onConnected: () => {
        setStatus("connected");
        setMessages((prev) => [
          ...prev,
          {
            text: "Connected to session",
            fromSelf: false,
            type: "system",
          },
        ]);
      },
      onError: () => {
        setStatus("disconnected");
        setMessages((prev) => [
          ...prev,
          {
            text: "Connection error occurred",
            fromSelf: false,
            type: "system",
          },
        ]);
      },
      onClose: () => {
        setStatus("disconnected");
        setMessages((prev) => [
          ...prev,
          { text: "Disconnected from chat", fromSelf: false, type: "system" },
        ]);
      },
    });

    setStatus("connecting");
    wsService.connect();
    setWs(wsService);
  }, [sessionCode]);

  useEffect(() => {
    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [setupWebSocket]);

  const handleSend = () => {
    if (inputMessage.trim() && ws) {
      // Send message in consistent format
      ws.send(
        JSON.stringify({
          type: "message",
          data: inputMessage.trim(),
        })
      );

      setMessages((prev) => [
        ...prev,
        { text: inputMessage, fromSelf: true, type: "message" },
      ]);
      setInputMessage("");
    }
  };

  const handleImageSelect = async (file: File) => {
    if (!ws) return;

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        // Send image through WebSocket
        ws.send(
          JSON.stringify({
            type: "image",
            data: base64String,
          })
        );

        // Add to messages
        setMessages((prev) => [
          ...prev,
          {
            text: "Image",
            fromSelf: true,
            type: "image",
            imageUrl: base64String,
          },
        ]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-2xl mx-auto p-4 border rounded-lg shadow-lg">
      <div className="mb-4 space-y-2">
        {currentCode && (
          <div className="bg-blue-100 p-2 rounded">
            <span className="font-semibold">Session Code:</span> {currentCode}
          </div>
        )}
        <div
          className={`text-sm px-2 py-1 rounded inline-block ${
            status === "connected"
              ? "bg-green-100 text-green-700"
              : status === "connecting"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          Status: {status}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${
              msg.type === "system"
                ? "text-gray-500 text-center text-sm italic"
                : msg.fromSelf
                ? "text-right"
                : "text-left"
            }`}
          >
            {msg.type === "image" ? (
              <div
                className={`inline-block max-w-[200px] ${
                  msg.fromSelf ? "ml-auto" : "mr-auto"
                }`}
              >
                <img
                  src={msg.imageUrl}
                  alt="Shared image"
                  className="rounded-lg border shadow-sm"
                />
              </div>
            ) : (
              <span
                className={`inline-block px-3 py-2 rounded-lg ${
                  msg.type === "system"
                    ? ""
                    : msg.fromSelf
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {msg.text}
              </span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded"
            disabled={status !== "connected"}
          />
          <button
            onClick={handleSend}
            className={`px-6 py-2 rounded ${
              status === "connected"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={status !== "connected"}
          >
            Send
          </button>
        </div>
        <div className="mt-2">
          <ImageUpload
            onImageSelect={handleImageSelect}
            disabled={status !== "connected"}
          />
        </div>
      </div>
    </div>
  );
}

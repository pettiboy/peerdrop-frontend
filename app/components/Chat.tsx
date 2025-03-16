import { useEffect, useState, useRef } from "react";
import { WebSocketService } from "../services/websocket";

interface ChatProps {
  sessionCode?: string | null;
}

interface ChatMessage {
  text: string;
  fromSelf: boolean;
  type: "message" | "system";
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const wsService = new WebSocketService(sessionCode || null);

    wsService.setCallbacks({
      onPeerJoined: () => {
        setMessages((prev) => [
          ...prev,
          { text: "Peer joined the chat", fromSelf: false, type: "system" },
        ]);
        setStatus("connected");
      },
      onMessage: (message) => {
        setMessages((prev) => [
          ...prev,
          { text: message, fromSelf: false, type: "message" },
        ]);
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

    return () => {
      wsService.close();
    };
  }, [sessionCode]);

  const handleSend = () => {
    if (inputMessage.trim() && ws) {
      ws.send(inputMessage);
      setMessages((prev) => [
        ...prev,
        { text: inputMessage, fromSelf: true, type: "message" },
      ]);
      setInputMessage("");
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
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
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
    </div>
  );
}

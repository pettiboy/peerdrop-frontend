import { useEffect, useState, useRef } from "react";
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

export function Chat({ sessionCode }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      setMessages((prev) => [
        ...prev,
        { text: inputMessage, fromSelf: true, type: "message" },
      ]);
      setInputMessage("");
    }
  };

  const handleImageSelect = async (file: File) => {
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
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
        {sessionCode && (
          <div className="bg-blue-100 p-2 rounded">
            <span className="font-semibold">Session Code:</span> {sessionCode}
          </div>
        )}
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
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Send
          </button>
        </div>
        <div className="mt-2">
          <ImageUpload onImageSelect={handleImageSelect} />
        </div>
      </div>
    </div>
  );
}

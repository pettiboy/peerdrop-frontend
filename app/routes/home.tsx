import type { Route } from "./+types/home";
import { useState } from "react";
import { Chat } from "../components/Chat";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PeerDrop Chat" },
    {
      name: "description",
      content: "Real-time peer-to-peer chat with PeerDrop!",
    },
  ];
}

export default function Home() {
  const [sessionCode, setSessionCode] = useState("");
  const [activeSession, setActiveSession] = useState<string | undefined>();

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      setActiveSession(sessionCode.trim());
      setSessionCode(""); // Clear the input after joining
    }
  };

  const handleCreateSession = () => {
    setActiveSession(""); // Empty string indicates we want to create a new session
  };

  if (activeSession !== undefined) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <button
            onClick={() => {
              setActiveSession(undefined);
              setSessionCode("");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Leave Session
          </button>
        </div>
        <Chat sessionCode={activeSession} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">PeerDrop Chat</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Join Existing Session
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="Enter session code"
                className="flex-1 px-4 py-2 border rounded"
              />
              <button
                onClick={handleJoinSession}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Join
              </button>
            </div>
          </div>

          <div className="text-center">
            <div className="mb-2">or</div>
            <button
              onClick={handleCreateSession}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Create New Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import init, { greet } from "../wasm/pkg";

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
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState("");

  const handleJoinSession = () => {
    const code = sessionCode.trim();
    if (code) {
      navigate(`/chat/${code}`);
    }
  };

  const handleCreateSession = () => {
    navigate("/chat/new");
  };

  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    init().then(() => {
      const message = greet("Hussain");
      setGreeting(message);
    });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1>{greeting}</h1>
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
                onKeyPress={(e) => e.key === "Enter" && handleJoinSession()}
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

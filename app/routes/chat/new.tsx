import { useNavigate } from "react-router";
import { Chat } from "../../components/Chat";

export default function NewChatSession() {
  const navigate = useNavigate();

  const handleLeave = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Leave Session
        </button>
      </div>
      <Chat sessionCode={null} />
    </div>
  );
}

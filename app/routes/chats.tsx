import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { QrCode, Plus, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router";

interface ChatPreview {
  id: string;
  userCode: string;
  lastMessage: string;
  timestamp: string;
}

export default function ChatsPage() {
  const navigate = useNavigate();
  // TODO: Replace with actual chats data
  const chats: ChatPreview[] = [];

  const handleNewChat = () => {
    navigate("/qr");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3">
        <h1 className="text-2xl font-semibold">Chats</h1>
      </header>

      {/* Chat List */}
      {chats.length > 0 ? (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="w-full p-4 rounded-lg hover:bg-muted transition-colors duration-200 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{chat.userCode}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {chat.timestamp}
                  </time>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No chats yet</h2>
          <p className="text-muted-foreground mb-6">
            Start a new chat by scanning a QR code
          </p>
          <Button onClick={handleNewChat} className="gap-2">
            <QrCode className="w-4 h-4" />
            Scan QR Code
          </Button>
        </div>
      )}

      {/* FAB for new chat when there are existing chats */}
      {chats.length > 0 && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg"
          onClick={handleNewChat}
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}

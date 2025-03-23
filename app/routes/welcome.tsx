import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Shield, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router";

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleStartChatting = () => {
    // TODO: Generate user identity
    navigate("/chats");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            PeerDrop Chat
          </CardTitle>
          <CardDescription className="text-lg">
            No accounts. No passwords. Scan & chat securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>End-to-end encrypted messaging</span>
          </div>
          <Button
            className="w-full text-lg py-6"
            size="lg"
            onClick={handleStartChatting}
          >
            Start Chatting
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

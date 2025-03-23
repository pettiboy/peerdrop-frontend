import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Shield, MessageCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../hooks/useUser";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, isLoading, error } = useUser();

  const handleStartChatting = () => {
    if (user) {
      navigate("/chats");
    }
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
          {error ? (
            <div className="text-red-500 text-center">
              Failed to initialize: {error.message}
            </div>
          ) : (
            <Button
              className="w-full text-lg py-6"
              size="lg"
              onClick={handleStartChatting}
              disabled={isLoading || !user}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Start Chatting"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

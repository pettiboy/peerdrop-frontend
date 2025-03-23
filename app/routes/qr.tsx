import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ArrowLeft, QrCode, Shield } from "lucide-react";
import { useNavigate } from "react-router";

export default function QRScanPage() {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // TODO: Implement actual connection logic
    await new Promise((resolve) => setTimeout(resolve, 1500));
    navigate("/chat/new");
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Establishing Connection</CardTitle>
            <CardDescription>Creating a secure channel...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>End-to-end encrypted</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">Connect with Contact</h1>
      </header>

      <div className="flex-1 p-4 flex flex-col items-center">
        {/* QR Scanner Placeholder */}
        <div className="w-full max-w-md aspect-square bg-muted rounded-lg mb-8 flex items-center justify-center">
          <QrCode className="w-16 h-16 text-muted-foreground" />
          {/* TODO: Implement actual QR scanner */}
        </div>

        {/* Manual Code Entry */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter Code Manually</CardTitle>
            <CardDescription>
              Ask your contact to share their user code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter user code"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            <Button
              className="w-full"
              disabled={!manualCode}
              onClick={handleConnect}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

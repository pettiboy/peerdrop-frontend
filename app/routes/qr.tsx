import { QRCodeSVG } from "qrcode.react";
import { useUser } from "~/hooks/useUser";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
// Temporarily disable tabs and toast until we can add them
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "~/components/ui/tabs";
import { ArrowLeft, Copy, QrCode, Shield, Scan } from "lucide-react";
import { useNavigate } from "react-router";
import { getUserKeys } from "~/api/users";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

// Define tab types
type TabType = "my-qr" | "connect";

type ConnectionStatus = "idle" | "fetching" | "establishing" | "error";

export default function QRPage() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [connectionError, setConnectionError] = useState<string>("");
  // Temporarily set tab manually until we can add Tabs component
  const [activeTab, setActiveTab] = useState<TabType>("my-qr");

  const handleCopyCode = () => {
    if (user?.userCode) {
      navigator.clipboard.writeText(user.userCode);
      toast.success("Code copied to clipboard", {
        description: "Share this code with others to connect",
        duration: 2000,
      });
    }
  };

  const handleConnect = async () => {
    if (!manualCode.trim()) return;

    try {
      setConnectionStatus("fetching");
      setConnectionError("");

      // First step: Get the user's public keys
      const targetUser = await getUserKeys(manualCode.trim());

      // If we successfully got the keys, move to establishing connection
      setConnectionStatus("establishing");

      // TODO: Implement the actual connection establishment using the keys
      // targetUser.ecdh_public_key and targetUser.eddsa_public_key
      await new Promise((resolve) => setTimeout(resolve, 1500));

      navigate("/chat/new");
    } catch (error) {
      setConnectionStatus("error");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to establish connection. Please try again.";
      setConnectionError(errorMessage);
      toast.error("Connection failed", {
        description: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (connectionStatus === "fetching") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Retrieving User Keys</CardTitle>
            <CardDescription>Looking up connection details...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connectionStatus === "establishing") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">QR Code Connection</h1>
      </header>

      <div className="flex-1 p-4">
        {/* Temporarily use basic tabs implementation */}
        <div className="w-full max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button
              variant={activeTab === "my-qr" ? "default" : "outline"}
              className="justify-center"
              onClick={() => setActiveTab("my-qr")}
            >
              My QR Code
            </Button>
            <Button
              variant={activeTab === "connect" ? "default" : "outline"}
              className="justify-center"
              onClick={() => setActiveTab("connect")}
            >
              Connect
            </Button>
          </div>

          {/* My QR Code Content */}
          {activeTab === "my-qr" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Your QR Code</CardTitle>
                <CardDescription>
                  Share this with others to connect
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                {/* QR Code */}
                <div className="bg-white p-4 rounded-lg shadow-inner">
                  <QRCodeSVG
                    value={user?.userCode || ""}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="mx-auto"
                  />
                </div>

                {/* User Code Display */}
                <div className="text-center space-y-2 w-full">
                  <p className="text-sm text-muted-foreground">Your Code</p>
                  <div className="flex items-center justify-center bg-muted rounded-md overflow-hidden w-full">
                    <code className="px-4 py-2 text-lg font-mono flex-1 text-center">
                      {user?.userCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-full px-3 rounded-l-none"
                      onClick={handleCopyCode}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-center justify-center text-sm text-muted-foreground">
                Connected as{" "}
                <span className="font-medium ml-1">{user?.name}</span>
              </CardFooter>
            </Card>
          )}

          {/* Connect Content */}
          {activeTab === "connect" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scan QR Code</CardTitle>
                  <CardDescription>
                    Scan another user's QR code to connect
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Placeholder for QR Scanner */}
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Scan className="w-16 h-16 text-muted-foreground" />
                    {/* TODO: Implement actual QR scanner */}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Or Enter Code Manually</CardTitle>
                  <CardDescription>
                    Enter the other user's connection code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter connection code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className={cn(
                      connectionStatus === "error" &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {connectionError && (
                    <p className="text-sm text-destructive">
                      {connectionError}
                    </p>
                  )}
                  <Button
                    className="w-full"
                    disabled={
                      !manualCode.trim() ||
                      ["fetching", "establishing"].includes(connectionStatus)
                    }
                    onClick={handleConnect}
                  >
                    Connect
                  </Button>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground flex items-center justify-center">
                  <Shield className="w-3 h-3 mr-1" /> Secure, end-to-end
                  encrypted connection
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

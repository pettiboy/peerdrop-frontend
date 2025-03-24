import { QRCodeSVG } from "qrcode.react";
import { getCurrentUser } from "~/db/queries/userIdentity";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useUser } from "~/hooks/useUser";

export default function QRPage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Your QR Code</h1>
          <p className="text-muted-foreground">
            Share this code to connect with others
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg shadow-inner">
            <QRCodeSVG
              value={user.userCode}
              size={200}
              level="H"
              includeMargin={true}
              className="mx-auto"
            />
          </div>

          {/* User Code Display */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Your Code</p>
            <div className="flex items-center justify-center space-x-2">
              <code className="bg-muted px-4 py-2 rounded-md text-xl font-mono">
                {user.userCode}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(user.userCode);
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Connected as <span className="font-medium">{user.name}</span>
          </p>
        </div>
      </Card>
    </div>
  );
}

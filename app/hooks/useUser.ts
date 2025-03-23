import { useEffect, useState } from "react";
import init from "../wasm/pkg";
import type { UserDocument } from "../db/schema";
import { createUserIdentity, getCurrentUser } from "../services/userService";

export function useUser() {
  const [user, setUser] = useState<UserDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initializeUser() {
      try {
        // Initialize WASM
        await init();

        // Get or create user
        let currentUser = await getCurrentUser();

        if (!currentUser) {
          // Create a new user with a default name (can be updated later)
          currentUser = await createUserIdentity("Anonymous");
        }

        setUser(currentUser);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to initialize user")
        );
      } finally {
        setIsLoading(false);
      }
    }

    initializeUser();
  }, []);

  return {
    user,
    isLoading,
    error,
  };
}

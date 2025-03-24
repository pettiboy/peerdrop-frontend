import { useCallback, useEffect, useState } from "react";
import init, { ecdh_keygen, eddsa_keygen } from "~/wasm/pkg";
import type { SelfIdentityDocument } from "~/db/schema";
import { createUserIdentity, getCurrentUser } from "~/db/queries/userIdentity";
import { createUser } from "~/api/users";
import { clearDatabase } from "~/db/database";

export function useUser() {
  const [user, setUser] = useState<SelfIdentityDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleCreateUser = useCallback(async () => {
    // Generate key pairs using WASM bindings
    const eddsaKeys = eddsa_keygen();
    const ecdhKeys = ecdh_keygen();

    // call createUser api
    const user = await createUser(ecdhKeys.public_key, eddsaKeys.public_key);

    // save user to db
    const newUser = await createUserIdentity(
      user.name || "Anonymous",
      user.code,
      ecdhKeys.public_key,
      ecdhKeys.secret_key,
      eddsaKeys.public_key,
      eddsaKeys.secret_key,
      user.created_at
    );

    return newUser;
  }, []);

  useEffect(() => {
    async function initializeUser() {
      try {
        // Initialize WASM
        await init();

        await clearDatabase();

        // Get or create user
        let currentUser = await getCurrentUser();

        console.log("currentUser", currentUser);

        if (!currentUser) {
          const newUser = await handleCreateUser();
          console.log("after handleCreateUser", newUser);
          currentUser = newUser;
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

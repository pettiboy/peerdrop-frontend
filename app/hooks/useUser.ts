import { useCallback, useEffect, useState } from "react";
import init, { ecdh_keygen, eddsa_keygen } from "~/wasm/pkg";
import type { SelfIdentityDocument } from "~/db/schema";
import { createUserIdentity, getCurrentUser } from "~/db/queries/userIdentity";
import { createUser } from "~/api/users";

// Initialize a flag to prevent multiple initializations
let userInitialized = false;

export function useUser() {
  const [user, setUser] = useState<SelfIdentityDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleCreateUser = useCallback(async () => {
    try {
      console.debug("Creating new user identity with WASM");

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

      console.debug("Created new user identity:", newUser);
      return newUser;
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeUser() {
      if (userInitialized) {
        console.debug("User already initialized, retrieving from database");
        try {
          const currentUser = await getCurrentUser();
          if (isMounted) {
            setUser(currentUser);
            setIsLoading(false);
          }
        } catch (err) {
          if (isMounted) {
            setError(
              err instanceof Error ? err : new Error("Failed to get user")
            );
            setIsLoading(false);
          }
        }
        return;
      }

      try {
        // Initialize WASM
        await init();
        console.debug("WASM initialized");

        // Get or create user
        let currentUser = await getCurrentUser();
        console.debug("Current user from database:", currentUser);

        if (!currentUser) {
          console.debug("No user found, creating new user");
          currentUser = await handleCreateUser();
        }

        // Set the initialized flag
        userInitialized = true;

        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Error initializing user:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to initialize user")
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeUser();

    return () => {
      isMounted = false;
    };
  }, [handleCreateUser]);

  return {
    user,
    isLoading,
    error,
  };
}

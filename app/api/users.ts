import { API_URL } from "~/constants/config";

interface CreateUserRequest {
  ecdh_public_key: string;
  eddsa_public_key: string;
}

interface UserResponse {
  id: number;
  code: string;
  name: string | null;
  ecdh_public_key: string;
  eddsa_public_key: string;
  created_at: string;
}

/**
 * Creates a new user with the given public keys
 */
export async function createUser(
  ecdhPublicKey: string,
  eddsaPublicKey: string
): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ecdh_public_key: ecdhPublicKey,
      eddsa_public_key: eddsaPublicKey,
    } satisfies CreateUserRequest),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return (await response.json()) as UserResponse;
}

/**
 * Gets a user's public keys by their user code
 */
export async function getUserKeys(userCode: string): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/users/${userCode}`);

  if (!response.ok) {
    throw new Error("Failed to get user keys");
  }

  return (await response.json()) as UserResponse;
}
